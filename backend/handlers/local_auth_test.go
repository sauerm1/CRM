package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
	"go-api-mongo/config"
)

func TestRegisterValidation(t *testing.T) {
	sessionConfig := config.InitSessionConfig()
	handler := &LocalAuthHandler{sessionConfig: sessionConfig}

	t.Run("missing email", func(t *testing.T) {
		body := []byte(`{"password":"test1234","name":"Test"}`)
		req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()
		handler.Register(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400, got %d", w.Code)
		}
	})

	t.Run("short password", func(t *testing.T) {
		body := []byte(`{"email":"test@example.com","password":"123","name":"Test"}`)
		req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()
		handler.Register(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for short password, got %d", w.Code)
		}
	})

	t.Run("invalid email", func(t *testing.T) {
		body := []byte(`{"email":"notanemail","password":"test1234","name":"Test"}`)
		req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()
		handler.Register(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid email, got %d", w.Code)
		}
	})
}

func TestLoginValidation(t *testing.T) {
	sessionConfig := config.InitSessionConfig()
	handler := &LocalAuthHandler{sessionConfig: sessionConfig}

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
