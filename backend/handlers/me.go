package handlers

import (
	"encoding/json"
	"net/http"

	"go-api-mongo/models"
)

// Me returns the currently authenticated user
func Me(w http.ResponseWriter, r *http.Request) {
	// Get user from context (added by auth middleware)
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "User not found in context"})
		return
	}

	// Remove password before returning
	user.Password = ""

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
