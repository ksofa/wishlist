package errors

import (
	"fmt"
	"net/http"
)

// Error represents a structured error response
type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func (e *Error) Error() string {
	return e.Message
}

// Common errors
var (
	ErrInvalidInput = &Error{
		Code:    http.StatusBadRequest,
		Message: "Invalid input",
	}

	ErrUnauthorized = &Error{
		Code:    http.StatusUnauthorized,
		Message: "Unauthorized",
	}

	ErrForbidden = &Error{
		Code:    http.StatusForbidden,
		Message: "Forbidden",
	}

	ErrNotFound = &Error{
		Code:    http.StatusNotFound,
		Message: "Resource not found",
	}

	ErrInternalServer = &Error{
		Code:    http.StatusInternalServerError,
		Message: "Internal server error",
	}
)

// Validation errors
func NewValidationError(field, message string) *Error {
	return &Error{
		Code:    http.StatusBadRequest,
		Message: fmt.Sprintf("Validation failed for %s: %s", field, message),
		Details: message,
	}
}

// Database errors
func NewDatabaseError(err error) *Error {
	return &Error{
		Code:    http.StatusInternalServerError,
		Message: "Database error",
		Details: err.Error(),
	}
}

// Authentication errors
func NewAuthError(message string) *Error {
	return &Error{
		Code:    http.StatusUnauthorized,
		Message: "Authentication failed",
		Details: message,
	}
}

// Authorization errors
func NewAuthorizationError(message string) *Error {
	return &Error{
		Code:    http.StatusForbidden,
		Message: "Authorization failed",
		Details: message,
	}
} 