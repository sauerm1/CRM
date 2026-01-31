package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Club struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name"`
	Address   string             `bson:"address"`
	City      string             `bson:"city"`
	State     string             `bson:"state"`
	ZipCode   string             `bson:"zip_code"`
	Phone     string             `bson:"phone"`
	Email     string             `bson:"email"`
	Active    bool               `bson:"active"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
}

type Instructor struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty"`
	ClubIDs   []primitive.ObjectID `bson:"club_ids,omitempty"`
	Name      string               `bson:"name"`
	Email     string               `bson:"email"`
	Phone     string               `bson:"phone"`
	Specialty string               `bson:"specialty"`
	Bio       string               `bson:"bio"`
	Active    bool                 `bson:"active"`
	CreatedAt time.Time            `bson:"created_at"`
	UpdatedAt time.Time            `bson:"updated_at"`
}

type Member struct {
	ID               primitive.ObjectID  `bson:"_id,omitempty"`
	ClubID           *primitive.ObjectID `bson:"club_id,omitempty"`
	FirstName        string              `bson:"first_name"`
	LastName         string              `bson:"last_name"`
	Email            string              `bson:"email"`
	Phone            string              `bson:"phone"`
	MembershipType   string              `bson:"membership_type"`
	Status           string              `bson:"status"`
	JoinDate         time.Time           `bson:"join_date"`
	ExpiryDate       time.Time           `bson:"expiry_date"`
	AutoRenewal      bool                `bson:"auto_renewal"`
	EmergencyContact string              `bson:"emergency_contact"`
	Notes            string              `bson:"notes"`
	CreatedAt        time.Time           `bson:"created_at"`
	UpdatedAt        time.Time           `bson:"updated_at"`
}

var firstNames = []string{
	"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
	"William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
	"Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
	"Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
	"Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
	"Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
	"Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
	"Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
	"Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
	"Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
	"Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
	"Frank", "Rachel", "Alexander", "Catherine", "Patrick", "Carolyn", "Jack", "Janet",
}

var lastNames = []string{
	"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
	"Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
	"Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
	"Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
	"Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
	"Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
	"Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
	"Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
	"Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
	"Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
}

var clubData = []struct {
	name    string
	address string
	city    string
	state   string
	zipCode string
}{
	{"FitZone Downtown", "123 Main Street", "San Francisco", "CA", "94102"},
	{"PowerGym North", "456 Oak Avenue", "San Francisco", "CA", "94109"},
	{"Elite Fitness Center", "789 Market Street", "San Jose", "CA", "95113"},
	{"Peak Performance Gym", "321 Elm Road", "Oakland", "CA", "94612"},
	{"Iron Temple Fitness", "654 Broadway", "Berkeley", "CA", "94704"},
}

var specialties = []string{
	"Yoga",
	"CrossFit",
	"Personal Training",
	"Pilates",
	"Spinning",
	"Strength Training",
	"HIIT",
	"Boxing",
	"Nutrition",
	"Sports Performance",
	"Rehabilitation",
	"Dance Fitness",
}

var instructorBios = []string{
	"Certified trainer with over 10 years of experience helping clients achieve their fitness goals.",
	"Former professional athlete passionate about sharing fitness knowledge with others.",
	"Specialized in helping beginners start their fitness journey with confidence.",
	"Expert in functional training and injury prevention techniques.",
	"Dedicated to creating personalized workout plans for each client.",
	"Competition-level athlete who loves motivating others to push their limits.",
	"Believes in holistic approach combining fitness, nutrition, and mental wellness.",
	"Award-winning instructor known for energetic and engaging classes.",
}

var membershipTypes = []string{"basic", "premium", "vip", "student", "senior"}

var memberNotes = []string{
	"Prefers morning classes",
	"Interested in personal training",
	"Has knee injury - low impact only",
	"Regular attendee",
	"Needs nutrition consultation",
	"Prefers group classes",
	"Training for marathon",
	"New to fitness",
	"Experienced athlete",
	"Referred by friend",
	"Goals: weight loss",
	"Goals: muscle building",
	"Goals: general fitness",
	"",
	"",
}

func randomString(items []string) string {
	return items[rand.Intn(len(items))]
}

func randomPhone() string {
	return fmt.Sprintf("(%03d) %03d-%04d", rand.Intn(900)+100, rand.Intn(900)+100, rand.Intn(9000)+1000)
}

func randomDate(start, end time.Time) time.Time {
	delta := end.Unix() - start.Unix()
	sec := rand.Int63n(delta) + start.Unix()
	return time.Unix(sec, 0)
}

func seedClubs(ctx context.Context, db *mongo.Database) []primitive.ObjectID {
	collection := db.Collection("clubs")

	// Clear existing clubs
	collection.DeleteMany(ctx, bson.M{})

	clubs := make([]interface{}, len(clubData))
	clubIDs := make([]primitive.ObjectID, len(clubData))
	now := time.Now()

	for i, data := range clubData {
		club := Club{
			Name:      data.name,
			Address:   data.address,
			City:      data.city,
			State:     data.state,
			ZipCode:   data.zipCode,
			Phone:     randomPhone(),
			Email:     fmt.Sprintf("info@%s.com", data.name[:7]),
			Active:    true,
			CreatedAt: now,
			UpdatedAt: now,
		}
		clubs[i] = club
	}

	result, err := collection.InsertMany(ctx, clubs)
	if err != nil {
		log.Fatal("Failed to insert clubs:", err)
	}

	for i, id := range result.InsertedIDs {
		clubIDs[i] = id.(primitive.ObjectID)
	}

	fmt.Printf("✓ Successfully inserted %d clubs\n", len(clubIDs))
	return clubIDs
}

