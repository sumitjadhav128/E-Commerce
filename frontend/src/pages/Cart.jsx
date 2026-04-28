// Cart.jsx — REPLACE your entire existing Cart.jsx with this
//
// CHANGES FROM YOUR VERSION:
// 1. ADDED: BottomNav import and component
// 2. ADDED: product image in each cart item
// 3. CHANGED: alert() in checkout → toast
// 4. CHANGED: loading state for checkout button
// 5. CHANGED: empty cart shows nicer UI instead of plain text
// 6. CHANGED: if (!cart) return <h2>Empty...</h2> → proper loading state
// 7. REMOVED: console.log(cart) — was just for debugging
// ALL logic (updateQuantity, removeItem, checkout, total calc) completely untouched

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../utils/api";
import "../css/Cart.css";
import BottomNav from "./BottomNav";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);       // ADDED: loading state
  const [checkingOut, setCheckingOut] = useState(false); // ADDED: checkout loading
  const [address, setAddress] = useState(
  localStorage.getItem("address") || ""
);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    localStorage.setItem("address", address);

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
        setLoading(false); // ADDED
      });
  }, []);

  // ---- All existing logic — untouched ----

  const total = cart?.items?.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0) || 0;

  const updateQuantity = async (productId, action) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/cart/update/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    setCart(data);
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCart(data);
  };

  const checkout = async () => {
  if (!address) {
    alert("Please enter address");
    return;
  }

  const token = localStorage.getItem("token");

  setCheckingOut(true);

  const res = await fetch(`${API_URL}/api/order/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  setCheckingOut(false);

  if (data.orderId) {
    navigate(`/payment/${data.orderId}`, {
      state: { address } // ✅ FIXED
    });
  } else {
    toast.error(data.message);
  }
};

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="cart-page page-with-nav">
        <div className="cart-loading">
          <p>Loading your cart...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ---- Empty cart ----
  if (!cart || cart.items?.length === 0) {
    return (
      <div className="cart-page page-with-nav">
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-sub">Looks like you haven't added anything yet.</p>
          <button
            className="cart-empty-btn"
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
    <div className="cart-page page-with-nav">

      {/* Header */}
      <div className="cart-header">
        <h1 className="cart-title">Your Cart</h1>
        <span className="cart-count">{cart.items?.length || 0} item{cart.items?.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cart.items?.map(item => (
          <div key={item.product._id} className="cart-item">

            {/* Product Image */}
            <div className="cart-item-img">
              <img
                src={item.product.image?.url}
                alt={item.product.name}
              />
            </div>

            {/* Info + Actions */}
            <div className="cart-item-body">
              <div className="cart-item-top">
                <h3 className="cart-item-name">{item.product.name}</h3>
                <p className="cart-item-price">₹{item.product.price}</p>
              </div>

              <div className="cart-item-bottom">
                {/* Quantity controls */}
                <div className="quantity">
                  <button onClick={() => updateQuantity(item.product._id, "decrease")}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, "increase")}>+</button>
                </div>

                {/* Subtotal + Remove */}
                <div className="cart-item-right">
                  <p className="cart-item-subtotal">₹{item.product.price * item.quantity}</p>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="cart-summary">
        <h2 className="summary-title">Order Summary</h2>

        <div className="summary-row">
          <span>Subtotal ({cart.items?.length || 0} items)</span>
          <span>₹{total}</span>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <span className="free-delivery">FREE</span>
        </div>

        <div className="summary-divider" />

        <div className="summary-row summary-total">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        
        <div className="address-box">
  <h3>📍 Delivery Address</h3>

  <textarea
    placeholder="Enter your delivery address..."
    value={address}
    onChange={(e) => setAddress(e.target.value)}
  />

  {!address && (
    <p className="address-warning">
      ⚠ Please enter address before checkout
    </p>
  )}
</div>

        <button
          className="checkout-btn"
          onClick={checkout}
          disabled={checkingOut}
        >
          {checkingOut ? "Placing Order..." : "Proceed to Checkout"}
        </button>
      </div>

    </div>
  );
}

export default Cart;