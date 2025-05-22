import PageTitle from "../../features/PageTitle";
import MarketTransactionTable from "../../features/tansactionTable/MarketTransactionTable";
import { useAppSelector } from "../../hooks";
import { selectMarketTransactions } from "../../spaceTraderAPI/redux/tansactionSlice";

function MarketTransaction() {
  const transaction = useAppSelector(selectMarketTransactions);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Market Transaction" />
      <h1>MarketTransaction {transaction.length}</h1>
      <MarketTransactionTable transactions={transaction} />
    </div>
  );
}

export default MarketTransaction;
