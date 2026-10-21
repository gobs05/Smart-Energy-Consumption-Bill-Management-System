import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand-logo">
          ⚡ EnergyManager
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                end
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/records" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                Energy Records
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/add-record" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                Add Record
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
