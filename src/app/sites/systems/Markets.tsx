import { Divider, Table } from "antd";
import { useParams } from "react-router-dom";
import PageTitle from "../../features/PageTitle";
import TradeRoutes from "../../features/TradeRoutes/TradeRoutes";
import { useAppSelector } from "../../hooks";
import { selectSystemMarkets } from "../../spaceTraderAPI/redux/marketSlice";
import { selectSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";

function Markets() {
  const { systemID } = useParams();

  const unfilteredWaypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemID!),
  );

  const unfilteredMarkets = useAppSelector((state) =>
    selectSystemMarkets(state, systemID!),
  );

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Markets ${systemID}`} />
      <h1>Markets</h1>
      <Table
        columns={[
          {
            title: "Symbol",
            dataIndex: "symbol",
            key: "symbol",
            sorter: (a, b) => a.symbol.localeCompare(b.symbol),

            // render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Last Updated",
            dataIndex: "lastUpdated",
            sorter: (a, b) => a.lastUpdated - b.lastUpdated,

            render: (value) => `${new Date(value).toLocaleString()}`,
          },
        ]}
        dataSource={Object.entries(unfilteredMarkets).map(
          ([key, waypoint]) => ({
            symbol: key,
            lastUpdated:
              waypoint.tradeGoods.length !== 0
                ? waypoint.tradeGoods[waypoint.tradeGoods.length - 1].timestamp
                : 0,
          }),
        )}
      />
      <Divider />
      <TradeRoutes
        waypoints={unfilteredWaypoints}
        waypointsMarkets={unfilteredMarkets}
      />
    </div>
  );
}

export default Markets;
