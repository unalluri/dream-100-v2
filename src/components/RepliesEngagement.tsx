import React from 'react';
import { useLeads } from '../hooks/useLeads';
import { 
  MessageSquare, 
  User, 
  Building, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const RepliesEngagement: React.FC = () => {
  const { leads, loading, error, updateLead } = useLeads();

  // Filter for leads with engagement (DM activity)
  const engagedLeads = leads.filter(lead => 
    lead.dm_1 || lead.dm_2 || lead.dm_3
  );

  // High priority leads (engaged but no meeting yet)
  const highPriorityLeads = engagedLeads.filter(lead => 
    !lead.booked_meeting
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20',
      in_sequence: 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20',
      completed: 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20',
      paused: 'bg-[#6b7280]/10 text-[#6b7280] border border-[#6b7280]/20'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#0f172a] p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1e293b] rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#0f172a] p-6">
        <div className="bg-[#1e293b] border border-[#dc2626]/20 rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-[#dc2626] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#dc2626] mb-2">Error Loading Engagement Data</h3>
          <p className="text-[#9ca3af]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f172a]">
      {/* Header */}
      <div className="p-6 border-b border-[#334155]">
        <h1 className="text-2xl font-semibold text-white">Replies</h1>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 hover:bg-[#334155] transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <MessageSquare className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">{engagedLeads.length}</p>
                <p className="text-[#9CA3AF] text-sm">Total Engaged</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 hover:bg-[#334155] transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <AlertCircle className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">{highPriorityLeads.length}</p>
                <p className="text-[#9CA3AF] text-sm">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 hover:bg-[#334155] transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <CheckCircle2 className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">
                  {engagedLeads.filter(l => l.booked_meeting).length}
                </p>
                <p className="text-[#9CA3AF] text-sm">Converted</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 hover:bg-[#334155] transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">
                  {engagedLeads.length > 0 
                    ? ((engagedLeads.filter(l => l.booked_meeting).length / engagedLeads.length) * 100).toFixed(1)
                    : 0
                  }%
                </p>
                <p className="text-[#9CA3AF] text-sm">Conversion Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Engaged Leads */}
        <div className="space-y-4">
          {engagedLeads.length > 0 ? (
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a] border-b border-[#334155]">
                    <tr>
                      <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Lead</th>
                      <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Company</th>
                      <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Status</th>
                      <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Engagement</th>
                      <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Last Activity</th>
                      <th className="text-center p-4 text-[#9CA3AF] font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {engagedLeads.map((lead) => (
                      <tr key={lead.process_id} className="hover:bg-[#0f172a] transition-all duration-150 ease-out">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              lead.booked_meeting
                                ? 'bg-[#10b981]'
                                : 'bg-[#14b8a6]'
                            }`}>
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{lead.lead_name}</p>
                              {lead.booked_meeting && (
                                <div className="flex items-center gap-1 mt-1">
                                  <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
                                  <span className="text-xs text-[#10b981]">Meeting Booked</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">{lead.lead_company_name || 'Unknown Company'}</p>
                          <p className="text-sm text-[#9CA3AF]">{lead.industry || 'Unknown Industry'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.lead_status || 'pending')}`}>
                            {lead.lead_status || 'pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {lead.dm_3 && (
                              <span className="px-2 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs rounded-full border border-[#8b5cf6]/20">
                                DM3
                              </span>
                            )}
                            {lead.dm_2 && (
                              <span className="px-2 py-1 bg-[#f59e0b]/10 text-[#f59e0b] text-xs rounded-full border border-[#f59e0b]/20">
                                DM2
                              </span>
                            )}
                            {lead.dm_1sent && (
                              <span className="px-2 py-1 bg-[#3b82f6]/10 text-[#3b82f6] text-xs rounded-full border border-[#3b82f6]/20">
                                DM1
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-[#9CA3AF] text-sm">about 3 hours ago</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            {!lead.booked_meeting ? (
                              <button
                                onClick={() => updateLead(lead.process_id, { booked_meeting: true })}
                                className="px-3 py-1 bg-[#10b981] hover:bg-[#059669] text-white text-sm rounded-2xl transition-colors flex items-center gap-1"
                              >
                                <Calendar className="h-3 w-3" />
                                Book
                              </button>
                            ) : (
                              <span className="text-[#10b981] text-sm font-medium">✓ Converted</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-[#9CA3AF] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Engaged Leads Yet</h3>
              <p className="text-[#9CA3AF]">Continue your outreach campaigns to generate engagement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepliesEngagement;