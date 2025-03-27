package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"wishlist/internal/config"
	"wishlist/internal/repository"
	"wishlist/internal/service"
	"wishlist/internal/testutil"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupAuthTestRouter(t *testing.T) (*gin.Engine, *AuthHandler) {
	db := testutil.TestDB(t)
	defer testutil.CleanupDB(t, db)

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)

	// Создаем конфигурацию для JWT
	cfg := &config.Config{
		JWTSecret: "test-secret",
	}

	authHandler := NewAuthHandler(userService, cfg)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)

	return r, authHandler
}

func TestAuthHandler_Register(t *testing.T) {
	r, _ := setupAuthTestRouter(t)

	t.Run("successful registration", func(t *testing.T) {
		reqBody := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		jsonBody, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.Contains(t, response, "token")
	})

	t.Run("duplicate email", func(t *testing.T) {
		// Register first user
		reqBody := map[string]string{
			"email":    "duplicate@example.com",
			"password": "password123",
		}
		jsonBody, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Try to register with same email
		req = httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusConflict, w.Code)
	})
}

func TestAuthHandler_Login(t *testing.T) {
	r, _ := setupAuthTestRouter(t)

	// Register a test user first
	reqBody := map[string]string{
		"email":    "test@example.com",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Run("successful login", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.Contains(t, response, "token")
	})

	t.Run("invalid credentials", func(t *testing.T) {
		reqBody := map[string]string{
			"email":    "test@example.com",
			"password": "wrongpassword",
		}
		jsonBody, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("POST", "/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
