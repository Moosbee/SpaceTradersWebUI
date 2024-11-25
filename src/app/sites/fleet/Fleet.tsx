import { Card, Divider, Flex, Select } from "antd";
import ShipDisp from "../../features/disp/ship/ShipDisp";

import { useMemo, useState } from "react";
import CachingFleetCard from "../../features/cachingCard/CachingFleetCard";
import PageTitle from "../../features/PageTitle";
import { useAppSelector } from "../../hooks";
import { ShipRole } from "../../spaceTraderAPI/api";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { selectShips } from "../../spaceTraderAPI/redux/fleetSlice";

function Fleet() {
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const cachedAllFleet = useAppSelector(selectShips);

  const [searchType, setSearchType] = useState<ShipRole[]>([]);

  const ships = useMemo(() => {
    if (!agentSymbol) return cachedAllFleet;
    return cachedAllFleet
      .filter((value) => value.symbol.startsWith(agentSymbol))
      .filter((value) => {
        if (searchType.length === 0) return true;
        return searchType.includes(value.registration.role);
      });
  }, [agentSymbol, cachedAllFleet, searchType]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Fleet" />
      <h2>All Ships</h2>
      <Flex justify="space-around">
        <Card title="Filter" style={{ width: "fit-content" }}>
          <Select
            mode="multiple"
            placeholder="Please select"
            onChange={setSearchType}
            style={{ width: 250 }}
            options={Object.values(ShipRole)
              .map((value) => {
                return {
                  label:
                    value +
                    ` (${ships.filter((w) => w.registration.role === value).length})`,
                  value: value,
                };
              })
              .filter(
                (value, index, self) =>
                  self.findIndex((v) => v.value === value.value) === index,
              )}
          />
        </Card>
        <CachingFleetCard />
      </Flex>
      <Divider />
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {ships.map((value) => {
          return <ShipDisp key={value.symbol} ship={value}></ShipDisp>;
        })}
      </Flex>
    </div>
  );
}

export default Fleet;
