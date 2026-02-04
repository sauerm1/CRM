package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go-api-mongo/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func GetUsers(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.URL.Query().Get("role")
		clubID := r.URL.Query().Get("club_id")

		filter := bson.M{}
		if role != "" {
			filter["role"] = role
		}
		if clubID != "" {
			objID, err := primitive.ObjectIDFromHex(clubID)
			if err == nil {
				filter["assigned_club_ids"] = objID
			}
		}

		cursor, err := collection.Find(context.Background(), filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

		var users []models.User
		if err := cursor.All(context.Background(), &users); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if users == nil {
			users = []models.User{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}

func GetUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var user models.User
		err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func CreateUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input struct {
			Email           string   `json:"email"`
			Name            string   `json:"name"`
			Password        string   `json:"password"`
			Role            string   `json:"role"`
			AssignedClubIDs []string `json:"assigned_club_ids"`
			Active          bool     `json:"active"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Validate required fields
		if input.Email == "" || input.Name == "" || input.Password == "" || input.Role == "" {
			http.Error(w, "Email, name, password, and role are required", http.StatusBadRequest)
			return
		}

		// Check if user already exists
		var existingUser models.User
		err := collection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&existingUser)
		if err == nil {
			http.Error(w, "User with this email already exists", http.StatusConflict)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Convert club IDs to ObjectIDs
		var clubObjIDs []primitive.ObjectID
		for _, clubID := range input.AssignedClubIDs {
			objID, err := primitive.ObjectIDFromHex(clubID)
			if err == nil {
				clubObjIDs = append(clubObjIDs, objID)
			}
		}

		user := models.User{
			Email:           input.Email,
			Name:            input.Name,
			Password:        string(hashedPassword),
			Provider:        "local",
			Role:            input.Role,
			AssignedClubIDs: clubObjIDs,
			Active:          input.Active,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		result, err := collection.InsertOne(context.Background(), user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user.ID = result.InsertedID.(primitive.ObjectID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(user)
	}
}

func UpdateUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var input struct {
			Name            string   `json:"name"`
			Role            string   `json:"role"`
			AssignedClubIDs []string `json:"assigned_club_ids"`
			Active          *bool    `json:"active"`
			Password        string   `json:"password,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		update := bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
		}

		if input.Name != "" {
			update["$set"].(bson.M)["name"] = input.Name
		}
		if input.Role != "" {
			update["$set"].(bson.M)["role"] = input.Role
		}
		if input.Active != nil {
			update["$set"].(bson.M)["active"] = *input.Active
		}

		// Convert club IDs
		if input.AssignedClubIDs != nil {
			var clubObjIDs []primitive.ObjectID
			for _, clubID := range input.AssignedClubIDs {
				objID, err := primitive.ObjectIDFromHex(clubID)
				if err == nil {
					clubObjIDs = append(clubObjIDs, objID)
				}
			}
			update["$set"].(bson.M)["assigned_club_ids"] = clubObjIDs
		}

		// Update password if provided
		if input.Password != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
			if err != nil {
				http.Error(w, "Failed to hash password", http.StatusInternalServerError)
				return
			}
			update["$set"].(bson.M)["password"] = string(hashedPassword)
		}

		result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		var user models.User
		err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func DeleteUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objID})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.DeletedCount == 0 {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
