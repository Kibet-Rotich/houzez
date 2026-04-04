User Table (Custom User Model)

id (Primary Key)

email (Unique)

password (Hashed)

role (Enum/Choices: 'CUSTOMER', 'OWNER')

first_name, last_name, phone_number

Property Table (The Rentals)

id (Primary Key)

owner_id (Foreign Key -> User)

title (String - e.g., "Spacious Bedsitter in Juja")

description (Text)

location (String)

price (Decimal)

property_type (Enum/Choices: 'BEDSITTER', '1_BDRM', '2_BDRM', 'HOUSE', etc.)

available_units (Positive Integer, default: 1)

owner contact exposed in property API: owner_name, owner_email, owner_phone_number

property media supports both photos and videos (max 15 files per property)

created_at, updated_at (Timestamps)

Visit/Booking Table

id (Primary Key)

property_id (Foreign Key -> Property)

customer_id (Foreign Key -> User)

scheduled_date (DateTime)

status (Enum/Choices: 'PENDING', 'CONFIRMED', 'CANCELLED')

notes (Text - optional, for the customer to leave a message)

created_at (Timestamp)



apis


Authentication

POST /api/auth/register/: Create a new user (Customer or Owner).

POST /api/auth/login/: Authenticate and return JWT access/refresh tokens.

GET /api/auth/me/: Get the currently logged-in user's profile and role.

Properties (Rentals)

GET /api/properties/: List all properties. Unauthenticated access allowed.

Query Params for Filtering/Search: ?search=keyword&location=X&property_type=BEDSITTER&min_price=Y&max_price=Z&min_units=A&max_units=B

GET /api/properties/<id>/: View details of a specific property.

POST /api/properties/: Create a new property listing. (Requires Auth + Owner Role).

PUT/PATCH /api/properties/<id>/: Update a property. (Requires Auth + Owner Role + Must be the creator).

DELETE /api/properties/<id>/: Remove a property listing.

GET /api/staff-portal/: Staff-only dashboard summary and recent properties.

Server admin promotion script: python makeadmin.py <username> (sets is_staff=True for the chosen user).

Bookings/Visits

POST /api/bookings/: Book a house visit. (Requires Auth + Customer Role).

GET /api/bookings/: List bookings.

If Customer: Returns visits they have booked.

If Owner: Returns visits requested for their properties.

PATCH /api/bookings/<id>/: Update booking status (e.g., Owner accepts/cancels the visit).


pages 
Home / Search Page (Public)

Function: The landing page. Contains a search bar and a sidebar for filters (location, cost slider, property type dropdown). Displays a grid of rental cards.

Property Details Page (Public)

Function: Shows the full description, price, and placeholder images of a specific rental. Contains a "Book a Visit" button.

Logic: If the user clicks "Book" and isn't logged in, they are redirected to the Login page.

Login & Sign Up Pages (Public)

Function: Standard forms. The Sign Up form should have a toggle or dropdown asking: "Are you looking for a house, or listing a house?" to set their role.

Customer Dashboard (Protected)

Function: A simple dashboard where a customer can see all their upcoming scheduled visits, the status of those requests (Pending/Confirmed), and the contact info of the owner.

Owner Dashboard (Protected)

Function: The management hub for landlords.

Sub-views: 1. "My Properties" (List of their active listings with edit/delete buttons).
2. "Add New Property" (A form matching the Property database schema).
3. "Visit Requests" (A table of customers who want to view their houses, with buttons to Confirm or Cancel).