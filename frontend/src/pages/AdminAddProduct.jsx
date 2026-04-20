import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import "../css/AdminAddProduct.css";

function AdminAddProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submitting form...");

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("image", image);

    const res = await fetch(`${API_URL}/api/products/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      alert("Product added successfully");
      navigate("/products");
      
    } else {
      alert(data.message || "Error adding product");
    }
  };

  return (
   <div className="add-product-page">

  <div className="add-product-card">

    <h1>Add Product</h1>

    <form onSubmit={handleSubmit} className="product-form">

      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        accept="image/*"
        className="file-input"
        required
      />

      <button type="submit">
        Add Product
      </button>

    </form>

  </div>

</div>
  );
}

export default AdminAddProduct;