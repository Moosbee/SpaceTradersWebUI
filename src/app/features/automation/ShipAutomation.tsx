import { Flex } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";
import Extractor from "./runner/Extractor";
import Navigator from "./runner/Navigator";
import SimpleTrader from "./runner/SimpleTrader";
import Surveyor from "./runner/Surveyor";

function ShipAutomation({ ship }: { ship: Ship }) {
  return (
    <Flex wrap style={{ gap: "20px" }}>
      <Surveyor ship={ship} />
      <Extractor ship={ship} />
      <Navigator ship={ship} />
      <SimpleTrader ship={ship} />
    </Flex>
  );
}

export default ShipAutomation;