func seedInstructors(ctx context.Context, db *mongo.Database, clubIDs []primitive.ObjectID) []primitive.ObjectID {
	collection := db.Collection("instructors")

	// Clear existing instructors
	collection.DeleteMany(ctx, bson.M{})

	numInstructors := 15
	instructors := make([]interface{}, numInstructors)
	instructorIDs := make([]primitive.ObjectID, numInstructors)
	now := time.Now()

	for i := 0; i < numInstructors; i++ {
		firstName := randomString(firstNames)
		lastName := randomString(lastNames)
		name := fmt.Sprintf("%s %s", firstName, lastName)

		// Assign instructors to 1-3 random clubs
		numClubs := rand.Intn(3) + 1
		assignedClubs := make([]primitive.ObjectID, numClubs)
		usedIndices := make(map[int]bool)

		for j := 0; j < numClubs; j++ {
			var idx int
			for {
				idx = rand.Intn(len(clubIDs))
				if !usedIndices[idx] {
					usedIndices[idx] = true
					break
				}
			}
			assignedClubs[j] = clubIDs[idx]
		}

		instructor := Instructor{
			Name:      name,
			Email:     fmt.Sprintf("%s.%s@fitzone.com", firstName, lastName),
			Phone:     randomPhone(),
			Specialty: randomString(specialties),
			Bio:       randomString(instructorBios),
			ClubIDs:   assignedClubs,
			Active:    rand.Float32() > 0.1, // 90% active
			CreatedAt: now,
			UpdatedAt: now,
		}

		instructors[i] = instructor
	}

	result, err := collection.InsertMany(ctx, instructors)
	if err != nil {
		log.Fatal("Failed to insert instructors:", err)
	}

	for i, id := range result.InsertedIDs {
		instructorIDs[i] = id.(primitive.ObjectID)
	}

	fmt.Printf("✓ Successfully inserted %d instructors\n", len(instructorIDs))
	return instructorIDs
}

func seedMembers(ctx context.Context, db *mongo.Database, clubIDs []primitive.ObjectID) {
	collection := db.Collection("members")

	// Clear existing members
	collection.DeleteMany(ctx, bson.M{})

	numMembers := 100
	members := make([]interface{}, numMembers)
	now := time.Now()

	for i := 0; i < numMembers; i++ {
		firstName := randomString(firstNames)
		lastName := randomString(lastNames)

		// Random join date in the past 2 years
		twoYearsAgo := now.AddDate(-2, 0, 0)
		joinDate := randomDate(twoYearsAgo, now)

		// Expiry date is 1 year from join date
		expiryDate := joinDate.AddDate(1, 0, 0)

		// Random auto-renewal (80% chance of true)
		autoRenewal := rand.Float32() < 0.8

		// Random status (85% active, 10% inactive, 5% suspended)
		var status string
		r := rand.Float32()
		if r < 0.85 {
			status = "active"
		} else if r < 0.95 {
			status = "inactive"
		} else {
			status = "suspended"
		}

		// 90% of members are assigned to a club
		var clubID *primitive.ObjectID
		if rand.Float32() < 0.9 {
			randomClubID := clubIDs[rand.Intn(len(clubIDs))]
			clubID = &randomClubID
		}

		member := Member{
			ClubID:           clubID,
			FirstName:        firstName,
			LastName:         lastName,
			Email:            fmt.Sprintf("%s.%s%d@example.com", firstName, lastName, rand.Intn(1000)),
			Phone:            randomPhone(),
			MembershipType:   randomString(membershipTypes),
			Status:           status,
			JoinDate:         joinDate,
			ExpiryDate:       expiryDate,
			AutoRenewal:      autoRenewal,
			EmergencyContact: fmt.Sprintf("%s %s - %s", randomString(firstNames), randomString(lastNames), randomPhone()),
			Notes:            randomString(memberNotes),
			CreatedAt:        joinDate,
			UpdatedAt:        now,
		}

		members[i] = member
	}

	// Insert all members
	result, err := collection.InsertMany(ctx, members)
	if err != nil {
		log.Fatal("Failed to insert members:", err)
	}

	fmt.Printf("✓ Successfully inserted %d members\n", len(result.InsertedIDs))
}

func main() {
	rand.Seed(time.Now().UnixNano())

	fmt.Println("🌱 Seeding database with sample data...")
	fmt.Println("")

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(ctx)

	db := client.Database("goapi")

	// Seed data in order
	clubIDs := seedClubs(ctx, db)
	seedInstructors(ctx, db, clubIDs)
	seedMembers(ctx, db, clubIDs)

	fmt.Println("")
	fmt.Println("✅ Database seeding completed successfully!")
	fmt.Println("")
	fmt.Println("Summary:")
	fmt.Printf("  - %d clubs\n", len(clubIDs))
	fmt.Println("  - 15 instructors")
	fmt.Println("  - 100 members")
}
