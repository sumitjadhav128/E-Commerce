import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/order/my-orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div>
      <h1>My Orders</h1>

      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>Order ID: {order._id}</h3>
          <h3>
  User: {order.user?.name}
</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.totalAmount}</p>
          <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

          <h4>Items:</h4>
          {order.items.map(item => (
            <div key={item._id}>
              <p>{item.product?.name} × {item.quantity}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Orders;