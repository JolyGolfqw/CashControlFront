import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { AnalyticsPoint } from "../api/analytics";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

type Props = {
  data: AnalyticsPoint[];
};

export default function AnalyticsChart({ data }: Props) {
  const chartData: ChartData<"line"> = {
    labels: data.map((d) => d.date.slice(0, 10)),
    datasets: [
      {
        label: "Расходы",
        data: data.map((d) => d.total),
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 6 },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 700,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toLocaleString('ru-RU')} ₽`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString('ru-RU') + ' ₽';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: "260px", maxWidth: "100%" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
