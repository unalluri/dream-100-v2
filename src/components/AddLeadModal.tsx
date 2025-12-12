import React, { useState } from 'react';
import { X, User, Mail, Phone, Globe, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { leadSchema, LeadFormData } from '../lib/validations';

// Webhook function to trigger n8n workflow
const triggerWebhook = async (leadData: any) => {
  try {
    const webhookUrl = import.meta.env.VITE_ADD_LEAD_WEBHOOK_URL;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...leadData,
        source: 'manual_entry',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.warn('Webhook trigger failed:', response.status, response.statusText);
    } else {
      console.log('Webhook triggered successfully');
    }
  } catch (error) {
    console.warn('Webhook unavailable - continuing without external notification:', error);
    // Don't throw the error to prevent it from affecting the lead creation/update
  }
};

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onLeadAdded }) => {
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState<'single' | 'csv'>('single');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    try {
      // Trigger webhook after successful lead creation
      await triggerWebhook(data);
      
      toast.success('Lead submitted for processing!');
      
      onLeadAdded();
      onClose();
      reset();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to submit lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setCsvFile(file);
      toast.success(`File "${file.name}" selected successfully`);
    } else {
      toast.error('Please select a valid CSV or Excel file');
    }
  };

  const processCsvFile = async () => {
    if (!csvFile) return;

    setLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      console.log('CSV Headers:', headers);
      console.log('Total lines:', lines.length);
      
      const leads = [];
      const invalidLeads = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Handle CSV with quotes and commas properly
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^"|"$/g, ''));
          
          console.log(`Row ${i + 1} values:`, values);
          
          const lead: any = {
            lead_status: 'pending',
            connection_accepted_status: false,
            booked_meeting: false
          };

          headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';
            switch (header) {
              case 'name':
              case 'lead_name':
              case 'full_name':
              case 'fullname':
              case 'full name':
              case 'lead name':
                lead.lead_name = value;
                break;
              case 'company':
              case 'company_name':
              case 'lead_company_name':
              case 'company name':
              case 'lead company name':
                lead.lead_company_name = value || '';
                break;
              case 'email':
              case 'lead_email':
              case 'email address':
              case 'lead email':
                lead.lead_email = value || '';
                break;
              case 'phone':
              case 'phone_number':
              case 'lead_phone_number':
              case 'phone number':
              case 'lead phone number':
              case 'contact':
              case 'contact_number':
              case 'mobile':
              case 'mobile_number':
                lead.lead_phone_number = value || '';
                break;
              case 'job_title':
              case 'title':
              case 'position':
              case 'job title':
              case 'role':
              case 'designation':
              case 'job_position':
                lead.job_title = value || '';
                break;
              case 'industry':
              case 'sector':
              case 'business_type':
                lead.industry = value || '';
                break;
              case 'linkedin':
              case 'linkedin_url':
              case 'lead_linkedin_url':
              case 'linkedin_profile':
              case 'linkedin url':
              case 'linkedin profile':
              case 'lead linkedin url':
              case 'linkedin profile url':
                lead.lead_linkedin_url = value;
                break;
              case 'company_linkedin':
              case 'lead_company_linkedin_url':
              case 'company_linkedin_url':
              case 'company linkedin':
              case 'company linkedin url':
              case 'lead company linkedin url':
                lead.lead_company_linkedin_url = value || '';
                break;
              case 'website':
              case 'company_website':
              case 'website_url':
              case 'company website':
              case 'website url':
              case 'company_url':
              case 'site':
              case 'web':
                lead.company_website = value || '';
                break;
              case 'services':
              case 'potential_services':
              case 'potential services':
                lead.potential_services = value || '';
                break;
              case 'connection_status':
              case 'connected':
              case 'connection':
              case 'status':
                // Handle various connection status formats
                const connectionValue = value.toLowerCase();
                if (connectionValue === 'true' || connectionValue === 'yes' || 
                    connectionValue === '1' || connectionValue === 'connected' || 
                    connectionValue === 'accepted' || connectionValue === 'connection accepted') {
                  lead.connection_accepted_status = true;
                } else {
                  lead.connection_accepted_status = false;
                }
                break;
              case 'dm1':
              case 'dm_1':
              case 'message1':
              case 'first_message':
              case 'dm 1':
                lead.dm_1 = value || null;
                break;
              case 'dm2':
              case 'dm_2':
              case 'message2':
              case 'second_message':
              case 'dm 2':
                lead.dm_2 = value || null;
                break;
              case 'dm3':
              case 'dm_3':
              case 'message3':
              case 'third_message':
              case 'dm 3':
                lead.dm_3 = value || null;
                break;
              case 'booked_meeting':
              case 'meeting_booked':
              case 'meeting':
              case 'booked':
                const meetingValue = value.toLowerCase();
                if (meetingValue === 'true' || meetingValue === 'yes' || 
                    meetingValue === '1' || meetingValue === 'booked') {
                  lead.booked_meeting = true;
                } else {
                  lead.booked_meeting = false;
                }
                break;
            }
          });

          console.log('Processed lead:', lead);
          
          // Validate required fields
          const hasRequiredFields = lead.lead_name && lead.lead_linkedin_url;
          
          if (!hasRequiredFields) {
            invalidLeads.push({
              name: lead.lead_name || 'Unknown',
              row: i + 1,
              errors: `Missing: ${!lead.lead_name ? 'Name ' : ''}${!lead.lead_linkedin_url ? 'LinkedIn URL' : ''}`.trim()
            });
          } else {
            // Validate LinkedIn URL format
            const linkedinUrlRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
            if (!linkedinUrlRegex.test(lead.lead_linkedin_url)) {
              invalidLeads.push({
                name: lead.lead_name || 'Unknown',
                row: i + 1,
                errors: 'Invalid LinkedIn URL format (must start with https://linkedin.com/ or https://www.linkedin.com/)'
              });
            } else {
              // Ensure all fields have default values
              Object.keys(lead).forEach(key => {
                if (lead[key] === undefined || lead[key] === null) {
                  lead[key] = '';
                }
              });
              
              leads.push(lead);
            }
          }
        }
      }

      console.log('Valid leads to insert:', leads);
      console.log('Invalid leads:', invalidLeads);
      
      if (invalidLeads.length > 0) {
        const errorMessage = `${invalidLeads.length} leads skipped:\n${invalidLeads.map(l => `Row ${l.row}: ${l.name} - ${l.errors}`).join('\n')}`;
        console.error('Invalid leads details:', errorMessage);
        toast.error(`${invalidLeads.length} leads were skipped. Check console for details.`);
        
        if (leads.length === 0) {
          setLoading(false);
          return;
        }
      }

      if (leads.length === 0) {
        toast.error('No valid leads found in CSV/Excel file');
        setLoading(false);
        return;
      }
      
      // Trigger webhook for each imported lead
      for (const lead of leads) {
        await triggerWebhook({
          ...lead,
          source: 'csv_import'
        });
      }
      
      const successMessage = leads.length > 0 
        ? `Successfully submitted ${leads.length} leads for processing!${invalidLeads.length > 0 ? ` (${invalidLeads.length} skipped)` : ''}`
        : 'No valid leads found to import';
      
      toast.success(successMessage);
      onLeadAdded();
      onClose();
      setCsvFile(null);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error(`Error importing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panels border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text">Add New Lead</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('single')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                importMode === 'single'
                  ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/25'
                  : 'bg-elevated text-muted hover:text-text hover:bg-white/5'
              }`}
            >
              Single Lead
            </button>
            <button
              onClick={() => setImportMode('csv')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                importMode === 'csv'
                  ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/25'
                  : 'bg-elevated text-muted hover:text-text hover:bg-white/5'
              }`}
            >
              CSV Import
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {importMode === 'single' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Lead Information */}
              <div className="bg-elevated rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#10b981]" />
                  Lead Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('lead_name')}
                      className="w-full px-4 py-3 bg-base border border-white/10 rounded-xl text-text placeholder-muted focus:outline-none focus:border-[#10b981]/50 focus:shadow-lg focus:shadow-[#10b981]/10 transition-all"
                      placeholder="John Smith"
                    />
                    {errors.lead_name && (
                      <p className="text-[#10b981] text-sm mt-1">{errors.lead_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Job Title
                    </label>
                    <input
                      {...register('job_title')}
                      className="w-full px-4 py-3 bg-base border border-white/10 rounded-xl text-text placeholder-muted focus:outline-none focus:border-[#10b981]/50 focus:shadow-lg focus:shadow-[#10b981]/10 transition-all"
                      placeholder="CEO, CTO, VP of Engineering"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-elevated rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#10b981]" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Email Address
                    </label>
                    <input
                      {...register('lead_email')}
                      type="email"
                      className="w-full px-4 py-3 bg-base border border-white/10 rounded-xl text-text placeholder-muted focus:outline-none focus:border-[#10b981]/50 focus:shadow-lg focus:shadow-[#10b981]/10 transition-all"
                      placeholder="john@techcorp.com"
                    />
                    {errors.lead_email && (
                      <p className="text-[#10b981] text-sm mt-1">{errors.lead_email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('lead_phone_number')}
                      type="tel"
                      className="w-full px-4 py-3 bg-base border border-white/10 rounded-xl text-text placeholder-muted focus:outline-none focus:border-[#10b981]/50 focus:shadow-lg focus:shadow-[#10b981]/10 transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="bg-elevated rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#10b981]" />
                  LinkedIn Profile
                </h3>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    LinkedIn Profile *
                  </label>
                  <input
                    {...register('lead_linkedin_url')}
                    type="url"
                    className="w-full px-4 py-3 bg-base border border-white/10 rounded-xl text-text placeholder-muted focus:outline-none focus:border-[#10b981]/50 focus:shadow-lg focus:shadow-[#10b981]/10 transition-all"
                    placeholder="https://linkedin.com/in/johnsmith"
                  />
                  {errors.lead_linkedin_url && (
                    <p className="text-[#10b981] text-sm mt-1">{errors.lead_linkedin_url.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#10b981] hover:bg-[#10b981]-hover text-white rounded-xl transition-all hover:shadow-lg hover:shadow-[#10b981]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting Lead...' : 'Add Lead'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* CSV Upload */}
              <div className="bg-elevated rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[#10b981]" />
                  Upload CSV File
                </h3>
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-[#10b981]/50 transition-colors">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="h-8 w-8 text-muted" />
                    <span className="text-muted">
                      {csvFile ? csvFile.name : 'Click to select CSV/Excel file or drag and drop'}
                    </span>
                  </label>
                </div>
              </div>

              {/* CSV Format Info */}
              <div className="bg-elevated rounded-2xl p-6 border border-white/5">
                <h4 className="text-sm font-medium text-text mb-3">CSV/Excel Format Requirements:</h4>
                <div className="text-sm text-muted space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-text mb-1">Required Columns:</p>
                      <ul className="space-y-1">
                        <li>• <code className="text-[#10b981]">name</code>, <code className="text-[#10b981]">lead_name</code>, <code className="text-[#10b981]">full_name</code>, or <code className="text-[#10b981]">fullname</code></li>
                        <li>• <code className="text-[#10b981]">linkedin</code>, <code className="text-[#10b981]">linkedin_url</code>, <code className="text-[#10b981]">lead_linkedin_url</code>, or <code className="text-[#10b981]">linkedin_profile</code></li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-text mb-1">Optional Columns:</p>
                      <ul className="space-y-1">
                        <li>• <code>company</code> or <code>company_name</code></li>
                        <li>• <code>email</code></li>
                        <li>• <code>phone</code> or <code>phone_number</code></li>
                        <li>• <code>job_title</code>, <code>title</code>, or <code>position</code></li>
                        <li>• <code>industry</code></li>
                        <li>• <code>website</code>, <code>company_website</code>, or <code>website_url</code></li>
                        <li>• <code>company_linkedin</code> or <code>company_linkedin_url</code></li>
                        <li>• <code>services</code> or <code>potential_services</code></li>
                        <li>• <code>connection_status</code>, <code>connected</code>, or <code>status</code></li>
                        <li>• <code>dm1</code>, <code>dm2</code>, <code>dm3</code> for messages</li>
                        <li>• <code>booked_meeting</code>, <code>meeting</code>, or <code>booked</code></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg">
                    <p className="text-[#10b981] text-xs font-medium">
                      📋 Only <strong>Name</strong> and <strong>LinkedIn URL</strong> are required. Supports CSV and Excel files. LinkedIn URLs must start with https://linkedin.com/ or https://www.linkedin.com/
                    </p>
                  </div>
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processCsvFile}
                  disabled={!csvFile || loading}
                  className="px-6 py-3 bg-[#10b981] hover:bg-[#10b981]-hover text-white rounded-xl transition-all hover:shadow-lg hover:shadow-[#10b981]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Import CSV'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;