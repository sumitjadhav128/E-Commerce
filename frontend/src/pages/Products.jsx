import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");
const [sort, setSort] = useState("");
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

const fetchProducts = async () => {
  let url = `http://localhost:5000/api/products?`;

  if (search) url += `search=${search}&`;
  if (minPrice) url += `minPrice=${minPrice}&`;
  if (maxPrice) url += `maxPrice=${maxPrice}&`;
  if (sort) url += `sort=${sort}`;

  const res = await fetch(url);
  const data = await res.json();

  setProducts(data);
};

  return (
    <div>
      <div>
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

  <button onClick={fetchProducts}>Apply</button>
</div>

      <h1>Products</h1>

      {products.map(product => (
        <div key={product._id}>
          <img
  src={product.image?.url}
  alt={product.name}
  width="150"
/>
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