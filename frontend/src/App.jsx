import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import EnergyRecords from './pages/EnergyRecords';
import AddRecord from './pages/AddRecord';
import ViewRecord from './pages/ViewRecord';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/records" element={<EnergyRecords />} />
          <Route path="/records/:id" element={<ViewRecord />} />
          <Route path="/add-record" element={<AddRecord />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
