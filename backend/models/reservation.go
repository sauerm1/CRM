package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Reservation represents a restaurant reservation
type Reservation struct {
	ID           primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	RestaurantID *primitive.ObjectID `json:"restaurant_id" bson:"restaurant_id,omitempty"`
	MemberID     *primitive.ObjectID `json:"member_id" bson:"member_id,omitempty"`
	GuestName    string              `json:"guest_name" bson:"guest_name"`
	GuestEmail   string              `json:"guest_email" bson:"guest_email"`
	GuestPhone   string              `json:"guest_phone" bson:"guest_phone"`
	PartySize    int                 `json:"party_size" bson:"party_size"`
	DateTime     time.Time           `json:"date_time" bson:"date_time"`
	Status       string              `json:"status" bson:"status"` // confirmed, cancelled, completed, no-show
	SpecialReqs  string              `json:"special_requests" bson:"special_requests"`
	Notes        string              `json:"notes" bson:"notes"`
	CreatedAt    time.Time           `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at" bson:"updated_at"`
}
