package testutil

import (
	"fmt"
	"os"
	"testing"

	"wishlist/internal/domain"

	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// TestDB creates a test database connection
func TestDB(t *testing.T) *gorm.DB {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnvOrDefault("TEST_DB_HOST", "localhost"),
		getEnvOrDefault("TEST_DB_PORT", "5432"),
		getEnvOrDefault("TEST_DB_USER", "wishlist"),
		getEnvOrDefault("TEST_DB_PASSWORD", "wishlist"),
		getEnvOrDefault("TEST_DB_NAME", "wishlist_test"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	require.NoError(t, err)

	// Clean up and migrate
	err = db.Migrator().DropTable(&domain.WishItem{}, &domain.WishList{}, &domain.User{})
	require.NoError(t, err)

	err = db.AutoMigrate(&domain.User{}, &domain.WishList{}, &domain.WishItem{})
	require.NoError(t, err)

	return db
}

// CleanupDB cleans up the test database
func CleanupDB(t *testing.T, db *gorm.DB) {
	err := db.Migrator().DropTable(&domain.WishItem{}, &domain.WishList{}, &domain.User{})
	require.NoError(t, err)
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
