function MoneyDisplay({
  amount,
  ...props
}: { amount: number } & React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props}>{Math.round(amount || 0).toLocaleString()}$</span>;
}

export default MoneyDisplay;
