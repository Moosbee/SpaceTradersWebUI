import { Flex } from "antd";
import Extractor from "../../features/automation/runner/Extractor";
import Surveyor from "../../features/automation/runner/Surveyor";
import PageTitle from "../../features/PageTitle";

function Automations() {
  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Automations" />
      <h1>Automations</h1>

      <Flex wrap style={{ gap: "20px" }}>
        <Surveyor />
        <Extractor />
      </Flex>
    </div>
  );
}

export default Automations;
