package observability

import (
	"go.uber.org/zap"
)

// Logger provides structured logging capabilities
type Logger struct {
	*zap.Logger
}

// NewLogger creates a new Logger instance
func NewLogger() (*zap.Logger, error) {
	logger, err := zap.NewDevelopment()
	if err != nil {
		return nil, err
	}
	return logger, nil
}

// WithContext adds context fields to the logger
func (l *Logger) WithContext(fields ...zap.Field) *Logger {
	return &Logger{l.Logger.With(fields...)}
}

// WithRequest adds request context to the logger
func (l *Logger) WithRequest(method, path string) *Logger {
	return l.WithContext(
		zap.String("method", method),
		zap.String("path", path),
	)
}

// WithUser adds user context to the logger
func (l *Logger) WithUser(userID uint) *Logger {
	return l.WithContext(
		zap.Uint("user_id", userID),
	)
}

// WithError adds error context to the logger
func (l *Logger) WithError(err error) *Logger {
	return l.WithContext(
		zap.Error(err),
	)
}

// Sync flushes any buffered log entries
func (l *Logger) Sync() error {
	return l.Logger.Sync()
} 