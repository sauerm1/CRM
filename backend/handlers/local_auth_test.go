package handlers

import (
	"bytes"
	"go-api-mongo/config"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLoginValidation(t *testing.T) {
	jwtConfig := config.InitJWTConfig()
	handler := &LocalAuthHandler{jwtConfig: jwtConfig}

	t.Run("missing credentials", func(t *testing.T) {
		body := []byte(`{}`)
		req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
		w := httptest.NewRecorder()
		handler.Login(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400, got %d", w.Code)
		}
	})
}
