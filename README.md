# Smart Energy Consumption & Bill Management System ⚡

A simple and beginner-friendly university Web Application Development mini-project built with the **MERN stack** (MongoDB Atlas / Local Fallback, Express.js, React, Node.js).

---

## 📅 Development Roadmap & Status

### ✅ Day 1: Project Foundation & Layout Setup
- Initialized clean project structure (`backend/` and `frontend/`).
- Database connection configuration with `.env`.
- Express backend server configuration.
- React single-page application setup with Vite and React Router.
- Responsive layout with navigation (Dashboard, Energy Records, Add Record).
- Dashboard overview placeholder cards and empty state.

### ✅ Day 2: Database Structure & Entity Model
- Created the main entity model: [`EnergyRecord`](backend/models/EnergyRecord.js).
- Configured MongoDB collection: `energy_records`.
- Set up schema fields and strict data types matching requirements:
  - `id` / `_id`: Primary key (auto-generated)
  - `month`: String
  - `previous_reading`: Number
  - `current_reading`: Number
  - `units_consumed`: Number
  - `rate_per_unit`: Number
  - `total_bill`: Number
  - `payment_status`: String (`Paid` / `Unpaid`)
  - `due_date`: Date
  - `created_at`: Date (auto-managed timestamp)
  - `updated_at`: Date (auto-managed timestamp)
- Added automatic local MongoDB fallback (`localhost:27017`) if Atlas is unreachable or IP is unwhitelisted.

### ✅ Day 3: CREATE Functionality & Automatic Calculations
- Working Add Record form with automatic calculation:
  - `units_consumed = current_reading - previous_reading`
  - `total_bill = units_consumed * rate_per_unit`
- Server-side validations (non-empty fields, non-negative numbers, current reading $\ge$ previous reading, rate $>0$, valid payment status).
- Record storage via `POST /api/records` route.

### ✅ Day 4: READ Functionality, Search, Filter & Sort
- **List Records Table:**
  - Displays all records with columns: Month, Previous Reading, Current Reading, Units Consumed (`150 kWh`), Rate Per Unit (`Rs. 25.00`), Total Bill (`Rs. 3,750.00`), Payment Status (Paid/Unpaid visual badge), Due Date, and Actions (`View`).
- **View Record Page:**
  - Dedicated details view (`/records/:id`) showing all meter and bill parameters with a "Back to Records" navigation link.
  - Graceful 404 handling for non-existing or invalid record IDs.
- **Search:**
  - Fast case-insensitive search by month (e.g. `October 2026`).
- **Filter:**
  - Payment status filter: `All`, `Paid`, `Unpaid`.
- **Sort:**
  - Sort by: `Due Date`, `Month`, `Total Bill`.
  - Direction: `Descending` (high to low / newest) or `Ascending` (low to high / oldest).
- **Combined Search / Filter / Sort:**
  - Search, filter, and sorting interact simultaneously.
- **Empty State:**
  - Clean message *"No energy records available."* with direct "Add Record" link.
- **Automated Day 4 Test Suite:**
  - Run via `npm run test:day4`.

---

## 📂 Project Structure

```text
Smart-Energy-Consumption-Bill-Management-System/
├── .gitignore
├── README.md
├── package.json               # Root scripts
├── backend/
│   ├── .env                   # Environment variables (Atlas URI, PORT)
│   ├── .env.example           # Example environment template
│   ├── package.json           # Backend dependencies & test scripts
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── db.js              # Database connection (Atlas + local fallback)
│   ├── models/
│   │   └── EnergyRecord.js    # EnergyRecord Mongoose model
│   ├── routes/
│   │   └── records.js         # API routes (POST create, GET all with filters, GET by ID)
│   └── scripts/
│       ├── verifyDb.js        # Day 2 database verification script
│       ├── testDay3.js        # Day 3 validation & calculation test script
│       └── testDay4.js        # Day 4 listing, view, search, filter, sort test script
└── frontend/
    ├── index.html             # HTML entry point
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with proxy to port 5001
    └── src/
        ├── App.jsx            # Application layout & routes (including /records/:id)
        ├── main.jsx           # React DOM root
        ├── index.css          # Clean responsive stylesheet (tables, badges, filters)
        ├── components/
        │   ├── Navbar.jsx     # Navigation bar
        │   └── Footer.jsx     # Footer
        └── pages/
            ├── Dashboard.jsx      # Overview cards
            ├── EnergyRecords.jsx  # Day 4 interactive records table with search/filter/sort
            ├── ViewRecord.jsx     # Day 4 single record details view
            └── AddRecord.jsx      # Day 3 Add Record form
```

---

## 🛠️ Verification Commands

To run the Day 4 test suite (tests listing, single view, search, filter, sort):
```bash
npm run test:day4
```

To run the Day 3 test suite (tests calculations, validation, and database storage):
```bash
npm run test:day3
```

To test the database connection and collection:
```bash
npm run test:db
```

---

## 🚀 Running the Project

**1. Start Backend Server:**
```bash
npm run server
```
*Backend runs at: http://localhost:5001*

**2. Start Frontend Application:**
```bash
npm run client
```
*Frontend runs at: http://localhost:5173*
# Smart-Energy-Consumption-Bill-Management-System