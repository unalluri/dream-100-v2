import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  MessageSquare, 
  Calendar,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenAddModal: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all-leads', label: 'All Leads', icon: Users },
  { id: 'active-campaigns', label: 'Active Campaigns', icon: Target },
  { id: 'meetings', label: 'Booked', icon: Calendar },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
  onOpenAddModal
}) => {
  return (
    <div className="fixed left-0 top-0 w-64 bg-[#002447] border-r border-[#003366] h-screen flex flex-col z-10">
      {/* Header */}
      <div className="p-6 border-b border-[#003366]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#14b8a6]/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl animate-pulse"></div>
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-ping" style={{animationDuration: '2s'}} />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 2v4M12 18v4M22 12h-4M6 12H2" strokeLinecap="round" />
              <path d="M19 5l-2.8 2.8M7.8 16.2L5 19M19 19l-2.8-2.8M7.8 7.8L5 5" strokeLinecap="round" className="animate-spin" style={{transformOrigin: 'center', animationDuration: '8s'}} />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Dream 100</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ease-out group ${
                    isActive
                      ? 'bg-[#14b8a6] text-white'
                      : 'text-[#9CA3AF] hover:bg-[#003366] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  
                  {item.count && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#14b8a6] text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Add Lead Button */}
      <div className="p-4 border-t border-[#003366]">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-lg transition-all duration-150 ease-out flex items-center justify-center gap-2 text-sm font-medium"
        >
          <span className="text-lg">+</span>
          Add Lead
        </button>
      </div>
    </div>
  );
};

export default Sidebar;