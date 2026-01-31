package config

import (
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

// OAuthConfig holds the OAuth configuration for different providers
type OAuthConfig struct {
	Google *oauth2.Config
	GitHub *oauth2.Config
}

// InitOAuthConfig initializes OAuth configurations from environment variables
func InitOAuthConfig() *OAuthConfig {
	redirectURL := os.Getenv("OAUTH_REDIRECT_URL")
	if redirectURL == "" {
		redirectURL = "http://localhost:8080/auth/callback"
	}

	return &OAuthConfig{
		Google: &oauth2.Config{
			ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			RedirectURL:  redirectURL + "/google",
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		},
		GitHub: &oauth2.Config{
			ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
			ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
			RedirectURL:  redirectURL + "/github",
			Scopes:       []string{"user:email", "read:user"},
			Endpoint:     github.Endpoint,
		},
	}
}

// SessionConfig holds session configuration
type SessionConfig struct {
	SecretKey            string
	AccessTokenName      string
	AccessTokenMaxAge    int // in seconds
	RefreshTokenName     string
	RefreshTokenMaxAge   int // in seconds
}

// InitSessionConfig initializes session configuration
func InitSessionConfig() *SessionConfig {
	secretKey := os.Getenv("SESSION_SECRET")
	if secretKey == "" {
		secretKey = "your-secret-key-change-this-in-production"
	}

	return &SessionConfig{
		SecretKey:            secretKey,
		AccessTokenName:      "session_token",
		AccessTokenMaxAge:    3600,        // 1 hour
		RefreshTokenName:     "refresh_token",
		RefreshTokenMaxAge:   86400 * 7,   // 7 days
	}
}
