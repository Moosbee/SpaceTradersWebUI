import { Flex } from "antd";
import MarketTransactionDisp from "../../features/disp/transactions/MarketTransactionDisp";
import PageTitle from "../../features/PageTitle";
import { useAppSelector } from "../../hooks";
import { selectMarketTransactions } from "../../spaceTraderAPI/redux/tansactionSlice";

function MarketTransaction() {
  const transaction = useAppSelector(selectMarketTransactions);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Market Transaction" />
      <h1>MarketTransaction</h1>
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {transaction.toReversed().map((transaction) => (
          <MarketTransactionDisp
            key={transaction.timestamp}
            transaction={transaction}
          />
        ))}
      </Flex>
    </div>
  );
}

export default MarketTransaction;
