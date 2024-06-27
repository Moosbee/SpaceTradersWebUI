import classes from "./FaIcon.module.css";
import { icons } from "./icons";

function FaIcon({
  icon,
  type,
}: {
  icon: keyof typeof icons;
  type: "solid" | "regular";
}) {
  // Hex string
  const iconName = icons[icon];

  // Parse the hex string to an integer
  const codePoint: number = parseInt(iconName, 16);

  // Convert the integer to its corresponding character
  const character = String.fromCodePoint(codePoint);

  return (
    <span className={`${classes.faIcon} ${classes[type]}`} aria-hidden="true">
      {character}
    </span>
  );
}

export default FaIcon;
