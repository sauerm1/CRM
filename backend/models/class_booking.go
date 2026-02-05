package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ClassBooking represents a member's class booking/enrollment
type ClassBooking struct {
	ID        primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	ClassID   *primitive.ObjectID `json:"class_id" bson:"class_id,omitempty"`
	MemberID  *primitive.ObjectID `json:"member_id" bson:"member_id,omitempty"`
	Status    string              `json:"status" bson:"status"` // confirmed, waitlist, cancelled, attended, no-show
	BookedAt  time.Time           `json:"booked_at" bson:"booked_at"`
	Notes     string              `json:"notes" bson:"notes"`
	CreatedAt time.Time           `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time           `json:"updated_at" bson:"updated_at"`
}
