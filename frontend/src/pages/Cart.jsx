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
        </div>
      ))}
    </div>
  );
}

export default Cart;