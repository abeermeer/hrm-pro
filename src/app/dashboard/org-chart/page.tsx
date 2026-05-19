"use client"

import { useState } from "react"
import useSWR from "swr"
import { Download, Search, ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

const fetcher = (url: string): Promise<any> => api.get(url)

interface OrgNode {
  id: string
  name: string
  position: string
  department: string
  avatar: string
  reportsTo: string | null
  children?: OrgNode[]
}

function buildOrgTree(employees: any[]): OrgNode | null {
  if (!employees || employees.length === 0) return null

  const nodeMap = new Map<string, OrgNode>()
  let root: OrgNode | null = null

  for (const emp of employees) {
    const node: OrgNode = {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      position: emp.position || "Employee",
      department: emp.department?.name || "Unassigned",
      avatar: emp.avatar || `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase(),
      reportsTo: emp.reportsToId,
      children: [],
    }
    nodeMap.set(emp.id, node)
  }

  for (const node of nodeMap.values()) {
    if (node.reportsTo && nodeMap.has(node.reportsTo)) {
      const parent = nodeMap.get(node.reportsTo)!
      parent.children!.push(node)
    } else if (!root) {
      root = node
    }
  }

  if (!root && nodeMap.size > 0) {
    root = Array.from(nodeMap.values())[0]
  }

  return root
}

function OrgNodeCard({ node, expanded, onToggle }: { node: OrgNode; expanded: Record<string, boolean>; onToggle: (id: string) => void }) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded[node.id] ?? false

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white border border-gray-200 rounded-xl p-4 w-48 text-center hover:shadow-lg hover:border-indigo-200 transition-all relative">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mx-auto mb-2">
          {node.avatar}
        </div>
        <div className="font-semibold text-gray-900 text-sm">{node.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{node.position}</div>
        <div className="text-xs text-indigo-600 mt-0.5">{node.department}</div>
        {hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700"
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex gap-6 relative">
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-[25%] right-[25%] h-px bg-gray-300"></div>
            )}
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {node.children!.length > 1 && (
                  <div className="absolute -top-0 left-1/2 w-px h-3 bg-gray-300 -translate-x-1/2"></div>
                )}
                <div className="pt-3">
                  <OrgNodeCard node={child} expanded={expanded} onToggle={onToggle} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [zoom, setZoom] = useState(100)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const { data: employees, isLoading } = useSWR("/api/employees?limit=100", fetcher)

  const orgTree = buildOrgTree(employees?.employees || [])

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    const walk = (node: OrgNode | null) => {
      if (!node) return
      allExpanded[node.id] = true
      node.children?.forEach(walk)
    }
    walk(orgTree)
    setExpanded(allExpanded)
  }

  const departmentSummary = employees?.employees?.reduce((acc: Record<string, { count: number; head: string }>, emp: any) => {
    const dept = emp.department?.name || "Unassigned"
    if (!acc[dept]) {
      acc[dept] = { count: 0, head: `${emp.firstName} ${emp.lastName}` }
    }
    acc[dept].count++
    return acc
  }, {}) || {}

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{employees?.employees?.length || 0} employees · {Object.keys(departmentSummary).length} departments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-none sm:w-auto min-w-[150px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button onClick={expandAll} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Expand All
          </button>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1.5 rounded hover:bg-gray-100">
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-gray-600 w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="p-1.5 rounded hover:bg-gray-100">
              <ZoomIn size={16} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : orgTree ? (
          <div className="flex justify-center min-w-max" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            <OrgNodeCard node={orgTree} expanded={expanded} onToggle={toggle} />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium">No organizational data found</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Department Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(departmentSummary).map(([dept, data]: [string, any]) => (
            <div key={dept} className="p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{data.count}</div>
              <div className="text-sm text-gray-600">{dept}</div>
              <div className="text-xs text-gray-400 mt-1">Lead: {data.head}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
