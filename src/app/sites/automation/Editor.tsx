import AutomationEditor from "../../features/automation/editor/AutomationEditor";
import PageTitle from "../../features/PageTitle";

function PageAutomationEditor() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <PageTitle title={`Automation Editor`} />
      <AutomationEditor />
    </div>
  );
}

export default PageAutomationEditor;
