export default function BudgetWarning({
  percentage,
}: {
  percentage: number;
}) {
  if (percentage < 80) return null;

  const tone = percentage > 100 ? "danger" : "warning";
  const label =
    percentage > 100
      ? "Бюджет превышен"
      : "Вы близки к лимиту бюджета";

  return (
    <div className={`budget-warning budget-warning--${tone}`}>
      ⚠️ {label}
    </div>
  );
}
