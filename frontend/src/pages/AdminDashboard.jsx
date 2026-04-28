import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Line,
  Bar,
  Doughnut
} from "react-chartjs-2";
import API_URL from "../utils/api";
import "../css/AdminDashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: "#1a1a2e",
      titleColor: "#fff",
      bodyColor: "#ccc",
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#8a8a9a", font: { size: 11 } },
      border: { display: false }
    },
    y: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: "#8a8a9a", font: { size: 11 } },
      border: { display: false }
    }
  }
};

function StatCard({ label, value, icon, accent, sub }) {
  return (
    <div className={`ad-stat-card ad-stat-card--${accent}`}>
      <div className="ad-stat-icon">{icon}</div>
      <div className="ad-stat-body">
        <span className="ad-stat-label">{label}</span>
        <span className="ad-stat-value">{value}</span>
        {sub && <span className="ad-stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="ad-section-header">
      <h2 className="ad-section-title">{title}</h2>
      {subtitle && <span className="ad-section-sub">{subtitle}</span>}
    </div>
  );
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // Fetch /api/admin/analytics
    fetch(`${API_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 403) {
          alert("Admin access only");
          navigate("/");
        }
        return res.json();
      })
      .then(data => setSummary(data))
      .catch(err => console.error(err));

    // Fetch /api/admin/advanced-analytics
    fetch(`${API_URL}/api/admin/advanced-analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error(err));
  }, []);

  const isLoading = !summary || !analytics;

  // ---- Chart Data ----

  const revenueDayChartData = analytics && {
    labels: analytics.revenuePerDay.map(d => d._id),
    datasets: [
      {
        label: "Revenue",
        data: analytics.revenuePerDay.map(d => d.revenue),
        borderColor: "#ff6b2b",
        backgroundColor: "rgba(255,107,43,0.08)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#ff6b2b",
        fill: true,
        tension: 0.4
      }
    ]
  };

  const monthlyRevenueChartData = analytics && {
    labels: analytics.monthlyRevenue.map(d => MONTH_NAMES[d._id] || `M${d._id}`),
    datasets: [
      {
        label: "Revenue",
        data: analytics.monthlyRevenue.map(d => d.revenue),
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, "#ff6b2b");
          gradient.addColorStop(1, "rgba(255,107,43,0.3)");
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const topProductsChartData = analytics && {
    labels: analytics.topProducts.map(p => p.name),
    datasets: [
      {
        label: "Units Sold",
        data: analytics.topProducts.map(p => p.totalSold),
        backgroundColor: [
          "#ff6b2b", "#ff9f69", "#ffbe9d",
          "#ffd4ba", "#ffe8d6"
        ],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const orderStatusDonutData = summary && {
    labels: ["Paid / Fulfilled", "Pending"],
    datasets: [
      {
        data: [summary.paidOrders, summary.pendingOrders],
        backgroundColor: ["#ff6b2b", "#e8e8ef"],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: "▦" },
    { id: "revenue", label: "Revenue", icon: "₹" },
    { id: "products", label: "Products", icon: "◈" },
    { id: "users", label: "Users", icon: "◉" }
  ];

  return (
    <div className="ad-root">

      {/* ===== Sidebar ===== */}
      <aside className={`ad-sidebar ${sidebarOpen ? "ad-sidebar--open" : ""}`}>
        <div className="ad-sidebar-brand">
          <span className="ad-brand-logo">⬡</span>
          <span className="ad-brand-name">AdminPanel</span>
        </div>

        <nav className="ad-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeTab === item.id ? "ad-nav-item--active" : ""}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              <span className="ad-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-admin-badge">
            <div className="ad-admin-avatar">A</div>
            <div>
              <p className="ad-admin-name">Admin</p>
              <p className="ad-admin-role">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== Main Content ===== */}
      <main className="ad-main">

        {/* Topbar */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
              <span></span><span></span><span></span>
            </button>
            <div className="ad-breadcrumb">
              <span className="ad-breadcrumb-root">Admin</span>
              <span className="ad-breadcrumb-sep">›</span>
              <span className="ad-breadcrumb-current">
                {navItems.find(n => n.id === activeTab)?.label}
              </span>
            </div>
          </div>
          <div className="ad-topbar-right">
            <span className="ad-topbar-date">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="ad-content">

          {isLoading ? (
            <div className="ad-loading">
              <div className="ad-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* ===== OVERVIEW TAB ===== */}
              {activeTab === "overview" && (
                <>
                  <SectionHeader
                    title="Dashboard Overview"
                    subtitle="All key metrics at a glance"
                  />

                  {/* Stat Cards */}
                  <div className="ad-stats-grid">
                    <StatCard
                      label="Total Revenue"
                      value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
                      icon="₹"
                      accent="orange"
                      sub="from paid orders"
                    />
                    <StatCard
                      label="Total Orders"
                      value={summary.totalOrders.toLocaleString()}
                      icon="◈"
                      accent="blue"
                      sub={`${summary.paidOrders} paid · ${summary.pendingOrders} pending`}
                    />
                    <StatCard
                      label="Total Users"
                      value={summary.totalUsers.toLocaleString()}
                      icon="◉"
                      accent="green"
                      sub={`${analytics.newUsers} new this month`}
                    />
                    <StatCard
                      label="Total Products"
                      value={summary.totalProducts.toLocaleString()}
                      icon="▦"
                      accent="purple"
                    />
                  </div>

                  {/* Charts Row 1 */}
                  <div className="ad-charts-row">
                    <div className="ad-chart-card ad-chart-card--wide">
                      <div className="ad-chart-head">
                        <h3 className="ad-chart-title">Daily Revenue</h3>
                        <span className="ad-chart-badge">Line</span>
                      </div>
                      <div className="ad-chart-body">
                        <Line data={revenueDayChartData} options={chartDefaults} />
                      </div>
                    </div>

                    <div className="ad-chart-card">
                      <div className="ad-chart-head">
                        <h3 className="ad-chart-title">Order Status</h3>
                        <span className="ad-chart-badge">Donut</span>
                      </div>
                      <div className="ad-chart-body ad-chart-body--donut">
                        <Doughnut
                          data={orderStatusDonutData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: "72%",
                            plugins: {
                              legend: {
                                display: true,
                                position: "bottom",
                                labels: {
                                  color: "#8a8a9a",
                                  font: { size: 12 },
                                  padding: 16,
                                  usePointStyle: true
                                }
                              },
                              tooltip: {
                                backgroundColor: "#1a1a2e",
                                titleColor: "#fff",
                                bodyColor: "#ccc",
                                padding: 12,
                                cornerRadius: 8
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Products Table */}
                  <div className="ad-table-card">
                    <div className="ad-chart-head">
                      <h3 className="ad-chart-title">Top Selling Products</h3>
                      <span className="ad-chart-badge">Top 5</span>
                    </div>
                    <div className="ad-table-wrapper">
                      <table className="ad-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Units Sold</th>
                            <th>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.topProducts.map((p, i) => {
                            const total = analytics.topProducts.reduce((a, b) => a + b.totalSold, 0);
                            const pct = total > 0 ? ((p.totalSold / total) * 100).toFixed(1) : 0;
                            return (
                              <tr key={i}>
                                <td className="ad-table-rank">{i + 1}</td>
                                <td className="ad-table-name">{p.name}</td>
                                <td className="ad-table-units">{p.totalSold}</td>
                                <td>
                                  <div className="ad-progress-wrap">
                                    <div className="ad-progress-bar">
                                      <div
                                        className="ad-progress-fill"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className="ad-progress-pct">{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ===== REVENUE TAB ===== */}
              {activeTab === "revenue" && (
                <>
                  <SectionHeader
                    title="Revenue Analytics"
                    subtitle="Daily and monthly revenue breakdown"
                  />

                  <div className="ad-stats-grid ad-stats-grid--2">
                    <StatCard
                      label="Total Revenue"
                      value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
                      icon="₹"
                      accent="orange"
                      sub="all paid orders"
                    />
                    <StatCard
                      label="Paid Orders"
                      value={summary.paidOrders}
                      icon="✓"
                      accent="green"
                      sub="fulfilled"
                    />
                  </div>

                  <div className="ad-chart-card ad-chart-card--full">
                    <div className="ad-chart-head">
                      <h3 className="ad-chart-title">Revenue Per Day</h3>
                      <span className="ad-chart-badge">Line</span>
                    </div>
                    <div className="ad-chart-body ad-chart-body--tall">
                      <Line data={revenueDayChartData} options={chartDefaults} />
                    </div>
                  </div>

                  <div className="ad-chart-card ad-chart-card--full">
                    <div className="ad-chart-head">
                      <h3 className="ad-chart-title">Monthly Revenue</h3>
                      <span className="ad-chart-badge">Bar</span>
                    </div>
                    <div className="ad-chart-body ad-chart-body--tall">
                      <Bar data={monthlyRevenueChartData} options={chartDefaults} />
                    </div>
                  </div>
                </>
              )}

              {/* ===== PRODUCTS TAB ===== */}
              {activeTab === "products" && (
                <>
                  <SectionHeader
                    title="Product Analytics"
                    subtitle="Top selling products by units"
                  />

                  <div className="ad-stats-grid ad-stats-grid--2">
                    <StatCard
                      label="Total Products"
                      value={summary.totalProducts}
                      icon="▦"
                      accent="purple"
                    />
                    <StatCard
                      label="Top Product"
                      value={analytics.topProducts[0]?.name || "—"}
                      icon="★"
                      accent="orange"
                      sub={`${analytics.topProducts[0]?.totalSold || 0} units sold`}
                    />
                  </div>

                  <div className="ad-chart-card ad-chart-card--full">
                    <div className="ad-chart-head">
                      <h3 className="ad-chart-title">Top 5 Products by Units Sold</h3>
                      <span className="ad-chart-badge">Bar</span>
                    </div>
                    <div className="ad-chart-body ad-chart-body--tall">
                      <Bar
                        data={topProductsChartData}
                        options={{
                          ...chartDefaults,
                          indexAxis: "y",
                          scales: {
                            x: {
                              grid: { color: "rgba(0,0,0,0.05)" },
                              ticks: { color: "#8a8a9a", font: { size: 11 } },
                              border: { display: false }
                            },
                            y: {
                              grid: { display: false },
                              ticks: { color: "#3a3a4a", font: { size: 12, weight: "500" } },
                              border: { display: false }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="ad-table-card">
                    <div className="ad-chart-head">
                      <h3 className="ad-chart-title">Product Breakdown</h3>
                    </div>
                    <div className="ad-table-wrapper">
                      <table className="ad-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Product Name</th>
                            <th>Units Sold</th>
                            <th>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.topProducts.map((p, i) => {
                            const total = analytics.topProducts.reduce((a, b) => a + b.totalSold, 0);
                            const pct = total > 0 ? ((p.totalSold / total) * 100).toFixed(1) : 0;
                            return (
                              <tr key={i}>
                                <td className="ad-table-rank">{i + 1}</td>
                                <td className="ad-table-name">{p.name}</td>
                                <td className="ad-table-units">{p.totalSold}</td>
                                <td>
                                  <div className="ad-progress-wrap">
                                    <div className="ad-progress-bar">
                                      <div className="ad-progress-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="ad-progress-pct">{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ===== USERS TAB ===== */}
              {activeTab === "users" && (
                <>
                  <SectionHeader
                    title="User Analytics"
                    subtitle="User growth and activity"
                  />

                  <div className="ad-stats-grid ad-stats-grid--2">
                    <StatCard
                      label="Total Users"
                      value={summary.totalUsers.toLocaleString()}
                      icon="◉"
                      accent="blue"
                    />
                    <StatCard
                      label="New This Month"
                      value={analytics.newUsers.toLocaleString()}
                      icon="+"
                      accent="green"
                      sub="registered users"
                    />
                  </div>

                  <div className="ad-chart-card ad-chart-card--full">
                    <div className="ad-chart-head">
                      <h3 className="ad-chart-title">Order Status Distribution</h3>
                      <span className="ad-chart-badge">Donut</span>
                    </div>
                    <div className="ad-chart-body" style={{ height: "300px" }}>
                      <Doughnut
                        data={orderStatusDonutData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: "68%",
                          plugins: {
                            legend: {
                              display: true,
                              position: "bottom",
                              labels: {
                                color: "#8a8a9a",
                                font: { size: 13 },
                                padding: 20,
                                usePointStyle: true
                              }
                            },
                            tooltip: {
                              backgroundColor: "#1a1a2e",
                              titleColor: "#fff",
                              bodyColor: "#ccc",
                              padding: 12,
                              cornerRadius: 8
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="ad-info-card">
                    <div className="ad-info-row">
                      <span className="ad-info-label">Total Orders</span>
                      <span className="ad-info-value">{summary.totalOrders}</span>
                    </div>
                    <div className="ad-info-row">
                      <span className="ad-info-label">Paid / Fulfilled</span>
                      <span className="ad-info-value ad-info-value--green">{summary.paidOrders}</span>
                    </div>
                    <div className="ad-info-row">
                      <span className="ad-info-label">Pending</span>
                      <span className="ad-info-value ad-info-value--orange">{summary.pendingOrders}</span>
                    </div>
                    <div className="ad-info-row">
                      <span className="ad-info-label">New Users This Month</span>
                      <span className="ad-info-value ad-info-value--blue">{analytics.newUsers}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;