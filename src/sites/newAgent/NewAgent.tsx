import classes from "./NewAgent.module.css";

function NewAgent() {
  return <div className={classes.NewAgent}>
    NewAgent
<br />
Name
<br />
<input type="text" />
    <button
      onClick={(e) => {
        console.log(e);
      }}
    >
      Log
    </button>

  </div>;
}

export default NewAgent;
