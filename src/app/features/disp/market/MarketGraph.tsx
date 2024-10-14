import { ResponsiveLine } from "@nivo/line";
import { Card } from "antd";
import { useMemo } from "react";
import type { TradeSymbol } from "../../../spaceTraderAPI/api";
import {
  type MarketTradeGood,
  type MarketTransaction,
} from "../../../spaceTraderAPI/api";

function MarketGraph({
  tradeGoods,
  transactions,
  type,
}: {
  tradeGoods: Array<{
    timestamp: number;
    tradeGoods: Array<MarketTradeGood>;
  }>;
  transactions: Array<MarketTransaction>;
  type: "purchase" | "sell";
}) {
  const data = useMemo(() => {
    const data: Partial<
      Record<
        TradeSymbol,
        {
          id: TradeSymbol;
          data: Array<{ x: Date; y: number }>;
        }
      >
    > = {};

    const tradeGoodsNames: Set<TradeSymbol> = new Set();

    for (const { timestamp, tradeGoods: timeTradeGoods } of tradeGoods) {
      for (const { symbol, purchasePrice, sellPrice } of timeTradeGoods) {
        // if (symbol === "DRUGS") continue;

        if (!data[symbol]) {
          data[symbol] = {
            id: symbol,
            data: [],
          };
        }
        data[symbol]!.data.push({
          x: new Date(timestamp),
          y: type === "purchase" ? purchasePrice : sellPrice,
        });
        tradeGoodsNames.add(symbol);
      }
    }

    return Object.values(data);
    // return [data, tradeGoodsNames];
  }, [tradeGoods, type]);

  // const dark = useAppSelector(selectDarkMode);

  return (
    <Card>
      <div style={{ height: 600, width: "90%  " }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "time" }}
          yScale={{
            type: "linear",
            max: "auto",
            min: "auto",
          }}
          enableTouchCrosshair={true}
          useMesh={true}
          tooltip={({ point }) => <span>{+point.data.y}</span>}
          axisBottom={{
            format: (x) => {
              const date = new Date(x);
              return `${date.toLocaleDateString()} ${date
                .getHours()
                .toString()
                .padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;
            },
          }}
          theme={{
            tooltip: {
              container: {
                background: "black",
                color: "white",
              },
            },
          }}
        ></ResponsiveLine>
      </div>
    </Card>
  );
}

export default MarketGraph;
