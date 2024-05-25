import { useEffect, useState } from "react";
import spaceTraderClient from "../../spaceTraderClient";
import { Ship } from "../../components/api";

function Fleet() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [shipsPage, setShipsPage] = useState(1);
  const [allShips, setAllShips] = useState(0);
  const itemsPerPage = 20;
  useEffect(() => {
    spaceTraderClient.FleetClient.getMyShips().then((response) => {
      console.log("my responses", response);
      setShips(response.data.data);
      setAllShips(response.data.meta.total);
    });
    return () => {};
  }, []);

  return (
    <div>
      <h2>All Ships</h2>
      <div>
        <button
          onClick={(e) => {
            setShipsPage(
              Math.max(
                shipsPage - (e.ctrlKey ? 10 : 1) * (e.altKey ? 10 : 1),
                1
              )
            );
          }}
        >
          Prev
        </button>
        <div>
          <div>
            Page: {shipsPage} / {Math.ceil(allShips / itemsPerPage)}
          </div>
          <div>
            Entry: {shipsPage * itemsPerPage - itemsPerPage + 1} -{" "}
            {Math.min(shipsPage * itemsPerPage, allShips)} / {allShips}
          </div>
        </div>

        <button
          onClick={(e) => {
            setShipsPage(
              Math.min(
                Math.ceil(allShips / itemsPerPage),
                shipsPage + (e.ctrlKey ? 10 : 1) * (e.altKey ? 10 : 1)
              )
            );
          }}
        >
          Next
        </button>
      </div>
      <div>
        {ships.map((value) => {
          return (
            <div key={value.symbol}>
              <div>Symbol:</div>
              <div>{value.symbol}</div>
              <div>Role:</div>
              <div>{value.registration.role}</div>

              <div>Cooldown:</div>
              <div>
                {value.cooldown.remainingSeconds} /{" "}
                {value.cooldown.totalSeconds}
              </div>
              <div>Nav Status:</div>
              <div>{value.nav.status}</div>
              <div>Nav System:</div>
              <div>{value.nav.systemSymbol}</div>
              <div>Nav Waypoint:</div>
              <div>{value.nav.waypointSymbol}</div>
              <div>Fuel:</div>
              <div>
                {value.fuel.current}/{value.fuel.capacity}
              </div>
              <div>Cargo</div>
              <div>
                {value.cargo.units}/{value.cargo.capacity}
              </div>
              <div>Crew:</div>
              <div>
                {value.crew.current} / {value.crew.capacity} (min{" "}
                {value.crew.required})
              </div>
              <div>Mounts:</div>
              <div>{value.mounts.length} installed</div>
              <div>Modules:</div>
              <div>{value.modules.length} installed</div>
              <div>Engine:</div>
              <div>
                {value.engine.name} ({value.engine.symbol})
              </div>
              <div>Reactor:</div>
              <div>
                {value.reactor.name} ({value.reactor.symbol})
              </div>
              <div>Frame:</div>
              <div>
                {value.frame.name} ({value.frame.symbol})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Fleet;
