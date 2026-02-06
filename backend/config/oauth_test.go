package config

import (
	"testing"
)

func TestInitJWTConfig(t *testing.T) {
	t.Run("creates JWT config with defaults", func(t *testing.T) {
		config := InitJWTConfig()
		if config.SecretKey == "" {
			t.Error("Expected SecretKey to be initialized")
		}
		if config.ExpiryHours <= 0 {
			t.Error("Expected positive expiry hours")
		}
	})
}
