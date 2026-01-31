# Group Fitness Class Schedule Feature

## Overview
A complete class scheduling system has been added to the Gym CRM, allowing you to create fitness classes and manage member enrollments.

## Features

### Class Management
- **Create Classes**: Schedule new fitness classes with instructor, time, duration, and capacity
- **Edit Classes**: Update class details, reschedule, or change capacity
- **Delete Classes**: Remove classes from the schedule
- **Recurring Classes**: Support for weekly recurring classes on specific days
- **Class Status**: Track classes as scheduled, in-progress, completed, or cancelled

### Member Enrollment
- **Enroll Members**: Add members to classes with automatic capacity management
- **Waitlist**: Automatically add members to waitlist when class is full
- **Auto-promote**: When a member unenrolls, the first waitlisted member is automatically enrolled
- **Search Members**: Quickly find and enroll members using the search feature
- **View Enrollments**: See all enrolled members and waitlist for each class

## Backend API

### Endpoints
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get a specific class
- `GET /api/classes/:id/details` - Get class with enrolled member details
- `POST /api/classes` - Create a new class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class
- `POST /api/classes/:id/enroll` - Enroll a member in a class
- `DELETE /api/classes/:id/unenroll/:memberId` - Unenroll a member from a class

### Data Model
```go
type Class struct {
    ID              ObjectID    // Unique class ID
    Name            string      // Class name (e.g., "Morning Yoga")
    Description     string      // Class description
    Instructor      string      // Instructor name
    Date            time.Time   // Class date
    StartTime       string      // Start time (HH:MM format)
    EndTime         string      // End time (HH:MM format)
    Duration        int         // Duration in minutes
    Capacity        int         // Maximum number of participants
    EnrolledMembers []ObjectID  // List of enrolled member IDs
    WaitList        []ObjectID  // List of waitlisted member IDs
    Recurring       bool        // Whether class repeats weekly
    RecurringDays   []string    // Days of week for recurring classes
    Status          string      // "scheduled", "in-progress", "completed", "cancelled"
    CreatedAt       time.Time
    UpdatedAt       time.Time
}
```

## Frontend Pages

### Class List (`/dashboard/classes`)
- Table view of all scheduled classes
- Search functionality
- Shows enrolled count vs capacity
- Color-coded availability (green=available, yellow=75%+, red=full)
- Quick actions: Edit, Delete
- Click row to view class details

### Create Class (`/dashboard/classes/new`)
- Form to create new classes
- Fields:
  - Class name and description
  - Instructor name
  - Date and time
  - Duration (in minutes)
  - Capacity
  - Recurring settings (days of week)
  - Status

### Edit Class (`/dashboard/classes/edit/:id`)
- Same form as create, pre-populated with existing data
- Update any class details
- Note: Enrolled members are managed separately

### Class Detail (`/dashboard/classes/:id`)
- Full class information with gradient header
- Statistics cards: Status, Enrolled count, Available spots, Waitlist count
- **Enrolled Members Table**:
  - Shows all currently enrolled members
  - Member details: Name, Email, Phone, Membership type
  - Remove button for each member
- **Waitlist Table** (if applicable):
  - Shows members waiting for a spot
  - Remove button for each member
- **Enroll Member Modal**:
  - Search all members not currently enrolled
  - Click "Enroll" to add member
  - Automatic waitlist if class is full

## Usage Workflow

### Creating a Class
1. Navigate to "Class Schedule" from dashboard
2. Click "+ Add New Class"
3. Fill in class details
4. Set recurring if needed (select days of week)
5. Click "Create Class"

### Enrolling Members
1. Click on a class from the list
2. Click "+ Enroll Member"
3. Search for the member
4. Click "Enroll" next to their name
5. If class is full, member is added to waitlist

### Managing Enrollments
- To remove a member: Click "Remove" in the enrolled members table
- System automatically promotes first waitlisted member if space opens
- View current enrollment count in real-time

## Navigation
- From main dashboard: Click "📅 Class Schedule" button
- From class list: Click any row to view details
- From class detail: "Edit" button or "Back" to list

## Database Collection
Classes are stored in the `classes` collection in MongoDB with the following indexes recommended:
- `date` - For chronological queries
- `status` - For filtering by status
- `instructor` - For instructor-specific views

## Future Enhancements
Consider adding:
- Email notifications when enrolled or added to waitlist
- Check-in system for attendance tracking
- Recurring class automatic generation
- Instructor dashboard
- Member class history
- Class ratings and feedback
