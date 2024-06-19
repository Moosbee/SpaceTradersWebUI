import type { PaginationProps } from "antd"
import { Pagination, Flex, Spin } from "antd"
import { useState, useEffect } from "react"
import type { System } from "../../app/spaceTraderAPI/api"
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient"
import SystemDisp from "../../features/disp/SystemDisp"

function Systems() {
  const [systems, setSystems] = useState<System[]>([])
  const [systemsPage, setSystemsPage] = useState(1)
  const [allSystems, setAllSystems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    spaceTraderClient.SystemsClient.getSystems(systemsPage, itemsPerPage).then(
      response => {
        console.log("my responses", response)
        setSystems(response.data.data)
        setAllSystems(response.data.meta.total)
        setLoading(false)
      },
    )
    return () => {}
  }, [itemsPerPage, systemsPage])

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page)
    setSystemsPage(page)
    setItemsPerPage(pageSize)
  }

  return (
    <div>
      <h2>All Systems</h2>
      <Pagination
        current={systemsPage}
        onChange={onChange}
        total={allSystems}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {systems.map(value => {
            return <SystemDisp key={value.symbol} system={value}></SystemDisp>
          })}
        </Flex>
      </Spin>
    </div>
  )
}

export default Systems
