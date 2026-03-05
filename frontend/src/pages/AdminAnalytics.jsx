import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
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
    fetch("http://localhost:5000/api/admin/advanced-analytics", {
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
    <div style={{ padding: "20px" }}>
      <h1>Admin Analytics Dashboard</h1>

      <h2>📈 Revenue Per Day</h2>
      <Line data={revenueDayData} />

      <h2>📊 Monthly Revenue</h2>
      <Bar data={monthlyRevenueData} />

      <h2>📦 Top Selling Products</h2>
      <Bar data={topProductsData} />

      <h2>👥 New Users This Month</h2>
      <h3>{data.newUsers}</h3>
    </div>
  );
}

export default AdminAnalytics;