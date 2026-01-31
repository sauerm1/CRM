package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Class struct {
	ID              primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	Name            string               `bson:"name" json:"name"`
	Description     string               `bson:"description" json:"description"`
	Instructor      string               `bson:"instructor" json:"instructor"`
	Date            time.Time            `bson:"date" json:"date"`
	StartTime       string               `bson:"start_time" json:"start_time"` // Format: "HH:MM"
	EndTime         string               `bson:"end_time" json:"end_time"`     // Format: "HH:MM"
	Duration        int                  `bson:"duration" json:"duration"`     // Duration in minutes
	Capacity        int                  `bson:"capacity" json:"capacity"`
	EnrolledMembers []primitive.ObjectID `bson:"enrolled_members" json:"enrolled_members"`
	WaitList        []primitive.ObjectID `bson:"wait_list" json:"wait_list"`
	Recurring       bool                 `bson:"recurring" json:"recurring"`
	RecurringDays   []string             `bson:"recurring_days" json:"recurring_days"` // ["Monday", "Wednesday", "Friday"]
	Status          string               `bson:"status" json:"status"`                 // "scheduled", "in-progress", "completed", "cancelled"
	CreatedAt       time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time            `bson:"updated_at" json:"updated_at"`
}

type ClassWithMembers struct {
	Class
	EnrolledMembersDetails []Member `json:"enrolled_members_details"`
	WaitListDetails        []Member `json:"wait_list_details"`
}
