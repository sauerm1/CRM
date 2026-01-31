package middleware

import (
	"testing"
	"net/http"
	"net/http/httptest"
)

func testHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func TestCORSMiddleware(t *testing.T) {
	handler := CORS(testHandler)
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler(w, req)
	if w.Header().Get("Access-Control-Allow-Origin") == "" {
		t.Error("Expected CORS header to be set")
	}
}
