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
		origin := r.Header.Get("Origin")
		// Allow localhost:3000 (frontend) and any Expo Go requests
		if origin == "http://localhost:3000" || origin == "http://10.7.150.85:8082" || origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		}
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

	// Initialize JWT configuration
	jwtConfig := config.InitJWTConfig()

	// Initialize handlers with database
	h := handlers.NewHandler(db)
	localAuthHandler := handlers.NewLocalAuthHandler(db.Client.Database(db.DatabaseName), jwtConfig)
	memberHandler := handlers.NewMemberHandler(db.Client.Database(db.DatabaseName))
	classHandler := handlers.NewClassHandler(db.Client.Database(db.DatabaseName))
	instructorHandler := handlers.NewInstructorHandler(db.Client.Database(db.DatabaseName))
	clubHandler := handlers.NewClubHandler(db.Client.Database(db.DatabaseName))
	authMiddleware := middleware.NewAuthMiddleware(db.Client.Database(db.DatabaseName), jwtConfig)

	// Initialize restaurant and reservation collections
	restaurantCollection := db.Client.Database(db.DatabaseName).Collection("restaurants")
	reservationCollection := db.Client.Database(db.DatabaseName).Collection("reservations")
	officeCollection := db.Client.Database(db.DatabaseName).Collection("offices")
	officeBookingCollection := db.Client.Database(db.DatabaseName).Collection("office_bookings")
	classBookingCollection := db.Client.Database(db.DatabaseName).Collection("class_bookings")
	userCollection := db.Client.Database(db.DatabaseName).Collection("users")
	membersCollection := db.Client.Database(db.DatabaseName).Collection("members")

	// Setup routes
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/health", h.HealthHandler)

	// Local authentication routes
	mux.HandleFunc("/auth/login", localAuthHandler.Login)

	// Protected routes - require authentication
	mux.HandleFunc("/api/me", authMiddleware.RequireAuth(handlers.Me))
	
	// Revenue analytics routes - require authentication
	mux.HandleFunc("GET /api/revenue", authMiddleware.RequireAuth(handlers.GetRevenueAnalytics(officeBookingCollection, membersCollection)))

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

	// Restaurant routes - require authentication
	mux.HandleFunc("GET /api/restaurants", authMiddleware.RequireAuth(handlers.GetRestaurants(restaurantCollection)))
	mux.HandleFunc("POST /api/restaurants", authMiddleware.RequireAuth(handlers.CreateRestaurant(restaurantCollection)))
	mux.HandleFunc("GET /api/restaurants/{id}", authMiddleware.RequireAuth(handlers.GetRestaurant(restaurantCollection)))
	mux.HandleFunc("PUT /api/restaurants/{id}", authMiddleware.RequireAuth(handlers.UpdateRestaurant(restaurantCollection)))
	mux.HandleFunc("DELETE /api/restaurants/{id}", authMiddleware.RequireAuth(handlers.DeleteRestaurant(restaurantCollection)))

	// Reservation routes - require authentication
	mux.HandleFunc("GET /api/reservations", authMiddleware.RequireAuth(handlers.GetReservations(reservationCollection)))
	mux.HandleFunc("POST /api/reservations", authMiddleware.RequireAuth(handlers.CreateReservation(reservationCollection)))
	mux.HandleFunc("GET /api/reservations/{id}", authMiddleware.RequireAuth(handlers.GetReservation(reservationCollection)))
	mux.HandleFunc("PUT /api/reservations/{id}", authMiddleware.RequireAuth(handlers.UpdateReservation(reservationCollection)))
	mux.HandleFunc("DELETE /api/reservations/{id}", authMiddleware.RequireAuth(handlers.DeleteReservation(reservationCollection)))

	// Office routes - require authentication
	mux.HandleFunc("GET /api/offices", authMiddleware.RequireAuth(handlers.GetOffices(officeCollection)))
	mux.HandleFunc("POST /api/offices", authMiddleware.RequireAuth(handlers.CreateOffice(officeCollection)))
	mux.HandleFunc("GET /api/offices/{id}", authMiddleware.RequireAuth(handlers.GetOffice(officeCollection)))
	mux.HandleFunc("PUT /api/offices/{id}", authMiddleware.RequireAuth(handlers.UpdateOffice(officeCollection)))
	mux.HandleFunc("DELETE /api/offices/{id}", authMiddleware.RequireAuth(handlers.DeleteOffice(officeCollection)))

	// Office booking routes - require authentication
	mux.HandleFunc("GET /api/office-bookings", authMiddleware.RequireAuth(handlers.GetOfficeBookings(officeBookingCollection)))
	mux.HandleFunc("POST /api/office-bookings", authMiddleware.RequireAuth(handlers.CreateOfficeBooking(officeBookingCollection)))
	mux.HandleFunc("GET /api/office-bookings/{id}", authMiddleware.RequireAuth(handlers.GetOfficeBooking(officeBookingCollection)))
	mux.HandleFunc("PUT /api/office-bookings/{id}", authMiddleware.RequireAuth(handlers.UpdateOfficeBooking(officeBookingCollection)))

	// Class booking routes - require authentication
	classBookingHandler := &handlers.ClassBookingHandler{Collection: classBookingCollection}
	mux.HandleFunc("GET /api/class-bookings", authMiddleware.RequireAuth(classBookingHandler.List))
	mux.HandleFunc("POST /api/class-bookings", authMiddleware.RequireAuth(classBookingHandler.Create))
	mux.HandleFunc("GET /api/class-bookings/{id}", authMiddleware.RequireAuth(classBookingHandler.Get))
	mux.HandleFunc("PUT /api/class-bookings/{id}", authMiddleware.RequireAuth(classBookingHandler.Update))
	mux.HandleFunc("DELETE /api/class-bookings/{id}", authMiddleware.RequireAuth(classBookingHandler.Delete))
	mux.HandleFunc("POST /api/class-bookings/{id}/cancel", authMiddleware.RequireAuth(classBookingHandler.Cancel))
	mux.HandleFunc("DELETE /api/office-bookings/{id}", authMiddleware.RequireAuth(handlers.DeleteOfficeBooking(officeBookingCollection)))

	// User management routes - require authentication (admin only in the future)
	mux.HandleFunc("GET /api/users", authMiddleware.RequireAuth(handlers.GetUsers(userCollection)))
	mux.HandleFunc("POST /api/users", authMiddleware.RequireAuth(handlers.CreateUser(userCollection)))
	mux.HandleFunc("GET /api/users/{id}", authMiddleware.RequireAuth(handlers.GetUser(userCollection)))
	mux.HandleFunc("PUT /api/users/{id}", authMiddleware.RequireAuth(handlers.UpdateUser(userCollection)))
	mux.HandleFunc("DELETE /api/users/{id}", authMiddleware.RequireAuth(handlers.DeleteUser(userCollection)))

	// User profile routes
	mux.HandleFunc("POST /api/me/change-password", authMiddleware.RequireAuth(handlers.ChangePassword(userCollection)))

	// Create server
	srv := &http.Server{
		Addr:         "0.0.0.0:8080", // Bind to all network interfaces
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
