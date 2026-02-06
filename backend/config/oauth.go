package config

import (
	"os"
)

// JWTConfig holds JWT configuration
type JWTConfig struct {
	SecretKey   string
	ExpiryHours int
}

// InitJWTConfig initializes JWT configuration from environment
func InitJWTConfig() *JWTConfig {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		secretKey = "change-this-secret-in-production"
	}

	expiryHours := 168 // 7 days default
	if os.Getenv("JWT_EXPIRY_HOURS") != "" {
		// Parse if needed, for now use default
		expiryHours = 168
	}

	return &JWTConfig{
		SecretKey:   secretKey,
		ExpiryHours: expiryHours,
	}
}
