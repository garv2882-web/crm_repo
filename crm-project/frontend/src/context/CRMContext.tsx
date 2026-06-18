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
  type CRMSettings,
  type CRMDatabase
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
  authLoading: boolean;
  refreshData: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  userPermissions: Record<string, boolean>; // computed active user permissions
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<CRMDatabase>(() => api.getRawDB());
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [
        users,
        companies,
        contacts,
        leads,
        deals,
        tasks,
        activities,
        activityLog,
        sessions,
        settings,
        campaigns,
        supportCases,
        kbArticles,
        socialEngagements,
        emailMessages
      ] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getCompanies().catch(() => []),
        api.getContacts().catch(() => []),
        api.getLeads().catch(() => []),
        api.getDeals().catch(() => []),
        api.getTasks().catch(() => []),
        api.getActivities().catch(() => []),
        api.getActivityLog().catch(() => []),
        api.getSessions().catch(() => []),
        api.getSettings().catch(() => ({ orgName: 'Dexnest', timezone: 'Asia/Kolkata', dealStages: [], departments: [], roleTemplates: [] })),
        api.getCampaigns().catch(() => []),
        api.getSupportCases().catch(() => []),
        api.getKBArticles().catch(() => []),
        api.getSocialEngagements().catch(() => []),
        api.getEmailMessages().catch(() => [])
      ]);

      setDbState({
        users,
        companies,
        contacts,
        leads,
        deals,
        tasks,
        activities,
        activityLog,
        sessions,
        settings,
        campaigns,
        supportCases,
        kbArticles,
        socialEngagements,
        emailMessages
      });
    } catch (err) {
      console.error("Failed to load CRM data:", err);
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

  // Fetch current user on mount to recover session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.getCurrentUser();
        setCurrentUserState(res.user);
      } catch (err) {
        setCurrentUserState(null);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Fetch all tables when logged in
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  // Compute permissions for the active employee
  let userPermissions: Record<string, boolean> = {};
  if (currentUser) {
    // Find role template in settings
    const template = dbState.settings.roleTemplates.find(
      (t: any) => t.name.toLowerCase() === currentUser.role.toLowerCase()
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
    authLoading,
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
