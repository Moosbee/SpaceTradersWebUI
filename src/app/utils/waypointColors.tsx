import { ReactElement } from "react";
import FaIcon from "../features/FontAwsome/FaIcon";
import NounIcon from "../features/FontAwsome/NounIcon";
import { SystemType, WaypointType } from "../models/api";
//TODO change color to antd color and dark/light mode

export const systemIcons: Record<
  SystemType,
  { icon: ReactElement; color: string }
> = {
  NEUTRON_STAR: {
    icon: <FaIcon type="solid" icon="fa-star-christmas" />,
    color: "rgb(255, 255, 255)",
  },
  RED_STAR: {
    icon: <FaIcon type="solid" icon="fa-sparkle" />,
    color: "rgb(255, 0, 0)",
  },
  ORANGE_STAR: {
    icon: <FaIcon type="solid" icon="fa-star" />,
    color: "rgb(255, 165, 0)",
  },
  BLUE_STAR: {
    icon: <FaIcon type="solid" icon="fa-star-christmas" />,
    color: "rgb(0, 102, 255)",
  },
  YOUNG_STAR: {
    icon: <FaIcon type="solid" icon="fa-star-of-life" />,
    color: "rgb(144, 238, 144)",
  },
  WHITE_DWARF: {
    icon: <FaIcon type="solid" icon="fa-period" />,
    color: "rgb(255, 255, 255)",
  },
  BLACK_HOLE: {
    icon: <FaIcon type="solid" icon="fa-atom" />,
    color: "rgb(255, 255, 255)",
  },
  HYPERGIANT: {
    icon: <FaIcon type="solid" icon="fa-certificate" />,
    color: "rgb(173, 216, 230)",
  },
  NEBULA: {
    icon: <NounIcon name="nebula" />,
    color: "rgb(255, 255, 255)",
  },
  UNSTABLE: {
    icon: <FaIcon type="solid" icon="fa-star-exclamation" />,
    color: "rgb(139, 0, 0)",
  },
};

//TODO change color to antd color and dark/light mode
export const waypointIcons: Record<
  WaypointType,
  { icon: ReactElement; color: string }
> = {
  PLANET: {
    icon: <FaIcon type="solid" icon="fa-earth-oceania" />,
    color: "rgb(165, 42, 42)",
  },
  GAS_GIANT: {
    icon: <FaIcon type="solid" icon="fa-planet-ringed" />,
    color: "rgb(173, 216, 230)",
  },
  MOON: {
    icon: <FaIcon type="solid" icon="fa-moon" />,
    color: "rgb(128, 128, 128)",
  },
  ORBITAL_STATION: {
    icon: <NounIcon name="space-station" />,
    color: "rgb(255, 255, 0)",
  },
  JUMP_GATE: {
    icon: <FaIcon type="solid" icon="fa-bullseye-pointer" />,
    color: "rgb(255, 255, 0)",
  },
  ASTEROID_FIELD: {
    icon: <NounIcon name="asteroid-field" />,
    color: "rgb(211, 211, 211)",
  },
  ASTEROID: {
    icon: <NounIcon name="asteroid" />,
    color: "rgb(211, 211, 211)",
  },
  ENGINEERED_ASTEROID: {
    icon: <NounIcon name="asteroid_2" />,
    color: "rgb(211, 211, 211)",
  },
  ASTEROID_BASE: {
    icon: <FaIcon type="solid" icon="fa-planet-ringed" />,
    color: "rgb(255, 255, 0)",
  },
  NEBULA: {
    icon: <NounIcon name="nebula" />,
    color: "rgb(255, 255, 255)",
  },
  DEBRIS_FIELD: {
    icon: <FaIcon type="solid" icon="fa-sparkles" />,
    color: "rgb(255, 0, 0)",
  },
  GRAVITY_WELL: {
    icon: <FaIcon type="solid" icon="fa-arrows-minimize" />,
    color: "rgb(0, 128, 0)",
  },
  ARTIFICIAL_GRAVITY_WELL: {
    icon: <FaIcon type="solid" icon="fa-arrows-to-circle" />,
    color: "rgb(154, 205, 50)",
  },
  FUEL_STATION: {
    icon: <FaIcon type="solid" icon="fa-gas-pump" />,
    color: "rgb(255, 255, 0)",
  },
};
