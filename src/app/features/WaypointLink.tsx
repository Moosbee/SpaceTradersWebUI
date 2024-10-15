import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import type { Prettify } from "../utils/utils";

function WaypointLink({
  systemSymbol,
  waypoint,
  children,
  ...props
}: Prettify<
  Omit<
    {
      waypoint: string;
      systemSymbol?: string;
    } & LinkProps,
    "to"
  >
>) {
  if (!systemSymbol) {
    systemSymbol = waypoint.split("-", 2).join("-");
  }

  return (
    <Link to={`/system/${systemSymbol}/${waypoint}`} {...props}>
      {children}
    </Link>
  );
}

export default WaypointLink;
