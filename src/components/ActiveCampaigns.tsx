import React, { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import LeadDetailModal from './LeadDetailModal';
import TogglePill from './TogglePill';
import { 
  Target, 
  Send, 
  MessageSquare, 
  CheckCircle,
  User,
  Building
} from 'lucide-react';

const ActiveCampaigns: React.FC = () => {
  const { leads, loading, error, updateLead, deleteLead } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter for active campaign leads (connected but not booked)
  const activeCampaignLeads = leads.filter(lead => 
    lead.connection_accepted_status && !lead.booked_meeting
  );

  const handleRowClick = (lead: any) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handlePillClick = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation(); // Prevent row click
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-base p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-panels rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-base p-6">
        <div className="bg-panels border border-[#14b8a6]/20 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-[#14b8a6] mb-2">Error Loading Campaigns</h3>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-semibold text-text">Active Campaigns</h1>
      </div>

      <div className="p-6">
        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <Target className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">{activeCampaignLeads.length}</p>
                <p className="text-muted text-sm">Active Campaigns</p>
              </div>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <Send className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">
                  {activeCampaignLeads.filter(l => l.dm_1sent).length}
                </p>
                <p className="text-muted text-sm">DM1 Sent</p>
              </div>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <MessageSquare className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">
                  {activeCampaignLeads.filter(l => l.dm_2sent).length}
                </p>
                <p className="text-muted text-sm">DM2 Sent</p>
              </div>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">
                  {activeCampaignLeads.filter(l => l.dm_3sent).length}
                </p>
                <p className="text-muted text-sm">DM3 Sent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Table */}
        {activeCampaignLeads.length > 0 ? (
          <div className="bg-panels border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-elevated border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-muted font-medium text-sm">Lead</th>
                    <th className="text-left p-4 text-muted font-medium text-sm">Company</th>
                    <th className="text-center p-4 text-muted font-medium text-sm">Connection Request</th>
                    <th className="text-center p-4 text-muted font-medium text-sm">Connected</th>
                    <th className="text-center p-4 text-muted font-medium text-sm">DM1 Sent</th>
                    <th className="text-center p-4 text-muted font-medium text-sm">DM2 Sent</th>
                    <th className="text-center p-4 text-muted font-medium text-sm">DM3 Sent</th>
                    <th className="text-center p-4 text-muted font-medium text-sm">Meeting Booked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {activeCampaignLeads.map((lead) => (
                    <tr 
                      key={lead.process_id} 
                      className="hover:bg-elevated transition-all duration-150 ease-out cursor-pointer"
                      onClick={() => handleRowClick(lead)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#14b8a6] rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-text">{lead.lead_name}</p>
                            <p className="text-sm text-muted">{lead.job_title || 'Unknown Title'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted" />
                          <div>
                            <p className="text-text font-medium">{lead.lead_company_name || 'Unknown Company'}</p>
                            <p className="text-sm text-muted">{lead.industry || 'Unknown Industry'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <TogglePill
                          label="Sent"
                          isOn={!!lead.connection_request_message}
                          onClick={(e) => handlePillClick(e, lead)}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <TogglePill
                          label="Connected"
                          isOn={!!lead.connection_accepted_status}
                          onClick={(e) => handlePillClick(e, lead)}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <TogglePill
                          label="DM1"
                          isOn={!!lead.dm_1sent}
                          onClick={(e) => handlePillClick(e, lead)}
                          disabled={!lead.connection_accepted_status}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <TogglePill
                          label="DM2"
                          isOn={!!lead.dm_2sent}
                          onClick={(e) => handlePillClick(e, lead)}
                          disabled={!lead.dm_1sent}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <TogglePill
                          label="DM3"
                          isOn={!!lead.dm_3sent}
                          onClick={(e) => handlePillClick(e, lead)}
                          disabled={!lead.dm_2sent}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <TogglePill
                          label="Booked"
                          isOn={!!lead.booked_meeting}
                          onClick={(e) => handlePillClick(e, lead)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No Active Campaigns</h3>
            <p className="text-muted">Start by connecting with leads to begin your outreach campaigns</p>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        lead={selectedLead}
        onUpdate={updateLead}
        onDelete={deleteLead}
      />
    </div>
  );
};

export default ActiveCampaigns;