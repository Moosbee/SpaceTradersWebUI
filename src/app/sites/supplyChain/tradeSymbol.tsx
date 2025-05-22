import { Button, Col, Divider, Row, Space, Table } from "antd";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import PageTitle from "../../features/PageTitle";
import MarketTransactionTable from "../../features/tansactionTable/MarketTransactionTable";
import WaypointLink from "../../features/WaypointLink";
import { useAppSelector } from "../../hooks";
import {
  ActivityLevel,
  SupplyLevel,
  TradeSymbol,
} from "../../spaceTraderAPI/api";
import { selectSupplyChain } from "../../spaceTraderAPI/redux/dataSlice";
import { selectMarketSystems } from "../../spaceTraderAPI/redux/marketSlice";
import { selectMarketTransactions } from "../../spaceTraderAPI/redux/tansactionSlice";
import { chartColorTradeSymbol } from "../../utils/chartColors";
import classes from "./tradeSymbol.module.css";

export default function TradeSymbolInfo() {
  const { tradeSymbol: tradeSymbolString } = useParams();
  // if (!tradeSymbolString || !isTradeSymbol(tradeSymbolString)) return null;
  const tradeSymbol = tradeSymbolString as TradeSymbol;
  const supplyChain = useAppSelector(selectSupplyChain);
  const unfilteredMarkets = useAppSelector(selectMarketSystems);
  const filteredMarkets = useMemo(() => {
    const allMarkets = Object.keys(unfilteredMarkets).flatMap((key) => {
      const systemMarkets = unfilteredMarkets[key];
      const markets = Object.values(systemMarkets).map((market) => {
        return market;
      });
      return markets.filter((market) => {
        const exports = market.static.exports.some(
          (good) => good.symbol === tradeSymbol,
        );
        const imports = market.static.imports.some(
          (good) => good.symbol === tradeSymbol,
        );
        const exchange = market.static.exchange.some(
          (good) => good.symbol === tradeSymbol,
        );

        return exports || imports || exchange;
      });
    });
    return allMarkets;
  }, [tradeSymbol, unfilteredMarkets]);
  const needs = supplyChain[tradeSymbol];
  const needetBy = Object.keys(supplyChain).filter((key) =>
    supplyChain[key].includes(tradeSymbol),
  );
  const totalSupply: Needs = useMemo(() => {
    const totalSupply = {
      symbol: tradeSymbol,
      needs: [getNeeds(tradeSymbol, supplyChain)],
    };

    return totalSupply;
  }, [supplyChain, tradeSymbol]);

  const allTransactions = useAppSelector(selectMarketTransactions);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      return transaction.tradeSymbol === tradeSymbol;
    });
  }, [allTransactions, tradeSymbol]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`TradeSymbol ${tradeSymbol}`} />
      <Space>
        <h1>TradeSymbol: {tradeSymbol}</h1>
        <Button>Reload</Button>
      </Space>
      <Row gutter={16}>
        <Col span={8}>
          <h2>Needs</h2>
          <ul>
            {needs.map((need) => (
              <li key={need}>
                <Link to={`/supplyChain/${need}`}>{need}</Link>
              </li>
            ))}
          </ul>
        </Col>
        <Col span={8} className={classes.totalSupply}>
          <h2>Total Supply Chain</h2>
          {renderNeed(totalSupply)}
        </Col>
        <Col span={8}>
          <h2>Needed by</h2>

          <ul>
            {needetBy.map((need) => (
              <li key={need}>
                {" "}
                <Link to={`/supplyChain/${need}`}>{need}</Link>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
      <Divider>Markets</Divider>
      <Table
        columns={[
          {
            title: "Market Symbol",
            dataIndex: "marketSymbol",
            key: "marketSymbol",
            render: (value: string) => (
              <WaypointLink waypoint={value}>{value}</WaypointLink>
            ),
            sorter: (a, b) => a.marketSymbol.localeCompare(b.marketSymbol),
            filterMode: "tree",
            filterSearch: true,
            onFilter: (value, record) =>
              record.marketSymbol.startsWith(value as string),
            filters: filteredMarkets
              .map((market) => market.marketSymbol)
              .reduce(
                (acc, marketSymbol) => {
                  const systemSymbol = marketSymbol.split("-", 2).join("-");
                  const existingGroup = acc.find(
                    (group) => group.value === systemSymbol,
                  );
                  if (existingGroup) {
                    existingGroup.children.push({
                      text: marketSymbol,
                      value: marketSymbol,
                    });
                  } else {
                    acc.push({
                      text: systemSymbol,
                      value: systemSymbol,
                      children: [
                        {
                          text: marketSymbol,
                          value: marketSymbol,
                        },
                      ],
                    });
                  }
                  return acc;
                },
                [] as {
                  text: string;
                  value: string;
                  children: { text: string; value: string }[];
                }[],
              )
              .map((group) => ({
                text: group.text,
                value: group.value,
                children: group.children,
              })),
          },
          {
            title: "Type",
            key: "type",
            // dataIndex: "type",
            render: (value: any, record) => {
              const inExports = record.static.exports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inImports = record.static.imports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inExchange = record.static.exchange.some(
                (good) => good.symbol === tradeSymbol,
              );
              return (
                <div>
                  {inExports && "EXPORT"} {inImports && "IMPORT"}{" "}
                  {inExchange && "EXCHANGE"}
                </div>
              );
            },
            filters: [
              {
                text: "EXPORT",
                value: "EXPORT",
              },
              {
                text: "IMPORT",
                value: "IMPORT",
              },
              {
                text: "EXCHANGE",
                value: "EXCHANGE",
              },
            ],
            onFilter: (value, record) => {
              const inExports = record.static.exports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inImports = record.static.imports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inExchange = record.static.exchange.some(
                (good) => good.symbol === tradeSymbol,
              );
              return (
                (value === "EXPORT" && inExports) ||
                (value === "IMPORT" && inImports) ||
                (value === "EXCHANGE" && inExchange)
              );
            },
            sorter: (a, b) => {
              const inExportsA = +a.static.exports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inExportsB = +b.static.exports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inImportsA = +a.static.imports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inImportsB = +b.static.imports.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inExchangeA = +a.static.exchange.some(
                (good) => good.symbol === tradeSymbol,
              );
              const inExchangeB = +b.static.exchange.some(
                (good) => good.symbol === tradeSymbol,
              );
              return (
                inExportsB - inExportsA ||
                inImportsB - inImportsA ||
                inExchangeB - inExchangeA
              );
            },
          },
          {
            title: "Trade Volume",
            // dataIndex: "tradeVolume",
            key: "tradeVolume",
            render: (value: any, record) =>
              record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              )?.tradeVolume || "N/A",
            sorter: (a, b) => {
              const goodA = a.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              const goodB = b.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (goodB?.tradeVolume || 0) - (goodA?.tradeVolume || 0);
            },
          },
          {
            title: "Supply",
            key: "supply",
            render: (value: any, record) =>
              record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              )?.supply || "N/A",
            sorter: (a, b) => {
              const goodA = a.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              const goodB = b.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (goodB?.supply || "").localeCompare(goodA?.supply || "");
            },
            filters: [
              ...Object.values(SupplyLevel).map((level) => ({
                text: level,
                value: level,
              })),
              {
                text: "N/A",
                value: "N/A",
              },
            ],
            onFilter: (value, record) => {
              const good = record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (
                good?.supply === value || (value === "N/A" && !good?.supply)
              );
            },
          },
          {
            title: "Activity",
            key: "activity",
            render: (value: any, record) =>
              record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              )?.activity || "N/A",
            sorter: (a, b) => {
              const goodA = a.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              const goodB = b.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (goodB?.activity || "").localeCompare(
                goodA?.activity || "",
              );
            },
            filters: [
              ...Object.values(ActivityLevel).map((level) => ({
                text: level,
                value: level,
              })),
              {
                text: "N/A",
                value: "N/A",
              },
            ],
            onFilter: (value, record) => {
              const good = record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (
                good?.activity === value || (value === "N/A" && !good?.activity)
              );
            },
          },
          {
            title: "Purchase Price",
            key: "purchasePrice",
            render: (value: any, record) => {
              const good = record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return good ? (
                <>
                  {good.type === "IMPORT" ? (
                    <span>{good.sellPrice}</span>
                  ) : (
                    <b>{good.sellPrice}</b>
                  )}
                </>
              ) : (
                "N/A"
              );
            },
            sorter: (a, b) => {
              const goodA = a.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              const goodB = b.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (goodB?.sellPrice || 0) - (goodA?.sellPrice || 0);
            },
          },
          {
            title: "Sell Price",
            key: "sellPrice",
            render: (value: any, record) => {
              const good = record.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return good ? (
                <>
                  {good.type === "EXPORT" ? (
                    <span>{good.sellPrice}</span>
                  ) : (
                    <b>{good.sellPrice}</b>
                  )}
                </>
              ) : (
                "N/A"
              );
            },
            sorter: (a, b) => {
              const goodA = a.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              const goodB = b.tradeGoods[0]?.tradeGoods.find(
                (good) => good.symbol === tradeSymbol,
              );
              return (goodB?.sellPrice || 0) - (goodA?.sellPrice || 0);
            },
          },
        ]}
        dataSource={filteredMarkets}
      />
      <Divider />
      <MarketTransactionTable transactions={filteredTransactions} />
    </div>
  );
}

