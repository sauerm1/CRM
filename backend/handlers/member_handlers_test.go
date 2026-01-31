package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestGetMembers(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	// Insert test data
	collection := db.Collection("members")
	ctx := context.Background()

	testMember := models.Member{
		ID:             primitive.NewObjectID(),
		FirstName:      "John",
		LastName:       "Doe",
		Email:          "john.doe@example.com",
		Phone:          "1234567890",
		Status:         "active",
		MembershipType: "monthly",
		JoinDate:       time.Now(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err := collection.InsertOne(ctx, testMember)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewMemberHandler(db)
	req := httptest.NewRequest(http.MethodGet, "/api/members", nil)
	w := httptest.NewRecorder()

	handler.GetMembers(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var members []models.Member
	if err := json.NewDecoder(w.Body).Decode(&members); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if len(members) == 0 {
		t.Error("Expected at least one member, got none")
	}

	if members[0].Email != "john.doe@example.com" {
		t.Errorf("Expected email 'john.doe@example.com', got '%s'", members[0].Email)
	}
}

func TestGetMember(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	collection := db.Collection("members")
	ctx := context.Background()

	testMember := models.Member{
		ID:             primitive.NewObjectID(),
		FirstName:      "Jane",
		LastName:       "Smith",
		Email:          "jane.smith@example.com",
		Phone:          "9876543210",
		Status:         "active",
		MembershipType: "annual",
		JoinDate:       time.Now(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err := collection.InsertOne(ctx, testMember)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewMemberHandler(db)
	req := httptest.NewRequest(http.MethodGet, "/api/members/"+testMember.ID.Hex(), nil)
	w := httptest.NewRecorder()

	handler.GetMember(w, req, testMember.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var member models.Member
	if err := json.NewDecoder(w.Body).Decode(&member); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if member.FirstName != "Jane" {
		t.Errorf("Expected first name 'Jane', got '%s'", member.FirstName)
	}

	if member.LastName != "Smith" {
		t.Errorf("Expected last name 'Smith', got '%s'", member.LastName)
	}
}

func TestGetMemberNotFound(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	handler := NewMemberHandler(db)
	fakeID := primitive.NewObjectID()
	req := httptest.NewRequest(http.MethodGet, "/api/members/"+fakeID.Hex(), nil)
	w := httptest.NewRecorder()

	handler.GetMember(w, req, fakeID.Hex())

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestCreateMember(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	handler := NewMemberHandler(db)

	newMember := map[string]interface{}{
		"first_name":      "Alice",
		"last_name":       "Johnson",
		"email":           "alice.johnson@example.com",
		"phone":           "5551234567",
		"membership_type": "monthly",
		"emergency_contact_name":  "Bob Johnson",
		"emergency_contact_phone": "5559876543",
	}

	body, _ := json.Marshal(newMember)
	req := httptest.NewRequest(http.MethodPost, "/api/members", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.CreateMember(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var created models.Member
	if err := json.NewDecoder(w.Body).Decode(&created); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if created.FirstName != "Alice" {
		t.Errorf("Expected first name 'Alice', got '%s'", created.FirstName)
	}

	if created.Status != "active" {
		t.Errorf("Expected default status 'active', got '%s'", created.Status)
	}

	if created.ID.IsZero() {
		t.Error("Expected non-zero ID")
	}
}

func TestUpdateMember(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	collection := db.Collection("members")
	ctx := context.Background()

	testMember := models.Member{
		ID:             primitive.NewObjectID(),
		FirstName:      "Original",
		LastName:       "Name",
		Email:          "original@example.com",
		Phone:          "1111111111",
		Status:         "active",
		MembershipType: "monthly",
		JoinDate:       time.Now(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err := collection.InsertOne(ctx, testMember)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewMemberHandler(db)

	updates := map[string]interface{}{
		"first_name":      "Updated",
		"last_name":       "Person",
		"email":           "updated@example.com",
		"membership_type": "annual",
	}

	body, _ := json.Marshal(updates)
	req := httptest.NewRequest(http.MethodPut, "/api/members/"+testMember.ID.Hex(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.UpdateMember(w, req, testMember.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify update
	var updated models.Member
	collection.FindOne(ctx, bson.M{"_id": testMember.ID}).Decode(&updated)

	if updated.FirstName != "Updated" {
		t.Errorf("Expected first name 'Updated', got '%s'", updated.FirstName)
	}

	if updated.Email != "updated@example.com" {
		t.Errorf("Expected email 'updated@example.com', got '%s'", updated.Email)
	}

	if updated.MembershipType != "annual" {
		t.Errorf("Expected membership type 'annual', got '%s'", updated.MembershipType)
	}
}

func TestDeleteMember(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	collection := db.Collection("members")
	ctx := context.Background()

	testMember := models.Member{
		ID:             primitive.NewObjectID(),
		FirstName:      "ToDelete",
		LastName:       "User",
		Email:          "delete@example.com",
		Phone:          "9999999999",
		Status:         "active",
		MembershipType: "monthly",
		JoinDate:       time.Now(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err := collection.InsertOne(ctx, testMember)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewMemberHandler(db)
	req := httptest.NewRequest(http.MethodDelete, "/api/members/"+testMember.ID.Hex(), nil)
	w := httptest.NewRecorder()

	handler.DeleteMember(w, req, testMember.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify deletion
	var deleted models.Member
	err = collection.FindOne(ctx, bson.M{"_id": testMember.ID}).Decode(&deleted)
	if err == nil {
		t.Error("Expected member to be deleted")
	}
}

func TestCreateMemberWithInvalidData(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	handler := NewMemberHandler(db)

	// Invalid JSON
	req := httptest.NewRequest(http.MethodPost, "/api/members", bytes.NewReader([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.CreateMember(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid JSON, got %d", w.Code)
	}
}

func TestUpdateMemberInvalidID(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	handler := NewMemberHandler(db)

	updates := map[string]interface{}{
		"first_name": "Test",
	}

	body, _ := json.Marshal(updates)
	req := httptest.NewRequest(http.MethodPut, "/api/members/invalid-id", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.UpdateMember(w, req, "invalid-id")

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid ID, got %d", w.Code)
	}
}
