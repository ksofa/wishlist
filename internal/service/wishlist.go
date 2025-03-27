package service

import (
	"errors"
	"time"
	"wishlist/internal/domain"
)

type WishListService struct {
	repo WishListRepository
}

type WishListRepository interface {
	Create(wishlist *domain.WishList) error
	FindByID(id uint) (*domain.WishList, error)
	FindByUserID(userID uint) ([]*domain.WishList, error)
	Update(wishlist *domain.WishList) error
	Delete(id uint) error
	AddItem(item *domain.WishItem) error
	UpdateItem(item *domain.WishItem) error
	DeleteItem(wishlistID, itemID uint) error
	GetItem(wishlistID, itemID uint) (*domain.WishItem, error)
}

func NewWishListService(repo WishListRepository) *WishListService {
	return &WishListService{repo: repo}
}

func (s *WishListService) Create(wishlist *domain.WishList) error {
	now := time.Now()
	wishlist.CreatedAt = now
	wishlist.UpdatedAt = now
	return s.repo.Create(wishlist)
}

func (s *WishListService) GetByID(id uint, userID uint) (*domain.WishList, error) {
	wishlist, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if wishlist.UserID != userID {
		return nil, errors.New("access denied")
	}

	return wishlist, nil
}

func (s *WishListService) GetByUserID(userID uint) ([]*domain.WishList, error) {
	return s.repo.FindByUserID(userID)
}

func (s *WishListService) Update(wishlist *domain.WishList, userID uint) error {
	existing, err := s.repo.FindByID(wishlist.ID)
	if err != nil {
		return err
	}

	if existing.UserID != userID {
		return errors.New("access denied")
	}

	wishlist.UserID = userID // Ensure UserID is set correctly
	wishlist.UpdatedAt = time.Now()
	return s.repo.Update(wishlist)
}

func (s *WishListService) Delete(id uint, userID uint) error {
	existing, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if existing.UserID != userID {
		return errors.New("access denied")
	}

	return s.repo.Delete(id)
}

func (s *WishListService) AddItem(item *domain.WishItem, userID uint) error {
	wishlist, err := s.repo.FindByID(item.WishListID)
	if err != nil {
		return err
	}

	if wishlist.UserID != userID {
		return errors.New("access denied")
	}

	now := time.Now()
	item.CreatedAt = now
	item.UpdatedAt = now
	return s.repo.AddItem(item)
}

func (s *WishListService) UpdateItem(item *domain.WishItem, userID uint) error {
	wishlist, err := s.repo.FindByID(item.WishListID)
	if err != nil {
		return err
	}

	if wishlist.UserID != userID {
		return errors.New("access denied")
	}

	item.UpdatedAt = time.Now()
	return s.repo.UpdateItem(item)
}

func (s *WishListService) DeleteItem(wishlistID, itemID uint, userID uint) error {
	wishlist, err := s.repo.FindByID(wishlistID)
	if err != nil {
		return err
	}

	if wishlist.UserID != userID {
		return errors.New("access denied")
	}

	return s.repo.DeleteItem(wishlistID, itemID)
}

func (s *WishListService) GetItem(wishlistID, itemID uint, userID uint) (*domain.WishItem, error) {
	wishlist, err := s.repo.FindByID(wishlistID)
	if err != nil {
		return nil, err
	}

	if wishlist.UserID != userID {
		return nil, errors.New("access denied")
	}

	return s.repo.GetItem(wishlistID, itemID)
} 