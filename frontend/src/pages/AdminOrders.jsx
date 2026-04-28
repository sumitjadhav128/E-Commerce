import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API_URL from "../utils/api";
import "../css/AdminOrders.css";

const STATUS_OPTIONS = ["Pending", "Paid", "Shipped", "Delivered"];

const STATUS_META = {
  Pending:   { color: "amber",  icon: "◷" },
  Paid:      { color: "blue",   icon: "✓" },
  Shipped:   { color: "purple", icon: "➤" },
  Delivered: { color: "green",  icon: "⬤" },
};

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

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { color: "gray", icon: "•" };
  return (
    <span className={`ao-badge ao-badge--${meta.color}`}>
      <span className="ao-badge-icon">{meta.icon}</span>
      {status}
    </span>
  );
}

function OrderCard({ order, isAdmin, onStatusChange }) {
  const [attempted, setAttempted] = useState(false);

  const handleChange = (e) => {
    if (!isAdmin) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    onStatusChange(order._id, e.target.value);
  };

  const handleFocus = () => {
    if (!isAdmin) setAttempted(true);
  };

  const items = order.items || [];

  return (
    <div className="ao-card">
      {/* Card Header */}
      <div className="ao-card-header">
        <div className="ao-user-info">
          <div className="ao-avatar">
            {(order.user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="ao-user-name">{order.user?.name || "Unknown User"}</p>
            <p className="ao-user-email">{order.user?.email || "—"}</p>
          </div>
        </div>
        <div className="ao-header-right">
          <StatusBadge status={order.status} />
          <p className="ao-order-date">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Order Items */}
      {items.length > 0 && (
        <div className="ao-items">
          {items.map((item, i) => (
            <div key={i} className="ao-item-row">
              <span className="ao-item-name">
                {item.product?.name || item.name || "Product"}
              </span>
              <span className="ao-item-qty">× {item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Card Footer */}
      <div className="ao-card-footer">
        <div className="ao-amount-block">
          <span className="ao-amount-label">Total</span>
          <span className="ao-amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
        </div>

        <div className="ao-status-control">
          <label className="ao-select-label">Update Status</label>
          <div className={`ao-select-wrap ${!isAdmin ? "ao-select-wrap--locked" : ""}`}>
            <select
              value={order.status}
              onChange={handleChange}
              onFocus={handleFocus}
              className="ao-select"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {!isAdmin && <span className="ao-lock-icon">🔒</span>}
          </div>

          {attempted && !isAdmin && (
            <p className="ao-access-msg">
              <span className="ao-access-icon">⚠</span>
              Only admins can change order status. Please contact the admin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const token = localStorage.getItem("token");
  const isAdmin = getRole() === "admin";

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/order/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_URL}/api/order/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      await fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter + search
  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o._id?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="ao-root">

      {/* Page Header */}
      <div className="ao-page-header">
        <div>
          <h1 className="ao-page-title">Orders</h1>
          <p className="ao-page-sub">
            {orders.length} total orders
            {!isAdmin && (
              <span className="ao-viewer-tag"> · View only</span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="ao-summary-row">
        {["All", ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            className={`ao-pill ${filterStatus === s ? "ao-pill--active" : ""}`}
            onClick={() => setFilterStatus(s)}
          >
            {s}
            <span className="ao-pill-count">
              {s === "All" ? orders.length : counts[s] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ao-search-row">
        <div className="ao-search-wrap">
          <span className="ao-search-icon">⌕</span>
          <input
            className="ao-search"
            type="text"
            placeholder="Search by name, email or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ao-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <p className="ao-result-count">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="ao-loading">
          <div className="ao-spinner" />
          <p>Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ao-empty">
          <span className="ao-empty-icon">◈</span>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="ao-list">
          {filtered.map(order => (
            <div key={order._id} className={updatingId === order._id ? "ao-updating" : ""}>
              <OrderCard
                order={order}
                isAdmin={isAdmin}
                onStatusChange={updateStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;