import React from 'react';
import { useLeads } from '../hooks/useLeads';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Calendar,
  ExternalLink,
  Activity,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { leads, loading, error } = useLeads();

  if (loading) {
    return (
      <div className="flex-1 bg-base">
        <div className="mb-8 animate-fade-in">
          <div className="h-8 bg-panels rounded-2xl w-48 mb-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-panels border border-white/10 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-elevated rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-elevated rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-base p-6">
        <div className="bg-panels border border-[#10b981]/20 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-[#10b981] mb-2">Connection Error</h3>
          <p className="text-muted mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalLeads = leads.length;
  const messagesSent = leads.reduce((acc, lead) => {
    let count = 0;
    if (lead.dm_1sent) count++;
    if (lead.dm_2) count++;
    if (lead.dm_3) count++;
    return acc + count;
  }, 0);
  
  const totalReplied = leads.filter(lead => 
    lead.dm_1sent || lead.dm_2 || lead.dm_3
  ).length;
  
  const meetingsBooked = leads.filter(lead => lead.booked_meeting).length;
  const replyRate = totalLeads > 0 ? (totalReplied / totalLeads * 100) : 0;
  const conversionRate = totalLeads > 0 ? (meetingsBooked / totalLeads * 100) : 0;

  const recentActivities = leads
    .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
    .slice(0, 5);

  const quickStats = [
    { label: 'Active Campaigns', value: 19 },
    { label: 'Connection Requests Sent', value: 8 },
    { label: 'Connections Accepted', value: 7 },
    { label: 'Pending Follow-ups', value: 15 },
    { label: 'Success Rate', value: '4%' }
  ];

  return (
    <div className="flex-1 bg-base">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
      </div>

      <div className="p-6 animate-fade-in">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#10b981]/10 rounded-2xl">
                <Users className="h-6 w-6 text-[#10b981]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-text mb-1">{totalLeads}</p>
              <p className="text-muted text-sm">Total Leads</p>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#10b981]/10 rounded-2xl">
                <Send className="h-6 w-6 text-[#10b981]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-text mb-1">{messagesSent}</p>
              <p className="text-muted text-sm">Total DMs Sent</p>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#10b981]/10 rounded-2xl">
                <MessageSquare className="h-6 w-6 text-[#10b981]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-text mb-1">{totalReplied}</p>
              <p className="text-muted text-sm">Total Replied</p>
            </div>
          </div>

          <div className="bg-panels border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-150 ease-out">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#10b981]/10 rounded-2xl">
                <Calendar className="h-6 w-6 text-[#10b981]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-text mb-1">{meetingsBooked}</p>
              <p className="text-muted text-sm">Booked Calls</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-panels border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((lead) => {
                  let activityText = '';
                  const activities = [];
                  
                  if (lead.dm_1sent) activities.push('DM1 sent');
                  if (lead.dm_3) activities.push('DM3 sent');
                  if (lead.connection_accepted_status) activities.push('Connection accepted');
                  if (lead.booked_meeting) activities.push('Meeting booked');
                  
                  activityText = activities.join(', ') || 'Lead added';

                  return (
                    <div key={lead.process_id} className="flex items-center justify-between p-4 bg-elevated rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-150 ease-out">
                      <div className="flex-1">
                        <p className="text-text font-medium">
                          {lead.lead_name}: {activityText}
                        </p>
                        <p className="text-muted text-sm">
                          about 2 hours ago
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted mx-auto mb-2" />
                  <p className="text-muted">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-panels border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-lg font-semibold text-text">Quick Stats</h2>
            </div>
            <div className="space-y-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-elevated transition-all duration-150 ease-out">
                  <span className="text-muted">{stat.label}</span>
                  <span className="text-text font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;