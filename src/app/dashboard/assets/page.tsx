"use client"

import { useState } from "react"
import useSWR from "swr"
import { TrendingUp, Plus, Eye, X, Search, AlertTriangle, CheckCircle, Clock, Calendar, User, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ToastProvider"

const fetcher = (url: string): Promise<any> => api.get(url)

const statusColors: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-700",
  AVAILABLE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  RETIRED: "bg-gray-100 text-gray-700",
}

const conditionColors: Record<string, string> = {
  EXCELLENT: "text-green-600",
  GOOD: "text-blue-600",
  FAIR: "text-amber-600",
  POOR: "text-red-600",
}

export default function AssetsPage() {
  const { success, error } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showDetail, setShowDetail] = useState<any>(null)
  const [showNewAsset, setShowNewAsset] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newAsset, setNewAsset] = useState({ name: "", type: "Laptop", serialNumber: "", purchaseDate: "", warrantyExpiry: "", value: "", condition: "GOOD" })

  const { data: assets, mutate } = useSWR("/api/assets", fetcher)

  const filteredAssets = (assets || []).filter((a: any) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || `${a.employee?.firstName || ""} ${a.employee?.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || a.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const totalValue = assets?.reduce((sum: number, a: any) => sum + (Number(a.value) || 0), 0) || 0
  const assignedCount = assets?.filter((a: any) => a.status === "ASSIGNED").length || 0
  const availableCount = assets?.filter((a: any) => a.status === "AVAILABLE").length || 0
  const expiringSoon = assets?.filter((a: any) => {
    if (!a.warrantyExpiry) return false
    const expiry = new Date(a.warrantyExpiry)
    const now = new Date()
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 0 && diff < 90
  }).length || 0

  const handleAssign = async (id: string) => {
    setLoading(true)
    try {
      await api.patch(`/api/assets/${id}`, { action: "assign" })
      mutate()
      success("Asset assigned successfully")
    } catch (err: any) {
      error("Assignment failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAsset.name || !newAsset.serialNumber || !newAsset.purchaseDate) {
      error("Validation Error", "Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      await api.post("/api/assets", {
        name: newAsset.name,
        type: newAsset.type,
        serialNumber: newAsset.serialNumber,
        purchaseDate: newAsset.purchaseDate,
        warrantyExpiry: newAsset.warrantyExpiry || null,
        value: parseFloat(newAsset.value) || 0,
        condition: newAsset.condition,
      })
      mutate()
      setShowNewAsset(false)
      setNewAsset({ name: "", type: "Laptop", serialNumber: "", purchaseDate: "", warrantyExpiry: "", value: "", condition: "GOOD" })
      success("Asset added successfully")
    } catch (err: any) {
      error("Failed to add asset", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `NPR ${amount.toLocaleString()}`

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{assets?.length || 0} assets tracked</p>
        </div>
        <button
          onClick={() => setShowNewAsset(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <Plus size={16} />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-500">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Assigned</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{assignedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Available</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{availableCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-500">Warranty Expiring</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{expiringSoon}</div>
          <div className="text-xs text-gray-500 mt-1">Within 90 days</div>
        </div>
      </div>

      {expiringSoon > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <div className="font-medium text-amber-900">{expiringSoon} asset(s) warranty expiring soon</div>
            <div className="text-sm text-amber-700">
              {assets?.filter((a: any) => {
                if (!a.warrantyExpiry) return false
                const expiry = new Date(a.warrantyExpiry)
                const now = new Date()
                return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 90 && (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) > 0
              }).map((a: any) => a.name).join(", ")}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, serial, or assigned to..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="All">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Serial</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Warranty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.map((asset: any) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{asset.name}</div>
                      <div className="text-sm text-gray-500">{asset.type}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell font-mono">{asset.serialNumber}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {asset.employee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-medium">
                          {asset.employee?.avatar || `${asset.employee?.firstName?.[0] || ""}${asset.employee?.lastName?.[0] || ""}`.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{asset.employee?.firstName} {asset.employee?.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="text-sm text-gray-600">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right hidden md:table-cell">{formatCurrency(Number(asset.value))}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[asset.status]}`}>
                      {asset.status.charAt(0) + asset.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {asset.status === "AVAILABLE" && (
                        <button onClick={() => handleAssign(asset.id)} disabled={loading} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">Assign</button>
                      )}
                      <button onClick={() => setShowDetail(asset)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No assets found</p>
            <p className="text-sm mt-1">Add an asset to start tracking</p>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(null)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Asset Details</h2>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{showDetail.name}</h3>
                  <p className="text-gray-500">{showDetail.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Serial Number</div>
                  <div className="text-sm font-mono font-medium">{showDetail.serialNumber}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Value</div>
                  <div className="text-sm font-medium">{formatCurrency(Number(showDetail.value))}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Purchase Date</div>
                  <div className="text-sm font-medium">{new Date(showDetail.purchaseDate).toLocaleDateString()}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Warranty Expiry</div>
                  <div className="text-sm font-medium">{showDetail.warrantyExpiry ? new Date(showDetail.warrantyExpiry).toLocaleDateString() : "—"}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Assigned To</span>
                {showDetail.employee ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-medium">
                      {showDetail.employee?.avatar || `${showDetail.employee?.firstName?.[0] || ""}${showDetail.employee?.lastName?.[0] || ""}`.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{showDetail.employee?.firstName} {showDetail.employee?.lastName}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[showDetail.status]}`}>
                  {showDetail.status.charAt(0) + showDetail.status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Condition</span>
                <span className={`text-sm font-medium ${conditionColors[showDetail.condition]}`}>
                  {showDetail.condition.charAt(0) + showDetail.condition.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewAsset && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewAsset(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Add Asset</h2>
              <button onClick={() => setShowNewAsset(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input type="text" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder='e.g. MacBook Pro 14"' required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {["Laptop", "Monitor", "Phone", "Tablet", "Furniture", "Printer", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select value={newAsset.condition} onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {["EXCELLENT", "GOOD", "FAIR", "POOR"].map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input type="text" value={newAsset.serialNumber} onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. MBP-2024-001" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input type="date" value={newAsset.purchaseDate} onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value (NPR)</label>
                  <input type="number" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry (optional)</label>
                <input type="date" value={newAsset.warrantyExpiry} onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowNewAsset(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Adding..." : "Add Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
