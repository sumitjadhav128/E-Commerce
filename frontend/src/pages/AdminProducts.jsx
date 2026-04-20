import { useEffect, useState } from "react";
import API_URL from "../utils/api";
import "../css/AdminProducts.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
     console.log(data);
    setProducts(data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchProducts();
  };

  return (
   <div className="admin-products">

  <h1 className="admin-title">Admin Product Panel</h1>

  <div className="admin-grid">
    {products.map(product => (
      <div key={product._id} className="admin-card">

        <div className="admin-info">
          <h3>{product.name}</h3>
          <p className="price">₹{product.price}</p>
          <p className="stock">
            Stock: {product.stock}
          </p>
        </div>

        <button
          className="delete-btn"
          onClick={() => deleteProduct(product._id)}
        >
          Delete
        </button>

      </div>
    ))}
  </div>

</div>
  );
}

export default AdminProducts;