package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"wishlist/internal/auth"
	"wishlist/internal/repository"
	"wishlist/internal/service"
	"wishlist/internal/testutil"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupWishListTestRouter(t *testing.T) (*gin.Engine, *WishListHandler, string) {
	db := testutil.TestDB(t)
	defer testutil.CleanupDB(t, db)

	userRepo := repository.NewUserRepository(db)
	wishListRepo := repository.NewWishListRepository(db)

	userService := service.NewUserService(userRepo)
	wishListService := service.NewWishListService(wishListRepo)
	jwtManager := auth.NewJWTManager("test-secret", 24*time.Hour)

	// Register a test user and get token
	user, err := userService.Register("test@example.com", "password123")
	require.NoError(t, err)
	token, err := jwtManager.GenerateToken(user.ID)
	require.NoError(t, err)

	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Add auth middleware
	r.Use(func(c *gin.Context) {
		c.Set("userID", user.ID)
		c.Next()
	})

	wishListHandler := NewWishListHandler(wishListService)

	// Add routes
	wishlists := r.Group("/wishlists")
	{
		wishlists.POST("", wishListHandler.Create)
		wishlists.GET("", wishListHandler.List)
		wishlists.GET("/:id", wishListHandler.Get)
		wishlists.PUT("/:id", wishListHandler.Update)
		wishlists.DELETE("/:id", wishListHandler.Delete)
		wishlists.POST("/:id/items", wishListHandler.AddItem)
	}

	return r, wishListHandler, token
}

func TestWishListHandler(t *testing.T) {
	r, _, token := setupWishListTestRouter(t)

	// Create a wishlist
	reqBody := map[string]string{
		"name": "Test Wishlist",
	}
	jsonBody, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/wishlists", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var wishList map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &wishList)
	require.NoError(t, err)
	assert.NotNil(t, wishList["id"])
	id := fmt.Sprintf("/wishlists/%.0f", wishList["id"].(float64))

	t.Run("list wishlists", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/wishlists", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var wishLists []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &wishLists)
		require.NoError(t, err)
		assert.Len(t, wishLists, 1)
	})

	t.Run("get wishlist", func(t *testing.T) {
		req := httptest.NewRequest("GET", id, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var wishList map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &wishList)
		require.NoError(t, err)
		assert.Equal(t, "Test Wishlist", wishList["name"])
	})

	t.Run("update wishlist", func(t *testing.T) {
		reqBody := map[string]string{
			"name": "Updated Wishlist",
		}
		jsonBody, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("PUT", id, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var wishList map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &wishList)
		require.NoError(t, err)
		assert.Equal(t, "Updated Wishlist", wishList["name"])
	})

	t.Run("add item to wishlist", func(t *testing.T) {
		reqBody := map[string]string{
			"name":        "New Item",
			"description": "Item Description",
			"status":      "wanted",
		}
		jsonBody, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("POST", id+"/items", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var item map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &item)
		require.NoError(t, err)
		assert.Equal(t, "New Item", item["name"])
		assert.Equal(t, "Item Description", item["description"])
		assert.Equal(t, "wanted", item["status"])
	})

	t.Run("delete wishlist", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", id, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)

		// Verify wishlist is deleted
		req = httptest.NewRequest("GET", id, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
