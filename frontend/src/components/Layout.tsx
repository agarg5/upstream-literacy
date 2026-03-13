import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User as UserIcon, Shield, LogOut, Users, BarChart3 } from 'lucide-react';
import { logout, User } from '../services/auth';

interface Props {
  user: User | null;
  children: React.ReactNode;
}

export default function Layout({ user, children }: Props) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/search', icon: Search, label: 'Find Leaders' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const adminItems = user?.role === 'admin' ? [
    { path: '/admin', icon: BarChart3, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Manage Users' },
    { path: '/admin/moderation', icon: Shield, label: 'Moderation' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-600 text-white flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold">Upstream Literacy</h1>
          <p className="text-primary-200 text-sm mt-1">Community for Literacy Leaders</p>
        </div>

        <nav className="flex-1 px-4">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-white/20 text-white'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
              }`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}

          {adminItems.length > 0 && (
            <>
              <div className="border-t border-primary-500 my-4"></div>
              <p className="text-primary-300 text-xs uppercase tracking-wider px-4 mb-2">Admin</p>
              {adminItems.map(item => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/20 text-white'
                      : 'text-primary-200 hover:bg-white/10 hover:text-white'
                  }`}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-primary-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-400 rounded-full flex items-center justify-center font-semibold text-primary-600">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-primary-300 truncate">{user?.title}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-primary-300 hover:text-white text-sm w-full">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
