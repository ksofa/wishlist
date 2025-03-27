package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
	"wishlist/internal/api/handlers"
	"wishlist/internal/api/middleware"
	"wishlist/internal/config"
	"wishlist/internal/repository"
	"wishlist/internal/service"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize configuration
	cfg := config.New()

	// Initialize logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Initialize database
	db, err := repository.NewPostgresDB(cfg)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	wishlistRepo := repository.NewWishListRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	wishlistService := service.NewWishListService(wishlistRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userService, cfg)
	wishlistHandler := handlers.NewWishListHandler(wishlistService)

	// Initialize router
	router := gin.New()

	// Add CORS middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	// Add middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Observability(logger))

	// Public routes
	router.POST("/api/auth/register", authHandler.Register)
	router.POST("/api/auth/login", authHandler.Login)

	// Protected routes
	authorized := router.Group("/api")
	authorized.Use(middleware.Auth(cfg.JWTSecret))
	{
		// Wishlist routes
		authorized.POST("/wishlists", wishlistHandler.Create)
		authorized.GET("/wishlists", wishlistHandler.List)
		authorized.GET("/wishlists/:id", wishlistHandler.Get)
		authorized.PUT("/wishlists/:id", wishlistHandler.Update)
		authorized.DELETE("/wishlists/:id", wishlistHandler.Delete)

		// Wishlist items routes
		authorized.POST("/wishlists/:id/items", wishlistHandler.AddItem)
		authorized.PUT("/wishlists/:id/items/:itemId", wishlistHandler.UpdateItem)
		authorized.DELETE("/wishlists/:id/items/:itemId", wishlistHandler.DeleteItem)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting server", zap.String("port", port))
	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
} 