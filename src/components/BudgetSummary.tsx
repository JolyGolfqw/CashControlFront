type Props = {
  spent: number;
  remaining: number;
  percentage: number;
};

export default function BudgetSummary({
  spent,
  remaining,
  percentage,
}: Props) {
  const normalized = Math.min(Math.max(percentage, 0), 100);
  const safePercentage = Math.min(Math.max(percentage, 0), 150);
  const barColor =
    percentage > 100 
      ? "linear-gradient(135deg, #ef4444, #fca5a5)" 
      : percentage > 80 
      ? "linear-gradient(135deg, #f59e0b, #fbbf24)" 
      : "linear-gradient(135deg, #2563eb, #60a5fa)";

  return (
    <div className="budget-summary">
      <div className="budget-summary__row">
        <span>Потрачено</span>
        <strong>
          {spent.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽
        </strong>
      </div>
      <div className="budget-summary__row">
        <span>Осталось</span>
        <strong>
          {remaining.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽
        </strong>
      </div>
      <div className="budget-summary__bar">
        <div
          className="budget-summary__bar-fill"
          style={{
            width: `${normalized}%`,
            background: barColor,
          }}
        />
      </div>
      <p className="budget-summary__percentage">
        {safePercentage.toFixed(0)}% лимита
      </p>
    </div>
  );
}
