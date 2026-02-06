package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
	"go-api-mongo/config"
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
