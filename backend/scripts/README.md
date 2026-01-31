# Database Seeding Scripts

This directory contains scripts for populating the database with sample data for development and testing.

## Available Scripts

### seed_data.go

A comprehensive seeding script that populates the database with realistic sample data:

- **5 Clubs** - Gym locations across different cities
- **15 Instructors** - Each assigned to 1-3 clubs with various specialties
- **100 Members** - With realistic membership data, most assigned to clubs

## Usage

### Quick Start (Recommended)

Run the seeding script using the Make command from the backend directory:

```bash
cd backend
make seed
```

### Manual Execution

Alternatively, run the script directly:

```bash
cd backend
go run scripts/seed_data.go
```

## What Gets Seeded

### Clubs
- Name, address, city, state, zip code
- Contact information (phone, email)
- All clubs are set to active status

Example clubs:
- FitZone Downtown (San Francisco)
- PowerGym North (San Francisco)
- Elite Fitness Center (San Jose)
- Peak Performance Gym (Oakland)
- Iron Temple Fitness (Berkeley)

### Instructors
- Full name, email, phone
- Specialty (Yoga, CrossFit, Personal Training, etc.)
- Professional bio
- Assigned to 1-3 random clubs
- 90% active status

### Members
- Personal information (name, email, phone)
- Membership type (basic, premium, vip, student, senior)
- Status distribution:
  - 85% active
  - 10% inactive
  - 5% suspended
- Join dates spread over past 2 years
- 1-year membership duration
- 80% with auto-renewal enabled
- Emergency contact information
- Optional notes (training goals, preferences, etc.)
- 90% assigned to a club

## Important Notes

⚠️ **This script clears existing data** before seeding:
- All existing clubs will be deleted
- All existing instructors will be deleted
- All existing members will be deleted

💡 **Best Practices:**
- Run this script on a fresh database or development environment
- **Never run on production data**
- Run after starting MongoDB: `mongod` or ensure MongoDB is running
- The database name is `goapi` (configured in the script)

## Database Connection

The script connects to MongoDB at:
```
mongodb://localhost:27017
Database: goapi
```

Make sure MongoDB is running before executing the script.

## Customization

You can modify the script to:
- Change the number of members (default: 100)
- Add more clubs
- Adjust instructor count (default: 15)
- Modify distribution percentages
- Add more realistic data patterns

## Legacy Scripts

### seed_members.go

An older script that only seeds members (without club associations). Use `seed_data.go` instead for complete data seeding.
