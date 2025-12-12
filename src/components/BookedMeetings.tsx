import React from 'react';
import { useLeads } from '../hooks/useLeads';
import { 
  Calendar, 
  User, 
  Building, 
  Trophy,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const BookedMeetings: React.FC = () => {
  const { leads, loading, error } = useLeads();

  // Filter for leads with booked meetings
  const bookedMeetings = leads.filter(lead => lead.booked_meeting);

  // Calculate success metrics
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? (bookedMeetings.length / totalLeads * 100) : 0;
  
  // Group by industry for analytics
  const industryStats = bookedMeetings.reduce((acc, lead) => {
    const industry = lead.industry || 'Unknown';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      in_sequence: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
      paused: 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-base p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-panels rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-base p-6">
        <div className="bg-panels border border-[#14b8a6]/20 rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-[#14b8a6] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#14b8a6] mb-2">Error Loading Meetings Data</h3>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-semibold text-text">Booked</h1>
      </div>

      <div className="p-6">
        {/* Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <Calendar className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">{bookedMeetings.length}</p>
                <p className="text-muted text-sm">Total Meetings</p>
              </div>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <Target className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">{conversionRate.toFixed(1)}%</p>
                <p className="text-muted text-sm">Conversion Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <DollarSign className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">${(bookedMeetings.length * 15000).toLocaleString()}</p>
                <p className="text-muted text-sm">Potential Pipeline</p>
              </div>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#14b8a6]/10 rounded-2xl">
                <Trophy className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text mb-1">
                  {bookedMeetings.filter(l => l.lead_status === 'completed').length}
                </p>
                <p className="text-muted text-sm">Converted Deals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Industry Performance */}
          <div className="bg-panels border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building className="h-5 w-5 text-[#14b8a6]" />
              <h2 className="text-lg font-semibold text-text">Performance by Industry</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(industryStats).length > 0 ? (
                Object.entries(industryStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="text-muted">{industry}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-[#14b8a6] h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(count / bookedMeetings.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-text font-medium min-w-[2rem] text-right">{count}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-muted text-center py-4">No industry data available</p>
              )}
            </div>
          </div>

          {/* Conversion Timeline */}
          <div className="bg-panels border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-5 w-5 text-[#14b8a6]" />
              <h2 className="text-lg font-semibold text-text">Recent Conversions</h2>
            </div>
            <div className="space-y-4">
              {bookedMeetings.slice(0, 5).map((lead) => (
                <div key={lead.process_id} className="flex items-center justify-between p-4 bg-elevated rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-150 ease-out">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-text" />
                    </div>
                    <div>
                      <p className="text-text font-medium">{lead.lead_name}</p>
                      <p className="text-muted text-sm">{lead.lead_company_name}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#14b8a6]" />
            <h2 className="text-lg font-semibold text-text">Successful Conversions</h2>
          </div>

          {bookedMeetings.length > 0 ? (
            <div className="bg-panels border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-elevated border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-muted font-medium text-sm">Lead</th>
                      <th className="text-left p-4 text-muted font-medium text-sm">Company</th>
                      <th className="text-left p-4 text-muted font-medium text-sm">Industry</th>
                      <th className="text-left p-4 text-muted font-medium text-sm">Status</th>
                      <th className="text-left p-4 text-muted font-medium text-sm">Journey</th>
                      <th className="text-left p-4 text-muted font-medium text-sm">Converted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {bookedMeetings
                      .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
                      .map((lead) => {
                        const journeySteps = [
                          lead.connection_request_message && '📤',
                          lead.connection_accepted_status && '🤝',
                          lead.dm_1sent && '💬',
                          lead.dm_2 && '📩',
                          lead.dm_3 && '📬',
                          lead.booked_meeting && '🎉'
                        ].filter(Boolean);

                        return (
                          <tr key={lead.process_id} className="hover:bg-elevated transition-all duration-150 ease-out">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-text" />
                                </div>
                                <div>
                                  <p className="font-medium text-text">{lead.lead_name}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
                                    <span className="text-xs text-[#10b981]">Meeting Booked</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-text font-medium">{lead.lead_company_name || 'Unknown Company'}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-muted">{lead.industry || 'Unknown'}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.lead_status || 'pending')}`}>
                                {lead.lead_status || 'pending'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                {journeySteps.map((step, index) => (
                                  <span key={index} className="text-lg">{step}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-muted text-sm">
                                {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'about 3 hours ago'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No Meetings Booked Yet</h3>
              <p className="text-muted">Continue your outreach campaigns to start booking meetings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookedMeetings;