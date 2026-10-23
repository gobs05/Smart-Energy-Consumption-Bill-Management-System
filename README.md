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
- Replaced Add Record placeholder with a working, responsive form:
  - Inputs: Month, Previous Meter Reading, Current Meter Reading, Rate Per Unit, Due Date, Payment Status (`Paid`/`Unpaid`).
  - Automatic calculations computed on submission:
    - `units_consumed = current_reading - previous_reading`
    - `total_bill = units_consumed * rate_per_unit`
  - Live calculation preview box for instant user feedback.
- Server-side validation:
  - All required fields present and non-empty.
  - Previous Reading $\ge 0$, Current Reading $\ge 0$.
  - Current Reading $\ge$ Previous Reading.
  - Rate Per Unit $> 0$.
  - Payment Status strictly `Paid` or `Unpaid`.
- Database storage via `POST /api/records` route saving records to `energy_records`.
- Clear user feedback with success messages and redirection to `/records`.
- Full Day 3 verification test suite (`npm run test:day3`).

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
│   │   └── records.js         # API route for creating records (Day 3)
│   └── scripts/
│       ├── verifyDb.js        # Day 2 database verification script
│       └── testDay3.js        # Day 3 validation & calculation test script
└── frontend/
    ├── index.html             # HTML entry point
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with proxy to port 5001
    └── src/
        ├── App.jsx            # Application layout & routes
        ├── main.jsx           # React DOM root
        ├── index.css          # Clean responsive stylesheet (cards, forms, alerts)
        ├── components/
        │   ├── Navbar.jsx     # Navigation bar
        │   └── Footer.jsx     # Footer
        └── pages/
            ├── Dashboard.jsx      # Overview cards
            ├── EnergyRecords.jsx  # Records placeholder
            └── AddRecord.jsx      # Day 3 working Add Record form
```

---

## 🛠️ Verification Commands

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