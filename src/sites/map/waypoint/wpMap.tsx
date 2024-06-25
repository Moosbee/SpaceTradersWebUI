import { useParams } from "react-router-dom";
import WaypointMap from "../../../features/WaypointMap/WaypointMap";

function WpMap() {
  const { systemID } = useParams();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {systemID && <WaypointMap systemID={systemID} />}
    </div>
  );
}

export default WpMap;
