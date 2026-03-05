import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/admin/analytics", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 403) {
          alert("Admin access only");
          navigate("/");
        }
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <div style={cardStyle}>
        <h3>Total Users</h3>
        <p>{data.totalUsers}</p>
      </div>

      <div style={cardStyle}>
        <h3>Total Products</h3>
        <p>{data.totalProducts}</p>
      </div>

      <div style={cardStyle}>
        <h3>Total Orders</h3>
        <p>{data.totalOrders}</p>
      </div>

      <div style={cardStyle}>
        <h3>Total Revenue</h3>
        <p>₹{data.totalRevenue}</p>
      </div>

      <div style={cardStyle}>
        <h3>Paid Orders</h3>
        <p>{data.paidOrders}</p>
      </div>

      <div style={cardStyle}>
        <h3>Pending Orders</h3>
        <p>{data.pendingOrders}</p>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "8px",
  width: "300px"
};

export default AdminDashboard;