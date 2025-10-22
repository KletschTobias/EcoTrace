# 🌱 EcoTrace - Environmental Impact Tracker

A full-stack web application that helps users track and reduce their personal environmental footprint through activity logging, data visualization, and social comparison.

## 🎯 Overview

EcoTrace enables users to:
- 📊 **Track their environmental impact** - Log daily activities and see CO₂, water, and electricity consumption
- 📈 **Visualize trends** - View statistics over time with interactive charts
- 🏆 **Compare with friends** - Add friends and compete on a leaderboard (lowest CO₂ wins!)
- 🌍 **See global impact** - Real-time counters showing worldwide consumption patterns

## 🛠️ Tech Stack

### Backend
- **Quarkus 3.28.1** - Supersonic Subatomic Java framework
- **PostgreSQL 16** - Relational database
- **Hibernate ORM Panache** - Simplified database access
- **RESTEasy Reactive** - JAX-RS for REST APIs
- **Docker** - Database containerization

### Frontend
- **Angular 20** - Modern standalone components
- **RxJS** - Reactive state management
- **Chart.js / ng2-charts** - Data visualization
- **TypeScript** - Type-safe development

## ✨ Features

### Backend (Quarkus + PostgreSQL) ✅
- ✅ User authentication (register/login) with password hashing
- ✅ Activity tracking with emission factors
- ✅ Automatic user statistics calculation (total CO2, water, electricity)
- ✅ Friend system with email-based invitations
- ✅ Leaderboard sorted by lowest CO₂ impact
- ✅ 30+ predefined environmental activities across 5 categories
- ✅ REST API with proper validation and error handling
- ✅ Database seeded with demo data
- ✅ CORS configuration for local development
- ✅ Swagger UI for API documentation

### Frontend (Angular) ✅
- ✅ **Homepage** - Live global environmental stats, beautiful hero section
- ✅ **Authentication Modal** - Login/register forms with demo account hint
- ✅ **Dashboard** - Personal impact overview with stats cards, date range selector, comparisons with global/EU averages
- ✅ **Activity Tracking** - Searchable activity dropdown, category filters, real-time impact preview, activity history
- ✅ **Social Features** - Add friends by email, friends list with avatars, leaderboard showing rankings
- ✅ **Layout Component** - Responsive navigation, user profile display, logout functionality
- ✅ **Route Protection** - Auth guard preventing unauthorized access
- ✅ **Services Layer** - Complete API integration with authentication, activities, user-activities, friendships
- ✅ **TypeScript Models** - Full type safety matching backend DTOs

## 📁 Project Structure

```
EvironmentTracker-E.T.-main/
├── backend/EcoTrace-E.T/
│   ├── src/main/java/at/htl/
│   │   ├── entities/         # JPA entities (User, Activity, UserActivity, Friendship)
│   │   ├── dtos/             # Data Transfer Objects
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Database repositories
│   │   └── resources/        # REST API controllers
│   ├── src/main/resources/
│   │   ├── application.properties  # Database & CORS config
│   │   └── import.sql             # Seed data
│   └── pom.xml               # Maven dependencies
├── frontend/project/
│   ├── src/
│   │   ├── components/       # Layout & Hero components
│   │   ├── pages/            # Dashboard, Activities, Friends pages
│   │   ├── services/         # API services
│   │   ├── guards/           # Auth guard
│   │   ├── models/           # TypeScript interfaces
│   │   ├── app.routes.ts     # Routing configuration
│   │   └── main.ts           # App bootstrap
│   └── package.json          # npm dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Java 21** or higher
- **Maven 3.8+**
- **Docker & Docker Compose** (for PostgreSQL)
- **Node.js 18+** and **npm** (for Angular)

### 1️⃣ Start the Database

```bash
cd backend/EcoTrace-E.T./docker
docker-compose up -d
```

This starts PostgreSQL on port 5432 with:
- Database: `ecotrace`
- User: `ecotrace`
- Password: `ecotrace`

### 2️⃣ Start the Backend

```bash
cd backend/EcoTrace-E.T.
mvn quarkus:dev
```

The backend will start on **http://localhost:8080**

- Swagger UI: http://localhost:8080/q/swagger-ui
- H2 Console (if dev mode): http://localhost:8080/q/dev-ui

### 3️⃣ Start the Frontend

```bash
cd frontend/project
npm install
npm start
```

The frontend will start on **http://localhost:4200**

### 4️⃣ Login with Demo Account

```
Email: demo@ecotrace.com
Password: demo123
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Activities
- `GET /api/activities` - Get all predefined activities
- `GET /api/activities/{id}` - Get activity by ID

### User Activities
- `GET /api/users/{userId}/activities` - Get user's logged activities
- `POST /api/users/{userId}/activities` - Log new activity
- `DELETE /api/users/{userId}/activities/{activityId}` - Delete activity

