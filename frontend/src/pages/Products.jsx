import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../css/Product.css";
import API_URL from "../utils/api";
import BottomNav from "./BottomNav";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProductNames, setAllProductNames] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // searchOverride — fixes stale state bug when clearing search
  const fetchProducts = async (pageNumber = 1, searchOverride = null) => {
    const searchValue = searchOverride !== null ? searchOverride : search;

    let url = `${API_URL}/api/products?page=${pageNumber}&limit=6`;
    if (searchValue) url += `&search=${searchValue}`;
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    if (sort) url += `&sort=${sort}`;

    const res = await fetch(url);
    const data = await res.json();

    setProducts(data.products);
    setTotalPages(data.totalPages);
    setCurrentPage(data.currentPage);
    setAllProductNames(data.products.map(p => p.name));
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }
    const res = await fetch(`${API_URL}/api/cart/add/${productId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    toast.success(data.message);
  };

  // Suggestions filtered from current product names
  const suggestions = search.trim()
    ? allProductNames.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSuggestionClick = (name) => {
    setSearch(name);
    setShowSuggestions(false);
    fetchProducts(1, name); // pass directly — no stale state
  };

  const handleSearchClear = () => {
    setSearch("");
    setShowSuggestions(false);
    fetchProducts(1, ""); // pass "" directly — no stale state
  };

  return (
    <div className="products-page">

      {/* Search Bar */}
      <div className="search-bar-wrapper" ref={searchRef}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
              if (e.target.value === "") fetchProducts(1, ""); // fix: pass "" directly
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {search && (
            <button className="search-clear" onClick={handleSearchClear}>✕</button>
          )}
        </div>

        {/* Real-time suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((name, i) => (
              <button
                key={i}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(name)}
              >
                🔍 {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compact Filter Row */}
      <div className="filters-row">
        <input
          type="number"
          className="filter-input"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="low">↑ Price</option>
          <option value="high">↓ Price</option>
        </select>
        <button className="filter-apply" onClick={() => fetchProducts(1)}>
          Apply
        </button>
      </div>

      {/* Title */}
      <h1 className="products-title">Products</h1>

      {/* Product Grid */}
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-img-wrap">
              <img
                src={product.image?.url}
                alt={product.name}
              />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="price">₹{product.price}</p>
            </div>
            <div className="product-actions">
              <button
                className="btn-cart"
                onClick={() => addToCart(product._id)}
              >
                Add to Cart
              </button>
              <button
                className="btn-view"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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

      <BottomNav />
    </div>
  );
}

export default Products;