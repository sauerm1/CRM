package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Instructor struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Phone     string             `bson:"phone" json:"phone"`
	Specialty string             `bson:"specialty" json:"specialty"`
	Bio       string             `bson:"bio" json:"bio"`
	Active    bool               `bson:"active" json:"active"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}
