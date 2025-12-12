import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, Globe, Briefcase, MessageSquare, Calendar, Clock, CheckCircle2, AlertCircle, Copy, CreditCard as Edit3, Save, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { leadEditSchema, LeadEditFormData } from '../lib/validations';

// Webhook function to trigger n8n workflow for connection accepted
const triggerConnectionWebhook = async (leadData: any) => {
  try {
    const webhookUrl = import.meta.env.VITE_CONNECTION_ACCEPTED_WEBHOOK_URL;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...leadData,
     dm_1: 'not_sent',
     dm_2: 'not_sent', 
     dm_3: 'not_sent'
    })
    });

    if (!response.ok) {
      console.warn('Connection webhook trigger failed:', response.status, response.statusText);
    } else {
      console.log('Connection webhook triggered successfully');
    }
  } catch (error) {
    console.warn('Connection webhook unavailable - continuing without external notification:', error);
  }
};

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onUpdate: (process_id: string, updates: any) => Promise<void>;
  onDelete: (process_id: string) => Promise<void>;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  lead, 
  onUpdate, 
  onDelete 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [messageStatuses, setMessageStatuses] = useState({
    connection_request: 'not_sent',
    dm_1: 'not_sent',
    dm_2: 'not_sent',
    dm_3: 'not_sent'
  });

  // Toggle states - NO RELATION to message fields
  const [connectionRequestSent, setConnectionRequestSent] = useState(false);
  const [connectionAccepted, setConnectionAccepted] = useState(false);
  const [dm1Sent, setDm1Sent] = useState(false);
  const [dm2Sent, setDm2Sent] = useState(false);
  const [dm3Sent, setDm3Sent] = useState(false);
  const [bookedMeeting, setBookedMeeting] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadEditFormData>({
    resolver: zodResolver(leadEditSchema),
  });

  useEffect(() => {
    if (lead) {
      const isNewLead = currentLeadId !== lead.process_id;

      reset({
        lead_name: lead.lead_name || '',
        lead_company_name: lead.lead_company_name || '',
        lead_email: lead.lead_email || '',
        lead_phone_number: lead.lead_phone_number || '',
        job_title: lead.job_title || '',
        industry: lead.industry || '',
        lead_linkedin_url: lead.lead_linkedin_url || '',
        lead_company_linkedin_url: lead.lead_company_linkedin_url || '',
        company_website: lead.company_website || '',
        potential_services: lead.potential_services || '',
        connection_request_message: lead.connection_request_message || '',
      });

      // Update current lead ID
      if (isNewLead) {
        setCurrentLeadId(lead.process_id);
      }

      // Always sync all toggles from database
      setConnectionRequestSent(!!lead.connection_request_sent);
      setConnectionAccepted(!!lead.connection_accepted_status);
      setDm1Sent(!!lead.dm_1sent);
      setDm2Sent(!!lead.dm_2sent);
      setDm3Sent(!!lead.dm_3sent);
      setBookedMeeting(!!lead.booked_meeting);

      // Initialize message statuses
      setMessageStatuses({
        connection_request: 'not_sent',
        dm_1: 'not_sent',
        dm_2: 'not_sent',
        dm_3: 'not_sent'
      });
    }
  }, [lead, reset, currentLeadId]);

  const handleToggleUpdate = async (field: string, newValue: boolean) => {
    if (!lead) return;

    setLoading(true);
    try {
      const updates: any = {};

      switch (field) {
        case 'connection_request_sent':
          updates.connection_request_sent = newValue;
          setConnectionRequestSent(newValue);
          break;

        case 'connection_accepted_status':
          updates.connection_accepted_status = newValue;
          setConnectionAccepted(newValue);

          // Trigger webhook when connection is accepted
          if (newValue) {
            await triggerConnectionWebhook({
              process_id: lead.process_id,
              lead_name: lead.lead_name,
              lead_company_name: lead.lead_company_name,
              lead_email: lead.lead_email
            });
          }
          break;

        case 'dm_1sent':
          updates.dm_1sent = newValue;
          if (newValue) {
            updates.dm1_timestamp = new Date().toISOString();
          } else {
            updates.dm1_timestamp = null;
          }
          setDm1Sent(newValue);
          break;

        case 'dm_2sent':
          updates.dm_2sent = newValue;
          setDm2Sent(newValue);
          break;

        case 'dm_3sent':
          updates.dm_3sent = newValue;
          setDm3Sent(newValue);
          break;

        case 'booked_meeting':
          updates.booked_meeting = newValue;
          setBookedMeeting(newValue);
          break;

        default:
          console.warn('Unknown toggle field:', field);
          setLoading(false);
          return;
      }

      await onUpdate(lead.process_id, updates);
      toast.success('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LeadEditFormData) => {
    if (!lead) return;

    setLoading(true);
    try {
      await onUpdate(lead.process_id, data);
      toast.success('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lead || !confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(lead.process_id);
      toast.success('Lead deleted successfully!');
      onClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to parse JSON messages
  const parseMessageContent = (messageData: string | null) => {
    if (!messageData) return null;

    try {
      // If it's already parsed JSON
      if (typeof messageData === 'object') {
        return messageData;
      }

      // Try to parse as JSON
      const parsed = JSON.parse(messageData);
      return parsed;
    } catch (error) {
      // If not JSON, return as plain text
      return { default: messageData };
    }
  };

  // Helper function to render message value (handles strings and objects)
  const renderMessageValue = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      // If it's an object with a 'message' property, return that
      if (value.message) {
        return value.message;
      }
      // Otherwise, stringify it
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Helper function to get message variant label
  const getVariantLabel = (key: string) => {
    const labels: Record<string, string> = {
      positive_confirmation: 'POSITIVE CONFIRMATION',
      partial_agreement: 'PARTIAL AGREEMENT',
      negative_off_target: 'NEGATIVE OFF TARGET',
      technical_question: 'TECHNICAL QUESTION',
      step_2: 'STEP 2',
      step_3: 'STEP 3',
      step_4: 'STEP 4',
      step6_video_followup: 'STEP6 VIDEO FOLLOWUP',
      step7_video_engaged: 'STEP7 VIDEO ENGAGED',
      step7_no_video_response: 'STEP7 NO VIDEO RESPONSE',
      default: 'MESSAGE'
    };
    return labels[key] || key.toUpperCase().replace(/_/g, ' ');
  };

  const getCurrentStage = () => {
    if (bookedMeeting) return 'Meeting Booked';
    if (dm1Sent) return 'DM1 Sent';
    if (connectionAccepted) return 'Connection Accepted';
    if (connectionRequestSent) return 'Connection Request Sent';
    return 'New Lead';
  };

  const getNextAction = () => {
    if (bookedMeeting) return 'Follow up on meeting';
    if (dm1Sent) return 'Wait for response or send follow-up';
    if (connectionAccepted) return 'Send first DM';
    if (connectionRequestSent) return 'Wait for connection acceptance';
    return 'Send connection request';
  };

  const copyToClipboard = async (text: string, messageType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${messageType} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  const handleEditMessage = (messageKey: string, currentContent: string) => {
    setEditingMessage(messageKey);
    setEditedContent(currentContent);
  };

  const handleSaveMessage = async (messageKey: string) => {
    if (!lead) return;

    setLoading(true);
    try {
      const updates = { [messageKey]: editedContent };
      await onUpdate(lead.process_id, updates);
      setEditingMessage(null);
      setEditedContent('');
      toast.success('Message updated successfully!');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditedContent('');
  };

  const handleStatusChange = async (messageKey: string, newStatus: string) => {
    if (!lead) return;

    setLoading(true);
    try {
      const updates: any = {};
      
      if (messageKey === 'dm_1') {
        updates.dm_1sent = newStatus === 'sent';
        if (newStatus === 'sent') {
          updates.dm1_timestamp = new Date().toISOString();
        } else {
          updates.dm1_timestamp = null;
        }
      }
      // Add similar logic for dm_2 and dm_3 if needed
      
      await onUpdate(lead.process_id, updates);
      setMessageStatuses(prev => ({ ...prev, [messageKey]: newStatus }));
      toast.success(`Message status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Failed to update message status');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysSinceDM1 = () => {
    if (!lead?.dm1_timestamp) return 0;
    const dm1Date = new Date(lead.dm1_timestamp);
    const now = new Date();
    return Math.floor((now.getTime() - dm1Date.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!isOpen || !lead) return null;

  const daysSinceDM1 = calculateDaysSinceDM1();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panels border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-text">{lead.lead_name}</h2>
              <p className="text-muted text-sm">{lead.lead_company_name || 'Unknown Company'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-muted" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {['details', 'messages', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#10b981] border-b-2 border-[#10b981]'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#10b981]" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted text-sm">Industry:</p>
                      <p className="text-text font-medium">{lead.industry || 'Information Technology & Services'}</p>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-[#10b981]" />
                    Company Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted text-sm">Company:</p>
                      <p className="text-text font-medium">{lead.lead_company_name || 'SW Cybernetics'}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#10b981]" />
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    {lead.lead_linkedin_url && (
                      <a
                        href={lead.lead_linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        LinkedIn Profile
                      </a>
                    )}
                    {lead.lead_company_linkedin_url && (
                      <a
                        href={lead.lead_company_linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Company LinkedIn
                      </a>
                    )}
                    {lead.company_website && (
                      <a
                        href={lead.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Company Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Campaign Progress */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                    Campaign Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Current Stage:</span>
                      <span className="text-[#10b981] font-medium">{getCurrentStage()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Next Action:</span>
                      <span className="text-text font-medium">{getNextAction()}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#10b981]" />
                    Connection Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text font-medium">Connection Request Sent</span>
                      <button
                        onClick={() => handleToggleUpdate('connection_request_sent', !connectionRequestSent)}
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          connectionRequestSent ? 'bg-[#10b981]' : 'bg-gray-600'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            connectionRequestSent ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text font-medium">Connection Accepted</span>
                      <button
                        onClick={() => handleToggleUpdate('connection_accepted_status', !connectionAccepted)}
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          connectionAccepted ? 'bg-[#10b981]' : 'bg-gray-600'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            connectionAccepted ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* DM Status */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#10b981]" />
                    DM Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text font-medium">DM1 Sent</span>
                      <button
                        onClick={() => handleToggleUpdate('dm_1sent', !dm1Sent)}
                        disabled={loading || !connectionAccepted}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          dm1Sent ? 'bg-[#10b981]' : 'bg-gray-600'
                        } ${(loading || !connectionAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            dm1Sent ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text font-medium">DM2 Sent</span>
                      <button
                        onClick={() => handleToggleUpdate('dm_2sent', !dm2Sent)}
                        disabled={loading || !dm1Sent}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          dm2Sent ? 'bg-[#10b981]' : 'bg-gray-600'
                        } ${(loading || !dm1Sent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            dm2Sent ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text font-medium">DM3 Sent</span>
                      <button
                        onClick={() => handleToggleUpdate('dm_3sent', !dm3Sent)}
                        disabled={loading || !dm2Sent}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          dm3Sent ? 'bg-[#10b981]' : 'bg-gray-600'
                        } ${(loading || !dm2Sent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            dm3Sent ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meeting Status */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#10b981]" />
                    Meeting Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text font-medium">Meeting Booked</span>
                      <button
                        onClick={() => handleToggleUpdate('booked_meeting', !bookedMeeting)}
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          bookedMeeting ? 'bg-[#10b981]' : 'bg-gray-600'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            bookedMeeting ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-text flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#10b981]" />
                  Messages
                </h3>
              </div>
              
              <div className="space-y-6">
                {/* Connection Request Message */}
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="flex items-center p-4 bg-elevated border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="text-lg font-heading font-semibold text-text">Connection Request</h4>
                        <p className="text-muted text-sm">Initial connection request message</p>
                      </div>
                    </div>
                  </div>
                  
                  {lead.connection_request_message && (
                    <div className="p-6 bg-base">
                      <div className="flex items-center justify-end gap-2 mb-4">
                        <button
                          onClick={() => copyToClipboard(lead.connection_request_message, 'Connection Request')}
                          className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                          title="Copy message"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditMessage('connection_request_message', lead.connection_request_message)}
                          className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                          title="Edit message"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {editingMessage === 'connection_request_message' ? (
                        <div className="space-y-4">
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full p-4 bg-elevated border border-white/10 rounded-lg text-text resize-vertical focus:outline-none focus:border-[#10b981] min-h-[150px]"
                            rows={8}
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSaveMessage('connection_request_message')}
                              disabled={loading}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-elevated border border-white/10 rounded-lg p-4">
                          <div className="text-text whitespace-pre-wrap leading-relaxed text-sm">
                            {lead.connection_request_message}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!lead.connection_request_message && (
                    <div className="p-6 bg-base text-center">
                      <p className="text-muted text-sm">No connection request message available</p>
                    </div>
                  )}
                </div>

                {/* DM1 - Initial Message */}
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-elevated border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="text-lg font-heading font-semibold text-text">DM1 - Initial Message</h4>
                        <p className="text-muted text-sm">First direct message after connection</p>
                      </div>
                    </div>
                    <select
                      value={messageStatuses.dm_1}
                      onChange={(e) => handleStatusChange('dm_1', e.target.value)}
                      disabled={loading}
                      className="px-3 py-2 bg-base border border-white/10 rounded-lg text-text text-sm focus:outline-none focus:border-[#10b981] disabled:opacity-50"
                    >
                      <option value="not_sent">Not Sent</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                  
                  {lead.dm_1 && (
                    <div className="p-6 bg-base">
                      {(() => {
                        const messageContent = parseMessageContent(lead.dm_1);
                        if (!messageContent) return null;
                        
                        return Object.entries(messageContent).map(([key, value]) => (
                          <div key={key} className="mb-6 last:mb-0">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30">
                                  {getVariantLabel(key)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => copyToClipboard(renderMessageValue(value), `DM1 - ${getVariantLabel(key)}`)}
                                  className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                  title="Copy message"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditMessage(`dm_1_${key}`, renderMessageValue(value))}
                                  className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                  title="Edit message"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {editingMessage === `dm_1_${key}` ? (
                              <div className="space-y-4">
                                <textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="w-full p-4 bg-elevated border border-white/10 rounded-lg text-text resize-vertical focus:outline-none focus:border-[#10b981] min-h-[200px]"
                                  rows={10}
                                />
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleSaveMessage(`dm_1_${key}`)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-elevated border border-white/10 rounded-lg p-4">
                                <div className="text-text whitespace-pre-wrap leading-relaxed text-sm break-words">
                                  {renderMessageValue(value)}
                                </div>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                  
                  {!lead.dm_1 && (
                    <div className="p-6 bg-base text-center">
                      <p className="text-muted text-sm">No message content available</p>
                    </div>
                  )}
                </div>

                {/* DM2 - Follow-up */}
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-elevated border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <h4 className="text-lg font-heading font-semibold text-text">DM2 - Follow-up</h4>
                        <p className="text-muted text-sm">Follow-up message (3 days after DM1)</p>
                      </div>
                    </div>
                    <select
                      value={messageStatuses.dm_2}
                      onChange={(e) => handleStatusChange('dm_2', e.target.value)}
                      disabled={loading}
                      className="px-3 py-2 bg-base border border-white/10 rounded-lg text-text text-sm focus:outline-none focus:border-[#10b981] disabled:opacity-50"
                    >
                      <option value="not_sent">Not Sent</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                  
                  {lead.dm_2 && (
                    <div className="p-6 bg-base">
                      {(() => {
                        const messageContent = parseMessageContent(lead.dm_2);
                        if (!messageContent) return null;
                        
                        return Object.entries(messageContent).map(([key, value]) => (
                          <div key={key} className="mb-6 last:mb-0">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded border border-yellow-500/30">
                                  {getVariantLabel(key)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => copyToClipboard(renderMessageValue(value), `DM2 - ${getVariantLabel(key)}`)}
                                  className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                  title="Copy message"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditMessage(`dm_2_${key}`, renderMessageValue(value))}
                                  className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                  title="Edit message"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {editingMessage === `dm_2_${key}` ? (
                              <div className="space-y-4">
                                <textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="w-full p-4 bg-elevated border border-white/10 rounded-lg text-text resize-vertical focus:outline-none focus:border-[#10b981] min-h-[200px]"
                                  rows={10}
                                />
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleSaveMessage(`dm_2_${key}`)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-elevated border border-white/10 rounded-lg p-4">
                                <div className="text-text whitespace-pre-wrap leading-relaxed text-sm break-words">
                                  {renderMessageValue(value)}
                                </div>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                  
                  {!lead.dm_2 && (
                    <div className="p-6 bg-base text-center">
                      <p className="text-muted text-sm">No message content available</p>
                    </div>
                  )}
                </div>

                {/* DM3 - Final Follow-up */}
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-elevated border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <h4 className="text-lg font-heading font-semibold text-text">DM3 - Final Follow-up</h4>
                        <p className="text-muted text-sm">Final follow-up message (5 days after DM2)</p>
                      </div>
                    </div>
                    <select
                      value={messageStatuses.dm_3}
                      onChange={(e) => handleStatusChange('dm_3', e.target.value)}
                      disabled={loading}
                      className="px-3 py-2 bg-base border border-white/10 rounded-lg text-text text-sm focus:outline-none focus:border-[#10b981] disabled:opacity-50"
                    >
                      <option value="not_sent">Not Sent</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                  
                  {lead.dm_3 && (
                    <div className="p-6 bg-base">
                      {(() => {
                        const messageContent = parseMessageContent(lead.dm_3);
                        if (!messageContent) return null;
                        
                        return Object.entries(messageContent).map(([key, value]) => (
                          <div key={key} className="mb-6 last:mb-0">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded border border-purple-500/30">
                                  {getVariantLabel(key)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => copyToClipboard(renderMessageValue(value), `DM3 - ${getVariantLabel(key)}`)}
                                  className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                  title="Copy message"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditMessage(`dm_3_${key}`, renderMessageValue(value))}
                                  className="p-2 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                  title="Edit message"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {editingMessage === `dm_3_${key}` ? (
                              <div className="space-y-4">
                                <textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="w-full p-4 bg-elevated border border-white/10 rounded-lg text-text resize-vertical focus:outline-none focus:border-[#10b981] min-h-[200px]"
                                  rows={10}
                                />
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleSaveMessage(`dm_3_${key}`)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-elevated border border-white/10 rounded-lg p-4">
                                <div className="text-text whitespace-pre-wrap leading-relaxed text-sm break-words">
                                  {renderMessageValue(value)}
                                </div>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                  
                  {!lead.dm_3 && (
                    <div className="p-6 bg-base text-center">
                      <p className="text-muted text-sm">No message content available</p>
                    </div>
                  )}
                </div>

                {!lead.connection_request_message && !lead.dm_1 && !lead.dm_2 && !lead.dm_3 && (
                  <div className="text-center py-12 glass-panel rounded-xl">
                    <MessageSquare className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted">No messages available for this lead</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#10b981]" />
                Timeline
              </h3>
              
              <div className="space-y-4">
                {/* DM1 Timeline */}
                {lead.dm_1sent && lead.dm1_timestamp && (
                  <div className="glass-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-medium text-text">DM1 Sent</h4>
                      </div>
                      <span className="text-muted text-sm">
                        {new Date(lead.dm1_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted" />
                        <span className="text-muted text-sm">
                          {daysSinceDM1} days ago
                        </span>
                      </div>
                      {daysSinceDM1 >= 3 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                          <AlertCircle className="h-3 w-3 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">
                            Reminder: Follow up ready
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lead Created */}
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h4 className="font-medium text-text">Lead Created</h4>
                    </div>
                    <span className="text-muted text-sm">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <p className="text-muted text-sm">Lead was added to the system</p>
                </div>

                {!lead.dm_1sent && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted">No timeline events yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === 'details' && (
          <div className="flex justify-between items-center p-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl transition-all hover:shadow-lg hover:shadow-[#14b8a6]/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {deleting ? 'Deleting...' : 'Delete Lead'}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-muted hover:text-text transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailModal;