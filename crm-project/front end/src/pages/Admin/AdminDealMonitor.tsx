import { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../api';
import { 
  Filter, 
  Search, 
  User, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';

export default function AdminDealMonitor() {
  const { deals, users, settings, refreshData } = useCRM();

  // Filter States
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('All');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Deal for Right Panel Detail
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Private notes edit states
  const [savingNote, setSavingNote] = useState<string | null>(null);

  // Active stages list
  const stages = settings.dealStages || [];

  // Filter logic
  const filteredDeals = deals.filter(deal => {
    // Text search (Deal Name, Company, Owner Name)
    const matchesSearch = 
      deal.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.company_name && deal.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (deal.deal_owner_name && deal.deal_owner_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Stage filter
    const matchesStage = selectedStage === 'All' || deal.deal_stage === selectedStage;

    // Owner filter
    const matchesOwner = selectedOwner === 'All' || deal.deal_owner === selectedOwner;

    // Min value filter
    const matchesMin = minVal === '' || Number(deal.deal_value || 0) >= Number(minVal);

    // Max value filter
    const matchesMax = maxVal === '' || Number(deal.deal_value || 0) <= Number(maxVal);

    // Date range filter
    let matchesDate = true;
    if (deal.expected_closing_date) {
      const closingTime = new Date(deal.expected_closing_date).getTime();
      if (startDate) {
        matchesDate = matchesDate && closingTime >= new Date(startDate).getTime();
      }
      if (endDate) {
        matchesDate = matchesDate && closingTime <= new Date(endDate).getTime();
      }
    } else if (startDate || endDate) {
      matchesDate = false; // Filtered out if no date specified but filter is active
    }

    return matchesSearch && matchesStage && matchesOwner && matchesMin && matchesMax && matchesDate;
  });

  const handleClearFilters = () => {
    setSelectedStage('All');
    setSelectedOwner('All');
    setMinVal('');
    setMaxVal('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };


  // Update Owner Handler
  const handleReassignOwner = async (dealId: string, newOwnerId: string) => {
    try {
      await api.updateDeal(dealId, { deal_owner: newOwnerId });
      refreshData();
    } catch (err) {
      console.error('Failed to reassign owner:', err);
    }
  };

  // Update Private Admin Notes Handler
  const handleUpdateAdminNotes = async (dealId: string, notes: string) => {
    setSavingNote(dealId);
    try {
      await api.updateDeal(dealId, { admin_notes: notes });
      refreshData();
    } catch (err) {
      console.error('Failed to update private admin notes:', err);
    } finally {
      setSavingNote(null);
    }
  };

  const getFormatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Not Specified';
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          Admin Deal Monitor
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Monitor all pipeline deals, reassign ownership, and maintain secure private administrative logs.
        </p>
      </div>

      {/* Main Two-Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start', flex: 1 }}>
        
        {/* Left Panel: Filter Controls */}
        <aside style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Pipeline Filters</span>
            </h2>
            <button 
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>

          {/* Text Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Deals
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              gap: '8px'
            }}>
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Deal name, company, or owner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', fontSize: '13px', border: 'none', outline: 'none', backgroundColor: 'transparent' }}
              />
            </div>
          </div>

          {/* Deal Stage Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deal Stage
            </label>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                backgroundColor: 'white'
              }}
            >
              <option value="All">All Stages</option>
              {stages.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          {/* Deal Owner Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deal Owner
            </label>
            <select
              value={selectedOwner}
              onChange={e => setSelectedOwner(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                backgroundColor: 'white'
              }}
            >
              <option value="All">All Owners</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          {/* Deal Value Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deal Value Range (INR)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input 
                type="number" 
                placeholder="Min Value"
                value={minVal}
                onChange={e => setMinVal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              <input 
                type="number" 
                placeholder="Max Value"
                value={maxVal}
                onChange={e => setMaxVal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Date expected range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Close Date Range
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Start Date</span>
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>End Date</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Deals Directory & Inspector */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Found {filteredDeals.length} Deal{filteredDeals.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDeals.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '48px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                No deals match your search criteria. Try modifying your filters.
              </div>
            ) : (
              filteredDeals.map(deal => {
                const isSelected = selectedDealId === deal.deal_id;
                return (
                  <div 
                    key={deal.deal_id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Compact Deal Header */}
                    <div 
                      onClick={() => setSelectedDealId(isSelected ? null : deal.deal_id)}
                      style={{
                        padding: '18px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isSelected ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                              {deal.deal_name}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              backgroundColor: deal.deal_status === 'Won' ? 'hsl(150, 80%, 95%)' : deal.deal_status === 'Lost' ? 'hsl(0, 100%, 96%)' : 'hsl(210, 80%, 96%)',
                              color: deal.deal_status === 'Won' ? 'hsl(150, 84%, 26%)' : deal.deal_status === 'Lost' ? 'hsl(0, 72%, 40%)' : 'hsl(210, 84%, 35%)',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {deal.deal_status}
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {deal.company_name || 'N/A'} &middot; Owner: {deal.deal_owner_name || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                          {getFormatCurrency(deal.deal_value || 0)}
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          marginTop: '4px'
                        }}>
                          {stages.find(s => s.id === deal.deal_stage)?.name || deal.deal_stage}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Dropdown Panel */}
                    {isSelected && (
                      <div style={{
                        padding: '24px',
                        borderTop: '1px solid var(--border-color)',
                        backgroundColor: '#f8fafc',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px'
                      }}>
                        {/* Details Panel Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Deal Operations Management
                          </h4>

                          {/* Reassign Owner */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User className="w-3.5 h-3.5" />
                              <span>Reassign Owner / Manager</span>
                            </label>
                            <select
                              value={deal.deal_owner}
                              onChange={e => handleReassignOwner(deal.deal_id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '13px',
                                backgroundColor: 'white'
                              }}
                            >
                              {users.map(u => (
                                <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.role})</option>
                              ))}
                            </select>
                          </div>

                          {/* Deal Metadata Details */}
                          <div style={{
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            fontSize: '12.5px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Close Date:</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {formatDate(deal.expected_closing_date)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {deal.priority || 'Medium'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Win Probability:</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {deal.probability_percentage || 50}%
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Pipeline:</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {deal.sales_pipeline || 'Standard'}
                              </span>
                            </div>
                          </div>

                          {/* Public CRM notes */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span>Public Deal Notes (From Rep)</span>
                            </label>
                            <div style={{
                              padding: '10px 14px',
                              backgroundColor: 'white',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '12.5px',
                              color: 'var(--text-secondary)',
                              minHeight: '44px',
                              lineHeight: '1.4'
                            }}>
                              {deal.notes || 'No description added by sales representative.'}
                            </div>
                          </div>
                        </div>

                        {/* Details Panel Right: Secure admin log notes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'hsl(0, 72%, 40%)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>Secure Admin-Only Log Notes</span>
                            </h4>
                            {savingNote === deal.deal_id && (
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock className="w-3 h-3 animate-spin" />
                                <span>Saving...</span>
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              These remarks are stored locally on the record. Standard employee interfaces cannot view this log block.
                            </p>
                            
                            <textarea
                              defaultValue={deal.admin_notes || ''}
                              onBlur={e => handleUpdateAdminNotes(deal.deal_id, e.target.value)}
                              placeholder="Write private administrative audits, override remarks, or performance logs..."
                              style={{
                                width: '100%',
                                height: '170px',
                                boxSizing: 'border-box',
                                padding: '14px',
                                border: '2px solid hsl(0, 100%, 93%)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '13px',
                                color: 'var(--text-primary)',
                                backgroundColor: 'hsl(0, 100%, 98%)',
                                outline: 'none',
                                resize: 'none',
                                fontStyle: 'italic',
                                lineHeight: '1.5',
                                transition: 'border-color 0.2s'
                              }}
                              onFocus={e => e.currentTarget.style.borderColor = 'hsl(0, 72%, 40%)'}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </section>
      </div>

    </div>
  );
}
