import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from './components/ui/sonner';
import { useAppContext } from './context/AppContext';

function App() {
  const { user, handleAuth, handleLogout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // This effect handles automatic redirection after a user logs in.
  useEffect(() => {
    // If the user is logged in and they are at the root URL ('/'),
    // redirect them to the default dashboard page, '/projects'.
    if (user && location.pathname === '/') {
      navigate('/projects');
    }
  }, [user, navigate, location.pathname]);

  // If there is no user, render the authentication screen. The login page is now the root path "/".
  if (!user) {
    return (
      <>
        <AuthScreen onAuth={handleAuth} />
        <Toaster />
      </>
    );
  }

  // If a user exists, render the main Dashboard layout.
  // The <Outlet /> is the placeholder that will be filled by the correct page component
  // based on the current URL (e.g., <ProjectsView /> for '/projects').
  return (
    <>
      <Dashboard user={user} onLogout={handleLogout}>
        <Outlet />
      </Dashboard>
      <Toaster />
    </>
  );
}

export default App;