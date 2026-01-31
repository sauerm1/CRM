package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ClubHandler struct {
	collection *mongo.Collection
}

func NewClubHandler(db *mongo.Database) *ClubHandler {
	return &ClubHandler{
		collection: db.Collection("clubs"),
	}
}

// ClubsHandler handles GET (all clubs) and POST (create club)
func (h *ClubHandler) ClubsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetClubs(w, r)
	case "POST":
		h.CreateClub(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// ClubHandler handles GET (single club), PUT (update), DELETE
func (h *ClubHandler) ClubHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetClub(w, r)
	case "PUT":
		h.UpdateClub(w, r)
	case "DELETE":
		h.DeleteClub(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// GetClubs returns all clubs
func (h *ClubHandler) GetClubs(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var clubs []models.Club
	if err = cursor.All(ctx, &clubs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if clubs == nil {
		clubs = []models.Club{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clubs)
}

// GetClub returns a single club by ID
func (h *ClubHandler) GetClub(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/clubs/")
	id, err := primitive.ObjectIDFromHex(path)
	if err != nil {
		http.Error(w, "Invalid club ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var club models.Club
	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&club)
	if err == mongo.ErrNoDocuments {
		http.Error(w, "Club not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(club)
}

// CreateClub creates a new club
func (h *ClubHandler) CreateClub(w http.ResponseWriter, r *http.Request) {
	var club models.Club
	if err := json.NewDecoder(r.Body).Decode(&club); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if club.Name == "" {
		http.Error(w, "Club name is required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	club.CreatedAt = time.Now()
	club.UpdatedAt = time.Now()

	result, err := h.collection.InsertOne(ctx, club)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	club.ID = result.InsertedID.(primitive.ObjectID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(club)
}

// UpdateClub updates an existing club
func (h *ClubHandler) UpdateClub(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/clubs/")
	id, err := primitive.ObjectIDFromHex(path)
	if err != nil {
		http.Error(w, "Invalid club ID", http.StatusBadRequest)
		return
	}

	var club models.Club
	if err := json.NewDecoder(r.Body).Decode(&club); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	club.UpdatedAt = time.Now()

	update := bson.M{
		"$set": bson.M{
			"name":       club.Name,
			"address":    club.Address,
			"city":       club.City,
			"state":      club.State,
			"zip_code":   club.ZipCode,
			"phone":      club.Phone,
			"email":      club.Email,
			"active":     club.Active,
			"updated_at": club.UpdatedAt,
		},
	}

	result, err := h.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Club not found", http.StatusNotFound)
		return
	}

	club.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(club)
}

// DeleteClub deletes a club
func (h *ClubHandler) DeleteClub(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/clubs/")
	id, err := primitive.ObjectIDFromHex(path)
	if err != nil {
		http.Error(w, "Invalid club ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Club not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
