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

type Restaurant struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty"`
	ClubID      *primitive.ObjectID `bson:"club_id,omitempty"`
	Name        string              `bson:"name"`
	Description string              `bson:"description"`
	Cuisine     string              `bson:"cuisine"`
	Phone       string              `bson:"phone"`
	Email       string              `bson:"email"`
	Capacity    int                 `bson:"capacity"`
	OpeningTime string              `bson:"opening_time"`
	ClosingTime string              `bson:"closing_time"`
	Active      bool                `bson:"active"`
	CreatedAt   time.Time           `bson:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at"`
}

type Class struct {
	ID              primitive.ObjectID   `bson:"_id,omitempty"`
	ClubID          *primitive.ObjectID  `bson:"club_id,omitempty"`
	Name            string               `bson:"name"`
	Description     string               `bson:"description"`
	Instructor      string               `bson:"instructor"`
	Date            time.Time            `bson:"date"`
	StartTime       string               `bson:"start_time"`
	EndTime         string               `bson:"end_time"`
	Duration        int                  `bson:"duration"`
	Capacity        int                  `bson:"capacity"`
	EnrolledMembers []primitive.ObjectID `bson:"enrolled_members"`
	WaitList        []primitive.ObjectID `bson:"wait_list"`
	Recurring       bool                 `bson:"recurring"`
	RecurringDays   []string             `bson:"recurring_days"`
	Status          string               `bson:"status"`
	CreatedAt       time.Time            `bson:"created_at"`
	UpdatedAt       time.Time            `bson:"updated_at"`
}

type Reservation struct {
	ID           primitive.ObjectID  `bson:"_id,omitempty"`
	RestaurantID *primitive.ObjectID `bson:"restaurant_id,omitempty"`
	MemberID     *primitive.ObjectID `bson:"member_id,omitempty"`
	GuestName    string              `bson:"guest_name"`
	GuestEmail   string              `bson:"guest_email"`
	GuestPhone   string              `bson:"guest_phone"`
	PartySize    int                 `bson:"party_size"`
	DateTime     time.Time           `bson:"date_time"`
	Status       string              `bson:"status"`
	SpecialReqs  string              `bson:"special_requests"`
	Notes        string              `bson:"notes"`
	CreatedAt    time.Time           `bson:"created_at"`
	UpdatedAt    time.Time           `bson:"updated_at"`
}

type Office struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty"`
	ClubID      *primitive.ObjectID `bson:"club_id,omitempty"`
	Name        string              `bson:"name"`
	Description string              `bson:"description"`
	Type        string              `bson:"type"`
	Capacity    int                 `bson:"capacity"`
	Amenities   []string            `bson:"amenities"`
	HourlyRate  float64             `bson:"hourly_rate"`
	DailyRate   float64             `bson:"daily_rate"`
	Active      bool                `bson:"active"`
	CreatedAt   time.Time           `bson:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at"`
}

type OfficeBooking struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty"`
	OfficeID  *primitive.ObjectID `bson:"office_id,omitempty"`
	MemberID  *primitive.ObjectID `bson:"member_id,omitempty"`
	StartTime time.Time           `bson:"start_time"`
	EndTime   time.Time           `bson:"end_time"`
	Status    string              `bson:"status"`
	TotalCost float64             `bson:"total_cost"`
	Notes     string              `bson:"notes"`
	CreatedAt time.Time           `bson:"created_at"`
	UpdatedAt time.Time           `bson:"updated_at"`
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

var restaurantData = []struct {
	name        string
	description string
	cuisine     string
	capacity    int
}{
	{"The Wellness Café", "Fresh, organic meals designed to fuel your fitness journey", "Healthy/Organic", 60},
	{"Power Protein Bar", "High-protein meals and smoothies for optimal recovery", "Health Food", 40},
	{"Summit Bistro", "Upscale dining with views and nutritious gourmet options", "Contemporary", 80},
	{"Fuel Station", "Quick, healthy grab-and-go options for busy members", "Quick Service", 30},
	{"The Recovery Lounge", "Smoothie bar and light fare in a relaxed setting", "Juice Bar/Café", 50},
}

