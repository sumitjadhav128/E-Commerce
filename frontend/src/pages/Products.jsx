import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // Add "Add To Cart" Button in Products Page
  const addToCart = async (productId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  const res = await fetch(
    `http://localhost:5000/api/cart/add/${productId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  alert(data.message);
};

  return (
    <div>
      <h1>Products</h1>

      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => addToCart(product._id)}>
      Add To Cart
    </button>
    <button onClick={() => navigate("/cart")}>
  Go To Cart
</button>
        </div>
      ))}
    </div>
  );
}

export default Products;