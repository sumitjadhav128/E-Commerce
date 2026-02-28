import { useParams, useNavigate } from "react-router-dom";

function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handlePayment = async (success) => {
    const res = await fetch(
      `http://localhost:5000/api/order/pay/${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ success })
      }
    );

    const data = await res.json();
    alert(data.message);

    navigate("/orders");
  };

  return (
    <div>
      <h1>Payment Page</h1>

      <button onClick={() => handlePayment(true)}>
        Pay Successfully
      </button>

      <button onClick={() => handlePayment(false)}>
        Fail Payment
      </button>
    </div>
  );
}

export default Payment;