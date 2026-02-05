package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the system
type User struct {
	ID              primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Email           string               `json:"email" bson:"email"`
	FirstName       string               `json:"first_name" bson:"first_name"`
	LastName        string               `json:"last_name" bson:"last_name"`
	Name            string               `json:"name,omitempty" bson:"name,omitempty"` // Deprecated, kept for backwards compatibility
	Picture         string               `json:"picture,omitempty" bson:"picture,omitempty"`
	Password        string               `json:"-" bson:"password,omitempty"`
	Role            string               `json:"role" bson:"role"` // admin, club_manager, all_services, restaurant, office, classes
	AssignedClubIDs []primitive.ObjectID `json:"assigned_club_ids,omitempty" bson:"assigned_club_ids,omitempty"`
	Active          bool                 `json:"active" bson:"active"`
	CreatedAt       time.Time            `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time            `json:"updated_at" bson:"updated_at"`
}

// Session represents a user session
type Session struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Token     string             `json:"token" bson:"token"`
	ExpiresAt time.Time          `json:"expires_at" bson:"expires_at"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}

// RefreshToken represents a refresh token for session renewal
type RefreshToken struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Token     string             `json:"token" bson:"token"`
	ExpiresAt time.Time          `json:"expires_at" bson:"expires_at"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
