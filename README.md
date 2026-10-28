# Smart Energy Consumption & Bill Management System ⚡

A complete, beginner-friendly university Web Application Development mini-project built with the **MERN stack** (MongoDB Atlas / Local Fallback, Express.js, React, Node.js).

---

## 📌 Project Architecture & Scope

The application contains the following core features:

- **Dashboard:**
  - **Total Usage:** Dynamically calculated sum of electricity consumption across all records (`X kWh`).
  - **Latest Bill:** Most recent bill amount (`Rs. X,XXX.XX`).
  - **Unpaid Bills:** Count of records with `Unpaid` status.
  - **Recent Records:** Real-time table displaying the latest 5 records with a link to full records.
  - Clean empty state when no records exist (*"No energy records available yet."*).
- **Energy Records:**
  - **List Records:** Responsive table with Month, Previous Reading, Current Reading, Units Consumed, Rate, Total Bill, Payment Status, Due Date, and Actions.
  - **Search:** Case-insensitive search by month (e.g. `October 2026`).
  - **Filter:** Filter by payment status (`All`, `Paid`, `Unpaid`).
  - **Sort:** Multi-criteria sorting by `Due Date`, `Month`, or `Total Bill` (`Ascending` / `Descending`).
  - **View Record:** Detailed breakdown view for a single record with graceful 404 error handling.
  - **Edit Record:** Update meter readings or rates with automatic recalculation and in-place database update.
  - **Delete Record:** Safe deletion with confirmation modal dialog preventing accidental deletes.
- **Add Record:**
  - Clean form with client and server-side validation.
  - Automatic live calculation of `units_consumed` and `total_bill`.
  - Non-editable calculated fields.

---

## 📂 Project Structure

```text
Smart-Energy-Consumption-Bill-Management-System/
├── .gitignore
├── README.md
├── package.json               # Root scripts (server, client, test suites)
├── backend/
│   ├── .env                   # Environment variables (Atlas URI, PORT)
│   ├── .env.example           # Example environment template
│   ├── package.json           # Backend dependencies & test scripts
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── db.js              # Persistent database connection (Atlas + local fallback)
│   ├── models/
│   │   └── EnergyRecord.js    # Mongoose model (11 required fields)
│   ├── routes/
│   │   └── records.js         # Complete CRUD routes + /summary endpoint
│   └── scripts/
│       ├── verifyDb.js        # Database collection verification
│       ├── testDay3.js        # Create & validation test suite
│       ├── testDay4.js        # Read, search, filter, sort test suite
│       ├── testDay5.js        # Update & delete test suite
│       └── testFullApplication.js # Complete end-to-end test suite (Tests A-J)
└── frontend/
    ├── index.html             # HTML entry point
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with proxy to port 5001
    └── src/
        ├── App.jsx            # Application routing (/, /records, /records/:id, /records/edit/:id, /add-record)
        ├── main.jsx           # React DOM root
        ├── index.css          # Responsive stylesheet (cards, forms, tables, modals)
        ├── components/
        │   ├── Navbar.jsx     # Navigation bar
        │   └── Footer.jsx     # Footer
        └── pages/
            ├── Dashboard.jsx      # Live database metrics & recent records
            ├── EnergyRecords.jsx  # Table with search, filter, sort, modal delete
            ├── ViewRecord.jsx     # Single record details view
            ├── EditRecord.jsx     # Edit form with live recalculation
            └── AddRecord.jsx      # Add record form
```

---

## 🗄️ Database Entity: `energy_records`

| Field | Data Type | Description |
|---|---|---|
| `id` / `_id` | `ObjectId` | Primary Key (auto-generated) |
| `month` | `String` | Month and Year (e.g. `"October 2026"`) |
| `previous_reading` | `Number` | Previous electricity meter reading |
| `current_reading` | `Number` | Current electricity meter reading |
| `units_consumed` | `Number` | Calculated: `current_reading - previous_reading` |
| `rate_per_unit` | `Number` | Electricity tariff rate per unit |
| `total_bill` | `Number` | Calculated: `units_consumed * rate_per_unit` |
| `payment_status` | `String` | `'Paid'` or `'Unpaid'` |
| `due_date` | `Date` | Bill payment due date |
| `created_at` | `Date` | Record creation timestamp |
| `updated_at` | `Date` | Record last updated timestamp |

---

## 🧪 Verification & Testing Commands

To run the complete end-to-end test suite covering all functional tests (Create, Read, Search, Filter, Sort, Update, Invalid Rejection, Dashboard, Delete, Error Handling):
```bash
npm run test:full
```

Additional test suites:
- `npm run test:db` — Verify database connection and collection
- `npm run test:day3` — Test create calculations and validation
- `npm run test:day4` — Test listing, view, search, filter, and sort
- `npm run test:day5` — Test update recalculation and deletion

---

## 🚀 How to Run the Application

**Step 1: Start Backend Server**
```bash
npm run server
```
*Backend runs on: [http://localhost:5001](http://localhost:5001)*

**Step 2: Start Frontend Application**
```bash
npm run client
```
*Frontend runs on: [http://localhost:5173](http://localhost:5173)*