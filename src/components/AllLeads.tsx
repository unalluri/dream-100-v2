import React, { useState, useMemo } from 'react';
import { useLeads } from '../hooks/useLeads';
import { toast } from 'react-hot-toast';
import LeadDetailModal from './LeadDetailModal';
import { Search, Plus, ExternalLink, CreditCard as Edit, Users, Linkedin } from 'lucide-react';

interface AllLeadsProps {
  onOpenAddModal: () => void;
}

const AllLeads: React.FC<AllLeadsProps> = ({ onOpenAddModal }) => {
  const { leads, loading, error, deleteLead, updateLead, refetch } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter leads based on search
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lead.lead_name.toLowerCase().includes(searchLower) ||
        (lead.lead_company_name || '').toLowerCase().includes(searchLower) ||
        (lead.industry || '').toLowerCase().includes(searchLower) ||
        (lead.job_title || '').toLowerCase().includes(searchLower)
      );
    });
  }, [leads, searchTerm]);

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleRowClick = (lead: any) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const getLeadStatus = (lead: any) => {
    if (lead.booked_meeting) {
      return 'completed';
    } else if (lead.connection_accepted_status) {
      return 'in_sequence';
    } else {
      return 'pending';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20',
      in_sequence: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20',
      completed: 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20',
      paused: 'bg-[#6b7280]/10 text-[#6b7280] border border-[#6b7280]/20'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };


  if (loading) {
    return (
      <div className="flex-1 bg-base">
        <div className="p-6 space-y-4 animate-fade-in">
          <div className="h-8 bg-panels rounded-2xl w-1/4 animate-pulse"></div>
          <div className="h-16 bg-panels rounded-2xl animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-panels rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-base p-6">
        <div className="glass-panel rounded-2xl p-6 text-center border border-[#10b981]/20">
          <h3 className="text-lg font-heading font-semibold text-[#10b981] mb-2">Error Loading Leads</h3>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f172a]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#334155]">
        <h1 className="text-2xl font-semibold text-white">All Leads</h1>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#0d9488] text-white rounded-lg transition-all duration-150 ease-out font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-[#334155]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search leads and companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#10b981] transition-all duration-150 ease-out"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[#0f172a]">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#0f172a] border-b border-[#334155]">
            <tr>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Name</th>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Company</th>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Industry</th>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Job Title</th>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Status</th>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Updated</th>
              <th className="text-left p-4 text-[#9CA3AF] font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filteredLeads.map((lead) => (
              <tr
                key={lead.process_id}
                className="hover:bg-[#1e293b] transition-all duration-150 ease-out cursor-pointer group"
                onClick={() => {
                  setSelectedLead(lead);
                  setShowDetailModal(true);
                }}
              >
                <td className="p-4">
                  <div className="text-white font-medium">{lead.lead_name}</div>
                </td>
                <td className="p-4">
                  <div className="text-[#9CA3AF]">{lead.lead_company_name || '-'}</div>
                </td>
                <td className="p-4">
                  <div className="text-[#9CA3AF]">{lead.industry || '-'}</div>
                </td>
                <td className="p-4">
                  <div className="text-[#9CA3AF]">{lead.job_title || '-'}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(getLeadStatus(lead))}`}>
                    {getLeadStatus(lead).replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-[#9CA3AF] text-sm">
                    {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'about 3 hours ago'}
                  </div>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <a
                      href={lead.lead_linkedin_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#334155] rounded transition-all duration-100 ease-out opacity-0 group-hover:opacity-100"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                        setShowDetailModal(true);
                      }}
                      className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#334155] rounded transition-all duration-100 ease-out opacity-0 group-hover:opacity-100"
                      title="Edit Lead"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLeads.length === 0 && !loading && (
        <div className="text-center py-12 animate-fade-in">
          <Users className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
          <p className="text-[#9CA3AF]">No leads found matching your criteria</p>
        </div>
      )}

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

export default AllLeads;