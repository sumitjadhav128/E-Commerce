import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import "../css/Cart.css";

function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

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

  if (!cart) return <h2>Empty...</h2>;

  const total = cart.items.reduce((acc, item) => {
  return acc + item.product.price * item.quantity;
}, 0);

// Add Function
const updateQuantity = async (productId, action) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/api/cart/update/${productId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action })
    }
  );

  const data = await res.json();
  setCart(data);
};

// Remove Function

const removeItem = async (productId) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
  `${API_URL}/api/cart/remove/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  setCart(data);
};

// Checkout Function
const checkout = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/order/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (data.orderId) {
    navigate(`/payment/${data.orderId}`);
  } else {
    alert(data.message);
  }
};

  return (
    <div className="cart-page">

  <h1 className="cart-title">Your Cart</h1>

  {cart.items && cart.items.length === 0 && (
    <p className="empty-cart">Your cart is empty</p>
  )}

  <div className="cart-container">

    {/* 🛒 Items */}
    <div className="cart-items">
      {cart.items?.map(item => (
        <div key={item.product._id} className="cart-item">

          <div className="item-info">
            <h3>{item.product.name}</h3>
            <p>₹{item.product.price}</p>
          </div>

          <div className="item-actions">

            <div className="quantity">
              <button onClick={() => updateQuantity(item.product._id, "decrease")}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product._id, "increase")}>+</button>
            </div>

            <button
              className="remove-btn"
              onClick={() => removeItem(item.product._id)}
            >
              Remove
            </button>

          </div>

        </div>
      ))}
    </div>

    {/* 💳 Summary */}
    <div className="cart-summary">
      <h2>Total: ₹{total}</h2>

      <button className="checkout-btn" onClick={checkout}>
        Checkout
      </button>
    </div>

  </div>

</div>
  );
}

export default Cart;