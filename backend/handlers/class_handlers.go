package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ClassHandler struct {
	db *mongo.Database
}

func NewClassHandler(db *mongo.Database) *ClassHandler {
	return &ClassHandler{db: db}
}

func (h *ClassHandler) ClassesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetClasses(w, r)
	case "POST":
		h.CreateClass(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *ClassHandler) ClassHandler(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/classes/")
	parts := strings.Split(path, "/")
	id := parts[0]

	// Handle enrollment/unenrollment
	if len(parts) > 1 {
		if parts[1] == "enroll" && r.Method == "POST" {
			h.EnrollMember(w, r, id)
			return
		}
		if parts[1] == "unenroll" && len(parts) > 2 && r.Method == "DELETE" {
			h.UnenrollMember(w, r, id, parts[2])
			return
		}
		if parts[1] == "details" && r.Method == "GET" {
			h.GetClassWithMembers(w, r, id)
			return
		}
	}

	// Handle basic CRUD
	switch r.Method {
	case "GET":
		h.GetClass(w, r, id)
	case "PUT":
		h.UpdateClass(w, r, id)
	case "DELETE":
		h.DeleteClass(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *ClassHandler) GetClasses(w http.ResponseWriter, r *http.Request) {
	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var classes []models.Class
	if err = cursor.All(ctx, &classes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if classes == nil {
		classes = []models.Class{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classes)
}

func (h *ClassHandler) GetClass(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var class models.Class
	err = collection.FindOne(ctx, bson.M{"_id": id}).Decode(&class)
	if err != nil {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(class)
}

func (h *ClassHandler) GetClassWithMembers(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var class models.Class
	err = collection.FindOne(ctx, bson.M{"_id": id}).Decode(&class)
	if err != nil {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	// Fetch enrolled members details
	memberCollection := h.db.Collection("members")
	var enrolledMembers []models.Member
	if len(class.EnrolledMembers) > 0 {
		cursor, err := memberCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.EnrolledMembers}})
		if err == nil {
			cursor.All(ctx, &enrolledMembers)
			cursor.Close(ctx)
		}
	}

	// Fetch waitlist members details
	var waitListMembers []models.Member
	if len(class.WaitList) > 0 {
		cursor, err := memberCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.WaitList}})
		if err == nil {
			cursor.All(ctx, &waitListMembers)
			cursor.Close(ctx)
		}
	}

	if enrolledMembers == nil {
		enrolledMembers = []models.Member{}
	}
	if waitListMembers == nil {
		waitListMembers = []models.Member{}
	}

	classWithMembers := models.ClassWithMembers{
		Class:                  class,
		EnrolledMembersDetails: enrolledMembers,
		WaitListDetails:        waitListMembers,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classWithMembers)
}

