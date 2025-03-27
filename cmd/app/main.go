package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "wishlist/docs" // Import swagger docs
	"wishlist/internal/api/handlers"
	"wishlist/internal/api/middleware"
	"wishlist/internal/config"
	"wishlist/internal/domain"
	"wishlist/internal/observability"
	"wishlist/internal/repository"
	"wishlist/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"
	"golang.org/x/time/rate"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func initDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate the schema
	if err := db.AutoMigrate(&domain.User{}, &domain.WishList{}, &domain.WishItem{}); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return db, nil
}

func main() {
	// Initialize logger
	logger, err := observability.NewLogger()
	if err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	// Initialize metrics
	metrics := observability.NewMetrics()

	// Initialize database
	db, err := initDB()
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	wishListRepo := repository.NewWishListRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	wishListService := service.NewWishListService(wishListRepo)

	// Создаем конфигурацию
	cfg := &config.Config{
		JWTSecret: os.Getenv("JWT_SECRET"),
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userService, cfg)
	wishListHandler := handlers.NewWishListHandler(wishListService)
	healthHandler := handlers.NewHealthHandler(db)

	// Initialize router
	r := gin.Default()

	// Создаем ограничитель запросов
	limiter := rate.NewLimiter(rate.Limit(10), 30) // 10 requests per second, burst of 30

	// Add middleware
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimit(limiter))
	// Используем логгер напрямую
	r.Use(func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()

		logger.Info("HTTP Request",
			zap.String("path", path),
			zap.String("method", method),
			zap.Int("status", statusCode),
			zap.Duration("latency", latency),
		)

		// Record metrics
		metrics.HTTPRequestsTotal.WithLabelValues(
			method,
			path,
			fmt.Sprintf("%d", statusCode),
		).Inc()

		metrics.HTTPRequestDuration.WithLabelValues(
			method,
			path,
			fmt.Sprintf("%d", statusCode),
		).Observe(latency.Seconds())
	})

	// Health check endpoint
	r.GET("/health", healthHandler.Check)

	// Prometheus metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Auth routes
	authRoutes := r.Group("/api/v1/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}

	// Protected routes
	api := r.Group("/api/v1")
	api.Use(middleware.Auth(os.Getenv("JWT_SECRET")))
	{
		// Wishlist routes
		wishlists := api.Group("/wishlists")
		{
			wishlists.POST("", wishListHandler.Create)
			wishlists.GET("", wishListHandler.List)
			wishlists.GET("/:id", wishListHandler.Get)
			wishlists.PUT("/:id", wishListHandler.Update)
			wishlists.DELETE("/:id", wishListHandler.Delete)
			wishlists.POST("/:id/items", wishListHandler.AddItem)
		}
	}

	// Create server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Shutdown server
	logger.Info("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown:", zap.Error(err))
	}

	logger.Info("Server exiting")
}
