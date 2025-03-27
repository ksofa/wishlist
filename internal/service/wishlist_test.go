package service

import (
	"testing"

	"wishlist/internal/domain"
	"wishlist/internal/repository"
	"wishlist/internal/testutil"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
		wishList := &domain.WishList{
			UserID:      user.ID,
			Name:        "My Birthday Wishes",
			Description: "Things I want for my birthday",
			Status:      "active",
		}

		err := wishListService.Create(wishList)
		require.NoError(t, err)
		assert.NotZero(t, wishList.ID)
		assert.Equal(t, "My Birthday Wishes", wishList.Name)
		assert.Equal(t, user.ID, wishList.UserID)
	})

	t.Run("get wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList := &domain.WishList{
			UserID:      user.ID,
			Name:        "Test Wishlist",
			Description: "Test Description",
			Status:      "active",
		}

		err := wishListService.Create(wishList)
		require.NoError(t, err)

		// Get the wishlist
		found, err := wishListService.GetByID(wishList.ID, user.ID)
		require.NoError(t, err)
		assert.Equal(t, wishList.ID, found.ID)
		assert.Equal(t, wishList.Name, found.Name)
	})

	t.Run("list wishlists", func(t *testing.T) {
		// Create multiple wishlists
		wishList1 := &domain.WishList{
			UserID:      user.ID,
			Name:        "Wishlist 1",
			Description: "Description 1",
			Status:      "active",
		}

		err := wishListService.Create(wishList1)
		require.NoError(t, err)

		wishList2 := &domain.WishList{
			UserID:      user.ID,
			Name:        "Wishlist 2",
			Description: "Description 2",
			Status:      "active",
		}

		err = wishListService.Create(wishList2)
		require.NoError(t, err)

		wishLists, err := wishListService.GetByUserID(user.ID)
		require.NoError(t, err)
		assert.GreaterOrEqual(t, len(wishLists), 2)
	})

	t.Run("update wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList := &domain.WishList{
			UserID:      user.ID,
			Name:        "Original Name",
			Description: "Original Description",
			Status:      "active",
		}

		err := wishListService.Create(wishList)
		require.NoError(t, err)

		// Update the wishlist
		wishList.Name = "Updated Name"
		err = wishListService.Update(wishList, user.ID)
		require.NoError(t, err)

		// Get updated wishlist
		updated, err := wishListService.GetByID(wishList.ID, user.ID)
		require.NoError(t, err)
		assert.Equal(t, "Updated Name", updated.Name)
	})

	t.Run("delete wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList := &domain.WishList{
			UserID:      user.ID,
			Name:        "To Delete",
			Description: "Will be deleted",
			Status:      "active",
		}

		err := wishListService.Create(wishList)
		require.NoError(t, err)

		// Delete the wishlist
		err = wishListService.Delete(wishList.ID, user.ID)
		require.NoError(t, err)

		// Try to get the deleted wishlist
		_, err = wishListService.GetByID(wishList.ID, user.ID)
		assert.Error(t, err)
	})

	t.Run("add item to wishlist", func(t *testing.T) {
		// Create a wishlist first
		wishList := &domain.WishList{
			UserID:      user.ID,
			Name:        "Test Wishlist",
			Description: "Test Description",
			Status:      "active",
		}

		err := wishListService.Create(wishList)
		require.NoError(t, err)

		// Add an item
		item := &domain.WishItem{
			WishListID:  wishList.ID,
			Name:        "New Item",
			Description: "Description",
			Status:      "wanted",
			Priority:    1,
		}

		err = wishListService.AddItem(item, user.ID)
		require.NoError(t, err)
		assert.NotZero(t, item.ID)
		assert.Equal(t, "New Item", item.Name)
		assert.Equal(t, "Description", item.Description)
		assert.Equal(t, wishList.ID, item.WishListID)
	})
}