func (h *ClassHandler) CreateClass(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Name          string   `json:"name"`
		Description   string   `json:"description"`
		Instructor    string   `json:"instructor"`
		Date          string   `json:"date"`
		StartTime     string   `json:"start_time"`
		EndTime       string   `json:"end_time"`
		Duration      int      `json:"duration"`
		Capacity      int      `json:"capacity"`
		Recurring     bool     `json:"recurring"`
		RecurringDays []string `json:"recurring_days"`
		Status        string   `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Parse date string (YYYY-MM-DD) to time.Time
	classDate, err := time.Parse("2006-01-02", requestData.Date)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	class := models.Class{
		Name:          requestData.Name,
		Description:   requestData.Description,
		Instructor:    requestData.Instructor,
		Date:          classDate,
		StartTime:     requestData.StartTime,
		EndTime:       requestData.EndTime,
		Duration:      requestData.Duration,
		Capacity:      requestData.Capacity,
		Recurring:     requestData.Recurring,
		RecurringDays: requestData.RecurringDays,
		Status:        requestData.Status,
	}

	class.CreatedAt = time.Now()
	class.UpdatedAt = time.Now()
	if class.EnrolledMembers == nil {
		class.EnrolledMembers = []primitive.ObjectID{}
	}
	if class.WaitList == nil {
		class.WaitList = []primitive.ObjectID{}
	}
	if class.Status == "" {
		class.Status = "scheduled"
	}

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, class)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	class.ID = result.InsertedID.(primitive.ObjectID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(class)
}

func (h *ClassHandler) UpdateClass(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	var requestData struct {
		Name          string   `json:"name"`
		Description   string   `json:"description"`
		Instructor    string   `json:"instructor"`
		Date          string   `json:"date"`
		StartTime     string   `json:"start_time"`
		EndTime       string   `json:"end_time"`
		Duration      int      `json:"duration"`
		Capacity      int      `json:"capacity"`
		Recurring     bool     `json:"recurring"`
		RecurringDays []string `json:"recurring_days"`
		Status        string   `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Parse date string (YYYY-MM-DD) to time.Time
	classDate, err := time.Parse("2006-01-02", requestData.Date)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	class := models.Class{
		Name:          requestData.Name,
		Description:   requestData.Description,
		Instructor:    requestData.Instructor,
		Date:          classDate,
		StartTime:     requestData.StartTime,
		EndTime:       requestData.EndTime,
		Duration:      requestData.Duration,
		Capacity:      requestData.Capacity,
		Recurring:     requestData.Recurring,
		RecurringDays: requestData.RecurringDays,
		Status:        requestData.Status,
	}

	class.UpdatedAt = time.Now()

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":           class.Name,
			"description":    class.Description,
			"instructor":     class.Instructor,
			"date":           class.Date,
			"start_time":     class.StartTime,
			"end_time":       class.EndTime,
			"duration":       class.Duration,
			"capacity":       class.Capacity,
			"recurring":      class.Recurring,
			"recurring_days": class.RecurringDays,
			"status":         class.Status,
			"updated_at":     class.UpdatedAt,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	class.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(class)
}

func (h *ClassHandler) DeleteClass(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ClassHandler) EnrollMember(w http.ResponseWriter, r *http.Request, classIDStr string) {
	classID, err := primitive.ObjectIDFromHex(classIDStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		MemberID string `json:"member_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	memberID, err := primitive.ObjectIDFromHex(requestBody.MemberID)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get current class
	var class models.Class
	err = collection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class)
	if err != nil {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	// Check if member is already enrolled
	for _, id := range class.EnrolledMembers {
		if id == memberID {
			http.Error(w, "Member already enrolled in this class", http.StatusBadRequest)
			return
		}
	}

	// Check capacity
	if len(class.EnrolledMembers) >= class.Capacity {
		// Add to waitlist
		update := bson.M{
			"$addToSet": bson.M{"wait_list": memberID},
			"$set":      bson.M{"updated_at": time.Now()},
		}
		_, err = collection.UpdateOne(ctx, bson.M{"_id": classID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Class is full. Member added to waitlist."})
		return
	}

	// Enroll member
	update := bson.M{
		"$addToSet": bson.M{"enrolled_members": memberID},
		"$set":      bson.M{"updated_at": time.Now()},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": classID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Member enrolled successfully"})
}

func (h *ClassHandler) UnenrollMember(w http.ResponseWriter, r *http.Request, classIDStr string, memberIDStr string) {
	classID, err := primitive.ObjectIDFromHex(classIDStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	memberID, err := primitive.ObjectIDFromHex(memberIDStr)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	collection := h.db.Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Remove member from enrolled list
	update := bson.M{
		"$pull": bson.M{"enrolled_members": memberID, "wait_list": memberID},
		"$set":  bson.M{"updated_at": time.Now()},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": classID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	// Check if we can move someone from waitlist
	var class models.Class
	err = collection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class)
	if err == nil && len(class.WaitList) > 0 && len(class.EnrolledMembers) < class.Capacity {
		// Move first person from waitlist to enrolled
		firstWaitlistMember := class.WaitList[0]
		update := bson.M{
			"$pull":     bson.M{"wait_list": firstWaitlistMember},
			"$addToSet": bson.M{"enrolled_members": firstWaitlistMember},
			"$set":      bson.M{"updated_at": time.Now()},
		}
		collection.UpdateOne(ctx, bson.M{"_id": classID}, update)
	}

	w.WriteHeader(http.StatusNoContent)
}
