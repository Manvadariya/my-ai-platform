import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from './components/ui/sonner';
import { useAppContext } from './context/AppContext';

// A simple component to show while verifying the user's session
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Loading Application...</h2>
    </div>
  );
}

function App() {
  const { user, handleAuth, handleLogout, isInitializing, loadUserFromToken } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // This effect runs only ONCE when the app starts
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // This effect handles redirects AFTER the initial loading is done
  useEffect(() => {
    if (isInitializing) return; // Do nothing until we know if user is logged in or not

    if (user && location.pathname === '/') {
      navigate('/projects');
    } else if (!user && location.pathname !== '/') {
      navigate('/');
    }
  }, [user, isInitializing, navigate, location.pathname]);

  // Show a loading screen while we verify the token
  if (isInitializing) {
    return <LoadingSpinner />;
  }

  // If loading is finished and there's still no user, show the AuthScreen
  if (!user) {
    return (
      <>
        <AuthScreen onAuth={handleAuth} />
        <Toaster />
      </>
    );
  }
  
  // If loading is finished and we have a user, show the Dashboard
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