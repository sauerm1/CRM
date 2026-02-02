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

// GetReservations retrieves all reservations
func GetReservations(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Support filtering by restaurant_id
		filter := bson.M{}
		if restaurantID := r.URL.Query().Get("restaurant_id"); restaurantID != "" {
			objID, err := primitive.ObjectIDFromHex(restaurantID)
			if err == nil {
				filter["restaurant_id"] = objID
			}
		}

		cursor, err := collection.Find(ctx, filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var reservations []models.Reservation
		if err = cursor.All(ctx, &reservations); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(reservations)
	}
}

// GetReservation retrieves a single reservation by ID
func GetReservation(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID format", http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var reservation models.Reservation
		err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&reservation)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "Reservation not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(reservation)
	}
}

// CreateReservation creates a new reservation
func CreateReservation(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var reservation models.Reservation
		if err := json.NewDecoder(r.Body).Decode(&reservation); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		reservation.CreatedAt = time.Now()
		reservation.UpdatedAt = time.Now()

		// Default status if not provided
		if reservation.Status == "" {
			reservation.Status = "confirmed"
		}

		result, err := collection.InsertOne(ctx, reservation)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		reservation.ID = result.InsertedID.(primitive.ObjectID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(reservation)
	}
}

// UpdateReservation updates an existing reservation
func UpdateReservation(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID format", http.StatusBadRequest)
			return
		}

		var reservation models.Reservation
		if err := json.NewDecoder(r.Body).Decode(&reservation); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		reservation.UpdatedAt = time.Now()

		update := bson.M{
			"$set": bson.M{
				"restaurant_id":     reservation.RestaurantID,
				"member_id":         reservation.MemberID,
				"guest_name":        reservation.GuestName,
				"guest_email":       reservation.GuestEmail,
				"guest_phone":       reservation.GuestPhone,
				"party_size":        reservation.PartySize,
				"date_time":         reservation.DateTime,
				"status":            reservation.Status,
				"special_requests":  reservation.SpecialReqs,
				"notes":             reservation.Notes,
				"updated_at":        reservation.UpdatedAt,
			},
		}

		result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			http.Error(w, "Reservation not found", http.StatusNotFound)
			return
		}

		reservation.ID = objectID
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(reservation)
	}
}

// DeleteReservation deletes a reservation
func DeleteReservation(collection *mongo.Collection) http.HandlerFunc {
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
			http.Error(w, "Reservation not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
