// BottomNav.jsx — NEW FILE, create this in your components folder
// This replaces Dashboard.jsx's 3 buttons with a proper mobile bottom nav
// Import this in every page you want the nav to appear on

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/BottomNav.css";

function BottomNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Profile popup — appears above nav when Profile is tapped */}
      {profileOpen && (
        <div className="profile-popup">
          <button
            className="profile-popup-item"
            onClick={() => { setProfileOpen(false); navigate("/cart"); }}
          >
            🛒 My Cart
          </button>
          <button
            className="profile-popup-item"
            onClick={() => { setProfileOpen(false); navigate("/orders"); }}
          >
            📦 My Orders
          </button>
           
            {/* use chat-float classname for flowing chat UI */}
          <button className="profile-popup-item" 
          onClick={() => navigate("/ai-support")}
          >
          💬Ai Assistant
         </button>
 
          <div className="profile-popup-divider" />
          <button
            className="profile-popup-item logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

          
        </div>
      )}
        
      {/* Overlay — closes popup when tapping outside */}
      {profileOpen && (
        <div
          className="profile-overlay"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">

        <button
  className={`nav-item ${adminOpen ? "active" : ""}`}
  onClick={() => {
    setAdminOpen(!adminOpen);
    setProfileOpen(false); // 🔥 closes profile when admin opens
  }}
>
        <span className="nav-icon">🛠️</span>
        <span className="nav-label">Admin</span>
        </button>
         
         {adminOpen && (
  <div className="admin-popup">

    <button onClick={() => navigate("/admin/orders")}>
      🚚 Admin Orders
    </button>

    <button onClick={() => navigate("/admin/products")}> 
     🔐 Admin Products
    </button>

    <button onClick={() => navigate("/admin/tickets")}>
      🎫 Tickets
    </button>

    <button onClick={() => navigate("/admin/dashboard")}>
     📈 Admin Dashboard
    </button>

     <button onClick={() => navigate("/admin/add-product")}> 
          🛒 Admin Add-Products
      </button>  

    <p className="admin-note">
      ⚠ View only. Only admin can modify data.
    </p>

  </div>
)}

        <button
          className={`nav-item ${isActive("/products") ? "active" : ""}`}
          onClick={() => navigate("/products")}
        >
          <span className="nav-icon">🛍</span>
          <span className="nav-label">Products</span>
        </button>

        <button
          className={`nav-item ${isActive("/cart") ? "active" : ""}`}
          onClick={() => navigate("/cart")}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Cart</span>
        </button>

         <button
  className={`nav-item ${profileOpen ? "active" : ""}`}
  onClick={() => {
    setProfileOpen(!profileOpen);
    setAdminOpen(false); // 🔥 close admin when profile opens
  }}
>
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </nav>
    </>
  );
}

export default BottomNav;