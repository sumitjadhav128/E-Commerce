// Payment.jsx — REPLACE your entire existing Payment.jsx with this
//
// CHANGES FROM YOUR VERSION:
// 1. ADDED: BottomNav import and component
// 2. ADDED: loading state while fetching cart
// 3. ADDED: order summary showing items from cart
// 4. ADDED: secure payment icons
// 5. CHANGED: alert() → toast
// 6. CHANGED: payment methods to actual radio buttons with better styling
// 7. REMOVED: console.log(cart) — was just for debugging
// ALL existing logic (fetch cart, handlePayment, total calc) untouched

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API_URL from "../utils/api";
import "../css/Payment.css";
import BottomNav from "./BottomNav";
import { useLocation } from "react-router-dom";

function Payment() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("card");
  
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const address =
  location.state?.address || localStorage.getItem("address");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setLoading(false);
      });
  }, []);

  // ---- Existing total calculation — untouched ----
  const total = cart?.items?.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0) || 0;

  // ---- Existing handlePayment — untouched, alert → toast ----
  const handlePayment = async (success) => {
    setProcessing(true);
    const res = await fetch(`${API_URL}/api/order/pay/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ success })
    });

    const data = await res.json();
    setProcessing(false);
    
    if (success) {
      toast.success(data.message);
    } else {
      console.log(data)
      toast.error(data.message || data.error);
    }

    navigate("/orders");
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="payment-page page-with-nav">
        <div className="payment-status">
          <p>Loading payment details...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="payment-page page-with-nav">

      {/* Payment Card */}
      <div className="payment-card">

        {/* Header */}
        <div className="payment-header">
          <span className="payment-lock">🔒</span>
          <h1 className="payment-title">Secure Payment</h1>
          <p className="payment-subtitle">Complete your purchase safely</p>
        </div>

        {/* Order Summary */}
        <div className="payment-section">
          <h3 className="section-title">Order Summary</h3>
          <div className="order-items">
            {cart?.items?.map((item) => (
              <div key={item.product._id} className="summary-item">
                <span className="summary-name">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="summary-price">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span className="total-label">Total Amount</span>
            <span className="total-value">₹{total}</span>
          </div>
        </div>
        
        <div className="checkout-address">
  <h4>📍 Delivery Address</h4>
  <p>{address}</p>
</div>
        {/* Payment Methods */}
        <div className="payment-section">
          <h3 className="section-title">Payment Method</h3>
          <div className="payment-methods">

            <label className={`method-option ${selectedMethod === "card" ? "active" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={selectedMethod === "card"}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">💳</span>
                <span className="method-label">Credit / Debit Card</span>
              </div>
            </label>

            <label className={`method-option ${selectedMethod === "upi" ? "active" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={selectedMethod === "upi"}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">📱</span>
                <span className="method-label">UPI</span>
              </div>
            </label>

            <label className={`method-option ${selectedMethod === "cod" ? "active" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={selectedMethod === "cod"}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">💵</span>
                <span className="method-label">Cash on Delivery</span>
              </div>
            </label>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="payment-actions">
          <button
            className="pay-btn"
            onClick={() => handlePayment(true)}
            disabled={processing}
          >
            {processing ? "Processing..." : `Pay ₹${total}`}
          </button>

          <button
            className="fail-btn"
            onClick={() => handlePayment(false)}
            disabled={processing}
          >
            Simulate Payment Failure
          </button>
        </div>

        <p className="payment-notice">
          🔒 Your payment information is secure and encrypted
        </p>

      </div>

      <BottomNav />
    </div>
  );
}

export default Payment;