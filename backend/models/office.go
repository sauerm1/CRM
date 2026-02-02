package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Office represents a rentable office/workspace at a club
type Office struct {
	ID          primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	ClubID      *primitive.ObjectID `json:"club_id" bson:"club_id,omitempty"`
	Name        string              `json:"name" bson:"name"`
	Description string              `json:"description" bson:"description"`
	Type        string              `json:"type" bson:"type"` // private, shared, meeting_room, phone_booth
	Capacity    int                 `json:"capacity" bson:"capacity"`
	Amenities   []string            `json:"amenities" bson:"amenities"` // wifi, monitor, whiteboard, etc.
	HourlyRate  float64             `json:"hourly_rate" bson:"hourly_rate"`
	DailyRate   float64             `json:"daily_rate" bson:"daily_rate"`
	Active      bool                `json:"active" bson:"active"`
	CreatedAt   time.Time           `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at" bson:"updated_at"`
}

// OfficeBooking represents a member's office booking
type OfficeBooking struct {
	ID        primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	OfficeID  *primitive.ObjectID `json:"office_id" bson:"office_id,omitempty"`
	MemberID  *primitive.ObjectID `json:"member_id" bson:"member_id,omitempty"`
	StartTime time.Time           `json:"start_time" bson:"start_time"`
	EndTime   time.Time           `json:"end_time" bson:"end_time"`
	Status    string              `json:"status" bson:"status"` // confirmed, cancelled, completed, no-show
	TotalCost float64             `json:"total_cost" bson:"total_cost"`
	Notes     string              `json:"notes" bson:"notes"`
	CreatedAt time.Time           `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time           `json:"updated_at" bson:"updated_at"`
}
