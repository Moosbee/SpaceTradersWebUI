import { useParams } from "react-router-dom";
import WaypointMap from "../../../features/WaypointMap/WaypointMap";
import MapHolder from "../../../features/MapHolder/MapHolder";

function WpMap() {
  const { systemID } = useParams();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {systemID && (
        <MapHolder>
          {" "}
          <WaypointMap systemID={systemID} />
        </MapHolder>
      )}
    </div>
  );
}

export default WpMap;
