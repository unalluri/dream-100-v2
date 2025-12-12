import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AllLeads from './components/AllLeads';
import ActiveCampaigns from './components/ActiveCampaigns';
import BookedMeetings from './components/BookedMeetings';
import AddLeadModal from './components/AddLeadModal';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'all-leads':
        return <AllLeads onOpenAddModal={() => setShowAddModal(true)} />;
      case 'active-campaigns':
        return <ActiveCampaigns />;
      case 'meetings':
        return <BookedMeetings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* Main Content */}
      <main className="ml-64 flex flex-col min-h-screen">
        {renderActiveSection()}
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onLeadAdded={() => {
          // Refresh will happen automatically via the modal
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

export default App;