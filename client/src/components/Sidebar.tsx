import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  Building, 
  LayoutDashboard, 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  Wrench, 
  BarChart3,
  UserCog,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav.properties'), href: '/properties', icon: Home },
    { name: t('nav.tenants'), href: '/tenants', icon: Users },
    { name: t('nav.contracts'), href: '/contracts', icon: FileText },
    { name: t('nav.payments'), href: '/payments', icon: CreditCard },
    { name: t('nav.service'), href: '/service', icon: Wrench },
    { name: t('nav.reports'), href: '/reports', icon: BarChart3 },
  ];

  const adminNavigation = [
    { name: t('nav.users'), href: '/users', icon: UserCog },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RentalMaster</h1>
            <p className="text-xs text-gray-500">Property Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'text-primary bg-blue-50 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t('user.admin')}
              </p>
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'text-primary bg-blue-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
