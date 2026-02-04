# Role-Based Access Control System

## Overview
The CRM now uses a service-specific role system where each role is directly tied to the services users can manage. This replaces the previous flexible role + service assignment model with a more structured approach.

## Role Types

### 1. **Admin**
- **Access**: Full access to all services at all locations
- **Badge Color**: Purple
- **Description**: Complete system administration with no restrictions
- **Location Assignment**: Not required (has access to all locations)
- **Use Case**: System administrators, business owners

### 2. **All Services**
- **Access**: All services at assigned locations only
- **Badge Color**: Blue
- **Description**: Can manage all services (restaurant, office, classes) but only at their assigned club locations
- **Location Assignment**: Required
- **Use Case**: General managers, multi-service staff at specific locations

### 3. **Restaurant**
- **Access**: Restaurant service only at assigned locations
- **Badge Color**: Green
- **Description**: Limited to restaurant reservation and management features
- **Location Assignment**: Required
- **Use Case**: Restaurant hosts, dining coordinators

### 4. **Office/Co-working**
- **Access**: Office/co-working service only at assigned locations
- **Badge Color**: Yellow
- **Description**: Limited to office booking and flex-space management
- **Location Assignment**: Required
- **Use Case**: Office managers, co-working space coordinators

### 5. **Classes**
- **Access**: Fitness classes service only at assigned locations
- **Badge Color**: Orange
- **Description**: Limited to class scheduling, instructor management, and member enrollment
- **Location Assignment**: Required
- **Use Case**: Fitness instructors, class coordinators

## Key Changes from Previous System

### Removed
- ❌ `assigned_services` field - Service access is now determined by role
- ❌ Flexible service assignment checkboxes in user forms
- ❌ Old role names: `front_desk`, `restaurant_host`, `instructor`

### Added
- ✅ Service-specific roles: `all_services`, `restaurant`, `office`, `classes`
- ✅ Role-based service access mapping
- ✅ Descriptive role labels with service access explanations
- ✅ Improved role selection dropdown with access descriptions

## Implementation Details

### Backend Changes
**File**: `backend/models/user.go`
- Removed `AssignedServices []string` field
- Updated role comment to reflect new role types

**File**: `backend/handlers/user_handlers.go`
- Removed `assigned_services` from create/update input structs
- Removed service assignment logic from user creation and updates
- Role is now the sole determinant of service access

### Frontend Changes
**File**: `frontend/types/index.ts`
- Removed `assigned_services?: string[]` from User interface
- Added comment explaining valid role values

**File**: `frontend/app/dashboard/users/page.tsx`
- Updated role badge colors and labels
- Added `getServiceAccess()` function to display service permissions
- Updated role filter dropdown with new options
- Changed "Services" column to "Service Access" with role-based descriptions

**Files**: `frontend/app/dashboard/users/new/page.tsx` and `edit/[id]/page.tsx`
- Removed service checkboxes section
- Updated role dropdown with descriptive options showing access levels
- Added helper text explaining each role's permissions
- Changed "Assigned Clubs" label context based on admin role

## Migration Notes

### For Existing Users
If you have existing users with the old role system:
1. Users with `front_desk` role should be migrated to `all_services`
2. Users with `restaurant_host` role should be migrated to `restaurant`
3. Users with `instructor` role should be migrated to `classes`
4. The `assigned_services` field will be ignored by the system

### Database Migration
To update existing users in MongoDB:
```javascript
// Update front_desk → all_services
db.users.updateMany(
  { role: "front_desk" },
  { $set: { role: "all_services" }, $unset: { assigned_services: "" } }
)

// Update restaurant_host → restaurant
db.users.updateMany(
  { role: "restaurant_host" },
  { $set: { role: "restaurant" }, $unset: { assigned_services: "" } }
)

// Update instructor → classes
db.users.updateMany(
  { role: "instructor" },
  { $set: { role: "classes" }, $unset: { assigned_services: "" } }
)
```

## Future Enhancements

### Planned Features
1. **Middleware Protection**: Add role-based middleware to restrict API endpoints by service type
2. **Permission Guards**: Frontend route guards based on user role
3. **Audit Logging**: Track which users access which services
4. **Role-based UI**: Hide/show features based on user's role

### Example Middleware Implementation
```go
// Future implementation in middleware/role.go
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(models.User)
        
        for _, role := range allowedRoles {
            if user.Role == role || user.Role == "admin" {
                c.Next()
                return
            }
        }
        
        c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
        c.Abort()
    }
}

// Usage
router.GET("/api/restaurants", middleware.RequireAuth, middleware.RequireRole("admin", "all_services", "restaurant"), handlers.GetRestaurants)
```

## Testing the Role System

### Test Cases
1. **Admin Role**
   - Create admin user
   - Verify access to all services without location assignment
   - Confirm purple badge displays

2. **All Services Role**
   - Create all_services user with 2 specific clubs
   - Verify access to restaurant, office, and classes at assigned clubs only
   - Confirm blue badge displays

3. **Service-Specific Roles**
   - Create restaurant, office, and classes users
   - Verify each can only access their designated service
   - Confirm appropriate badge colors

4. **Location Restrictions**
   - Assign user to Club A only
   - Verify cannot access Club B resources
   - Confirm admin bypasses location restrictions

## User Interface

### User List View
- Displays role badge with color coding
- Shows "Service Access" column describing permissions
- Filter dropdown with all 5 role options

### User Creation/Edit Forms
- Role dropdown with descriptive labels
- Contextual helper text explaining selected role
- Location assignment section with admin role notice
- No service checkboxes (removed)

## Best Practices

### Role Assignment Guidelines
1. **Use Admin sparingly** - Only for trusted system administrators
2. **Prefer specific roles** - Assign the minimal role needed (restaurant, office, or classes)
3. **Use All Services for managers** - Staff managing multiple services at one location
4. **Always assign locations** - Except for admin role
5. **Review regularly** - Audit user roles and remove inactive users

### Security Considerations
- Location assignments are enforced at the API level (planned)
- Role changes take effect immediately
- Inactive users cannot access any resources
- Password changes trigger session invalidation (planned)
