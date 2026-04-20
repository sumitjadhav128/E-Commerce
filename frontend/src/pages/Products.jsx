import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Product.css";
import API_URL from "../utils/api";
import Dashboard from "./Dashboard";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");
const [sort, setSort] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

// Replace the entire useEffect
  useEffect(() => {
  fetchProducts(1);
}, []);

// product fetching
    // const API_URL = "http://192.168.183.196:5000"; 
  const fetchProducts = async (pageNumber = 1) => {
  let url = `${API_URL}/api/products?page=${pageNumber}&limit=6`;

  if (search) url += `&search=${search}`;
  if (minPrice) url += `&minPrice=${minPrice}`;
  if (maxPrice) url += `&maxPrice=${maxPrice}`;
  if (sort) url += `&sort=${sort}`;

  const res = await fetch(url);
  const data = await res.json();

  setProducts(data.products);
  setTotalPages(data.totalPages);
  setCurrentPage(data.currentPage);
};

  // Add "Add To Cart" Button in Products Page
  const addToCart = async (productId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }
 
    // const API_URL = "http://192.168.183.196:5000"; 
    
  const res = await fetch(
    `${API_URL}/api/cart/add/${productId}`,
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
    <div className="products-page">

  {/* 🔍 Filters */}
  <div className="filters-container">
    <h3 className="filter-title">Filter Products</h3>

    <div className="filters">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <input
        type="number"
        placeholder="Min Price"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />

      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />

      <select onChange={(e) => setSort(e.target.value)}>
        <option value="">Sort</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
      </select>

      <button onClick={() => fetchProducts(1)}>Apply</button>
    </div>
  </div>

  {/* Title */}
  <h1 className="products-title">Products</h1>

  {/* 🛍 Grid */}
  <div className="products-grid">
    {products.map(product => (
      <div key={product._id} className="product-card">

        <img
          src={product.image?.url}
          alt={product.name} height={"70px"}
        />

        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>

        <div className="product-actions">
          <button onClick={() => addToCart(product._id)}>
            Add to Cart
          </button>

          <button onClick={() => navigate(`/product/${product._id}`)}>
            View
          </button>
        </div>

      </div>
    ))}
  </div>

  {/* 📄 Pagination */}
  <div className="pagination">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => fetchProducts(i + 1)}
        className={currentPage === i + 1 ? "active" : ""}
      >
        {i + 1}
      </button>
    ))}
  </div>

 {/*dashboard */}
 <Dashboard></Dashboard>
</div>
  );
}

export default Products;