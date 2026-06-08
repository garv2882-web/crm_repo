import { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../api';
import { ADMIN_EMAILS } from '../../config/adminConfig';
import { 
  Settings, 
  Building2, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  AlertTriangle,
  FolderOpen,
  Check,
  Edit2
} from 'lucide-react';

export default function AdminSettings() {
  const { settings, deals, refreshData } = useCRM();

  // Org Info editing
  const [orgName, setOrgName] = useState(settings.orgName);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [orgSavedMsg, setOrgSavedMsg] = useState('');

  // Deal Stage configuration editing
  const [newStageName, setNewStageName] = useState('');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [stageError, setStageError] = useState('');

  // Department list configuration editing
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDeptIdx, setEditingDeptIdx] = useState<number | null>(null);
  const [editingDeptName, setEditingDeptName] = useState('');

  // Save Org Info
  const handleSaveOrgInfo = () => {
    try {
      api.updateSettings({ orgName, timezone });
      setOrgSavedMsg('Organization settings saved successfully.');
      setTimeout(() => setOrgSavedMsg(''), 3000);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // ADD STAGE
  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const currentStages = settings.dealStages || [];
    const newStageId = newStageName.trim();

    // Check if ID already exists
    if (currentStages.some(s => s.id.toLowerCase() === newStageId.toLowerCase())) {
      setStageError('A deal stage with that name already exists.');
      return;
    }

    setStageError('');
    const updatedStages = [...currentStages, { id: newStageId, name: newStageName.trim() }];
    api.updateSettings({ dealStages: updatedStages });
    setNewStageName('');
    refreshData();
  };

  // UPDATE STAGE
  const handleSaveStageEdit = (id: string) => {
    if (!editingStageName.trim()) return;
    const currentStages = settings.dealStages || [];
    const updatedStages = currentStages.map(s => {
      if (s.id === id) {
        return { ...s, name: editingStageName.trim() };
      }
      return s;
    });
    api.updateSettings({ dealStages: updatedStages });
    setEditingStageId(null);
    setEditingStageName('');
    refreshData();
  };

  // MOVE STAGE ORDER
  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const currentStages = [...(settings.dealStages || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentStages.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = currentStages[index];
    currentStages[index] = currentStages[targetIdx];
    currentStages[targetIdx] = temp;

    api.updateSettings({ dealStages: currentStages });
    refreshData();
  };

  // DELETE STAGE (With Deal Reassignment logic)
  const handleDeleteStage = (stageId: string) => {
    const currentStages = settings.dealStages || [];
    
    if (currentStages.length <= 1) {
      setStageError('At least one deal stage must remain in the pipeline.');
      return;
    }

    setStageError('');

    // Determine reassignment target (next stage, or previous, or first remaining)
    const stageIdx = currentStages.findIndex(s => s.id === stageId);
    let reassignmentStageId = '';
    
    const remainingStages = currentStages.filter(s => s.id !== stageId);
    
    if (stageIdx < remainingStages.length) {
      reassignmentStageId = remainingStages[stageIdx].id; // Next stage shifts into this index
    } else if (remainingStages.length > 0) {
      reassignmentStageId = remainingStages[remainingStages.length - 1].id; // Last remaining stage
    }

    // Retrieve affected deals
    const affectedDealsCount = deals.filter(d => d.deal_stage === stageId).length;

    const confirmationText = affectedDealsCount > 0 
      ? `Deleting this stage will automatically reassign ${affectedDealsCount} deal(s) to "${remainingStages.find(s => s.id === reassignmentStageId)?.name}". Proceed?`
      : `Are you sure you want to delete the "${currentStages.find(s => s.id === stageId)?.name}" stage?`;

    if (window.confirm(confirmationText)) {
      // Modify raw database to perform atomic migration and update
      const db = api.getRawDB();
      db.deals = db.deals.map(d => {
        if (d.deal_stage === stageId) {
          return { ...d, deal_stage: reassignmentStageId };
        }
        return d;
      });
      db.settings.dealStages = remainingStages;
      api.saveRawDB(db);
      
      refreshData();
    }
  };

  // ADD DEPARTMENT
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const currentDepts = settings.departments || [];
    if (currentDepts.some(d => d.toLowerCase() === newDeptName.trim().toLowerCase())) {
      return; // Already exists
    }

    const updatedDepts = [...currentDepts, newDeptName.trim()];
    api.updateSettings({ departments: updatedDepts });
    setNewDeptName('');
    refreshData();
  };

  // UPDATE DEPARTMENT
  const handleSaveDeptEdit = (index: number) => {
    if (!editingDeptName.trim()) return;
    const currentDepts = [...(settings.departments || [])];
    currentDepts[index] = editingDeptName.trim();
    api.updateSettings({ departments: currentDepts });
    setEditingDeptIdx(null);
    setEditingDeptName('');
    refreshData();
  };

  // DELETE DEPARTMENT
  const handleDeleteDept = (deptName: string) => {
    if (window.confirm(`Remove "${deptName}" from the pre-seeded department list?`)) {
      const currentDepts = settings.departments || [];
      const updatedDepts = currentDepts.filter(d => d !== deptName);
      api.updateSettings({ departments: updatedDepts });
      refreshData();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          Global Settings & Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure organizational profiles, sales pipeline stages, custom departments, and administrative credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Org Info Settings Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Organization Profile
              </h2>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {orgSavedMsg && (
                <div style={{
                  backgroundColor: 'hsl(150, 80%, 95%)',
                  border: '1px solid hsl(150, 80%, 90%)',
                  color: 'hsl(150, 84%, 26%)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 500
                }}>
                  {orgSavedMsg}
                </div>
              )}

              {/* Org Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Organization Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Timezone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>System Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC / Greenwich Mean Time</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Europe/London">Europe/London (BST/GMT)</option>
                </select>
              </div>

              <button 
                onClick={handleSaveOrgInfo}
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 18px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: 'none',
                  marginTop: '6px'
                }}
              >
                Save Details
              </button>
            </div>
          </div>

          {/* Department Configuration Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderOpen className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                CRM Departments
              </h2>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Add Department Inline Form */}
              <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Create department name..."
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px'
                  }}
                />
                <button 
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* Department Directory List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                {(settings.departments || []).map((dept, index) => {
                  const isEditing = editingDeptIdx === index;
                  return (
                    <div 
                      key={dept} 
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: index < (settings.departments || []).length - 1 ? '1px solid var(--border-color)' : 'none',
                        fontSize: '13px',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                          <input 
                            type="text"
                            value={editingDeptName}
                            onChange={e => setEditingDeptName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px'
                            }}
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveDeptEdit(index)}
                            style={{
                              padding: '2px 8px',
                              backgroundColor: 'hsl(150, 80%, 95%)',
                              border: '1px solid hsl(150, 80%, 90%)',
                              color: 'hsl(150, 84%, 26%)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer'
                            }}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 550, color: 'var(--text-primary)' }}>{dept}</span>
                      )}

                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => { setEditingDeptIdx(index); setEditingDeptName(dept); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            title="Rename Department"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDept(dept)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            title="Remove Department"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Deal Stage Configuration Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Deal Pipeline Stages
              </h2>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Reorder, create, or delete active stages in the sales deals funnel. Deleting a stage will automatically move all associated deals into the next remaining stage.
              </p>

              {stageError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: '#ef4444'
                }}>
                  {stageError}
                </div>
              )}

              {/* Add Stage Form */}
              <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Create stage name..."
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px'
                  }}
                />
                <button 
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* Pipeline Stages list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                {(settings.dealStages || []).map((stage, idx) => {
                  const isEditing = editingStageId === stage.id;
                  const dealCount = deals.filter(d => d.deal_stage === stage.id).length;

                  return (
                    <div 
                      key={stage.id}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: idx < (settings.dealStages || []).length - 1 ? '1px solid var(--border-color)' : 'none',
                        fontSize: '13px',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      {/* Name area */}
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                          <input 
                            type="text"
                            value={editingStageName}
                            onChange={e => setEditingStageName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px'
                            }}
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveStageEdit(stage.id)}
                            style={{
                              padding: '2px 8px',
                              backgroundColor: 'hsl(150, 80%, 95%)',
                              border: '1px solid hsl(150, 80%, 90%)',
                              color: 'hsl(150, 84%, 26%)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer'
                            }}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Order actions */}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button 
                              type="button" 
                              onClick={() => handleMoveStage(idx, 'up')}
                              disabled={idx === 0}
                              style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: 0, opacity: idx === 0 ? 0.3 : 1 }}
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleMoveStage(idx, 'down')}
                              disabled={idx === (settings.dealStages || []).length - 1}
                              style={{ background: 'none', border: 'none', cursor: idx === (settings.dealStages || []).length - 1 ? 'default' : 'pointer', padding: 0, opacity: idx === (settings.dealStages || []).length - 1 ? 0.3 : 1 }}
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stage.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                              ({dealCount} active deals)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Operation buttons */}
                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => { setEditingStageId(stage.id); setEditingStageName(stage.name); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            title="Rename Stage"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStage(stage.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            title="Delete Stage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Admin allowlist security card */}
          <div style={{
            backgroundColor: 'hsl(222, 47%, 11%)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Admin Access Allowlist
              </h2>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(215, 20%, 75%)', lineHeight: 1.4 }}>
                Administrators are authenticated via Google Workspace OAuth. Their email address must be specified in the host environmental configurations:
              </p>
              
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#60a5fa',
                wordBreak: 'break-all'
              }}>
                VITE_ADMIN_EMAILS=owner@anigravity.com,admin@anigravity.com,garv@dexnest.com
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'hsl(215, 20%, 65%)' }}>
                <span style={{ fontWeight: 600, color: '#94a3b8' }}>Active System Allowed Emails:</span>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '4px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ADMIN_EMAILS.map(email => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#ef4444',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                marginTop: '6px'
              }}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span style={{ lineHeight: '1.4' }}>
                  <strong>Security Note:</strong> Changing this list requires updating configurations on Vercel/Vite hosting and performing a full clean deploy build.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
