import { Divider, Flex } from "antd";
import ShipDisp from "../../features/disp/ship/ShipDisp";

import { useAppSelector } from "../../app/hooks";
import { selectShips } from "../../app/spaceTraderAPI/redux/fleetSlice";
import CachingFleetCard from "../../features/cachingCard/CachingFleetCard";

function Fleet() {
  const ships = useAppSelector(selectShips);

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
