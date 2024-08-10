import { Divider, Flex } from "antd";
import ShipDisp from "../../features/disp/ship/ShipDisp";

import { useAppSelector } from "../../hooks";
import { selectShips } from "../../spaceTraderAPI/redux/fleetSlice";
import CachingFleetCard from "../../features/cachingCard/CachingFleetCard";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { useMemo } from "react";

function Fleet() {
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const cachedAllFleet = useAppSelector(selectShips);

  const ships = useMemo(() => {
    if (!agentSymbol) return cachedAllFleet;
    return cachedAllFleet.filter((value) =>
      value.symbol.startsWith(agentSymbol),
    );
  }, [agentSymbol, cachedAllFleet]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <Flex justify="space-around">
        <h2>All Ships</h2>
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
