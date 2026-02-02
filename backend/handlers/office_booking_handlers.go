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

// GetOfficeBookings returns all office bookings, optionally filtered by office_id or member_id
func GetOfficeBookings(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		w.Header().Set("Content-Type", "application/json")

		filter := bson.M{}
		if officeID := r.URL.Query().Get("office_id"); officeID != "" {
			objID, err := primitive.ObjectIDFromHex(officeID)
			if err != nil {
				http.Error(w, "Invalid office ID", http.StatusBadRequest)
				return
			}
			filter["office_id"] = objID
		}
		if memberID := r.URL.Query().Get("member_id"); memberID != "" {
			objID, err := primitive.ObjectIDFromHex(memberID)
			if err != nil {
				http.Error(w, "Invalid member ID", http.StatusBadRequest)
				return
			}
			filter["member_id"] = objID
		}
		if status := r.URL.Query().Get("status"); status != "" {
			filter["status"] = status
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		opts := options.Find().SetSort(bson.D{{Key: "start_time", Value: -1}})
		cursor, err := collection.Find(ctx, filter, opts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var bookings []models.OfficeBooking
		if err = cursor.All(ctx, &bookings); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if bookings == nil {
			bookings = []models.OfficeBooking{}
		}

		json.NewEncoder(w).Encode(bookings)
	}
}

// GetOfficeBooking returns a single office booking by ID
func GetOfficeBooking(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid booking ID", http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var booking models.OfficeBooking
		err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&booking)
		if err != nil {
			http.Error(w, "Booking not found", http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(booking)
	}
}

// CreateOfficeBooking creates a new office booking
func CreateOfficeBooking(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var booking models.OfficeBooking
		if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		booking.CreatedAt = time.Now()
		booking.UpdatedAt = time.Now()
		if booking.Status == "" {
			booking.Status = "confirmed"
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := collection.InsertOne(ctx, booking)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		booking.ID = result.InsertedID.(primitive.ObjectID)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(booking)
	}
}

// UpdateOfficeBooking updates an existing office booking
func UpdateOfficeBooking(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid booking ID", http.StatusBadRequest)
			return
		}

		var booking models.OfficeBooking
		if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		booking.UpdatedAt = time.Now()

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{
			"$set": bson.M{
				"office_id":  booking.OfficeID,
				"member_id":  booking.MemberID,
				"start_time": booking.StartTime,
				"end_time":   booking.EndTime,
				"status":     booking.Status,
				"total_cost": booking.TotalCost,
				"notes":      booking.Notes,
				"updated_at": booking.UpdatedAt,
			},
		}

		result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			http.Error(w, "Booking not found", http.StatusNotFound)
			return
		}

		booking.ID = objectID
		json.NewEncoder(w).Encode(booking)
	}
}

// DeleteOfficeBooking deletes an office booking
func DeleteOfficeBooking(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := r.PathValue("id")
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid booking ID", http.StatusBadRequest)
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
			http.Error(w, "Booking not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
