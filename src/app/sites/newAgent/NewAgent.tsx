import AddAgent from "../../features/addAgent/addAgent";
import CreateAgent from "../../features/addAgent/createAgent";
import UploadAgent from "../../features/addAgent/uploadAgent";

function NewAgent() {
  return (
    <div style={{ padding: "24px 24px" }}>
      <UploadAgent />
      <AddAgent />
      <CreateAgent />
    </div>
  );
}

export default NewAgent;
