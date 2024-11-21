import { Flex } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";
import Extractor from "./runner/Extractor";
import Navigator from "./runner/Navigator";
import SimpleTrader from "./runner/SimpleTrader";
import Surveyor from "./runner/Surveyor";

function ShipAutomation({ ship }: { ship: Ship }) {
  return (
    <Flex wrap style={{ gap: "20px" }}>
      {ship.mounts.some((m) => m.symbol.startsWith("MOUNT_SURVEYOR")) && (
        <Surveyor ship={ship} />
      )}
      {ship.mounts.some(
        (m) =>
          m.symbol.startsWith("MOUNT_GAS_SIPHON") ||
          m.symbol.startsWith("MOUNT_MINING_LASER"),
      ) && <Extractor ship={ship} />}
      <Navigator ship={ship} />
      {ship.cargo.capacity > 0 && <SimpleTrader ship={ship} />}
    </Flex>
  );
}

export default ShipAutomation;
