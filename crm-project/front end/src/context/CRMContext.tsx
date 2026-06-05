import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  api, 
  apiEvents, 
  type User, 
  type Company, 
  type Contact, 
  type Lead, 
  type Deal, 
  type Task, 
  type Activity, 
  type ActivityLogEntry, 
  type SessionHistory, 
  type CRMSettings 
} from '../api';

interface CRMContextType {
  users: User[];          // mapped from DB employees
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  activityLog: ActivityLogEntry[];
  sessions: SessionHistory[];
  settings: CRMSettings;
  currentUser: User | null;
  refreshData: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  userPermissions: Record<string, boolean>; // computed active user permissions
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState(() => api.getRawDB());
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const refreshData = () => {
    const raw = api.getRawDB();
    setDbState(raw);
    
    // Also sync current user details (e.g. if they got suspended or permissions changed)
    const savedUser = localStorage.getItem('crm_auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const latestUser = raw.users.find(u => u.user_id === parsed.user_id);
        if (latestUser) {
          // If suspended, force logout
          if (latestUser.status === 'Suspended') {
            handleLogout();
          } else {
            setCurrentUserState(latestUser);
            localStorage.setItem('crm_auth_user', JSON.stringify(latestUser));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUserState(null);
  };

  // Subscribe to raw apiEvents changes
  useEffect(() => {
    const unsubscribe = apiEvents.subscribe(() => {
      refreshData();
    });
    return unsubscribe;
  }, []);

  // Compute permissions for the active employee
  let userPermissions: Record<string, boolean> = {};
  if (currentUser) {
    // Find role template in settings
    const template = dbState.settings.roleTemplates.find(
      t => t.name.toLowerCase() === currentUser.role.toLowerCase()
    );
    // Combine base template permissions and overrides
    const basePerms = template ? template.permissions : {};
    const overrides = currentUser.custom_permissions || {};
    
    // Merge
    userPermissions = {
      ...basePerms,
      ...overrides
    };
  }

  const value: CRMContextType = {
    users: dbState.users,
    companies: dbState.companies,
    contacts: dbState.contacts,
    leads: dbState.leads,
    deals: dbState.deals,
    tasks: dbState.tasks,
    activities: dbState.activities,
    activityLog: dbState.activityLog,
    sessions: dbState.sessions,
    settings: dbState.settings,
    currentUser,
    refreshData,
    setCurrentUser: setCurrentUserState,
    logout: handleLogout,
    userPermissions
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
