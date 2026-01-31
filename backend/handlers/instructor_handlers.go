package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"go-api-mongo/models"
)

type InstructorHandler struct {
	collection *mongo.Collection
}

func NewInstructorHandler(db *mongo.Database) *InstructorHandler {
	return &InstructorHandler{
		collection: db.Collection("instructors"),
	}
}

func (h *InstructorHandler) InstructorsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetInstructors(w, r)
	case "POST":
		h.CreateInstructor(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *InstructorHandler) InstructorHandler(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/instructors/")
	id := strings.TrimSpace(path)

	if id == "" {
		http.Error(w, "Instructor ID required", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		h.GetInstructor(w, r, id)
	case "PUT":
		h.UpdateInstructor(w, r, id)
	case "DELETE":
		h.DeleteInstructor(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *InstructorHandler) GetInstructors(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var instructors []models.Instructor
	if err := cursor.All(ctx, &instructors); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if instructors == nil {
		instructors = []models.Instructor{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instructors)
}

func (h *InstructorHandler) GetInstructor(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid instructor ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var instructor models.Instructor
	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&instructor)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Instructor not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instructor)
}

func (h *InstructorHandler) CreateInstructor(w http.ResponseWriter, r *http.Request) {
	var instructor models.Instructor
	if err := json.NewDecoder(r.Body).Decode(&instructor); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	instructor.CreatedAt = time.Now()
	instructor.UpdatedAt = time.Now()

	if !instructor.Active {
		instructor.Active = true
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.collection.InsertOne(ctx, instructor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	instructor.ID = result.InsertedID.(primitive.ObjectID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(instructor)
}

func (h *InstructorHandler) UpdateInstructor(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid instructor ID", http.StatusBadRequest)
		return
	}

	var instructor models.Instructor
	if err := json.NewDecoder(r.Body).Decode(&instructor); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	instructor.UpdatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":       instructor.Name,
			"email":      instructor.Email,
			"phone":      instructor.Phone,
			"specialty":  instructor.Specialty,
			"bio":        instructor.Bio,
			"active":     instructor.Active,
			"club_ids":   instructor.ClubIDs,
			"updated_at": instructor.UpdatedAt,
		},
	}

	result, err := h.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Instructor not found", http.StatusNotFound)
		return
	}

	instructor.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instructor)
}

func (h *InstructorHandler) DeleteInstructor(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid instructor ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Instructor not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Instructor deleted successfully"})
}