var classData = []struct {
	name        string
	description string
	duration    int
	capacity    int
}{
	{"Morning Yoga Flow", "Start your day with energizing yoga sequences", 60, 25},
	{"HIIT Bootcamp", "High-intensity interval training for maximum calorie burn", 45, 20},
	{"Spin Class", "Indoor cycling to build endurance and strength", 50, 30},
	{"Pilates Core", "Strengthen your core with controlled movements", 55, 15},
	{"CrossFit WOD", "Workout of the day - constantly varied functional movements", 60, 25},
	{"Zumba Dance", "Dance fitness party with Latin-inspired moves", 50, 30},
	{"Boxing Fundamentals", "Learn proper boxing techniques and combinations", 60, 18},
	{"Power Lifting", "Build strength with compound movements", 75, 12},
	{"Meditation & Stretching", "Mindfulness practice with gentle stretching", 45, 20},
	{"Aqua Aerobics", "Low-impact cardio in the pool", 45, 20},
}

var specialRequests = []string{
	"Window seat preferred",
	"Celebrating anniversary",
	"Dietary restrictions: vegetarian",
	"Dietary restrictions: gluten-free",
	"Dietary restrictions: vegan",
	"High chair needed",
	"Quiet table requested",
	"Birthday celebration",
	"",
	"",
	"",
}

