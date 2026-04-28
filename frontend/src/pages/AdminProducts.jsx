import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import API_URL from "../utils/api";
import "../css/AdminProducts.css";

const LIMIT = 8;

function getRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch {
    return null;
  }
}

function ConfirmModal({ product, onConfirm, onCancel }) {
  return (
    <div className="ap-modal-overlay" onClick={onCancel}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-icon">⚠</div>
        <h3 className="ap-modal-title">Delete Product?</h3>
        <p className="ap-modal-body">
          <strong>{product.name}</strong> will be permanently removed.
          This action cannot be undone.
        </p>
        <div className="ap-modal-actions">
          <button className="ap-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="ap-modal-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 1;
  const left  = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (i === left - 1 || i === right + 1) {
      pages.push("...");
    }
  }

  // deduplicate consecutive "..."
  const deduped = pages.filter((p, i) => !(p === "..." && pages[i - 1] === "..."));

  return (
    <div className="ap-pagination">
      <button
        className="ap-page-btn ap-page-btn--nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {deduped.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="ap-page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`ap-page-btn ${currentPage === p ? "ap-page-btn--active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="ap-page-btn ap-page-btn--nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort]             = useState("");
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [accessMsg, setAccessMsg]   = useState(false);

  const token   = localStorage.getItem("token");
  const isAdmin = getRole() === "admin";

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(search && { search }),
        ...(sort   && { sort })
      });

      const res  = await fetch(`${API_URL}/api/products?${params}`);
      const data = await res.json();

      setProducts(data.products || []);
      setTotal(data.total || 0);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleDeleteClick = (product) => {
    if (!isAdmin) {
      setAccessMsg(true);
      setTimeout(() => setAccessMsg(false), 3000);
      return;
    }
    setConfirmProduct(product);
  };

  const confirmDelete = async () => {
    if (!confirmProduct) return;
    const id = confirmProduct._id;
    setConfirmProduct(null);
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProducts(currentPage);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ap-root">

      {/* Confirm Modal */}
      {confirmProduct && (
        <ConfirmModal
          product={confirmProduct}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmProduct(null)}
        />
      )}

      {/* Page Header */}
      <div className="ap-page-header">
        <div>
          <h1 className="ap-page-title">Products</h1>
          <p className="ap-page-sub">
            {total} total products
            {!isAdmin && <span className="ap-viewer-tag"> · View only</span>}
          </p>
        </div>
      </div>

      {/* Non-admin access message */}
      {accessMsg && (
        <div className="ap-access-banner">
          <span>⚠</span>
          Only admins can delete products. Please contact the admin.
        </div>
      )}

      {/* Toolbar */}
      <div className="ap-toolbar">
        <form className="ap-search-wrap" onSubmit={handleSearchSubmit}>
          <span className="ap-search-icon">⌕</span>
          <input
            className="ap-search"
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="ap-search-clear"
              onClick={() => { setSearchInput(""); setSearch(""); }}
            >✕</button>
          )}
          <button type="submit" className="ap-search-btn">Search</button>
        </form>

        <select
          className="ap-sort-select"
          value={sort}
          onChange={e => { setSort(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Default</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="ap-loading">
          <div className="ap-spinner" />
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="ap-empty">
          <span className="ap-empty-icon">◈</span>
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="ap-grid">
            {products.map(product => (
              <div
                key={product._id}
                className={`ap-card ${deletingId === product._id ? "ap-card--deleting" : ""}`}
              >
                {/* Product Image */}
                {product.image && (
                  <div className="ap-card-img-wrap">
                    <img
                      src={product.image.url}
                      alt={product.name}
                      className="ap-card-img"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="ap-card-body">
                  <h3 className="ap-product-name">{product.name}</h3>

                  <div className="ap-product-meta">
                    <span className="ap-product-price">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </span>
                    <span className={`ap-stock-badge ${product.stock === 0 ? "ap-stock-badge--out" : product.stock < 5 ? "ap-stock-badge--low" : "ap-stock-badge--ok"}`}>
                      {product.stock === 0
                        ? "Out of stock"
                        : product.stock < 5
                        ? `Low · ${product.stock} left`
                        : `${product.stock} in stock`}
                    </span>
                  </div>

                  {product.category && (
                    <span className="ap-category-tag">{product.category}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="ap-card-footer">
                  <button
                    className="ap-delete-btn"
                    onClick={() => handleDeleteClick(product)}
                    disabled={deletingId === product._id}
                  >
                    {deletingId === product._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="ap-pagination-wrap">
            <p className="ap-pagination-info">
              Page {currentPage} of {totalPages} · {total} products
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProducts;