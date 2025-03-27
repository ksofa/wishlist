package middleware

import (
	"time"

	"github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"wishlist/internal/observability"
)

// ObservabilityMiddleware adds logging and metrics to the request
func ObservabilityMiddleware(logger *observability.Logger, metrics *observability.Metrics) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Create request-scoped logger
		reqLogger := logger.WithRequest(c.Request.Method, c.Request.URL.Path)

		// Add user context if available
		if userID, exists := c.Get("userID"); exists {
			reqLogger = reqLogger.WithUser(userID.(uint))
		}

		// Process request
		c.Next()

		// Record metrics
		duration := time.Since(start)
		status := c.Writer.Status()

		metrics.HTTPRequestsTotal.WithLabelValues(
			c.Request.Method,
			c.Request.URL.Path,
			string(rune(status)),
		).Inc()

		metrics.HTTPRequestDuration.WithLabelValues(
			c.Request.Method,
			c.Request.URL.Path,
		).Observe(duration.Seconds())

		// Log request details
		reqLogger.Info("Request completed",
			zap.Int("status", status),
			zap.Duration("duration", duration),
		)
	}
}

func Observability(logger *zap.Logger) gin.HandlerFunc {
	return ginzap.RecoveryWithZap(logger, true)
} 