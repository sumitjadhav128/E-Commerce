import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../utils/api";
import "../css/Payment.css";

function Payment() {
  // no crash
const [cart, setCart] = useState({ items: [] });
  const { orderId } = useParams();
  const navigate = useNavigate();
const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setCart(data));
      
  }, []);

   console.log(cart);

  const handlePayment = async (success) => {
    const res = await fetch(
      `${API_URL}/api/order/pay/${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ success })
      }
    );

    const data = await res.json();
    alert(data.message);

    navigate("/orders");
  };

  // safe calculation
    const total = cart?.items?.reduce((acc, item) => {
  return acc + item.product.price * item.quantity;
}, 0) || 0;

 if (!cart) return <p>Loading...</p>;
 
  return (

    
 <div className="payment-page">

  <div className="payment-card">

    <h1 className="payment-title">Secure Payment</h1>

    <p className="payment-subtitle">
      Complete your purchase safely
    </p>

    {/* 💳 Fake payment options */}
    <div className="payment-methods">
      <label>
        <input type="radio" name="payment" defaultChecked />
        Credit / Debit Card
      </label>

      <label>
        <input type="radio" name="payment" />
        UPI
      </label>

      <label>
        <input type="radio" name="payment" />
        Cash on Delivery
      </label>
    </div>

    {/* 💰 Summary */}
    <div className="payment-summary">
      <p>Total Amount</p>
      <h2>₹{total}</h2>
    </div>

    {/* ✅ Buttons */}
    <div className="payment-actions">

      <button
        className="pay-btn"
        onClick={() => handlePayment(true)}
      >
        Pay Now
      </button>

      <button
        className="fail-btn"
        onClick={() => handlePayment(false)}
      >
        Simulate Failure
      </button>

    </div>

  </div>

</div>
  );
}

export default Payment;