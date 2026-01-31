package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go-api-mongo/config"
	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthMiddleware struct {
	db            *mongo.Database
	sessionConfig *config.SessionConfig
}

func NewAuthMiddleware(db *mongo.Database, sessionConfig *config.SessionConfig) *AuthMiddleware {
	return &AuthMiddleware{
		db:            db,
		sessionConfig: sessionConfig,
	}
}

// RequireAuth is a middleware that requires authentication
func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(m.sessionConfig.AccessTokenName)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Authentication required"})
			return
		}

		// Get session from database
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		sessionsCollection := m.db.Collection("sessions")
		var session models.Session
		err = sessionsCollection.FindOne(ctx, bson.M{"token": cookie.Value}).Decode(&session)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid session"})
			return
		}

		// Check if session is expired
		if session.ExpiresAt.Before(time.Now()) {
			// Delete expired session
			sessionsCollection.DeleteOne(ctx, bson.M{"_id": session.ID})
			
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Session expired"})
			return
		}

		// Get user from database
		usersCollection := m.db.Collection("users")
		var user models.User
		err = usersCollection.FindOne(ctx, bson.M{"_id": session.UserID}).Decode(&user)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}

		// Add user to request context
		ctx = context.WithValue(r.Context(), "user", &user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
// OptionalAuth is a middleware that optionally authenticates the user
func (m *AuthMiddleware) OptionalAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(m.sessionConfig.AccessTokenName)
		if err != nil {
			// No cookie, continue without authentication
			next.ServeHTTP(w, r)
			return
		}

		// Try to get session from database
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		sessionsCollection := m.db.Collection("sessions")
		var session models.Session
		err = sessionsCollection.FindOne(ctx, bson.M{"token": cookie.Value}).Decode(&session)
		if err != nil {
			// Invalid session, continue without authentication
			next.ServeHTTP(w, r)
			return
		}

		// Check if session is expired
		if session.ExpiresAt.Before(time.Now()) {
			// Delete expired session
			sessionsCollection.DeleteOne(ctx, bson.M{"_id": session.ID})
			next.ServeHTTP(w, r)
			return
		}

		// Get user from database
		usersCollection := m.db.Collection("users")
		var user models.User
		err = usersCollection.FindOne(ctx, bson.M{"_id": session.UserID}).Decode(&user)
		if err != nil {
			// User not found, continue without authentication
			next.ServeHTTP(w, r)
			return
		}

		// Add user to request context
		ctx = context.WithValue(r.Context(), "user", &user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// CORS middleware for handling cross-origin requests
func CORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	}
}
