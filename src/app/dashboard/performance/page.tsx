"use client"

import { useState } from "react"
import useSWR from "swr"
import { Target, Star, Plus, Eye, X, TrendingUp, Calendar, User, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ToastProvider"

const fetcher = (url: string): Promise<any> => api.get(url)

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  "IN_PROGRESS": "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
}

const goalStatusColors: Record<string, string> = {
  ACHIEVED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  MISSED: "bg-red-100 text-red-700",
}

export default function PerformancePage() {
  const { success, error } = useToast()
  const [showDetail, setShowDetail] = useState<any>(null)
  const [showNewReview, setShowNewReview] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState("All")
  const [loading, setLoading] = useState(false)
  const [newReview, setNewReview] = useState({ employeeId: "", cycle: "Q2 2026", goals: "", comments: "" })

  const { data: reviews, mutate } = useSWR("/api/performance", fetcher)
  const { data: employees } = useSWR("/api/employees?limit=100", fetcher)

  const completedCount = reviews?.filter((r: any) => r.status === "COMPLETED").length || 0
  const inProgressCount = reviews?.filter((r: any) => r.status === "IN_PROGRESS").length || 0
  const pendingCount = reviews?.filter((r: any) => r.status === "PENDING").length || 0
  const avgRating = reviews?.filter((r: any) => r.status === "COMPLETED").reduce((sum: number, r: any) => sum + (r.finalRating || 0), 0) / (completedCount || 1)

  const cycles: string[] = ["All", ...(Array.from(new Set(reviews?.map((r: any) => r.cycle) || [])) as string[])]

  const filteredReviews = reviews?.filter((r: any) => selectedCycle === "All" || r.cycle === selectedCycle) || []

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.employeeId) {
      error("Validation Error", "Please select an employee")
      return
    }
    setLoading(true)
    try {
      const goals = newReview.goals.split("\n").filter(Boolean).map((name) => ({ name, status: "IN_PROGRESS" }))
      await api.post("/api/performance", {
        employeeId: newReview.employeeId,
        cycle: newReview.cycle,
        goals,
        comments: newReview.comments,
      })
      mutate()
      setShowNewReview(false)
      setNewReview({ employeeId: "", cycle: "Q2 2026", goals: "", comments: "" })
      success("Performance review created")
    } catch (err: any) {
      error("Creation failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Track and manage employee performance</p>
        </div>
        <button
          onClick={() => setShowNewReview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Review
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-500">Total Reviews</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reviews?.length || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-500">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
          <div className="mt-1">{renderStars(Math.round(avgRating))}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {cycles.map((c) => <option key={c} value={c}>{c === "All" ? "All Cycles" : c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Cycle</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Self</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Manager</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Final</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReviews.map((review: any) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-medium flex-shrink-0">
                        {review.employee?.avatar || `${review.employee?.firstName?.[0] || ""}${review.employee?.lastName?.[0] || ""}`.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{review.employee?.firstName} {review.employee?.lastName}</div>
                        <div className="text-sm text-gray-500">{review.employee?.department?.name || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{review.cycle}</td>
                  <td className="px-4 py-3 text-center">{review.selfRating > 0 ? renderStars(review.selfRating) : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">{review.managerRating > 0 ? renderStars(review.managerRating) : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-center">{review.finalRating > 0 ? renderStars(review.finalRating) : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[review.status]}`}>
                      {review.status === "IN_PROGRESS" ? "In Progress" : review.status.charAt(0) + review.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setShowDetail(review)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No performance reviews found</p>
            <p className="text-sm mt-1">Create a review to start tracking performance</p>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(null)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Performance Review — {showDetail.cycle}</h2>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-lg font-bold">
                  {showDetail.employee?.avatar || `${showDetail.employee?.firstName?.[0] || ""}${showDetail.employee?.lastName?.[0] || ""}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{showDetail.employee?.firstName} {showDetail.employee?.lastName}</h3>
                  <p className="text-gray-500">{showDetail.employee?.position} · {showDetail.employee?.department?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Self Rating</div>
                  <div className="mt-1 flex justify-center">{showDetail.selfRating > 0 ? renderStars(showDetail.selfRating) : "—"}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Manager</div>
                  <div className="mt-1 flex justify-center">{showDetail.managerRating > 0 ? renderStars(showDetail.managerRating) : "—"}</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <div className="text-sm text-indigo-600">Final</div>
                  <div className="mt-1 flex justify-center">{showDetail.finalRating > 0 ? renderStars(showDetail.finalRating) : "—"}</div>
                </div>
              </div>

              {showDetail.goals && showDetail.goals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Goals</h4>
                  <div className="space-y-2">
                    {showDetail.goals.map((goal: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{goal.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${goalStatusColors[goal.status]}`}>
                          {goal.status === "IN_PROGRESS" ? "In Progress" : goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.comments && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Manager Comments</h4>
                  <p className="text-sm text-gray-600 italic">"{showDetail.comments}"</p>
                </div>
              )}

              {showDetail.reviewDate && (
                <div className="text-sm text-gray-500">Reviewed on {new Date(showDetail.reviewDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewReview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewReview(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">New Performance Review</h2>
              <button onClick={() => setShowNewReview(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select value={newReview.employeeId} onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required>
                  <option value="">Select employee</option>
                  {employees?.employees?.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} — {emp.department?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Cycle</label>
                <select value={newReview.cycle} onChange={(e) => setNewReview({ ...newReview, cycle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "Annual 2026"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals (one per line)</label>
                <textarea value={newReview.goals} onChange={(e) => setNewReview({ ...newReview, goals: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} placeholder="Ship new feature&#10;Improve test coverage&#10;Mentor junior developers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea value={newReview.comments} onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} placeholder="Initial comments..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowNewReview(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Creating..." : "Create Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
