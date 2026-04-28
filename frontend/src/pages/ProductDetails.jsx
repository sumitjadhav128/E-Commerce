// ProductDetails.jsx — REPLACE your entire existing ProductDetails.jsx with this
//
// CHANGES FROM PREVIOUS VERSION:
// 1. ADDED: sticky top bar with back button and title
// 2. ADDED: "Buy Now" button placeholder (no backend yet, shows toast)
// 3. ADDED: delivery info row
// 4. ADDED: brand name row above product name
// 5. CHANGED: layout to Myntra-style full-width sections separated by thick dividers
// 6. CHANGED: rating shown as green pill next to price
// 7. ALL existing logic (fetchProduct, addToCart, submitReview, refresh) untouched

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../utils/api";
import "../css/ProductDetails.css";
import BottomNav from "./BottomNav";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const token = localStorage.getItem("token");

  // ---- Existing fetch logic — untouched ----
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ---- addToCart — same pattern as Products.jsx ----
  const addToCart = async () => {
    if (!token) {
      toast.error("Please login first");
      navigate("/");
      return;
    }
    setAddingToCart(true);
    const res = await fetch(`${API_URL}/api/cart/add/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setAddingToCart(false);
    toast.success(data.message);
  };

  // ---- Existing submitReview — untouched ----
  const submitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Login to submit review");
      navigate("/");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      setSubmittingReview(false);

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Review submitted!");
      setComment("");
      setRating(5);

      // Existing: refresh product to show new review — untouched
      const updated = await fetch(`${API_URL}/api/products/${id}`);
      const updatedData = await updated.json();
      setProduct(updatedData);

    } catch (err) {
      console.error(err);
      setSubmittingReview(false);
    }
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="pd-page page-with-nav">
        <div className="pd-status"><p>Loading product...</p></div>
        <BottomNav />
      </div>
    );
  }

  // ---- Not found ----
  if (!product) {
    return (
      <div className="pd-page page-with-nav">
        <div className="pd-status"><p>Product not found.</p></div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pd-page page-with-nav">

      {/* ── Sticky Top Bar ── */}
      <div className="pd-topbar">
        <button className="pd-back" onClick={() => navigate(-1)}>←</button>
        <span className="pd-topbar-title">Product Details</span>
        <div style={{ width: 32 }} /> {/* spacer to center title */}
      </div>

      {/* ── Full Width Image ── */}
      <div className="pd-img-section">
        <div className="pd-img-wrap">
          {product.image?.url && (
            <img src={product.image.url} alt={product.name} />
          )}
        </div>
        {product.averageRating >= 4 && (
          <div className="pd-img-badge">⭐ Top Rated</div>
        )}
      </div>

      {/* ── Product Info ── */}
      <div className="pd-info">
        <p className="pd-brand">Kova</p>
        <h1 className="pd-name">{product.name}</h1>

        <div className="pd-price-row">
          <span className="pd-price">₹{product.price}</span>
          <span className="pd-rating-pill">
            ⭐ {product.averageRating?.toFixed(1) || "0.0"}
            <span className="pd-rcount"> · {product.reviews?.length || 0} reviews</span>
          </span>
        </div>

        <p className="pd-description">{product.description}</p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="pd-action-bar">
        <button
          className="pd-btn-cart"
          onClick={addToCart}
          disabled={addingToCart}
        >
          {addingToCart ? "Adding..." : "Add to Cart"}
        </button>
        <button
          className="pd-btn-buy"
          onClick={() => toast("Buy Now coming soon!")}
        >
          Buy Now
        </button>
      </div>

      {/* ── Delivery Info ── */}
      <div className="pd-delivery">
        <span className="pd-delivery-icon">🚚</span>
        <div className="pd-delivery-text">
          <strong>Free Delivery</strong>
          <span>Usually ships in 2–4 business days</span>
        </div>
      </div>

      {/* ── Reviews ── */}
      <div className="pd-section">
        <div className="pd-section-header">
          <h2 className="pd-section-title">Customer Reviews</h2>
          {product.reviews?.length > 0 && (
            <span className="pd-avg">
              {product.averageRating?.toFixed(1)} ⭐ · {product.reviews.length} reviews
            </span>
          )}
        </div>

        {(!product.reviews || product.reviews.length === 0) && (
          <p className="pd-no-reviews">No reviews yet. Be the first!</p>
        )}

        <div className="pd-reviews-list">
          {product.reviews?.map((review) => (
            <div key={review._id} className="pd-review-card">
              <div className="pd-review-top">
                <span className="pd-review-name">{review.name}</span>
                <span className="pd-review-stars">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="pd-review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Write Review ── */}
      <div className="pd-section">
        <h2 className="pd-section-title" style={{ marginBottom: "14px" }}>
          Write a Review
        </h2>

        <form onSubmit={submitReview} className="pd-review-form">

          <div className="pd-star-picker">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`pd-star ${star <= rating ? "active" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
            <span className="pd-star-label">{rating} / 5</span>
          </div>

          <textarea
            className="pd-textarea"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={3}
          />

          <button
            type="submit"
            className="pd-submit-btn"
            disabled={submittingReview}
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>

        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default ProductDetails;