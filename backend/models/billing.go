package models

import "time"

// BillingEntry represents a single billing transaction for a member
type BillingEntry struct {
	Date        time.Time `bson:"date" json:"date"`
	Amount      float64   `bson:"amount" json:"amount"`
	Description string    `bson:"description" json:"description"`
	Status      string    `bson:"status" json:"status"` // paid, pending, failed, refunded
}