// function isTradeSymbol(symbol: string): symbol is TradeSymbol {
//   return Object.values(TradeSymbol).includes(symbol as TradeSymbol);
// }

interface Needs {
  symbol: TradeSymbol;
  needs: Needs[];
}

function renderNeed(needs: Needs) {
  return (
    <ul className={classes.needs}>
      {needs.needs.map((need) => (
        <li
          key={need.symbol}
          className={classes.need}
          style={
            {
              "--depth": need.needs.length,
              "--tradeSymbolColor": chartColorTradeSymbol(need.symbol),
            } as React.CSSProperties
          }
        >
          <Link to={`/supplyChain/${need.symbol}`}>{need.symbol}</Link>

          {renderNeed(need)}
        </li>
      ))}
    </ul>
  );
}

const blockList: TradeSymbol[] = [
  TradeSymbol.AluminumOre,
  TradeSymbol.IronOre,
  TradeSymbol.CopperOre,
  TradeSymbol.SiliconCrystals,
  TradeSymbol.QuartzSand,
  TradeSymbol.IceWater,
  TradeSymbol.GoldOre,
  TradeSymbol.AmmoniaIce,
  TradeSymbol.PreciousStones,
  TradeSymbol.PlatinumOre,
  TradeSymbol.SilverOre,
  TradeSymbol.Diamonds,
  TradeSymbol.Hydrocarbon,
  TradeSymbol.LiquidHydrogen,
  TradeSymbol.LiquidNitrogen,
];

function getNeeds(
  tradeSymbol: TradeSymbol,
  supplyChain: { [key: string]: string[] },
): Needs {
  // console.log("getNeeds", tradeSymbol, supplyChain);
  // const needs = [] as TradeSymbol[];
  if (blockList.includes(tradeSymbol))
    return { symbol: tradeSymbol, needs: [] };
  const needs = (supplyChain[tradeSymbol] || []) as TradeSymbol[];
  const totalNeeds = needs
    // .filter((need) => !blockList.includes(need))
    .map((need) => {
      return getNeeds(need, supplyChain);
    });
  return {
    symbol: tradeSymbol,
    needs: totalNeeds,
  };
}
