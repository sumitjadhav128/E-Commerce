// Dashboard.jsx — REPLACE your entire existing Dashboard.jsx with this
//
// CHANGES MADE:
// 1. REMOVED: the 3 buttons (My Cart, My Orders, Logout) — these now live in BottomNav profile popup
// 2. REMOVED: Dashboard.css import — no longer needed (you can delete Dashboard.css)
// 3. ADDED: BottomNav import so the nav still shows on this route if you ever use /dashboard
// 4. KEPT: all existing auth logic — token check, fetch, navigate, setMessage — untouched
// 5. KEPT: navigate("/") on 401/400 — untouched
//
// NOTE: If you no longer use the /dashboard route at all, you can delete this file
// and remove the route from App.jsx. The BottomNav handles everything Dashboard used to show.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import BottomNav from "./BottomNav"; // ADDED

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ---- Existing auth logic — untouched ----
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/auth/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 400) {
          localStorage.removeItem("token");
          navigate("/");
        }
        return res.json();
      })
      .then(data => {
        setMessage(data.message);
      });
  }, []);

  return (
    <div className="page-with-nav"> {/* ADDED: padding so content clears nav */}
      <BottomNav /> {/* ADDED: nav shows on dashboard too */}
    </div>
  );
}

export default Dashboard;