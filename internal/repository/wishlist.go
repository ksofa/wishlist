package repository

import (
	"fmt"
	"wishlist/internal/domain"

	"gorm.io/gorm"
)

type WishListRepository struct {
	db *gorm.DB
}

func NewWishListRepository(db *gorm.DB) *WishListRepository {
	return &WishListRepository{db: db}
}

func (r *WishListRepository) Create(wishlist *domain.WishList) error {
	return r.db.Create(wishlist).Error
}

func (r *WishListRepository) FindByID(id uint) (*domain.WishList, error) {
	var wishlist domain.WishList
	if err := r.db.First(&wishlist, id).Error; err != nil {
		return nil, err
	}
	return &wishlist, nil
}

func (r *WishListRepository) FindByUserID(userID uint) ([]*domain.WishList, error) {
	var wishlists []*domain.WishList
	if err := r.db.Where("user_id = ?", userID).Find(&wishlists).Error; err != nil {
		return nil, err
	}
	return wishlists, nil
}

func (r *WishListRepository) Update(wishlist *domain.WishList) error {
	return r.db.Save(wishlist).Error
}

func (r *WishListRepository) Delete(id uint) error {
	return r.db.Delete(&domain.WishList{}, id).Error
}

func (r *WishListRepository) AddItem(item *domain.WishItem) error {
	return r.db.Create(item).Error
}

func (r *WishListRepository) UpdateItem(item *domain.WishItem) error {
	return r.db.Save(item).Error
}

func (r *WishListRepository) DeleteItem(wishlistID, itemID uint) error {
	return r.db.Where("wishlist_id = ? AND id = ?", wishlistID, itemID).Delete(&domain.WishItem{}).Error
}

func (r *WishListRepository) GetItem(wishlistID, itemID uint) (*domain.WishItem, error) {
	var item domain.WishItem
	if err := r.db.Where("wishlist_id = ? AND id = ?", wishlistID, itemID).First(&item).Error; err != nil {
		return nil, fmt.Errorf("item not found: %w", err)
	}
	return &item, nil
} 