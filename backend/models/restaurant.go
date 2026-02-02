package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Restaurant represents a restaurant at a club location
type Restaurant struct {
	ID          primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	ClubID      *primitive.ObjectID `json:"club_id" bson:"club_id,omitempty"`
	Name        string              `json:"name" bson:"name"`
	Description string              `json:"description" bson:"description"`
	Cuisine     string              `json:"cuisine" bson:"cuisine"`
	Phone       string              `json:"phone" bson:"phone"`
	Email       string              `json:"email" bson:"email"`
	Capacity    int                 `json:"capacity" bson:"capacity"`
	OpeningTime string              `json:"opening_time" bson:"opening_time"`
	ClosingTime string              `json:"closing_time" bson:"closing_time"`
	Active      bool                `json:"active" bson:"active"`
	CreatedAt   time.Time           `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at" bson:"updated_at"`
}
