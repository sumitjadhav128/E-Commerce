import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import API_URL from "../utils/api";
import "../css/AdminAnalytics.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/admin/advanced-analytics`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <h2>Loading analytics...</h2>;

  // 📈 Revenue Per Day Chart
  const revenueDayData = {
    labels: data.revenuePerDay.map(d => d._id),
    datasets: [
      {
        label: "Revenue Per Day",
        data: data.revenuePerDay.map(d => d.revenue),
        borderColor: "blue",
        backgroundColor: "lightblue"
      }
    ]
  };

  // 📊 Monthly Revenue Chart
  const monthlyRevenueData = {
    labels: data.monthlyRevenue.map(d => `Month ${d._id}`),
    datasets: [
      {
        label: "Monthly Revenue",
        data: data.monthlyRevenue.map(d => d.revenue),
        backgroundColor: "green"
      }
    ]
  };

  // 📦 Top Selling Products
  const topProductsData = {
    labels: data.topProducts.map(p => p.name),
    datasets: [
      {
        label: "Top Selling Products",
        data: data.topProducts.map(p => p.totalSold),
        backgroundColor: "orange"
      }
    ]
  };

  return (
    <div className="analytics-page">

  <h1 className="analytics-title">Analytics Dashboard</h1>

  {/* 👥 Top Stats */}
  <div className="analytics-stats">
    <div className="stat-box">
      <h4>New Users</h4>
      <p>{data.newUsers}</p>
    </div>
  </div>

  {/* 📈 Charts */}
  <div className="charts-grid">

    <div className="chart-card">
      <h3>Revenue Per Day</h3>
      <Line data={revenueDayData} />
    </div>

    <div className="chart-card">
      <h3>Monthly Revenue</h3>
      <Bar data={monthlyRevenueData} />
    </div>

    <div className="chart-card">
      <h3>Top Selling Products</h3>
      <Bar data={topProductsData} />
    </div>

  </div>

</div>
  );
}

export default AdminAnalytics;