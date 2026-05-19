"use client"

import { useState } from "react"
import { Building, Users, Bell, Shield, Palette, Database, Save, CheckCircle } from "lucide-react"

const tabs = [
  { id: "company", label: "Company", icon: Building },
  { id: "roles", label: "Roles & Permissions", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "data", label: "Data & Backup", icon: Database },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company")
  const [saved, setSaved] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: "Dura's Ltd.",
    industry: "Technology",
    size: "1-50",
    country: "Nepal",
    timezone: "Asia/Kathmandu",
    currency: "NPR",
    fiscalYearStart: "January",
    workDaysPerWeek: "5",
    workStartTime: "09:00",
    workEndTime: "18:00",
  })

  const [notifications, setNotifications] = useState({
    emailAttendance: true,
    emailLeave: true,
    emailPayroll: true,
    emailBirthday: false,
    slackIntegration: false,
    weeklyDigest: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Configure your workspace preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
            <CheckCircle size={16} />
            Settings saved successfully
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="hidden md:block w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="md:hidden w-full overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          {activeTab === "company" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Retail</option>
                    <option>Manufacturing</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    value={companyForm.size}
                    onChange={(e) => setCompanyForm({ ...companyForm, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option>1-50</option>
                    <option>51-200</option>
                    <option>201-500</option>
                    <option>500+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={companyForm.country}
                    onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={companyForm.timezone}
                    onChange={(e) => setCompanyForm({ ...companyForm, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Asia/Kathmandu">Asia/Kathmandu (UTC+5:45)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={companyForm.currency}
                    onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="NPR">NPR (Nepalese Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="INR">INR (Indian Rupee)</option>
                  </select>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Working Hours</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Days/Week</label>
                    <select
                      value={companyForm.workDaysPerWeek}
                      onChange={(e) => setCompanyForm({ ...companyForm, workDaysPerWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="5">5 Days</option>
                      <option value="6">6 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={companyForm.workStartTime}
                      onChange={(e) => setCompanyForm({ ...companyForm, workStartTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={companyForm.workEndTime}
                      onChange={(e) => setCompanyForm({ ...companyForm, workEndTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Roles & Permissions</h2>
              <div className="space-y-3">
                {[
                  { role: "Super Admin", users: 1, permissions: "Full access to all features" },
                  { role: "Admin", users: 2, permissions: "Manage employees, payroll, leave" },
                  { role: "Manager", users: 3, permissions: "View team, approve requests" },
                  { role: "Employee", users: 7, permissions: "View own data, apply leave" },
                  { role: "HR", users: 1, permissions: "Manage HR operations" },
                ].map((r) => (
                  <div key={r.role} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{r.role}</div>
                      <div className="text-sm text-gray-500">{r.permissions}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{r.users} user{r.users > 1 ? "s" : ""}</span>
                      <button className="text-sm text-indigo-600 hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">+ Create Custom Role</button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                      <div className="text-sm text-gray-500">Receive notifications for {key.replace(/([A-Z])/g, " $1").toLowerCase()}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !value })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Enable</button>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Session Timeout</div>
                      <div className="text-sm text-gray-500">Automatically log out after inactivity</div>
                    </div>
                    <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Password Policy</div>
                      <div className="text-sm text-gray-500">Minimum 8 characters with mixed case and numbers</div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:underline">Configure</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Light", "Dark", "System"].map((theme) => (
                    <button key={theme} className={`p-4 border-2 rounded-lg text-center ${theme === "Light" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${theme === "Dark" ? "bg-gray-800" : theme === "System" ? "bg-gradient-to-br from-gray-200 to-gray-800" : "bg-white border border-gray-200"}`} />
                      <span className="text-sm font-medium">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Primary Color</label>
                <div className="flex gap-3">
                  {["bg-indigo-600", "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-red-600", "bg-amber-600"].map((color) => (
                    <button key={color} className={`w-10 h-10 rounded-full ${color} ${color === "bg-indigo-600" ? "ring-2 ring-offset-2 ring-indigo-600" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Data & Backup</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Export All Data</div>
                      <div className="text-sm text-gray-500">Download a complete backup of your HR data</div>
                    </div>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Export</button>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Import Data</div>
                      <div className="text-sm text-gray-500">Upload employee data from CSV or Excel</div>
                    </div>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Import</button>
                  </div>
                </div>
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-900">Delete All Data</div>
                      <div className="text-sm text-red-700">Permanently remove all HR data. This cannot be undone.</div>
                    </div>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
