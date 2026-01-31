package handlers

import (
\t"encoding/json"
\t"net/http"

\t"go-api-mongo/database"
)

type Handler struct {
\tdb *database.Database
}

func NewHandler(db *database.Database) *Handler {
\treturn &Handler{db: db}
}

// HealthHandler returns the health status of the API
func (h *Handler) HealthHandler(w http.ResponseWriter, r *http.Request) {
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}
