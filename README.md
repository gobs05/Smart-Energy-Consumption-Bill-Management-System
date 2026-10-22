# Smart Energy Consumption & Bill Management System ⚡

A simple and beginner-friendly university Web Application Development mini-project built with the **MERN stack** (MongoDB Atlas, Express.js, React, Node.js).

---

## 📅 Development Roadmap & Status

### ✅ Day 1: Project Foundation & Layout Setup
- Initialized clean project structure (`backend/` and `frontend/`).
- Persistent MongoDB Atlas connection configuration with `.env`.
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
- Verified collection creation and field validations without leaving dummy records in DB.
- Added database verification test script (`npm run test:db`).

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
│   │   └── db.js              # Database connection & collection setup
│   ├── models/
│   │   └── EnergyRecord.js    # EnergyRecord Mongoose model
│   └── scripts/
│       └── verifyDb.js        # Day 2 database verification script
└── frontend/
    ├── index.html             # HTML entry point
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with proxy
    └── src/
        ├── App.jsx            # Application layout & routes
        ├── main.jsx           # React DOM root
        ├── index.css          # Clean responsive stylesheet
        ├── components/
        │   ├── Navbar.jsx     # Navigation bar
        │   └── Footer.jsx     # Footer
        └── pages/
            ├── Dashboard.jsx      # Overview cards
            ├── EnergyRecords.jsx  # Records placeholder
            └── AddRecord.jsx      # Add record placeholder
```

---

## 🛠️ Verification Commands

To verify the Day 2 database model and collection:
```bash
npm run test:db
```
*(Runs [`backend/scripts/verifyDb.js`](backend/scripts/verifyDb.js))*

---

## 🚀 Running the Project

**1. Start Backend:**
```bash
npm run server
```
*Runs at: http://localhost:5001*

**2. Start Frontend:**
```bash
npm run client
```
*Runs at: http://localhost:5173*
# Smart-Energy-Consumption-Bill-Management-System