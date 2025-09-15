import { createContext, useContext, useState } from 'react';
import { apiService } from '../lib/apiService'; // Adjust path if needed
import { toast } from 'sonner';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  // State is now initialized empty, not with mock data
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // Will be implemented later
  const [dataSources, setDataSources] = useState([]); // Will be implemented later
  const [playgroundMessages, setPlaygroundMessages] = useState([]); // Will be implemented later
  const [notifications, setNotifications] = useState([]); // Mock data for now
  const [settings, setSettings] = useState({
    notifications: { email: true, browser: true, weekly: true, marketing: false },
    security: { twoFactor: false, sessionTimeout: '24h' },
    appearance: { theme: 'light', language: 'en' }
  });
  const [apiKeys, setApiKeys] = useState([]); // Will be implemented later

  const handleAuth = async (authenticatedUser) => {
    setUser(authenticatedUser);
    
    // Fetch initial data after a successful login
    try {
      const fetchedProjects = await apiService.getProjects();
      // Mongoose uses _id, but your frontend expects id. Let's map it.
      const formattedProjects = fetchedProjects.map(p => ({ ...p, id: p._id }));
      setProjects(formattedProjects);
    } catch (error) {
      toast.error("Failed to load your projects.");
      console.error("Project fetching error:", error);
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    // Reset all states to their initial empty values
    setProjects([]);
    setTeamMembers([]);
    setDataSources([]);
    setPlaygroundMessages([]);
    setNotifications([]);
    setApiKeys([]);
  };

  const value = {
    user, setUser,
    handleAuth, handleLogout,
    sidebarCollapsed, setSidebarCollapsed,
    projects, setProjects,
    teamMembers, setTeamMembers,
    dataSources, setDataSources,
    playgroundMessages, setPlaygroundMessages,
    notifications, setNotifications,
    settings, setSettings,
    apiKeys, setApiKeys,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};