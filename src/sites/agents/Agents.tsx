import { useState, useEffect } from "react"
import type { Agent } from "../../app/spaceTraderAPI/api"
import type { PaginationProps } from "antd"
import { Divider, Flex, Pagination, Spin } from "antd"
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient"
import AgentDisp from "../../features/disp/AgentDisp"

function Agents() {
  const [myAgent, setMyAgent] = useState<Agent>({
    credits: 0,
    headquarters: "",
    shipCount: 0,
    startingFaction: "",
    symbol: "",
  })
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentsPage, setAgentsPage] = useState(1)
  const [agentsAll, setAgentsAll] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then(response => {
      console.log("my response", response)
      setMyAgent(response.data.data)
    })
    return () => {}
  }, [])
  useEffect(() => {
    setLoading(true)
    spaceTraderClient.AgentsClient.getAgents(agentsPage, itemsPerPage).then(
      response => {
        console.log("response", response)
        setAgents(response.data.data)
        setAgentsAll(response.data.meta.total)
        setLoading(false)
      },
    )
    return () => {}
  }, [agentsPage, itemsPerPage])

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page)
    setAgentsPage(page)
    setItemsPerPage(pageSize)
  }

  return (
    <div>
      <h2>My Agent</h2>
      <Spin spinning={myAgent.symbol === ""}>
        <AgentDisp agent={myAgent}></AgentDisp>
      </Spin>
      <Divider />
      <h2>All Agents</h2>
      <Pagination
        current={agentsPage}
        onChange={onChange}
        total={agentsAll}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {agents.map(value => {
            return <AgentDisp agent={value} key={value.symbol}></AgentDisp>
          })}
        </Flex>
      </Spin>
    </div>
  )
}

export default Agents
