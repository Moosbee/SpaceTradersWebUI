import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { selectSystem } from "../../../app/spaceTraderAPI/redux/systemSlice";

function WpMap() {
  const { systemID } = useParams();
  const system = useAppSelector((state) => selectSystem(state, systemID));
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>WpMap</h1>
    </div>
  );
}

export default WpMap;
