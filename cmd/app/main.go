package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "wishlist/docs" // Import swagger docs
	"wishlist/internal/api/handlers"
	"wishlist/internal/api/middleware"
	"wishlist/internal/auth"
	"wishlist/internal/domain"
	"wishlist/internal/observability"
	"wishlist/internal/repository"
	"wishlist/internal/service"
	"golang.org/x/time/rate"
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
	logger, err := observability.NewLogger(os.Getenv("LOG_LEVEL"))
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
		logger.Fatal("Failed to initialize database", logger.WithError(err))
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	wishListRepo := repository.NewWishListRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	wishListService := service.NewWishListService(wishListRepo)

	// Initialize JWT manager
	jwtManager := auth.NewJWTManager(
		os.Getenv("JWT_SECRET"),
		24*time.Hour,
	)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(jwtManager, userService)
	wishListHandler := handlers.NewWishListHandler(wishListService)
	healthHandler := handlers.NewHealthHandler(db)

	// Initialize rate limiter
	limiter := middleware.NewIPRateLimiter(rate.Limit(10), 30) // 10 requests per second, burst of 30

	// Initialize router
	r := gin.Default()

	// Add middleware
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimit(limiter))
	r.Use(middleware.ObservabilityMiddleware(logger, metrics))

	// Health check endpoint
	r.GET("/health", healthHandler.Check)

	// Prometheus metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Auth routes
	auth := r.Group("/api/v1/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes
	api := r.Group("/api/v1")
	api.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Wishlist routes
		wishlists := api.Group("/wishlists")
		{
			wishlists.POST("", wishListHandler.Create)
			wishlists.GET("", wishListHandler.List)
			wishlists.GET("/:id", wishListHandler.GetByID)
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
			logger.Fatal("Failed to start server", logger.WithError(err))
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
		logger.Fatal("Server forced to shutdown:", logger.WithError(err))
	}

	logger.Info("Server exiting")
} 