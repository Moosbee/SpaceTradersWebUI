import PageTitle from "../../../features/PageTitle";
import ShipControlCenter from "../../../features/Shipinfo/ShipControlCenter";
import { useAppSelector } from "../../../hooks";
import { selectShip } from "../../../spaceTraderAPI/redux/fleetSlice";
import {
  selectSelectedShipSymbol,
  selectSelectedWaypointSymbol,
} from "../../../spaceTraderAPI/redux/mapSlice";

function WpConfig() {
  const shipSymbol = useAppSelector(selectSelectedShipSymbol);
  const waypointSymbol = useAppSelector(selectSelectedWaypointSymbol);
  // const systemSymbol = useAppSelector(selectSelectedSystemSymbol);
  const ship = useAppSelector((state) => selectShip(state, shipSymbol));

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Waypoint Configuration" />
      {ship && (
        <ShipControlCenter
          ship={ship}
          toGoWaypoint={waypointSymbol}
        ></ShipControlCenter>
      )}
    </div>
  );
}

export default WpConfig;
