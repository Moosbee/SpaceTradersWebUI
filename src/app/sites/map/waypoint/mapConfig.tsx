import { Card, Divider, Radio, Select, Tooltip } from "antd";
import MapFilterCard from "../../../features/filterCard/mapFilterCard";
import PageTitle from "../../../features/PageTitle";
import ShipControlCenter from "../../../features/Shipinfo/ShipControlCenter";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { selectShip } from "../../../spaceTraderAPI/redux/fleetSlice";
import {
  selectRoute,
  selectSelectedShipSymbol,
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
  setRouteShow,
  setRouteTravelMode,
} from "../../../spaceTraderAPI/redux/mapSlice";
import { navModes } from "../../../utils/tavelUtils";

function MapConfig() {
  const shipSymbol = useAppSelector(selectSelectedShipSymbol);
  const waypointSymbol = useAppSelector(selectSelectedWaypointSymbol);
  const systemID = useAppSelector(selectSelectedSystemSymbol);
  const ship = useAppSelector((state) => selectShip(state, shipSymbol));

  const route = useAppSelector(selectRoute);
  const dispatch = useAppDispatch();

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Waypoint Configuration" />
      {systemID && <MapFilterCard systemID={systemID} />}
      {ship && (
        <ShipControlCenter
          ship={ship}
          toGoWaypoint={waypointSymbol}
        ></ShipControlCenter>
      )}
      <Card title="Route" style={{ width: "fit-content" }}>
        <Radio.Group
          onChange={(e) => dispatch(setRouteShow(e.target.value))}
          value={route.show}
        >
          <Radio value={"hide"}>Hide</Radio>
          <Radio value={"fullDijkstra"}>Full</Radio>
          <Radio value={"routeDijkstra"}>Route</Radio>
        </Radio.Group>
        <Divider />
        <Select
          options={Object.values(navModes).map((w) => {
            return {
              value: w,
              label: <Tooltip title={w}>{w}</Tooltip>,
            };
          })}
          showSearch
          style={{ width: 200 }}
          onChange={(value) => {
            dispatch(setRouteTravelMode(value));
          }}
          value={route.travelMode}
        />
      </Card>
    </div>
  );
}

export default MapConfig;
