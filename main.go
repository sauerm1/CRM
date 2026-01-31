package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"go-api-mongo/config"
	"go-api-mongo/database"
	"go-api-mongo/handlers"
	"go-api-mongo/middleware"
)

func main() {
	// Initialize MongoDB connection
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Disconnect()

	// Initialize OAuth and session configuration
	oauthConfig := config.InitOAuthConfig()
	sessionConfig := config.InitSessionConfig()

	// Initialize handlers with database
	h := handlers.NewHandler(db)
	oauthHandler := handlers.NewOAuthHandler(db.Client.Database(db.DatabaseName), oauthConfig, sessionConfig)
	localAuthHandler := handlers.NewLocalAuthHandler(db.Client.Database(db.DatabaseName), sessionConfig)
	authMiddleware := middleware.NewAuthMiddleware(db.Client.Database(db.DatabaseName), sessionConfig)

	// Setup routes
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/health", h.HealthHandler)

	// Local authentication routes
	mux.HandleFunc("/auth/register", localAuthHandler.Register)
	mux.HandleFunc("/auth/login", localAuthHandler.Login)

	// OAuth routes
	mux.HandleFunc("/auth/google", oauthHandler.GoogleLogin)
	mux.HandleFunc("/auth/github", oauthHandler.GitHubLogin)
	mux.HandleFunc("/auth/callback/google", oauthHandler.GoogleCallback)
	mux.HandleFunc("/auth/callback/github", oauthHandler.GitHubCallback)
	mux.HandleFunc("/auth/logout", oauthHandler.Logout)

	// Protected routes - require authentication
	mux.HandleFunc("/api/me", authMiddleware.RequireAuth(oauthHandler.Me))

	// Create server
	srv := &http.Server{
		Addr:         ":8080",
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Println("Server starting on port 8080...")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Server shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server stopped")
}
