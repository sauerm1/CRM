package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Club represents a gym location/club
type Club struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	Address   string             `json:"address" bson:"address"`
	City      string             `json:"city" bson:"city"`
	State     string             `json:"state" bson:"state"`
	ZipCode   string             `json:"zip_code" bson:"zip_code"`
	Phone     string             `json:"phone" bson:"phone"`
	Email     string             `json:"email" bson:"email"`
	Active    bool               `json:"active" bson:"active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}
