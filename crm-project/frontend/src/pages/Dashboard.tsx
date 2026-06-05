import { useEffect, useState } from 'react';
import { api, type Lead, type Activity } from '../api';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  CheckCircle,
  FileCheck,
  RefreshCw,
  Coins
} from 'lucide-react';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadsData, activitiesData] = await Promise.all([
        api.getLeads(),
        api.getActivities()
      ]);
      setLeads(leadsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-slate-500 font-medium">Loading Dashboard analytics...</span>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.lead_status === 'New').length;
  const contactedLeads = leads.filter(l => l.lead_status === 'Contacted').length;
  const qualifiedLeads = leads.filter(l => l.lead_status === 'Qualified').length;
  const disqualifiedLeads = leads.filter(l => l.lead_status === 'Disqualified').length;
  const convertedLeads = leads.filter(l => l.lead_status === 'Converted').length;

  const totalRevenue = leads.reduce((sum, l) => sum + Number(l.estimated_revenue || 0), 0);
  const expectedRevenue = leads.reduce((sum, l) => {
    const prob = Number(l.conversion_probability || 0) / 100;
    return sum + (Number(l.estimated_revenue || 0) * prob);
  }, 0);

  // Format currency Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Status statistics percentages for gauge
  const newPercentage = totalLeads ? Math.round((newLeads / totalLeads) * 100) : 0;
  const contactedPercentage = totalLeads ? Math.round((contactedLeads / totalLeads) * 100) : 0;
  const qualifiedPercentage = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  const convertedPercentage = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return (
    <div className="dashboard-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Upper Metrics Grid */}
      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        
        {/* Total Leads */}
        <div className="card metric-card" style={{ borderLeft: '4px solid var(--accent-total)', marginBottom: 0 }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Total Active Leads</span>
                <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{totalLeads}</h3>
              </div>
              <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '50%' }}>
                <Users style={{ color: 'var(--accent-total)', width: '22px', height: '22px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* New Leads */}
        <div className="card metric-card" style={{ borderLeft: '4px solid var(--accent-new)', marginBottom: 0 }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>New Pipeline</span>
                <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{newLeads}</h3>
              </div>
              <div style={{ background: 'hsl(187, 100%, 96%)', padding: '10px', borderRadius: '50%' }}>
                <UserPlus style={{ color: 'var(--accent-new)', width: '22px', height: '22px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Contacted Leads */}
        <div className="card metric-card" style={{ borderLeft: '4px solid var(--accent-contacted)', marginBottom: 0 }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Contacted Prospect</span>
                <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{contactedLeads}</h3>
              </div>
              <div style={{ background: 'hsl(35, 100%, 96%)', padding: '10px', borderRadius: '50%' }}>
                <TrendingUp style={{ color: 'var(--accent-contacted)', width: '22px', height: '22px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="card metric-card" style={{ borderLeft: '4px solid var(--accent-qualified)', marginBottom: 0 }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Qualified Pipelines</span>
                <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{qualifiedLeads}</h3>
              </div>
              <div style={{ background: 'hsl(150, 80%, 95%)', padding: '10px', borderRadius: '50%' }}>
                <CheckCircle style={{ color: 'var(--accent-qualified)', width: '22px', height: '22px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Expected Revenue */}
        <div className="card metric-card" style={{ borderLeft: '4px solid #a855f7', marginBottom: 0 }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Expected Pipeline Revenue</span>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {formatCurrency(expectedRevenue)}
                </h3>
              </div>
              <div style={{ background: 'hsl(265, 80%, 96%)', padding: '10px', borderRadius: '50%' }}>
                <Coins style={{ color: '#a855f7', width: '22px', height: '22px' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Split Layout: Charts and Activity Logs */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Conversion Ratios */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <TrendingUp />
              <span>Conversion Funnel Analysis</span>
            </div>
          </div>
          <div className="card-body">
            <div className="funnel-stats" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* New Leads Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>New Inbound Leads</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{newLeads} ({newPercentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${newPercentage}%`, background: 'var(--accent-new)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              {/* Contacted Leads Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Active Discussions (Contacted)</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{contactedLeads} ({contactedPercentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${contactedPercentage}%`, background: 'var(--accent-contacted)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              {/* Qualified Leads Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Proposal Stage (Qualified)</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{qualifiedLeads} ({qualifiedPercentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${qualifiedPercentage}%`, background: 'var(--accent-qualified)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              {/* Converted Leads Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Deals Won / Closed Converted</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{convertedLeads} ({convertedPercentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${convertedPercentage}%`, background: 'var(--status-converted-text)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              {/* Disqualified Stats */}
              <div style={{ 
                marginTop: '10px', 
                padding: '16px', 
                backgroundColor: 'var(--bg-main)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Disqualified Leads: </span>
                  <span style={{ fontWeight: 700, color: 'var(--status-disqualified-text)' }}>{disqualifiedLeads}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Overall Pipeline Value: </span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(totalRevenue)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Audit Logs */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <FileCheck />
              <span>Real-Time Audit Log</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: '0px' }}>
            <div className="recent-activities-list" style={{ 
              maxHeight: '340px', 
              overflowY: 'auto',
              padding: '12px 20px'
            }}>
              {activities.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No recent activities recorded.
                </div>
              ) : (
                activities.map(act => (
                  <div key={act.activity_id} className="activity-item" style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="activity-action" style={{
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: act.action_type === 'create_lead' ? 'var(--accent-new)' : 
                               act.action_type === 'convert_lead' ? '#a855f7' : 'var(--accent-contacted)'
                      }}>
                        {act.action_type.replace('_', ' ')}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                        {new Date(act.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div 
                      dangerouslySetInnerHTML={{ __html: act.text }} 
                      style={{ color: 'var(--text-primary)' }}
                      className="activity-text"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
