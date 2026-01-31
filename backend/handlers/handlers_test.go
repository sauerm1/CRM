package handlers

import (
	"testing"
	"net/http"
	"net/http/httptest"
)

func TestHealthHandler(t *testing.T) {
	handler := &Handler{}
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	handler.HealthHandler(w, req)
	if w.Result().StatusCode != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Result().StatusCode)
	}
}
