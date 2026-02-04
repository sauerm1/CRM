package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go-api-mongo/config"
	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
)

type OAuthHandler struct {
	db            *mongo.Database
	oauthConfig   *config.OAuthConfig
	sessionConfig *config.SessionConfig
}

func NewOAuthHandler(db *mongo.Database, oauthConfig *config.OAuthConfig, sessionConfig *config.SessionConfig) *OAuthHandler {
	return &OAuthHandler{
		db:            db,
		oauthConfig:   oauthConfig,
		sessionConfig: sessionConfig,
	}
}

// generateStateToken generates a random state token for OAuth
func generateStateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// generateSessionToken generates a random session token
func generateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// GoogleLogin handles the Google OAuth login
func (h *OAuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	state, err := generateStateToken()
	if err != nil {
		http.Error(w, "Failed to generate state token", http.StatusInternalServerError)
		return
	}

	// Store state in session cookie for verification
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		MaxAge:   300, // 5 minutes
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	})

	url := h.oauthConfig.Google.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GitHubLogin handles the GitHub OAuth login
func (h *OAuthHandler) GitHubLogin(w http.ResponseWriter, r *http.Request) {
	state, err := generateStateToken()
	if err != nil {
		http.Error(w, "Failed to generate state token", http.StatusInternalServerError)
		return
	}

	// Store state in session cookie for verification
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		MaxAge:   300, // 5 minutes
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	})

	url := h.oauthConfig.GitHub.AuthCodeURL(state)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GoogleCallback handles the Google OAuth callback
func (h *OAuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	h.handleCallback(w, r, "google", h.oauthConfig.Google)
}

// GitHubCallback handles the GitHub OAuth callback
func (h *OAuthHandler) GitHubCallback(w http.ResponseWriter, r *http.Request) {
	h.handleCallback(w, r, "github", h.oauthConfig.GitHub)
}

// handleCallback is a generic callback handler for OAuth providers
func (h *OAuthHandler) handleCallback(w http.ResponseWriter, r *http.Request, provider string, oauthConfig *oauth2.Config) {
	// Verify state token
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil {
		http.Error(w, "State token not found", http.StatusBadRequest)
		return
	}

	state := r.URL.Query().Get("state")
	if state != stateCookie.Value {
		http.Error(w, "Invalid state token", http.StatusBadRequest)
		return
	}

	// Clear state cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
	})

	// Exchange code for token
	code := r.URL.Query().Get("code")
	token, err := oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch user info
	var userInfo map[string]interface{}
	switch provider {
	case "google":
		userInfo, err = h.fetchGoogleUserInfo(token)
	case "github":
		userInfo, err = h.fetchGitHubUserInfo(token)
	default:
		http.Error(w, "Unknown provider", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, "Failed to fetch user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create or update user
	user, err := h.createOrUpdateUser(provider, userInfo)
	if err != nil {
		http.Error(w, "Failed to create/update user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create session (access token)
	sessionToken, err := h.createSession(user.ID)
	if err != nil {
		http.Error(w, "Failed to create session: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create refresh token
	refreshToken, err := h.createRefreshToken(user.ID)
	if err != nil {
		http.Error(w, "Failed to create refresh token: "+err.Error(), http.StatusInternalServerError)
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

	// Redirect to dashboard or home page
	http.Redirect(w, r, "/api/me", http.StatusTemporaryRedirect)
}

// fetchGoogleUserInfo fetches user information from Google
func (h *OAuthHandler) fetchGoogleUserInfo(token *oauth2.Token) (map[string]interface{}, error) {
	client := h.oauthConfig.Google.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return userInfo, nil
}

// fetchGitHubUserInfo fetches user information from GitHub
func (h *OAuthHandler) fetchGitHubUserInfo(token *oauth2.Token) (map[string]interface{}, error) {
	client := h.oauthConfig.GitHub.Client(context.Background(), token)

	// Fetch user profile
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	// Fetch user email if not public
	if userInfo["email"] == nil {
		emailResp, err := client.Get("https://api.github.com/user/emails")
		if err == nil {
			defer emailResp.Body.Close()
			var emails []map[string]interface{}
			if err := json.NewDecoder(emailResp.Body).Decode(&emails); err == nil {
				for _, email := range emails {
					if primary, ok := email["primary"].(bool); ok && primary {
						userInfo["email"] = email["email"]
						break
					}
				}
			}
		}
	}

	return userInfo, nil
}

// createOrUpdateUser creates a new user or updates an existing one
func (h *OAuthHandler) createOrUpdateUser(provider string, userInfo map[string]interface{}) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := h.db.Collection("users")

	var providerID string
	var email, name, picture string

	// Extract data based on provider
	switch provider {
	case "google":
		if id, ok := userInfo["id"].(string); ok {
			providerID = id
		}
		if e, ok := userInfo["email"].(string); ok {
			email = e
		}
		if n, ok := userInfo["name"].(string); ok {
			name = n
		}
		if p, ok := userInfo["picture"].(string); ok {
			picture = p
		}
	case "github":
		if id, ok := userInfo["id"].(float64); ok {
			providerID = fmt.Sprintf("%d", int(id))
		}
		if e, ok := userInfo["email"].(string); ok {
			email = e
		}
		if n, ok := userInfo["name"].(string); ok {
			name = n
		} else if login, ok := userInfo["login"].(string); ok {
			name = login
		}
		if p, ok := userInfo["avatar_url"].(string); ok {
			picture = p
		}
	}

	// Check if user exists
	filter := bson.M{"provider": provider, "provider_id": providerID}
	var existingUser models.User
	err := collection.FindOne(ctx, filter).Decode(&existingUser)

	if err == mongo.ErrNoDocuments {
		// Create new user
		user := models.User{
			Email:      email,
			Name:       name,
			Picture:    picture,
			Provider:   provider,
			ProviderID: providerID,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		result, err := collection.InsertOne(ctx, user)
		if err != nil {
			return nil, err
		}

		user.ID = result.InsertedID.(primitive.ObjectID)
		return &user, nil
	} else if err != nil {
		return nil, err
	}

	// Update existing user
	update := bson.M{
		"$set": bson.M{
			"email":      email,
			"name":       name,
			"picture":    picture,
			"updated_at": time.Now(),
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	existingUser.Email = email
	existingUser.Name = name
	existingUser.Picture = picture
	existingUser.UpdatedAt = time.Now()

	return &existingUser, nil
}

// createSession creates a new session for the user
func (h *OAuthHandler) createSession(userID primitive.ObjectID) (string, error) {
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
func (h *OAuthHandler) createRefreshToken(userID primitive.ObjectID) (string, error) {
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

// Logout handles user logout
func (h *OAuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" && r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie(h.sessionConfig.AccessTokenName)
	if err == nil {
		// Delete session from database
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := h.db.Collection("sessions")
		collection.DeleteOne(ctx, bson.M{"token": cookie.Value})
	}

	// Also delete refresh token
	refreshCookie, err := r.Cookie(h.sessionConfig.RefreshTokenName)
	if err == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		refreshCollection := h.db.Collection("refresh_tokens")
		refreshCollection.DeleteOne(ctx, bson.M{"token": refreshCookie.Value})
	}

	// Clear access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.AccessTokenName,
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	// Clear refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.RefreshTokenName,
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

// Me returns the current authenticated user
func (h *OAuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(*models.User)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": user,
	})
}
