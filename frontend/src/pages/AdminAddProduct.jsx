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
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const res = await fetch(`${API_URL}/api/products/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/products");
      } else {
        setError(data.message || "Error adding product");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aap-root">
      <div className="aap-container">

        {/* Header */}
        <div className="aap-header">
          <button className="aap-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div>
            <h1 className="aap-title">Add Product</h1>
            <p className="aap-subtitle">Fill in the details to list a new product</p>
          </div>
        </div>

        <div className="aap-layout">

          {/* Left — Image Upload */}
          <div className="aap-image-section">
            <label className="aap-section-label">Product Image</label>
            <div
              className={`aap-dropzone ${preview ? "aap-dropzone--filled" : ""}`}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => document.getElementById("aap-file-input").click()}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="aap-preview-img" />
                  <div className="aap-preview-overlay">
                    <span>Change Image</span>
                  </div>
                </>
              ) : (
                <div className="aap-dropzone-placeholder">
                  <span className="aap-upload-icon">↑</span>
                  <p className="aap-upload-text">Drag & drop or click to upload</p>
                  <p className="aap-upload-hint">PNG, JPG, WEBP — max 5MB</p>
                </div>
              )}
              <input
                id="aap-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="aap-file-hidden"
                required
              />
            </div>
          </div>

          {/* Right — Form Fields */}
          <form className="aap-form" onSubmit={handleSubmit}>

            {error && (
              <div className="aap-error-banner">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="aap-field">
              <label className="aap-label">Product Name</label>
              <input
                className="aap-input"
                type="text"
                placeholder="e.g. Nike Air Max 270"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="aap-row">
              <div className="aap-field">
                <label className="aap-label">Price (₹)</label>
                <div className="aap-input-prefix-wrap">
                  <span className="aap-prefix">₹</span>
                  <input
                    className="aap-input aap-input--prefixed"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="aap-field">
                <label className="aap-label">Stock</label>
                <input
                  className="aap-input"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="aap-field">
              <label className="aap-label">Description</label>
              <textarea
                className="aap-textarea"
                placeholder="Describe the product — material, features, sizing…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>

            <button
              type="submit"
              className="aap-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="aap-btn-loading">
                  <span className="aap-btn-spinner" /> Adding Product…
                </span>
              ) : (
                "Add Product"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminAddProduct;