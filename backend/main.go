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

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

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
	memberHandler := handlers.NewMemberHandler(db.Client.Database(db.DatabaseName))
	classHandler := handlers.NewClassHandler(db.Client.Database(db.DatabaseName))
	instructorHandler := handlers.NewInstructorHandler(db.Client.Database(db.DatabaseName))
	clubHandler := handlers.NewClubHandler(db.Client.Database(db.DatabaseName))
	authMiddleware := middleware.NewAuthMiddleware(db.Client.Database(db.DatabaseName), sessionConfig)

	// Setup routes
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/health", h.HealthHandler)

	// Local authentication routes
	mux.HandleFunc("/auth/register", localAuthHandler.Register)
	mux.HandleFunc("/auth/login", localAuthHandler.Login)
	mux.HandleFunc("/auth/refresh", localAuthHandler.RefreshToken)

	// OAuth routes
	mux.HandleFunc("/auth/google", oauthHandler.GoogleLogin)
	mux.HandleFunc("/auth/github", oauthHandler.GitHubLogin)
	mux.HandleFunc("/auth/callback/google", oauthHandler.GoogleCallback)
	mux.HandleFunc("/auth/callback/github", oauthHandler.GitHubCallback)
	mux.HandleFunc("/auth/logout", oauthHandler.Logout)

	// Protected routes - require authentication
	mux.HandleFunc("/api/me", authMiddleware.RequireAuth(oauthHandler.Me))

	// Member CRM routes - require authentication
	mux.HandleFunc("/api/members", authMiddleware.RequireAuth(memberHandler.MembersHandler))
	mux.HandleFunc("/api/members/", authMiddleware.RequireAuth(memberHandler.MemberHandler))

	// Class schedule routes - require authentication
	mux.HandleFunc("/api/classes", authMiddleware.RequireAuth(classHandler.ClassesHandler))
	mux.HandleFunc("/api/classes/", authMiddleware.RequireAuth(classHandler.ClassHandler))

	// Instructor routes - require authentication
	mux.HandleFunc("/api/instructors", authMiddleware.RequireAuth(instructorHandler.InstructorsHandler))
	mux.HandleFunc("/api/instructors/", authMiddleware.RequireAuth(instructorHandler.InstructorHandler))

	// Club routes - require authentication
	mux.HandleFunc("/api/clubs", authMiddleware.RequireAuth(clubHandler.ClubsHandler))
	mux.HandleFunc("/api/clubs/", authMiddleware.RequireAuth(clubHandler.ClubHandler))

	// Create server
	srv := &http.Server{
		Addr:         ":8080",
		Handler:      corsMiddleware(mux),
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
