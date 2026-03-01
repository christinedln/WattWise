import { Search } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices, alerts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>
    </div>
  );
}
