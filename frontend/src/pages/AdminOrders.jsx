import { useEffect, useState } from "react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/api/order/all", {
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
    await fetch(`http://localhost:5000/api/order/${id}/status`, {
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
    <div>
      <h1>Admin Order Panel</h1>

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>User: {order.user.name} ({order.user.email})</h3>
          <p>Total: ${order.totalAmount}</p>
          <p>Status: {order.status}</p>

          <select
            onChange={(e) => updateStatus(order._id, e.target.value)}
            value={order.status}
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default AdminOrders;