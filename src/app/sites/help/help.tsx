import { Layout, Typography } from "antd";
import PageTitle from "../../features/PageTitle";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function Help() {
  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Help" />
      <Content>
        <Title level={3}>3. Main Features</Title>
        <Paragraph>
          <ul>
            <li>
              Dashboard: The main dashboard provides th basic information about
              Space Trader.
            </li>
            <li>
              Multi Window Support: This game is intended to be played using
              multiple browser windows
            </li>
            <li>
              Ship Management: You can view and manage your ships, including
              their status, cargo, and navigation.
              <li>You have some automation and autopilot features.</li>
            </li>
            <li>
              Market Prices: You can view current market prices for goods and
              commodities.
              <li>
                Moreover you can also see all possible Trade routes and their
                predicted prices.
              </li>
            </li>
          </ul>
        </Paragraph>
        <Title level={3}>7. Troubleshooting</Title>
        <Paragraph>
          <ul>
            <li>
              If an action does not work, please go into the network tab of the
              dev tools.
            </li>
            <li>
              The Autopilot and Automation reqire a presice clock, if you find
              any issues please refresh the clock on your device
            </li>
          </ul>
        </Paragraph>
      </Content>
    </div>
  );
}

export default Help;
