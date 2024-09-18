import AddAgent from "../../features/addAgent/addAgent";
import CreateAgent from "../../features/addAgent/createAgent";
import UploadAgent from "../../features/addAgent/uploadAgent";
import PageTitle from "../../features/PageTitle";

function NewAgent() {
  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`New Agent`} />
      <UploadAgent />
      <AddAgent />
      <CreateAgent />
    </div>
  );
}

export default NewAgent;
