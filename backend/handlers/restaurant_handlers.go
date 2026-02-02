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
)

// GetRestaurants retrieves all restaurants
func GetRestaurants(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		cursor, err := collection.Find(ctx, bson.M{})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var restaurants []models.Restaurant
		if err = cursor.All(ctx, &restaurants); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(restaurants)
	}
}

// GetRestaurant retrieves a single restaurant by ID
func GetRestaurant(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID format", http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var restaurant models.Restaurant
		err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&restaurant)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "Restaurant not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(restaurant)
	}
}

// CreateRestaurant creates a new restaurant
func CreateRestaurant(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var restaurant models.Restaurant
		if err := json.NewDecoder(r.Body).Decode(&restaurant); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		restaurant.CreatedAt = time.Now()
		restaurant.UpdatedAt = time.Now()

		result, err := collection.InsertOne(ctx, restaurant)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		restaurant.ID = result.InsertedID.(primitive.ObjectID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(restaurant)
	}
}

// UpdateRestaurant updates an existing restaurant
func UpdateRestaurant(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID format", http.StatusBadRequest)
			return
		}

		var restaurant models.Restaurant
		if err := json.NewDecoder(r.Body).Decode(&restaurant); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		restaurant.UpdatedAt = time.Now()

		update := bson.M{
			"$set": bson.M{
				"club_id":      restaurant.ClubID,
				"name":         restaurant.Name,
				"description":  restaurant.Description,
				"cuisine":      restaurant.Cuisine,
				"phone":        restaurant.Phone,
				"email":        restaurant.Email,
				"capacity":     restaurant.Capacity,
				"opening_time": restaurant.OpeningTime,
				"closing_time": restaurant.ClosingTime,
				"active":       restaurant.Active,
				"updated_at":   restaurant.UpdatedAt,
			},
		}

		result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			http.Error(w, "Restaurant not found", http.StatusNotFound)
			return
		}

		restaurant.ID = objectID
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(restaurant)
	}
}

// DeleteRestaurant deletes a restaurant
func DeleteRestaurant(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID format", http.StatusBadRequest)
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
			http.Error(w, "Restaurant not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
