package validation

import (
	"regexp"
	"wishlist/internal/errors"
)

var (
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
)

// ValidateEmail validates an email address
func ValidateEmail(email string) error {
	if email == "" {
		return errors.NewValidationError("email", "Email is required")
	}
	if !emailRegex.MatchString(email) {
		return errors.NewValidationError("email", "Invalid email format")
	}
	return nil
}

// ValidatePassword validates a password
func ValidatePassword(password string) error {
	if password == "" {
		return errors.NewValidationError("password", "Password is required")
	}
	if len(password) < 8 {
		return errors.NewValidationError("password", "Password must be at least 8 characters long")
	}
	return nil
}

// ValidateWishListName validates a wishlist name
func ValidateWishListName(name string) error {
	if name == "" {
		return errors.NewValidationError("name", "Name is required")
	}
	if len(name) > 100 {
		return errors.NewValidationError("name", "Name must be less than 100 characters")
	}
	return nil
}

// ValidateWishItem validates a wish item
func ValidateWishItem(title, description, url string) error {
	if title == "" {
		return errors.NewValidationError("title", "Title is required")
	}
	if len(title) > 200 {
		return errors.NewValidationError("title", "Title must be less than 200 characters")
	}
	if len(description) > 1000 {
		return errors.NewValidationError("description", "Description must be less than 1000 characters")
	}
	if url != "" {
		if len(url) > 500 {
			return errors.NewValidationError("url", "URL must be less than 500 characters")
		}
	}
	return nil
} 