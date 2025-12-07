import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UserPlus,
  FlaskConical,
  FileText,
  CheckCircle,
  Users,
  ClipboardList,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'New Booking', href: '/booking', icon: UserPlus },
  { name: 'Sample Tracking', href: '/samples', icon: FlaskConical },
  { name: 'Results Entry', href: '/results', icon: ClipboardList },
  { name: 'Report Editor', href: '/reports', icon: FileText },
  { name: 'Verification', href: '/verification', icon: CheckCircle },
  { name: 'Patients', href: '/patients', icon: Users },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">Lab</h1>
            <p className="text-xs text-muted-foreground">LIMS System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs font-medium text-accent-foreground">Lab Information</p>
            <p className="mt-1 text-xs text-muted-foreground">LIMS Diagnostics</p>
            {/* <p className="text-xs text-muted-foreground">License: LAB-2024-001</p> */}
          </div>
        </div>
      </div>
    </aside>
  );
}
