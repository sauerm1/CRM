package config

import (
	"testing"
)

func TestInitOAuthConfig(t *testing.T) {
	t.Run("creates config with defaults", func(t *testing.T) {
		config := InitOAuthConfig()
		if config.Google == nil {
			t.Error("Expected Google config to be initialized")
		}
		if config.GitHub == nil {
			t.Error("Expected GitHub config to be initialized")
		}
	})
}

func TestInitSessionConfig(t *testing.T) {
	t.Run("creates session config", func(t *testing.T) {
		config := InitSessionConfig()
		if config.CookieName != "session_token" {
			t.Errorf("Expected cookie name session_token, got %s", config.CookieName)
		}
		if config.CookieMaxAge <= 0 {
			t.Error("Expected positive cookie max age")
		}
	})
}
