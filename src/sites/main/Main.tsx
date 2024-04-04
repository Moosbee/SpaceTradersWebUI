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
      <div className={classes.leaderboards}>
        <div>
          <h3>Most Credits</h3>
          <div className={classes.leaderboard}>
            <div>
              <b>Agent Symbol</b>
            </div>
            <div>
              <b>Credits</b>
            </div>
            {status?.leaderboards.mostCredits.map((value) => {
              return (
                <>
                  <div>{value.agentSymbol}</div>
                  <div>{value.credits}</div>
                </>
              );
            })}
          </div>
        </div>
        <div>
          <h3>Most Submitted Charts</h3>
          <div className={classes.leaderboard}>
            <div>
              <b>Agent Symbol</b>
            </div>
            <div>
              <b>Chart Count</b>
            </div>
            {status?.leaderboards.mostSubmittedCharts.map((value) => {
              return (
                <>
                  <div>{value.agentSymbol}</div>
                  <div>{value.chartCount}</div>
                </>
              );
            })}
          </div>
        </div>
      </div>

      <nav className={classes.linkMenu}>
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
