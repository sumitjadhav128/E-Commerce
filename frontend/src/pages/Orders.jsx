import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Orders.css";
import API_URL from "../utils/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    

    if (!token) {
      navigate("/");
      return;
    }

    const API_URL = "http://192.168.183.196:5000";

    fetch(`${API_URL}/api/order/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
   <div className="orders">
  <h1 className="orders-title">My Orders</h1>

  {orders.length === 0 && (
    <p className="no-orders">No orders yet.</p>
  )}

  {orders.map(order => (
    <div key={order._id} className="order-card">

      <div className="order-header">
        <div>
          <p className="order-id">Order ID: {order._id}</p>
          <p className="order-date">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className={`status ${order.status}`}>
          {order.status}
        </div>
      </div>

      <div className="order-body">
        <p><strong>User:</strong> {order.user?.name || "N/A"}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
      </div>

      <div className="order-items">
        <h4>Items</h4>

        {order.items.map(item => (
          <div key={item._id} className="order-item">
            <span>{item.product?.name}</span>
            <span>× {item.quantity}</span>
          </div>
        ))}
      </div>

    </div>
  ))}
</div>
  );
}

export default Orders;