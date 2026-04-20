import { useEffect, useState } from "react";
import API_URL from "../utils/api";
import "../css/AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/api/order/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/api/order/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    fetchOrders();
  };

  return (
    <div className="admin-orders">

  <h1 className="admin-title">Orders</h1>

  <div className="orders-list">
    {orders.map(order => (
      <div key={order._id} className="order-row">

        <div className="order-left">
          <h3>{order.user?.name || "User"}</h3>
          <p className="email">{order.user?.email}</p>
          <p className="date">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="order-middle">
          <p className="amount">₹{order.totalAmount}</p>
        </div>

        <div className="order-right">
          <span className={`status-badge ${order.status.toLowerCase()}`}>
            {order.status}
          </span>

          <select
            value={order.status}
            onChange={(e) => updateStatus(order._id, e.target.value)}
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>

      </div>
    ))}
  </div>

</div>
  );
}

export default AdminOrders;