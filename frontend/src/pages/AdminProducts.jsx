import { useEffect, useState } from "react";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchProducts();
  };

  return (
    <div>
      <h1>Admin Product Panel</h1>

      {products.map(product => (
        <div key={product._id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>

          <button onClick={() => deleteProduct(product._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminProducts;