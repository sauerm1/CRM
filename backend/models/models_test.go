package models

import (
	"testing"
	"time"
)

func TestUserModel(t *testing.T) {
	user := User{
		Email:     "test@example.com",
		FirstName: "Test",
		LastName:  "User",
		CreatedAt: time.Now(),
	}
	if user.Email != "test@example.com" {
		t.Error("User model not working")
	}
}
