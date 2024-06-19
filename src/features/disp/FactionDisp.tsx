import { Card, Descriptions, List, Tooltip } from "antd"
import type { Faction } from "../../utils/api"

function FactionDisp({ faction }: { faction: Faction }) {
  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        bordered
        title="Faction Info"
        layout="vertical"
        items={[
          {
            label: "Symbol",
            key: "symbol",
            children: faction.symbol,
          },
          {
            label: "Name",
            key: "name",
            children: faction.name,
          },
          {
            label: "Description",
            key: "description",
            children: faction.description,
          },
          {
            label: "Headquarters",
            key: "headquarters",
            children: faction.headquarters,
          },
          {
            label: "IsRecruiting",
            key: "isRecruiting",
            children: faction.isRecruiting ? "Yes" : "No",
          },
          {
            label: "Traits",
            key: "traits",
            children: (
              <List
                size="small"
                dataSource={faction.traits.map(trait => (
                  <Tooltip
                    key={trait.symbol}
                    title={`${trait.symbol} - ${trait.description}`}
                  >
                    <span>{trait.name}</span>
                  </Tooltip>
                ))}
                renderItem={item => <List.Item>{item}</List.Item>}
              ></List>
            ),
          },
        ]}
      ></Descriptions>
    </Card>
  )
}

export default FactionDisp
