package service

import (
	"testing"

	"wishlist/internal/repository"
	"wishlist/internal/testutil"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserService_Register(t *testing.T) {
	db := testutil.TestDB(t)
	defer testutil.CleanupDB(t, db)

	userRepo := repository.NewUserRepository(db)
	userService := NewUserService(userRepo)

	t.Run("successful registration", func(t *testing.T) {
		user, err := userService.Register("test@example.com", "password123")
		require.NoError(t, err)
		assert.NotZero(t, user.ID)
		assert.Equal(t, "test@example.com", user.Email)
		assert.NotEmpty(t, user.PasswordHash) // Password should be hashed
	})

	t.Run("duplicate email", func(t *testing.T) {
		// Register first user
		_, err := userService.Register("duplicate@example.com", "password123")
		require.NoError(t, err)

		// Try to register with same email
		_, err = userService.Register("duplicate@example.com", "password123")
		assert.Error(t, err)
		assert.Equal(t, "user already exists", err.Error())
	})
}

func TestUserService_Login(t *testing.T) {
	db := testutil.TestDB(t)
	defer testutil.CleanupDB(t, db)

	userRepo := repository.NewUserRepository(db)
	userService := NewUserService(userRepo)

	// Register a test user
	_, err := userService.Register("test@example.com", "password123")
	require.NoError(t, err)

	t.Run("successful login", func(t *testing.T) {
		user, err := userService.Login("test@example.com", "password123")
		require.NoError(t, err)
		assert.NotZero(t, user.ID)
		assert.Equal(t, "test@example.com", user.Email)
	})

	t.Run("invalid credentials", func(t *testing.T) {
		_, err := userService.Login("test@example.com", "wrongpassword")
		assert.Error(t, err)
		assert.Equal(t, "invalid credentials", err.Error())
	})

	t.Run("non-existent user", func(t *testing.T) {
		_, err := userService.Login("nonexistent@example.com", "password123")
		assert.Error(t, err)
		assert.Equal(t, "invalid credentials", err.Error())
	})
}
