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
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetOffices returns all offices, optionally filtered by club_id
func GetOffices(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		filter := bson.M{}
		if clubID := r.URL.Query().Get("club_id"); clubID != "" {
			objID, err := primitive.ObjectIDFromHex(clubID)
			if err != nil {
				http.Error(w, "Invalid club ID", http.StatusBadRequest)
				return
			}
			filter["club_id"] = objID
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		cursor, err := collection.Find(ctx, filter, options.Find())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var offices []models.Office
		if err = cursor.All(ctx, &offices); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if offices == nil {
			offices = []models.Office{}
		}

		json.NewEncoder(w).Encode(offices)
	}
}

// GetOffice returns a single office by ID
func GetOffice(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid office ID", http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var office models.Office
		err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&office)
		if err != nil {
			http.Error(w, "Office not found", http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(office)
	}
}

// CreateOffice creates a new office
func CreateOffice(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var office models.Office
		if err := json.NewDecoder(r.Body).Decode(&office); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		office.CreatedAt = time.Now()
		office.UpdatedAt = time.Now()

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := collection.InsertOne(ctx, office)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		office.ID = result.InsertedID.(primitive.ObjectID)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(office)
	}
}

// UpdateOffice updates an existing office
func UpdateOffice(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid office ID", http.StatusBadRequest)
			return
		}

		var office models.Office
		if err := json.NewDecoder(r.Body).Decode(&office); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		office.UpdatedAt = time.Now()

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{
			"$set": bson.M{
				"club_id":      office.ClubID,
				"name":         office.Name,
				"description":  office.Description,
				"type":         office.Type,
				"capacity":     office.Capacity,
				"amenities":    office.Amenities,
				"hourly_rate":  office.HourlyRate,
				"daily_rate":   office.DailyRate,
				"active":       office.Active,
				"updated_at":   office.UpdatedAt,
			},
		}

		result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			http.Error(w, "Office not found", http.StatusNotFound)
			return
		}

		office.ID = objectID
		json.NewEncoder(w).Encode(office)
	}
}

// DeleteOffice deletes an office
func DeleteOffice(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid office ID", http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.DeletedCount == 0 {
			http.Error(w, "Office not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
