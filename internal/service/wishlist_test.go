package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"wishlist/internal/repository"
	"wishlist/internal/testutil"
)

func TestWishListService(t *testing.T) {
	db := testutil.TestDB(t)
	defer testutil.CleanupDB(t, db)

	userRepo := repository.NewUserRepository(db)
	wishListRepo := repository.NewWishListRepository(db)

	userService := NewUserService(userRepo)
	wishListService := NewWishListService(wishListRepo)

	// Create a test user
	user, err := userService.Register("test@example.com", "password123")
	require.NoError(t, err)

	t.Run("create wishlist", func(t *testing.T) {
		wishList, err := wishListService.CreateWishList(user.ID, "My Birthday Wishes")
		require.NoError(t, err)
		assert.NotZero(t, wishList.ID)
		assert.Equal(t, "My Birthday Wishes", wishList.Name)
		assert.Equal(t, user.ID, wishList.UserID)
	})

	t.Run("get wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList, err := wishListService.CreateWishList(user.ID, "Test Wishlist")
		require.NoError(t, err)

		// Get the wishlist
		found, err := wishListService.GetWishList(wishList.ID, user.ID)
		require.NoError(t, err)
		assert.Equal(t, wishList.ID, found.ID)
		assert.Equal(t, wishList.Name, found.Name)
	})

	t.Run("list wishlists", func(t *testing.T) {
		// Create multiple wishlists
		_, err := wishListService.CreateWishList(user.ID, "Wishlist 1")
		require.NoError(t, err)
		_, err = wishListService.CreateWishList(user.ID, "Wishlist 2")
		require.NoError(t, err)

		wishLists, err := wishListService.ListWishLists(user.ID)
		require.NoError(t, err)
		assert.Len(t, wishLists, 2)
	})

	t.Run("update wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList, err := wishListService.CreateWishList(user.ID, "Original Name")
		require.NoError(t, err)

		// Update the wishlist
		updated, err := wishListService.UpdateWishList(wishList.ID, user.ID, "Updated Name")
		require.NoError(t, err)
		assert.Equal(t, "Updated Name", updated.Name)
	})

	t.Run("delete wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList, err := wishListService.CreateWishList(user.ID, "To Delete")
		require.NoError(t, err)

		// Delete the wishlist
		err = wishListService.DeleteWishList(wishList.ID, user.ID)
		require.NoError(t, err)

		// Try to get the deleted wishlist
		_, err = wishListService.GetWishList(wishList.ID, user.ID)
		assert.Error(t, err)
		assert.Equal(t, "wishlist not found", err.Error())
	})

	t.Run("add item to wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList, err := wishListService.CreateWishList(user.ID, "Test Wishlist")
		require.NoError(t, err)

		// Add an item
		item, err := wishListService.AddItem(wishList.ID, user.ID, "New Item", "Description", "https://example.com")
		require.NoError(t, err)
		assert.NotZero(t, item.ID)
		assert.Equal(t, "New Item", item.Title)
		assert.Equal(t, "Description", item.Description)
		assert.Equal(t, "https://example.com", item.URL)
		assert.Equal(t, wishList.ID, item.WishListID)
	})
} 