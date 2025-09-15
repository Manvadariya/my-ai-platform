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

  // This effect handles automatic redirection after a user logs in or out.
  useEffect(() => {
    // If the user is logged in and they are at the root URL ('/'),
    // redirect them to the default dashboard page.
    if (user && location.pathname === '/') {
      navigate('/projects');
    }
    // If the user is NOT logged in and they try to access any page
    // other than the root, redirect them back to the login screen.
    else if (!user && location.pathname !== '/') {
      navigate('/');
    }
  }, [user, navigate, location.pathname]);

  // If there is no user, render the authentication screen.
  if (!user) {
    return (
      <>
        <AuthScreen onAuth={handleAuth} />
        <Toaster />
      </>
    );
  }

  // If the user is logged in, render the main Dashboard layout.
  // The <Outlet /> component from react-router-dom will render the
  // specific child component that matches the current URL
  // (e.g., <ProjectsView /> when the URL is '/projects').
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