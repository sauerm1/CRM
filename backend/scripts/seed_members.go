package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Member struct {
	ID               primitive.ObjectID `bson:"_id,omitempty"`
	FirstName        string             `bson:"first_name"`
	LastName         string             `bson:"last_name"`
	Email            string             `bson:"email"`
	Phone            string             `bson:"phone"`
	MembershipType   string             `bson:"membership_type"`
	Status           string             `bson:"status"`
	JoinDate         time.Time          `bson:"join_date"`
	ExpiryDate       time.Time          `bson:"expiry_date"`
	AutoRenewal      bool               `bson:"auto_renewal"`
	EmergencyContact string             `bson:"emergency_contact"`
	Notes            string             `bson:"notes"`
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
	"Frank", "Rachel", "Alexander", "Catherine", "Patrick", "Carolyn", "Raymond", "Janet",
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

var membershipTypes = []string{"basic", "premium", "vip", "student", "senior"}
var statuses = []string{"active", "inactive", "suspended"}

var notes = []string{
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
	"",
	"",
	"",
}

func randomString(items []string) string {
	return items[rand.Intn(len(items))]
}

func randomPhone() string {
	return fmt.Sprintf("%03d-%03d-%04d", rand.Intn(900)+100, rand.Intn(900)+100, rand.Intn(9000)+1000)
}

func randomDate(start, end time.Time) time.Time {
	delta := end.Unix() - start.Unix()
	sec := rand.Int63n(delta) + start.Unix()
	return time.Unix(sec, 0)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	collection := client.Database("goapi").Collection("members")

	// Generate 100 fake members
	members := make([]interface{}, 100)
	
	for i := 0; i < 100; i++ {
		firstName := randomString(firstNames)
		lastName := randomString(lastNames)
		
		// Random join date in the past 2 years
		now := time.Now()
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
		
		member := Member{
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
			Notes:            randomString(notes),
		}
		
		members[i] = member
	}

	// Insert all members
	result, err := collection.InsertMany(ctx, members)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Successfully inserted %d members!\n", len(result.InsertedIDs))
}
