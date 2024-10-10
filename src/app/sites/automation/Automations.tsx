import { Spin } from "antd";
import { useParams } from "react-router-dom";
import ShipAutomation from "../../features/automation/ShipAutomation";
import PageTitle from "../../features/PageTitle";
import { useAppSelector } from "../../hooks";
import { selectShip } from "../../spaceTraderAPI/redux/fleetSlice";

function Automations() {
  const { shipID } = useParams();
  // const dispatch = useAppDispatch();
  const ship = useAppSelector((state) => selectShip(state, shipID));

  if (!ship) return <Spin spinning={true}></Spin>;

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Automations" />
      <h1>Automations</h1>
      <ShipAutomation ship={ship} />
    </div>
  );
}

export default Automations;
