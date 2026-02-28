import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/cart", {
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
    `http://localhost:5000/api/cart/update/${productId}`,
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
    `http://localhost:5000/api/cart/remove/${productId}`,
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

  const res = await fetch("http://localhost:5000/api/order/checkout", {
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
    <div>
      <h1>Your Cart</h1>

      {cart.items && cart.items.length === 0 && (
        <p>Your cart is empty</p>
      )}

      {cart.items?.map(item => (
        <div key={item.product._id}>
          <h3>{item.product.name}</h3>
          <p>Price: ${item.product.price}</p>
          <p>Quantity: {item.quantity}</p>
          <button onClick={() => updateQuantity(item.product._id, "increase")}>
  +
</button>

<button onClick={() => updateQuantity(item.product._id, "decrease")}>
  -
</button>

<button onClick={() => removeItem(item.product._id)}>
  Remove
</button>
          <h2>Total: ${total}</h2>
          <button onClick={checkout}>Checkout</button>
        </div>
      ))}
    </div>
  );
}

export default Cart;