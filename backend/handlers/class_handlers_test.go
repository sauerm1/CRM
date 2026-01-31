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
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// setupTestDB creates a test database connection
func setupTestDB(t *testing.T) *mongo.Database {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		t.Skipf("Skipping test: MongoDB not available: %v", err)
		return nil
	}

	if err := client.Ping(ctx, nil); err != nil {
		t.Skipf("Skipping test: MongoDB not responding: %v", err)
		return nil
	}

	db := client.Database("test_goapi")
	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		db.Drop(ctx)
		client.Disconnect(ctx)
	})

	return db
}

func TestGetClasses(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	// Insert test data
	collection := db.Collection("classes")
	ctx := context.Background()

	testClass := models.Class{
		ID:          primitive.NewObjectID(),
		Name:        "Test Yoga",
		Description: "Test class",
		Instructor:  "John Doe",
		Date:        time.Now(),
		StartTime:   "09:00",
		EndTime:     "10:00",
		Duration:    60,
		Capacity:    20,
		Status:      "scheduled",
		Recurring:   false,
	}

	_, err := collection.InsertOne(ctx, testClass)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewClassHandler(db)
	req := httptest.NewRequest(http.MethodGet, "/api/classes", nil)
	w := httptest.NewRecorder()

	handler.GetClasses(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var classes []models.Class
	if err := json.NewDecoder(w.Body).Decode(&classes); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if len(classes) == 0 {
		t.Error("Expected at least one class, got none")
	}

	if classes[0].Name != "Test Yoga" {
		t.Errorf("Expected class name 'Test Yoga', got '%s'", classes[0].Name)
	}
}

func TestGetClass(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	collection := db.Collection("classes")
	ctx := context.Background()

	testClass := models.Class{
		ID:          primitive.NewObjectID(),
		Name:        "Test Pilates",
		Description: "Test class",
		Instructor:  "Jane Smith",
		Date:        time.Now(),
		StartTime:   "10:00",
		EndTime:     "11:00",
		Duration:    60,
		Capacity:    15,
		Status:      "scheduled",
		Recurring:   false,
	}

	_, err := collection.InsertOne(ctx, testClass)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewClassHandler(db)
	req := httptest.NewRequest(http.MethodGet, "/api/classes/"+testClass.ID.Hex(), nil)
	w := httptest.NewRecorder()

	handler.GetClass(w, req, testClass.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var class models.Class
	if err := json.NewDecoder(w.Body).Decode(&class); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if class.Name != "Test Pilates" {
		t.Errorf("Expected class name 'Test Pilates', got '%s'", class.Name)
	}
}

func TestCreateClass(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	handler := NewClassHandler(db)

	newClass := map[string]interface{}{
		"name":        "New Yoga Class",
		"description": "A relaxing yoga session",
		"instructor":  "John Doe",
		"date":        time.Now().Format("2006-01-02"),
		"start_time":  "09:00",
		"end_time":    "10:00",
		"duration":    60,
		"capacity":    20,
		"status":      "scheduled",
		"recurring":   false,
	}

	body, _ := json.Marshal(newClass)
	req := httptest.NewRequest(http.MethodPost, "/api/classes", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.CreateClass(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var created models.Class
	if err := json.NewDecoder(w.Body).Decode(&created); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if created.Name != "New Yoga Class" {
		t.Errorf("Expected class name 'New Yoga Class', got '%s'", created.Name)
	}

	if created.ID.IsZero() {
		t.Error("Expected non-zero ID")
	}
}

func TestUpdateClass(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	collection := db.Collection("classes")
	ctx := context.Background()

	testClass := models.Class{
		ID:          primitive.NewObjectID(),
		Name:        "Original Name",
		Description: "Original description",
		Instructor:  "John Doe",
		Date:        time.Now(),
		StartTime:   "09:00",
		EndTime:     "10:00",
		Duration:    60,
		Capacity:    20,
		Status:      "scheduled",
		Recurring:   false,
	}

	_, err := collection.InsertOne(ctx, testClass)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewClassHandler(db)

	updates := map[string]interface{}{
		"name":        "Updated Name",
		"description": "Updated description",
		"capacity":    25,
	}

	body, _ := json.Marshal(updates)
	req := httptest.NewRequest(http.MethodPut, "/api/classes/"+testClass.ID.Hex(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.UpdateClass(w, req, testClass.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify update
	var updated models.Class
	collection.FindOne(ctx, bson.M{"_id": testClass.ID}).Decode(&updated)

	if updated.Name != "Updated Name" {
		t.Errorf("Expected name 'Updated Name', got '%s'", updated.Name)
	}

	if updated.Capacity != 25 {
		t.Errorf("Expected capacity 25, got %d", updated.Capacity)
	}
}

func TestDeleteClass(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	collection := db.Collection("classes")
	ctx := context.Background()

	testClass := models.Class{
		ID:          primitive.NewObjectID(),
		Name:        "Class to Delete",
		Description: "Will be deleted",
		Instructor:  "John Doe",
		Date:        time.Now(),
		StartTime:   "09:00",
		EndTime:     "10:00",
		Duration:    60,
		Capacity:    20,
		Status:      "scheduled",
		Recurring:   false,
	}

	_, err := collection.InsertOne(ctx, testClass)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	handler := NewClassHandler(db)
	req := httptest.NewRequest(http.MethodDelete, "/api/classes/"+testClass.ID.Hex(), nil)
	w := httptest.NewRecorder()

	handler.DeleteClass(w, req, testClass.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify deletion
	var deleted models.Class
	err = collection.FindOne(ctx, bson.M{"_id": testClass.ID}).Decode(&deleted)
	if err != mongo.ErrNoDocuments {
		t.Error("Expected class to be deleted")
	}
}

func TestEnrollMember(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	ctx := context.Background()

	// Create test class
	classCollection := db.Collection("classes")
	testClass := models.Class{
		ID:              primitive.NewObjectID(),
		Name:            "Enrollment Test",
		Description:     "Test",
		Instructor:      "John Doe",
		Date:            time.Now(),
		StartTime:       "09:00",
		EndTime:         "10:00",
		Duration:        60,
		Capacity:        20,
		Status:          "scheduled",
		Recurring:       false,
		EnrolledMembers: []primitive.ObjectID{},
		WaitList:        []primitive.ObjectID{},
	}
	_, err := classCollection.InsertOne(ctx, testClass)
	if err != nil {
		t.Fatalf("Failed to insert test class: %v", err)
	}

	// Create test member
	memberCollection := db.Collection("members")
	testMember := models.Member{
		ID:        primitive.NewObjectID(),
		FirstName: "Test",
		LastName:  "Member",
		Email:     "test@example.com",
		Phone:     "1234567890",
	}
	_, err = memberCollection.InsertOne(ctx, testMember)
	if err != nil {
		t.Fatalf("Failed to insert test member: %v", err)
	}

	handler := NewClassHandler(db)

	enrollData := map[string]string{
		"member_id": testMember.ID.Hex(),
	}

	body, _ := json.Marshal(enrollData)
	req := httptest.NewRequest(http.MethodPost, "/api/classes/"+testClass.ID.Hex()+"/enroll", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.EnrollMember(w, req, testClass.ID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify enrollment
	var updated models.Class
	classCollection.FindOne(ctx, bson.M{"_id": testClass.ID}).Decode(&updated)

	if len(updated.EnrolledMembers) != 1 {
		t.Errorf("Expected 1 enrolled member, got %d", len(updated.EnrolledMembers))
	}

	if updated.EnrolledMembers[0] != testMember.ID {
		t.Error("Member ID not found in enrolled members")
	}
}

func TestUnenrollMember(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	ctx := context.Background()

	memberID := primitive.NewObjectID()

	// Create test class with enrolled member
	classCollection := db.Collection("classes")
	testClass := models.Class{
		ID:              primitive.NewObjectID(),
		Name:            "Unenrollment Test",
		Description:     "Test",
		Instructor:      "John Doe",
		Date:            time.Now(),
		StartTime:       "09:00",
		EndTime:         "10:00",
		Duration:        60,
		Capacity:        20,
		Status:          "scheduled",
		Recurring:       false,
		EnrolledMembers: []primitive.ObjectID{memberID},
		WaitList:        []primitive.ObjectID{},
	}
	_, err := classCollection.InsertOne(ctx, testClass)
	if err != nil {
		t.Fatalf("Failed to insert test class: %v", err)
	}

	handler := NewClassHandler(db)
	req := httptest.NewRequest(http.MethodDelete, "/api/classes/"+testClass.ID.Hex()+"/unenroll/"+memberID.Hex(), nil)
	w := httptest.NewRecorder()

	handler.UnenrollMember(w, req, testClass.ID.Hex(), memberID.Hex())

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify unenrollment
	var updated models.Class
	classCollection.FindOne(ctx, bson.M{"_id": testClass.ID}).Decode(&updated)

	if len(updated.EnrolledMembers) != 0 {
		t.Errorf("Expected 0 enrolled members, got %d", len(updated.EnrolledMembers))
	}
}
