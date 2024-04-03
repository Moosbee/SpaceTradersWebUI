import { useEffect, useState } from "react";
import spaceTraderClient from "../../spaceTraderClient";
import classes from "./Main.module.css";
import { GetStatus200Response } from "../../components/api";

function Main() {
  const [status, setStatus] = useState<GetStatus200Response | null>(null);
  useEffect(() => {
    spaceTraderClient.DefaultClient.getStatus().then((response) => {
      console.log("response", response);
      setStatus(response.data);
    });
    return () => {};
  }, []);

  return (
    <div className={classes.main}>
      <h2>Announcements</h2>
      <ul className={classes.announcements}>
        {status?.announcements.map((value) => {
          return (
            <li key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </li>
          );
        })}
      </ul>
      <h2>Information</h2>
      <hr />
      <p>{status?.description}</p>
      <hr />
      <b>{status?.status}</b>
      <p>Version: {status?.version}</p>
      <p>
        Last reset:{" "}
        {new Date(status ? status.resetDate : 0).toLocaleDateString()}
      </p>
      <p>
        Next reset:{" "}
        {new Date(status ? status?.serverResets.next : 0).toLocaleDateString()}{" "}
        {new Date(status ? status?.serverResets.next : 0).toLocaleTimeString()}{" "}
        frequency: {status?.serverResets.frequency}
      </p>
      <p>
        Agents: {status?.stats.agents}
        <br />
        Ships: {status?.stats.ships}
        <br />
        Systems: {status?.stats.systems}
        <br />
        Waypoints: {status?.stats.waypoints}
      </p>
      <h2>Leaderboards</h2>
      <h3>Most Credits</h3>
      <ol>
        {status?.leaderboards.mostCredits.map((value) => {
          return (
            <li>
              {value.agentSymbol} {value.credits}
            </li>
          );
        })}
      </ol>
      <h3>Most Submitted Charts</h3>
      <ol>
        {status?.leaderboards.mostSubmittedCharts.map((value) => {
          return (
            <li>
              {value.agentSymbol} {value.chartCount}
            </li>
          );
        })}
      </ol>

      <nav>
        <ul>
          {status?.links.map((value) => {
            return (
              <li>
                <a href={value.url}>{value.name}</a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default Main;
