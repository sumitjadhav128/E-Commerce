// Orders.jsx — REPLACE your entire existing Orders.jsx with this
//
// CHANGES FROM YOUR VERSION:
// 1. ADDED: BottomNav import and component
// 2. ADDED: loading state while fetching orders
// 3. ADDED: empty state with nice icon and "Browse Products" button
// 4. ADDED: product image in each order item
// 5. ADDED: back button at top
// 6. CHANGED: order ID shortened (shows last 8 chars)
// 7. CHANGED: date format to "Dec 15, 2024" instead of full timestamp
// 8. REMOVED: "User:" row — not needed in "My Orders"
// ALL existing logic (fetch orders, display) untouched

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Orders.css";
import API_URL from "../utils/api";
import BottomNav from "./BottomNav";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/order/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="orders-page page-with-nav">
        <div className="orders-status">
          <p>Loading your orders...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ---- Empty state ----
  if (orders.length === 0) {
    return (
      <div className="orders-page page-with-nav">
        <h1 className="orders-title">My Orders</h1>
        <div className="orders-empty">
          <span className="orders-empty-icon">📦</span>
          <h2 className="orders-empty-title">No orders yet</h2>
          <p className="orders-empty-sub">
            Looks like you haven't placed any orders.
          </p>
          <button
            className="orders-empty-btn"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="orders-page page-with-nav">

      {/* Header */}
      <div className="orders-header">
        <button className="orders-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="orders-title">My Orders</h1>
        <div style={{ width: 32 }} /> {/* spacer */}
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">

            {/* Order Header */}
            <div className="order-header">
              <div className="order-meta">
                <p className="order-id">
                  Order #{order._id.slice(-8)}
                </p>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>

            {/* Order Total */}
            <div className="order-total">
              <span className="order-total-label">Total Amount</span>
              <span className="order-total-value">₹{order.totalAmount}</span>
            </div>

            {/* Order Items */}
            <div className="order-items">
              <h4 className="order-items-title">
                Items ({order.items.length})
              </h4>
              {order.items.map(item => (
                <div key={item._id} className="order-item">
                  <div className="order-item-img">
                    {item.product?.image?.url ? (
                      <img src={item.product.image.url} alt={item.product?.name} />
                    ) : (
                      <span className="order-item-placeholder">📦</span>
                    )}
                  </div>
                  <div className="order-item-info">
                    <p className="order-item-name">
                      {item.product?.name || "Product unavailable"}
                    </p>
                    <p className="order-item-qty">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

export default Orders;