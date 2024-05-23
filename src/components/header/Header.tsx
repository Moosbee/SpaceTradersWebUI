import classes from "./Header.module.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.nav}>
          <li>
            <Link to="/">Spacetraders API</Link>
          </li>
          <li>
            <Link to="/agents">Agents Overview</Link>
          </li>
          <li>
            <Link to="/fleet">Fleet Overview</Link>
          </li>
          <li>
            <Link to="/systems">Systems Overview</Link>
          </li>
          <li>
            <Link to="/factions">Factions Overview</Link>
          </li>
          <li>
            <Link to="/contracts">Contracts overview</Link>
          </li>
          <li>
            <Link to="/newAgent">New Agent</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
