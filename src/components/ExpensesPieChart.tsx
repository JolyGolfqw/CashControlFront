import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { type CategoryStat } from "../api/statistics";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  data: CategoryStat[];
};

export default function ExpensesPieChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="panel__empty">Нет данных для отображения</p>;
  }

  const chartData = {
    labels: data.map((c) => c.category_name),
    datasets: [
      {
        data: data.map((c) => c.total_amount),
        backgroundColor: data.map((c) => c.category_color || "#94a3b8"),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    layout: { padding: 4 },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 12,
          font: {
            size: 12,
          },
          color: "#475569",
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 700,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString('ru-RU')} ₽ (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: "220px", maxWidth: "100%", margin: "0.5rem 0" }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}
