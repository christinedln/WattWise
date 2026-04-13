import { Search, Bell } from 'lucide-react';

export default function DashboardHeader({ criticalAlerts = 0 }) {
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-beforecenter gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices, alerts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Bell */}
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-500" />
          {criticalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {criticalAlerts}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}