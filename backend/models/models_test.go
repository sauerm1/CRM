package models

import (
	"testing"
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestUserModel(t *testing.T) {
	user := User{
		Email: "test@example.com",
		Name: "Test",
		Provider: "google",
		CreatedAt: time.Now(),
	}
	if user.Email != "test@example.com" {
		t.Error("User model not working")
	}
}

func TestSessionModel(t *testing.T) {
	session := Session{
		UserID: primitive.NewObjectID(),
		Token: "test-token",
		CreatedAt: time.Now(),
	}
	if session.Token != "test-token" {
		t.Error("Session model not working")
	}
}
