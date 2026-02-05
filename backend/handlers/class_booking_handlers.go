package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"go-api-mongo/models"
)

type ClassBookingHandler struct {
	Collection *mongo.Collection
}

func (h *ClassBookingHandler) Create(w http.ResponseWriter, r *http.Request) {
	var booking models.ClassBooking
	if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	booking.ID = primitive.NewObjectID()
	booking.CreatedAt = time.Now()
	booking.UpdatedAt = time.Now()
	booking.BookedAt = time.Now()

	if booking.Status == "" {
		booking.Status = "confirmed"
	}

	_, err := h.Collection.InsertOne(r.Context(), booking)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func (h *ClassBookingHandler) List(w http.ResponseWriter, r *http.Request) {
	memberID := r.URL.Query().Get("member_id")
	classID := r.URL.Query().Get("class_id")

	filter := bson.M{}
	if memberID != "" {
		objID, err := primitive.ObjectIDFromHex(memberID)
		if err == nil {
			filter["member_id"] = objID
		}
	}
	if classID != "" {
		objID, err := primitive.ObjectIDFromHex(classID)
		if err == nil {
			filter["class_id"] = objID
		}
	}

	cursor, err := h.Collection.Find(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(r.Context())

	var bookings []models.ClassBooking
	if err = cursor.All(r.Context(), &bookings); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}

func (h *ClassBookingHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var booking models.ClassBooking
	err = h.Collection.FindOne(r.Context(), bson.M{"_id": objID}).Decode(&booking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Booking not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func (h *ClassBookingHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var booking models.ClassBooking
	if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	booking.UpdatedAt = time.Now()

	update := bson.M{"$set": booking}
	_, err = h.Collection.UpdateOne(r.Context(), bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func (h *ClassBookingHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.Collection.DeleteOne(r.Context(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Cancel cancels a class booking (soft delete by updating status)
func (h *ClassBookingHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":     "cancelled",
			"updated_at": time.Now(),
		},
	}

	result, err := h.Collection.UpdateOne(r.Context(), bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Booking not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking cancelled"})
}