var cuisineTypes = []string{
	"Healthy/Organic",
	"Mediterranean",
	"Contemporary American",
	"Asian Fusion",
	"Health Food",
	"Juice Bar/Café",
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

func seedMembers(ctx context.Context, db *mongo.Database, clubIDs []primitive.ObjectID) []primitive.ObjectID {
	collection := db.Collection("members")

	// Clear existing members
	collection.DeleteMany(ctx, bson.M{})

	numMembers := 100
	members := make([]interface{}, numMembers)
	memberIDs := make([]primitive.ObjectID, numMembers)
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

	for i, id := range result.InsertedIDs {
		memberIDs[i] = id.(primitive.ObjectID)
	}

	fmt.Printf("✓ Successfully inserted %d members\n", len(memberIDs))
	return memberIDs
}

func seedRestaurants(ctx context.Context, db *mongo.Database, clubIDs []primitive.ObjectID) []primitive.ObjectID {
	collection := db.Collection("restaurants")

	// Clear existing restaurants
	collection.DeleteMany(ctx, bson.M{})

	restaurants := make([]interface{}, len(restaurantData))
	restaurantIDs := make([]primitive.ObjectID, len(restaurantData))
	now := time.Now()

	for i, data := range restaurantData {
		// Each restaurant is assigned to a club
		clubID := clubIDs[i%len(clubIDs)]

		restaurant := Restaurant{
			ClubID:      &clubID,
			Name:        data.name,
			Description: data.description,
			Cuisine:     data.cuisine,
			Phone:       randomPhone(),
			Email:       fmt.Sprintf("reservations@%s.com", data.name[:5]),
			Capacity:    data.capacity,
			OpeningTime: "11:00 AM",
			ClosingTime: "9:00 PM",
			Active:      true,
			CreatedAt:   now,
			UpdatedAt:   now,
		}

		restaurants[i] = restaurant
	}

	result, err := collection.InsertMany(ctx, restaurants)
	if err != nil {
		log.Fatal("Failed to insert restaurants:", err)
	}

	for i, id := range result.InsertedIDs {
		restaurantIDs[i] = id.(primitive.ObjectID)
	}

	fmt.Printf("✓ Successfully inserted %d restaurants\n", len(restaurantIDs))
	return restaurantIDs
}

func seedClasses(ctx context.Context, db *mongo.Database, clubIDs []primitive.ObjectID, instructorIDs []primitive.ObjectID, memberIDs []primitive.ObjectID) []primitive.ObjectID {
	collection := db.Collection("classes")

	// Clear existing classes
	collection.DeleteMany(ctx, bson.M{})

	numClasses := 30
	classes := make([]interface{}, numClasses)
	classIDs := make([]primitive.ObjectID, numClasses)
	now := time.Now()

	for i := 0; i < numClasses; i++ {
		classInfo := classData[rand.Intn(len(classData))]
		clubID := clubIDs[rand.Intn(len(clubIDs))]
		
		// Get a random instructor
		instructorID := instructorIDs[rand.Intn(len(instructorIDs))]
		
		// Random date within next 14 days or past 7 days
		daysOffset := rand.Intn(21) - 7 // -7 to +14 days
		classDate := now.AddDate(0, 0, daysOffset)
		
		// Random start time between 6 AM and 8 PM
		startHour := rand.Intn(14) + 6
		startMinute := []int{0, 15, 30, 45}[rand.Intn(4)]
		startTime := fmt.Sprintf("%02d:%02d", startHour, startMinute)
		
		endHour := startHour + (classInfo.duration / 60)
		endMinute := startMinute + (classInfo.duration % 60)
		if endMinute >= 60 {
			endHour++
			endMinute -= 60
		}
		endTime := fmt.Sprintf("%02d:%02d", endHour, endMinute)

		// Determine status based on date
		var status string
		if daysOffset < 0 {
			// Past classes are either completed or cancelled
			if rand.Float32() < 0.9 {
				status = "completed"
			} else {
				status = "cancelled"
			}
		} else {
			// Future classes are mostly scheduled
			if rand.Float32() < 0.95 {
				status = "scheduled"
			} else {
				status = "cancelled"
			}
		}

		// Enroll random members (50-90% of capacity for scheduled/completed classes)
		var enrolledMembers []primitive.ObjectID
		if status != "cancelled" {
			numEnrolled := int(float32(classInfo.capacity) * (0.5 + rand.Float32()*0.4))
			if numEnrolled > len(memberIDs) {
				numEnrolled = len(memberIDs)
			}
			
			// Randomly select members
			shuffled := make([]primitive.ObjectID, len(memberIDs))
			copy(shuffled, memberIDs)
			rand.Shuffle(len(shuffled), func(i, j int) {
				shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
			})
			enrolledMembers = shuffled[:numEnrolled]
		}

		class := Class{
			ClubID:          &clubID,
			Name:            classInfo.name,
			Description:     classInfo.description,
			Instructor:      instructorID.Hex(),
			Date:            classDate,
			StartTime:       startTime,
			EndTime:         endTime,
			Duration:        classInfo.duration,
			Capacity:        classInfo.capacity,
			EnrolledMembers: enrolledMembers,
			WaitList:        []primitive.ObjectID{},
			Recurring:       rand.Float32() < 0.3, // 30% are recurring
			RecurringDays:   []string{},
			Status:          status,
			CreatedAt:       now.AddDate(0, 0, -14),
			UpdatedAt:       now,
		}

		classes[i] = class
	}

	result, err := collection.InsertMany(ctx, classes)
	if err != nil {
		log.Fatal("Failed to insert classes:", err)
	}

	for i, id := range result.InsertedIDs {
		classIDs[i] = id.(primitive.ObjectID)
	}

	fmt.Printf("✓ Successfully inserted %d classes\n", len(classIDs))
	return classIDs
}

func seedReservations(ctx context.Context, db *mongo.Database, restaurantIDs []primitive.ObjectID, memberIDs []primitive.ObjectID) {
	collection := db.Collection("reservations")

	// Clear existing reservations
	collection.DeleteMany(ctx, bson.M{})

	numReservations := 50
	reservations := make([]interface{}, numReservations)
	now := time.Now()

	for i := 0; i < numReservations; i++ {
		restaurantID := restaurantIDs[rand.Intn(len(restaurantIDs))]
		
		// Random date within next 14 days or past 7 days
		daysOffset := rand.Intn(21) - 7 // -7 to +14 days
		reservationDate := now.AddDate(0, 0, daysOffset)
		
		// Random time between 11 AM and 8 PM
		hour := rand.Intn(9) + 11
		minute := []int{0, 15, 30, 45}[rand.Intn(4)]
		reservationDate = time.Date(reservationDate.Year(), reservationDate.Month(), reservationDate.Day(),
			hour, minute, 0, 0, reservationDate.Location())

		// Determine status based on date
		var status string
		if daysOffset < 0 {
			// Past reservations
			r := rand.Float32()
			if r < 0.7 {
				status = "completed"
			} else if r < 0.85 {
				status = "no-show"
			} else {
				status = "cancelled"
			}
		} else {
			// Future reservations
			if rand.Float32() < 0.9 {
				status = "confirmed"
			} else {
				status = "cancelled"
			}
		}

		// 80% of reservations are by members, 20% are guests
		var memberID *primitive.ObjectID
		var guestName, guestEmail, guestPhone string
		
		if rand.Float32() < 0.8 && len(memberIDs) > 0 {
			randomMemberID := memberIDs[rand.Intn(len(memberIDs))]
			memberID = &randomMemberID
		} else {
			// Guest reservation
			guestName = fmt.Sprintf("%s %s", randomString(firstNames), randomString(lastNames))
			guestEmail = fmt.Sprintf("%s@example.com", guestName)
			guestPhone = randomPhone()
		}

		partySize := rand.Intn(6) + 1 // 1-6 people

		reservation := Reservation{
			RestaurantID: &restaurantID,
			MemberID:     memberID,
			GuestName:    guestName,
			GuestEmail:   guestEmail,
			GuestPhone:   guestPhone,
			PartySize:    partySize,
			DateTime:     reservationDate,
			Status:       status,
			SpecialReqs:  randomString(specialRequests),
			Notes:        "",
			CreatedAt:    now.AddDate(0, 0, -14),
			UpdatedAt:    now,
		}

		reservations[i] = reservation
	}

	result, err := collection.InsertMany(ctx, reservations)
	if err != nil {
		log.Fatal("Failed to insert reservations:", err)
	}

	fmt.Printf("✓ Successfully inserted %d reservations\n", len(result.InsertedIDs))
}

func seedOffices(ctx context.Context, db *mongo.Database, clubIDs []primitive.ObjectID) []primitive.ObjectID {
	collection := db.Collection("offices")

	// Clear existing offices
	collection.DeleteMany(ctx, bson.M{})

	officeTypes := []string{"private", "shared", "meeting_room", "phone_booth"}
	amenities := [][]string{
		{"wifi", "monitor", "desk", "chair", "whiteboard"},
		{"wifi", "standing_desk", "monitor", "ergonomic_chair"},
		{"wifi", "conference_table", "tv", "whiteboard", "video_conferencing"},
		{"wifi", "soundproofing", "phone", "monitor"},
		{"wifi", "dual_monitors", "desk", "chair", "storage"},
	}

	var offices []interface{}
	var officeIDs []primitive.ObjectID
	now := time.Now()

	// Not all clubs have offices - only 3 out of 5 will have them
	clubsWithOffices := []int{0, 1, 3} // Indices of clubs that have offices

	officeNames := map[string][]string{
		"private":      {"Executive Suite", "Focus Room A", "Focus Room B", "Private Office 1", "Private Office 2"},
		"shared":       {"Co-Working Space", "Flex Desk Area", "Open Workspace"},
		"meeting_room": {"Conference Room A", "Board Room", "Meeting Room 1", "Collaboration Space"},
		"phone_booth":  {"Phone Booth 1", "Phone Booth 2", "Quick Call Room"},
	}

	for _, clubIdx := range clubsWithOffices {
		clubID := clubIDs[clubIdx]
		
		// Each club gets 5-10 offices
		numOffices := rand.Intn(6) + 5
		
		for i := 0; i < numOffices; i++ {
			officeType := officeTypes[rand.Intn(len(officeTypes))]
			names := officeNames[officeType]
			name := names[rand.Intn(len(names))]
			
			var capacity int
			var hourlyRate, dailyRate float64
			
			switch officeType {
			case "private":
				capacity = 1
				hourlyRate = 15.0 + float64(rand.Intn(15))
				dailyRate = hourlyRate * 6
			case "shared":
				capacity = rand.Intn(8) + 4 // 4-12 people
				hourlyRate = 10.0 + float64(rand.Intn(10))
				dailyRate = hourlyRate * 6
			case "meeting_room":
				capacity = rand.Intn(6) + 6 // 6-12 people
				hourlyRate = 25.0 + float64(rand.Intn(20))
				dailyRate = hourlyRate * 6
			case "phone_booth":
				capacity = 1
				hourlyRate = 5.0 + float64(rand.Intn(5))
				dailyRate = hourlyRate * 6
			}

			office := Office{
				ClubID:      &clubID,
				Name:        name,
				Description: fmt.Sprintf("%s workspace with modern amenities", officeType),
				Type:        officeType,
				Capacity:    capacity,
				Amenities:   amenities[rand.Intn(len(amenities))],
				HourlyRate:  hourlyRate,
				DailyRate:   dailyRate,
				Active:      rand.Float32() > 0.1, // 90% active
				CreatedAt:   now,
				UpdatedAt:   now,
			}

			offices = append(offices, office)
		}
	}

	if len(offices) == 0 {
		fmt.Println("✓ No offices to insert (by design)")
		return []primitive.ObjectID{}
	}

	result, err := collection.InsertMany(ctx, offices)
	if err != nil {
		log.Fatal("Failed to insert offices:", err)
	}

	for _, id := range result.InsertedIDs {
		officeIDs = append(officeIDs, id.(primitive.ObjectID))
	}

	fmt.Printf("✓ Successfully inserted %d offices across %d clubs\n", len(officeIDs), len(clubsWithOffices))
	return officeIDs
}

func seedOfficeBookings(ctx context.Context, db *mongo.Database, officeIDs []primitive.ObjectID, memberIDs []primitive.ObjectID) {
	collection := db.Collection("office_bookings")

	// Clear existing bookings
	collection.DeleteMany(ctx, bson.M{})

	if len(officeIDs) == 0 {
		fmt.Println("✓ No office bookings to insert (no offices available)")
		return
	}

	numBookings := 40
	bookings := make([]interface{}, numBookings)
	now := time.Now()

	for i := 0; i < numBookings; i++ {
		officeID := officeIDs[rand.Intn(len(officeIDs))]
		memberID := memberIDs[rand.Intn(len(memberIDs))]
		
		// Random date within next 14 days or past 7 days
		daysOffset := rand.Intn(21) - 7
		bookingDate := now.AddDate(0, 0, daysOffset)
		
		// Random start hour between 8 AM and 4 PM (to allow for end time)
		startHour := rand.Intn(8) + 8
		startMinute := []int{0, 30}[rand.Intn(2)]
		
		startTime := time.Date(bookingDate.Year(), bookingDate.Month(), bookingDate.Day(),
			startHour, startMinute, 0, 0, bookingDate.Location())
		
		// Booking duration: 1-8 hours
		durationHours := rand.Intn(8) + 1
		endTime := startTime.Add(time.Duration(durationHours) * time.Hour)
		
		// Determine status based on date
		var status string
		if daysOffset < 0 {
			// Past bookings
			r := rand.Float32()
			if r < 0.8 {
				status = "completed"
			} else if r < 0.9 {
				status = "no-show"
			} else {
				status = "cancelled"
			}
		} else {
			// Future bookings
			if rand.Float32() < 0.9 {
				status = "confirmed"
			} else {
				status = "cancelled"
			}
		}
		
		// Calculate cost (hourly rate * hours)
		hourlyRate := 10.0 + float64(rand.Intn(20))
		totalCost := hourlyRate * float64(durationHours)
		
		booking := OfficeBooking{
			OfficeID:  &officeID,
			MemberID:  &memberID,
			StartTime: startTime,
			EndTime:   endTime,
			Status:    status,
			TotalCost: totalCost,
			Notes:     "",
			CreatedAt: now.AddDate(0, 0, -14),
			UpdatedAt: now,
		}

		bookings[i] = booking
	}

	result, err := collection.InsertMany(ctx, bookings)
	if err != nil {
		log.Fatal("Failed to insert office bookings:", err)
	}

	fmt.Printf("✓ Successfully inserted %d office bookings\n", len(result.InsertedIDs))
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
	restaurantIDs := seedRestaurants(ctx, db, clubIDs)
	instructorIDs := seedInstructors(ctx, db, clubIDs)
	memberIDs := seedMembers(ctx, db, clubIDs)
	classIDs := seedClasses(ctx, db, clubIDs, instructorIDs, memberIDs)
	seedReservations(ctx, db, restaurantIDs, memberIDs)
	officeIDs := seedOffices(ctx, db, clubIDs)
	seedOfficeBookings(ctx, db, officeIDs, memberIDs)

	fmt.Println("")
	fmt.Println("✅ Database seeding completed successfully!")
	fmt.Println("")
	fmt.Println("Summary:")
	fmt.Printf("  - %d clubs\n", len(clubIDs))
	fmt.Printf("  - %d restaurants\n", len(restaurantIDs))
	fmt.Printf("  - %d instructors\n", len(instructorIDs))
	fmt.Printf("  - %d members\n", len(memberIDs))
	fmt.Printf("  - %d classes\n", len(classIDs))
	fmt.Println("  - 50 reservations")
	fmt.Printf("  - %d offices (across select clubs)\n", len(officeIDs))
	fmt.Println("  - 40 office bookings")
}
