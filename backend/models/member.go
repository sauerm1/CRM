package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Member struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	FirstName        string             `bson:"first_name" json:"first_name"`
	LastName         string             `bson:"last_name" json:"last_name"`
	Email            string             `bson:"email" json:"email"`
	Phone            string             `bson:"phone" json:"phone"`
	MembershipType   string             `bson:"membership_type" json:"membership_type"`
	Status           string             `bson:"status" json:"status"`
	JoinDate         time.Time          `bson:"join_date" json:"join_date"`
	ExpiryDate       time.Time          `bson:"expiry_date" json:"expiry_date"`
	AutoRenewal      bool               `bson:"auto_renewal" json:"auto_renewal"`
	EmergencyContact string             `bson:"emergency_contact" json:"emergency_contact"`
	Notes            string             `bson:"notes" json:"notes"`
	CreatedAt        time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time          `bson:"updated_at" json:"updated_at"`
}
