import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Brain,
  FolderOpen,
  Users,
  ChartBar,
  Gear,
  SignOut,
  Plus,
  Bell,
  MagnifyingGlass,
  ChatCircle,
  Database,
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

// The Dashboard now accepts 'children', which will be the routed page component (e.g., <ProjectsView />)
export function Dashboard({ user, onLogout, children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerNewProject, setTriggerNewProject] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const location = useLocation(); // Hook to get the current URL information
  const navigate = useNavigate(); // Hook to programmatically navigate

  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    projects,
    teamMembers,
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
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }
    // Search logic now uses `navigate` to change pages
    const results = [];
    projects.forEach((project) => {
      if (project.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'project', title: project.name, description: project.description, icon: '🚀',
          action: () => { navigate('/projects'); sessionStorage.setItem('highlightProjectId', project.id); }
        });
      }
    });
    // ... other search logic would go here
    setSearchResults(results.slice(0, 6));
    setShowSearchResults(true);
  };

  const navigationItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
    { id: 'playground', label: 'Playground', icon: ChatCircle, path: '/playground' },
    { id: 'data', label: 'Knowledge Base', icon: Database, path: '/data' },
    { id: 'team', label: 'Team', icon: Users, path: '/team' },
    { id: 'analytics', label: 'Analytics', icon: ChartBar, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Gear, path: '/settings' }
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
                  placeholder="Search projects, team members... (Ctrl+K)"
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
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 border shadow-xl backdrop-blur-sm bg-card/95">
                  <CardContent className="p-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
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
                          {/* ... search result item JSX ... */}
                        </Button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">No results found</div>
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
                  <div className="flex items-center justify-center"><Bell size={20} /></div>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-xs text-white rounded-full flex items-center justify-center font-medium border-2 border-background">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {/* ... notifications dropdown content ... */}
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
                    <Avatar className="w-9 h-9 border-2 border-background shadow-sm">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="flex items-center">
                    <div className="flex items-center justify-center w-4 mr-3"><Gear size={16} /></div>
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
          <div className="p-4 relative z-10 flex-1">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: sidebarCollapsed ? 0 : 2, scale: sidebarCollapsed ? 1.05 : 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      as={Link}
                      to={item.path}
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
              {!sidebarCollapsed ? (
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
              ) : (
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
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}