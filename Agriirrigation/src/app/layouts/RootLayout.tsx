import { Outlet, useLocation } from "react-router";
import { ThemeProvider } from "../context/ThemeContext";
import { Navigation } from "../components/Navigation";

export function RootLayout() {
  const location = useLocation();
  const hideNavPaths = ['/', '/login', '/signup', '/profile-setup', '/farm-setup'];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {showNav && <Navigation />}
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