### Friends
- `POST /api/users/{userId}/friends` - Add friend by email
- `GET /api/users/{userId}/friends` - Get user's friends
- `GET /api/users/{userId}/leaderboard` - Get leaderboard including user and friends

## 📊 Database Schema

### Users
- id, username, email, password (hashed), fullName
- totalCo2, totalWater, totalElectricity
- avatarColor (for UI display)

### Activities (Predefined)
- id, name, category, co2Factor, waterFactor, electricityFactor
- description, icon

### UserActivities (User's logged activities)
- id, userId, activityId, quantity, date
- co2Amount, waterAmount, electricityAmount (calculated)

### Friendships
- id, userId, friendId, createdAt

## 🎨 UI Components

### Homepage
- Animated hero section with floating particles and waves
- Live global consumption counters (CO₂, Water, Electricity)
- Period selector (Daily, Week, Month, Year)
- Authentication modal with login/register tabs

### Dashboard
- Stats cards showing user's total impact
- Date range selector (Today, This Week, This Month)
- Comparison with global and EU averages
- Percentage indicators (good/bad performance)
- Recent activities list (last 5 activities)

### Activities Page
- Searchable dropdown to select activities
- Category filter buttons (All, Transport, Home, Food, Shopping, Other)
- Quantity input with real-time impact preview
- Activity history with delete functionality
- Beautiful gradient cards

### Friends Page
- Add friend form with email input
- Friends grid with avatars and stats
- Sticky leaderboard sidebar with rankings
- Medal indicators for top 3 users
- Current user highlight in leaderboard

### Layout
- Sticky navigation header
- Logo with navigation links (Dashboard, Activities, Friends)
- User profile display with avatar
- Logout button
- Responsive footer

## 🌍 Environmental Activities

30+ predefined activities across 5 categories:

### 🚗 Transport
- Walking, Cycling, Public Transport, Electric Scooter
- Car (Petrol/Diesel/Electric), Carpooling, Flight

### 🏠 Home
- LED Bulbs, Smart Thermostat, Air Conditioning
- Gas Heating, Electric Heating, Laundry

### 🍽️ Food
- Vegan Meal, Vegetarian Meal, Chicken, Beef, Pork
- Local Produce, Imported Produce, Bottled Water, Tap Water

### 🛒 Shopping
- Reusable Bag, Plastic Bag, Paper Bag
- New Clothing, Secondhand Clothing, Electronics Purchase

### ♻️ Other
- Recycling, Composting, Planting a Tree

Each activity has scientifically-based emission factors for CO₂ (kg), Water (liters), and Electricity (kWh).

## 🔐 Security

- Passwords are hashed using BCrypt
- HTTP-only auth tokens (can be extended to JWT)
- Auth guard protects Angular routes
- CORS configured for local development
- Input validation on both frontend and backend

## 🧑‍💻 Development

### Backend Development
- Hot reload enabled with `mvn quarkus:dev`
- Database schema auto-created on startup (dev mode)
- Seed data automatically loaded from `import.sql`
- Swagger UI available for API testing

### Frontend Development
- Angular CLI with live reload: `npm start`
- Standalone components (no modules needed)
- RxJS for reactive data flow
- FormsModule for two-way data binding

### Adding New Activities

Edit `backend/EcoTrace-E.T./src/main/resources/import.sql`:

```sql
INSERT INTO Activity (id, name, category, co2Factor, waterFactor, electricityFactor, description, icon)
VALUES (nextval('Activity_SEQ'), 'My Activity', 'OTHER', 1.5, 10.0, 0.5, 'Activity description', '🌟');
```

## 🐛 Troubleshooting

### Backend Issues

**Database connection failed**
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
cd backend/EcoTrace-E.T./docker
docker-compose restart
```

**Port 8080 already in use**
```bash
# Change port in application.properties
quarkus.http.port=8081
```

### Frontend Issues

**Module not found errors**
```bash
# Reinstall dependencies
cd frontend/project
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**
- Ensure backend is running on http://localhost:8080
- Check `application.properties` has correct CORS origins

## 📚 Resources

- [Quarkus Documentation](https://quarkus.io/guides/)
- [Angular Documentation](https://angular.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

## 👥 Demo Accounts

Three demo users are pre-loaded:

1. **demo@ecotrace.com** / demo123
2. **john@example.com** / password
3. **jane@example.com** / password

These users have sample activities and are friends with each other.

## 🚀 Production Deployment

### Backend
- Package: `mvn clean package`
- Run: `java -jar target/quarkus-app/quarkus-run.jar`
- Configure production database in `application.properties`

### Frontend
- Build: `npm run build`
- Serve: Deploy `dist/` folder to nginx/Apache
- Update API base URL for production

## 📄 License

This project is under PROPRIETARY LICENSE.

---

**Built with ❤️ for a sustainable future 🌍**
