package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go-api-mongo/config"
	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type LocalAuthHandler struct {
	db            *mongo.Database
	sessionConfig *config.SessionConfig
}

func NewLocalAuthHandler(db *mongo.Database, sessionConfig *config.SessionConfig) *LocalAuthHandler {
	return &LocalAuthHandler{
		db:            db,
		sessionConfig: sessionConfig,
	}
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

// Register handles user registration with email/password
func (h *LocalAuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// Validate email format (basic)
	if !strings.Contains(req.Email, "@") {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	// Validate password strength
	if len(req.Password) < 8 {
		http.Error(w, "Password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := h.db.Collection("users")

	// Check if user already exists
	var existingUser models.User
	err := collection.FindOne(ctx, bson.M{
		"email": strings.ToLower(req.Email),
	}).Decode(&existingUser)

	if err == nil {
		http.Error(w, "User with this email already exists", http.StatusConflict)
		return
	} else if err != mongo.ErrNoDocuments {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	// Create user
	user := models.User{
		Email:     strings.ToLower(req.Email),
		Name:      req.Name,
		Password:  string(hashedPassword),
		Role:      "admin", // Default to admin for now, can be changed via user management
		Active:    true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result, err := collection.InsertOne(ctx, user)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	user.ID = result.InsertedID.(primitive.ObjectID)

	// Create session (access token)
	sessionToken, err := h.createSession(user.ID)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Create refresh token
	refreshToken, err := h.createRefreshToken(user.ID)
	if err != nil {
		http.Error(w, "Failed to create refresh token", http.StatusInternalServerError)
		return
	}

	// Set access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.AccessTokenName,
		Value:    sessionToken,
		MaxAge:   h.sessionConfig.AccessTokenMaxAge,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	// Set refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.RefreshTokenName,
		Value:    refreshToken,
		MaxAge:   h.sessionConfig.RefreshTokenMaxAge,
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	// Return user (without password)
	user.Password = ""
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":    user,
		"message": "Registration successful",
	})
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

	// Create session (access token)
	sessionToken, err := h.createSession(user.ID)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Create refresh token
	refreshToken, err := h.createRefreshToken(user.ID)
	if err != nil {
		http.Error(w, "Failed to create refresh token", http.StatusInternalServerError)
		return
	}

	// Set access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.AccessTokenName,
		Value:    sessionToken,
		MaxAge:   h.sessionConfig.AccessTokenMaxAge,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	// Set refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.RefreshTokenName,
		Value:    refreshToken,
		MaxAge:   h.sessionConfig.RefreshTokenMaxAge,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	// Return user (without password)
	user.Password = ""
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":    user,
		"message": "Login successful",
	})
}

// createSession creates a new session for the user
func (h *LocalAuthHandler) createSession(userID primitive.ObjectID) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := h.db.Collection("sessions")

	token, err := generateSessionToken()
	if err != nil {
		return "", err
	}

	session := models.Session{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(time.Duration(h.sessionConfig.AccessTokenMaxAge) * time.Second),
		CreatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, session)
	if err != nil {
		return "", err
	}

	return token, nil
}

// createRefreshToken creates a new refresh token for the user
func (h *LocalAuthHandler) createRefreshToken(userID primitive.ObjectID) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := h.db.Collection("refresh_tokens")

	token, err := generateSessionToken()
	if err != nil {
		return "", err
	}

	refreshToken := models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(time.Duration(h.sessionConfig.RefreshTokenMaxAge) * time.Second),
		CreatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, refreshToken)
	if err != nil {
		return "", err
	}

	return token, nil
}

// RefreshToken handles refresh token exchange for new access token
func (h *LocalAuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get refresh token from cookie
	cookie, err := r.Cookie(h.sessionConfig.RefreshTokenName)
	if err != nil {
		http.Error(w, "Refresh token required", http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find refresh token in database
	refreshTokenCollection := h.db.Collection("refresh_tokens")
	var refreshToken models.RefreshToken
	err = refreshTokenCollection.FindOne(ctx, bson.M{"token": cookie.Value}).Decode(&refreshToken)
	if err != nil {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	// Check if refresh token is expired
	if refreshToken.ExpiresAt.Before(time.Now()) {
		// Delete expired refresh token
		refreshTokenCollection.DeleteOne(ctx, bson.M{"_id": refreshToken.ID})
		http.Error(w, "Refresh token expired", http.StatusUnauthorized)
		return
	}

	// Create new access token
	newAccessToken, err := h.createSession(refreshToken.UserID)
	if err != nil {
		http.Error(w, "Failed to create new access token", http.StatusInternalServerError)
		return
	}

	// Set new access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.AccessTokenName,
		Value:    newAccessToken,
		MaxAge:   h.sessionConfig.AccessTokenMaxAge,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Token refreshed successfully"})
}
