import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SalesChart({ products }) {

  const data = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: "Stock Quantity",
        data: products.map(p => p.stockQuantity),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF"
        ]
      }
    ]
  };

  return (
    <div style={{ width: "300px", marginBottom: "20px" }}>
      <Pie data={data} />
    </div>
  );
}