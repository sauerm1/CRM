package handlers

import (
	"testing"
	"net/http"
	"net/http/httptest"
	"go-api-mongo/config"
)

func TestGoogleLogin(t *testing.T) {
	oauthConfig := config.InitOAuthConfig()
	sessionConfig := config.InitSessionConfig()
	handler := &OAuthHandler{oauthConfig: oauthConfig, sessionConfig: sessionConfig}
	req := httptest.NewRequest(http.MethodGet, "/auth/google", nil)
	w := httptest.NewRecorder()
	handler.GoogleLogin(w, req)
	if w.Result().StatusCode != http.StatusTemporaryRedirect {
		t.Errorf("Expected 307, got %d", w.Result().StatusCode)
	}
}
