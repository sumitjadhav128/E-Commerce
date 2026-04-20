import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // 🔥 Fetch Product
  useEffect(() => {
     const API_URL = "http://192.168.183.196:5000";

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/products/${id}`
        );
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

  // ⭐ Submit Review
  const submitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Login to submit review");
      navigate("/");
      return;
    }

    try {

       const API_URL = "http://192.168.183.196:5000";

      const res = await fetch(
        `${API_URL}/api/products/${id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ rating, comment })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Review submitted!");
      setComment("");

      // 🔁 Refresh product to show new review
      
      const updated = await fetch(
        `${API_URL}/api/products/${id}`
      );
      const updatedData = await updated.json();
      setProduct(updatedData);

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (!product) return <h2>Product not found</h2>;

  return (
   <div className="product-details">

  <div className="product-container">

    {/* 🖼 Image */}
    <div className="product-image">
      {product.image?.url && (
        <img src={product.image.url} alt={product.name} height={"250px"}/>
      )}
    </div>

    {/* 📦 Info */}
    <div className="product-info">
      <h1>{product.name}</h1>

      <p className="price">₹{product.price}</p>

      <p className="rating">
        {product.averageRating?.toFixed(1) || 0} ⭐
      </p>

      <p className="description">{product.description}</p>

      <button className="buy-btn">
        Add to Cart
      </button>
    </div>

  </div>

  {/* ⭐ Reviews */}
  <div className="reviews-section">
    <h2>Reviews</h2>

    {product.reviews?.length === 0 && (
      <p className="no-reviews">No reviews yet.</p>
    )}

    {product.reviews?.map((review) => (
      <div key={review._id} className="review-card">
        <strong>{review.name}</strong>
        <p>⭐ {review.rating}</p>
        <p>{review.comment}</p>
      </div>
    ))}
  </div>

  {/* ✍️ Add Review */}
  <div className="add-review">
    <h2>Add Review</h2>

    <form onSubmit={submitReview}>
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      >
        <option value="">Rating</option>
        <option value="1">1 ⭐</option>
        <option value="2">2 ⭐</option>
        <option value="3">3 ⭐</option>
        <option value="4">4 ⭐</option>
        <option value="5">5 ⭐</option>
      </select>

      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <button type="submit">Submit Review</button>
    </form>
  </div>

</div>
  );
}

export default ProductDetails;