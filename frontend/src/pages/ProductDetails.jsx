import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/products/${id}`
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
      const res = await fetch(
        `http://localhost:5000/api/products/${id}/review`,
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
        `http://localhost:5000/api/products/${id}`
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
    <div style={{ padding: "20px" }}>
      <h1>{product.name}</h1>

      {product.image?.url && (
        <img
          src={product.image.url}
          alt={product.name}
          width="300"
        />
      )}

      <h3>Price: ₹{product.price}</h3>
      <p>{product.description}</p>

      <h3>
        Rating: {product.averageRating?.toFixed(1) || 0} ⭐
      </h3>

      <hr />

      <h2>Reviews</h2>

      {product.reviews?.length === 0 && <p>No reviews yet.</p>}

      {product.reviews?.map((review) => (
        <div
          key={review._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <strong>{review.name}</strong>
          <p>Rating: {review.rating} ⭐</p>
          <p>{review.comment}</p>
        </div>
      ))}

      <hr />

      <h2>Add Review</h2>

      <form onSubmit={submitReview}>
        <label>Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <br /><br />

        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ProductDetails;