package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go-api-mongo/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func GetUsers(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.URL.Query().Get("role")
		clubID := r.URL.Query().Get("club_id")

		filter := bson.M{}
		if role != "" {
			filter["role"] = role
		}
		if clubID != "" {
			objID, err := primitive.ObjectIDFromHex(clubID)
			if err == nil {
				filter["assigned_club_ids"] = objID
			}
		}

		cursor, err := collection.Find(context.Background(), filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

		var users []models.User
		if err := cursor.All(context.Background(), &users); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if users == nil {
			users = []models.User{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}

func GetUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var user models.User
		err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func CreateUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get current user from context
		contextUser := r.Context().Value("user")
		if contextUser == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		currentUser, ok := contextUser.(*models.User)
		if !ok {
			http.Error(w, "Invalid user context", http.StatusInternalServerError)
			return
		}

		var input struct {
			Email           string   `json:"email"`
			Name            string   `json:"name"`
			Password        string   `json:"password"`
			Role            string   `json:"role"`
			AssignedClubIDs []string `json:"assigned_club_ids"`
			Active          bool     `json:"active"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Validate required fields
		if input.Email == "" || input.Name == "" || input.Password == "" || input.Role == "" {
			http.Error(w, "Email, name, password, and role are required", http.StatusBadRequest)
			return
		}

		// Validate role
		validRoles := map[string]bool{
			"admin":        true,
			"club_manager": true,
			"all_services": true,
			"restaurant":   true,
			"office":       true,
			"classes":      true,
		}
		if !validRoles[input.Role] {
			http.Error(w, "Invalid role. Valid roles: admin, club_manager, all_services, restaurant, office, classes", http.StatusBadRequest)
			return
		}

		// Authorization: Club managers cannot create admin or club_manager users
		if currentUser.Role == "club_manager" && (input.Role == "admin" || input.Role == "club_manager") {
			http.Error(w, "Club managers cannot create admin or club manager users", http.StatusForbidden)
			return
		}

		// Check if user already exists
		var existingUser models.User
		err := collection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&existingUser)
		if err == nil {
			http.Error(w, "User with this email already exists", http.StatusConflict)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Convert club IDs to ObjectIDs
		var clubObjIDs []primitive.ObjectID
		for _, clubID := range input.AssignedClubIDs {
			objID, err := primitive.ObjectIDFromHex(clubID)
			if err == nil {
				clubObjIDs = append(clubObjIDs, objID)
			}
		}

		user := models.User{
			Email:           input.Email,
			Name:            input.Name,
			Password:        string(hashedPassword),
			Role:            input.Role,
			AssignedClubIDs: clubObjIDs,
			Active:          input.Active,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		result, err := collection.InsertOne(context.Background(), user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user.ID = result.InsertedID.(primitive.ObjectID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(user)
	}
}

func UpdateUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get current user from context
		contextUser := r.Context().Value("user")
		if contextUser == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		currentUser, ok := contextUser.(*models.User)
		if !ok {
			http.Error(w, "Invalid user context", http.StatusInternalServerError)
			return
		}

		id := r.PathValue("id")
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		// Get the user being updated
		var targetUser models.User
		err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&targetUser)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var input struct {
			Name            string   `json:"name"`
			Role            string   `json:"role"`
			AssignedClubIDs []string `json:"assigned_club_ids"`
			Active          *bool    `json:"active"`
			Password        string   `json:"password,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Authorization checks for club managers
		if currentUser.Role == "club_manager" {
			// Club managers can only update users at their assigned clubs
			hasAccess := false
			for _, clubID := range currentUser.AssignedClubIDs {
				for _, targetClubID := range targetUser.AssignedClubIDs {
					if clubID == targetClubID {
						hasAccess = true
						break
					}
				}
				if hasAccess {
					break
				}
			}
			if !hasAccess {
				http.Error(w, "You can only update users at your assigned clubs", http.StatusForbidden)
				return
			}

			// Club managers cannot update admin or club_manager roles
			if targetUser.Role == "admin" || targetUser.Role == "club_manager" {
				http.Error(w, "You cannot update admin or club manager users", http.StatusForbidden)
				return
			}

			// Club managers cannot assign admin or club_manager roles
			if input.Role != "" && (input.Role == "admin" || input.Role == "club_manager") {
				http.Error(w, "You cannot assign admin or club manager roles", http.StatusForbidden)
				return
			}
		}

		// Validate role if provided
		if input.Role != "" {
			validRoles := map[string]bool{
				"admin":        true,
				"club_manager": true,
				"all_services": true,
				"restaurant":   true,
				"office":       true,
				"classes":      true,
			}
			if !validRoles[input.Role] {
				http.Error(w, "Invalid role. Valid roles: admin, club_manager, all_services, restaurant, office, classes", http.StatusBadRequest)
				return
			}
		}

		update := bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
		}

		if input.Name != "" {
			update["$set"].(bson.M)["name"] = input.Name
		}
		if input.Role != "" {
			update["$set"].(bson.M)["role"] = input.Role
		}
		if input.Active != nil {
			update["$set"].(bson.M)["active"] = *input.Active
		}

		// Convert club IDs
		if input.AssignedClubIDs != nil {
			var clubObjIDs []primitive.ObjectID
			for _, clubID := range input.AssignedClubIDs {
				objID, err := primitive.ObjectIDFromHex(clubID)
				if err == nil {
					clubObjIDs = append(clubObjIDs, objID)
				}
			}
			update["$set"].(bson.M)["assigned_club_ids"] = clubObjIDs
		}

		// Update password if provided
		if input.Password != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
			if err != nil {
				http.Error(w, "Failed to hash password", http.StatusInternalServerError)
				return
			}
			update["$set"].(bson.M)["password"] = string(hashedPassword)
		}

		result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		var user models.User
		err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func DeleteUser(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objID})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.DeletedCount == 0 {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func ChangePassword(collection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get user from context (set by auth middleware)
		contextUser := r.Context().Value("user")
		if contextUser == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		user, ok := contextUser.(*models.User)
		if !ok {
			http.Error(w, "Invalid user context", http.StatusInternalServerError)
			return
		}

		var input struct {
			CurrentPassword string `json:"current_password"`
			NewPassword     string `json:"new_password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Validate input
		if input.CurrentPassword == "" || input.NewPassword == "" {
			http.Error(w, "Current password and new password are required", http.StatusBadRequest)
			return
		}

		if len(input.NewPassword) < 8 {
			http.Error(w, "New password must be at least 8 characters", http.StatusBadRequest)
			return
		}

		// Verify current password
		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.CurrentPassword))
		if err != nil {
			http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
			return
		}

		// Hash new password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Update password
		update := bson.M{
			"$set": bson.M{
				"password":   string(hashedPassword),
				"updated_at": time.Now(),
			},
		}

		_, err = collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Password changed successfully",
		})
	}
}
