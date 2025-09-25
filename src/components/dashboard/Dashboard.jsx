import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // IMPORT ROUTER HOOKS
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// --- CORRECTED ICON IMPORTS ---
import {
  Brain,
  FolderOpenIcon,
  Users,
  ChartBarIcon,
  GearIcon,
  SignOut,
  Plus,
  MagnifyingGlass,
  ChatCircleIcon,
  DatabaseIcon,
  List
} from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAppContext } from '../../context/AppContext';

// The Dashboard now accepts 'children' which will be the routed page component (e.g., <ProjectsView />)
export function Dashboard({ user, onLogout, children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerNewProject, setTriggerNewProject] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const location = useLocation(); // Hook to get the current URL path
  const navigate = useNavigate(); // Hook to programmatically navigate

  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    projects,
    dataSources,
    playgroundMessages,
    notifications,
    setNotifications,
  } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  // The handleSearch function now uses navigate() instead of onViewChange()
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    const results = [];

    projects.forEach((project) => {
      if (
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.model.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          type: 'project',
          title: project.name,
          description: `${project.description} • ${project.status}`,
          icon: '🚀',
          action: () => {
            navigate('/projects');
            sessionStorage.setItem('highlightProjectId', project.id);
          }
        });
      }
    });

    dataSources.forEach((file) => {
      if (
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.format.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          type: 'data',
          title: file.name,
          description: `${file.format} • ${file.size}`,
          icon: '📄',
          action: () => {
            navigate('/data');
            sessionStorage.setItem('highlightFileId', file.id);
          }
        });
      }
    });

    if (playgroundMessages.length > 0) {
      const hasMatchingMessage = playgroundMessages.some((message) =>
        message.content.toLowerCase().includes(query.toLowerCase())
      );

      if (hasMatchingMessage) {
        results.push({
          type: 'playground',
          title: 'Playground Chat',
          description: `${playgroundMessages.length} messages • Contains "${query}"`,
          icon: '💬',
          action: () => navigate('/playground')
        });
      }
    }

    const settingsItems = [
      { title: 'API Keys', description: 'Manage your API credentials', section: 'api' },
      { title: 'Profile Settings', description: 'Update your account information', section: 'profile' },
      { title: 'Usage Analytics', description: 'View API usage and analytics', section: 'analytics' },
    ];

    settingsItems.forEach(item => {
      if (
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          type: 'feature',
          title: item.title,
          description: item.description,
          icon: '⚙️',
          action: () => {
            if (item.section === 'analytics') {
              navigate(`/${item.section}`);
            } else {
              navigate('/settings');
            }
            sessionStorage.setItem('highlightSection', item.section);
          }
        });
      }
    });

    setSearchResults(results.slice(0, 6));
    setShowSearchResults(true);
  };

  // Add a `path` property to each navigation item for routing
  const navigationItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpenIcon, path: '/projects' },
    { id: 'playground', label: 'Playground', icon: ChatCircleIcon, path: '/playground' },
    { id: 'data', label: 'Knowledge Base', icon: DatabaseIcon, path: '/data' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: GearIcon, path: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20 shadow-sm">
              <Brain size={22} className="text-primary" weight="duotone" />
            </div>
            <h1 className="font-semibold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">AI Platform</h1>
          </div>
          
          <div className="flex-1 flex justify-center px-8">
            <div className="w-full max-w-lg relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10">
                  <MagnifyingGlass size={18} className="text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search projects, APIs... (Ctrl+K)"
                  className="pl-10 pr-4 h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearchResults(false);
                      setSearchQuery('');
                      e.currentTarget.blur();
                    }
                  }}
                />
              </div>
              
              {showSearchResults && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 border shadow-xl back backdrop-blur-sm bg-card/95">
                  <CardContent className="p-2">
                    {searchResults.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-muted/50 rounded-full">
                          <MagnifyingGlass size={20} />
                        </div>
                        No results found for "{searchQuery}"
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b mb-2">
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                        </div>
                        {searchResults.map((result, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start h-auto p-3 mb-1 last:mb-0 hover:bg-accent/50 rounded-lg transition-colors"
                            onClick={() => {
                              result.action();
                              setShowSearchResults(false);
                              setSearchQuery('');
                              toast.success(`Navigating to ${result.title}`);
                            }}
                          >
                            <div className="flex items-start gap-3 text-left w-full">
                              <div className="flex items-center justify-center w-8 h-8 bg-accent/20 rounded-lg flex-shrink-0 mt-0.5">
                                <span className="text-lg">{result.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{result.title}</p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{result.description}</p>
                                <Badge variant="outline" className="text-xs mt-2 capitalize">
                                  {result.type}
                                </Badge>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-lg hover:bg-accent/50 transition-colors">
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-xs text-white rounded-full flex items-center justify-center font-medium border-2 border-background">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 border-b">
                  <h4 className="font-medium">Notifications</h4>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start p-3 cursor-pointer"
                      onClick={() => {
                        setNotifications(current =>
                          current.map(n =>
                            n.id === notification.id ? { ...n, read: true } : n
                          )
                        );
                      }}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(notification.timestamp).toLocaleDateString()}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="justify-start"
                      onClick={() => {
                        setNotifications(current =>
                          current.map(notification => ({ ...notification, read: true }))
                        );
                        toast.success('All notifications marked as read');
                      }}
                    >
                      Mark all as read
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-3 border-l pl-4 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.company}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="flex items-center">
                    <div className="flex items-center justify-center w-4 mr-3"><GearIcon size={16} /></div>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive flex items-center focus:text-destructive focus:bg-destructive/10">
                    <div className="flex items-center justify-center w-4 mr-3"><SignOut size={16} /></div>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        <motion.nav
          className="border-r bg-gradient-to-b from-card/50 to-card/30 min-h-[calc(100vh-4rem)] overflow-hidden relative backdrop-blur-sm flex flex-col shadow-sm"
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 256 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            />
          )}
          <div className="p-4 relative z-10 flex-1">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path; // Determine active state from URL
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: sidebarCollapsed ? 0 : 2, scale: sidebarCollapsed ? 1.05 : 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => navigate(item.path)}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full h-11 ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'} ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'hover:bg-accent/50'} transition-all duration-200 relative group`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className={`flex items-center justify-center ${sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 flex-shrink-0'}`}>
                        <Icon size={20} weight={isActive ? "fill" : "regular"} />
                      </div>
                      <motion.span
                        initial={false}
                        animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : "auto" }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap font-medium"
                      >
                        {!sidebarCollapsed && item.label}
                      </motion.span>
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-card border border-border rounded-lg text-sm whitespace-nowrap shadow-lg z-50 pointer-events-none backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.label}
                        </div>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
            <motion.div
              className="mt-8 pt-6 border-t border-border/50"
              initial={false}
              animate={{ opacity: sidebarCollapsed ? 0.8 : 1 }}
              transition={{ duration: 0.2, delay: sidebarCollapsed ? 0 : 0.1 }}
            >
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                  <Button
                    className="w-full gap-3 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border border-primary/20 h-10 font-medium shadow-sm"
                    onClick={() => {
                      navigate('/projects');
                      setTriggerNewProject(true);
                    }}
                  >
                    <div className="flex items-center justify-center w-5 h-5"><Plus size={18} weight="bold" /></div>
                    New Project
                  </Button>
                </motion.div>
              )}
              {sidebarCollapsed && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                  <Button
                    className="w-full h-11 justify-center p-0 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border border-primary/20 shadow-sm"
                    onClick={() => {
                      navigate('/projects');
                      setTriggerNewProject(true);
                    }}
                    title="New Project"
                  >
                    <div className="flex items-center justify-center w-5 h-5"><Plus size={18} weight="bold" /></div>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
          <div className="p-4 border-t border-border/50 relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-10 w-10 p-0 bg-primary/5 hover:bg-primary/10 border border-primary/10 group rounded-lg"
                title={`${sidebarCollapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
              >
                <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-center w-5 h-5">
                  <List size={20} />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </motion.nav>

        <motion.main
          className={`flex-1 ${location.pathname === '/playground' ? '' : 'p-6'} min-w-0`}
          initial={false}
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* The main content area now renders the child route component */}
          {children}
        </motion.main>
      </div>
    </div>
  );
}