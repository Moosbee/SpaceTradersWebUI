import { useParams } from "react-router-dom";
import WaypointMap from "../../../features/WaypointMap/WaypointMap";
import MapHolder from "../../../features/MapHolder/MapHolder";
import PageTitle from "../../../features/PageTitle";

function WpMap() {
  const { systemID } = useParams();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <PageTitle title={`${systemID} Map`} />
      {systemID && (
        <MapHolder>
          <PageTitle title={`${systemID} Map`} />
          <WaypointMap systemID={systemID} />
        </MapHolder>
      )}
    </div>
  );
}

export default WpMap;
