package domain

import (
	"time"
)

type WishList struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	UserID      uint       `json:"user_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Items       []WishItem `json:"items,omitempty" gorm:"foreignKey:WishListID"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// TableName указывает GORM использовать таблицу wishlists вместо wish_lists
func (WishList) TableName() string {
	return "wishlists"
}

type WishItem struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	WishListID  uint      `json:"wishlist_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Priority    int       `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName указывает GORM использовать таблицу wishlist_items вместо wish_items
func (WishItem) TableName() string {
	return "wishlist_items"
}

type User struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Email        string     `json:"email" gorm:"unique;not null"`
	PasswordHash string     `json:"-" gorm:"column:password_hash;not null"`
	WishLists    []WishList `json:"wish_lists" gorm:"foreignKey:UserID"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
} 