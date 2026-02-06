package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go-api-mongo/config"
	"go-api-mongo/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type LocalAuthHandler struct {
	db        *mongo.Database
	jwtConfig *config.JWTConfig
}

func NewLocalAuthHandler(db *mongo.Database, jwtConfig *config.JWTConfig) *LocalAuthHandler {
	return &LocalAuthHandler{
		db:        db,
		jwtConfig: jwtConfig,
	}
}

// JWTClaims represents the JWT claims
type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login handles user login with email/password
func (h *LocalAuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := h.db.Collection("users")

	// Find user by email
	var user models.User
	err := collection.FindOne(ctx, bson.M{
		"email": strings.ToLower(req.Email),
	}).Decode(&user)

	if err == mongo.ErrNoDocuments {
		// Use generic message to prevent user enumeration
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	} else if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Check if user is active
	if !user.Active {
		http.Error(w, "Account is inactive. Please contact your administrator.", http.StatusForbidden)
		return
	}

	// Update last login time
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}
	collection.UpdateOne(ctx, bson.M{"_id": user.ID}, update)

	// Generate JWT token
	token, err := h.generateJWT(user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Return user and token (without password)
	user.Password = ""
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":    user,
		"token":   token,
		"message": "Login successful",
	})
}

// generateJWT creates a JWT token for the user
func (h *LocalAuthHandler) generateJWT(user models.User) (string, error) {
	claims := JWTClaims{
		UserID: user.ID.Hex(),
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(h.jwtConfig.ExpiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtConfig.SecretKey))
}
