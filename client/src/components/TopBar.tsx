import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, User, LogOut } from "lucide-react";

export default function TopBar() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [notificationCount] = useState(3);

  const languageFlags: Record<string, string> = {
    pl: '🇵🇱',
    en: '🇬🇧',
    da: '🇩🇰'
  };

  const languageNames: Record<string, string> = {
    pl: 'Polski',
    en: 'English',
    da: 'Dansk'
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('dashboard.title')}
          </h2>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>{t('dashboard.lastUpdate')}</span>
            <span>5 min ago</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>{languageFlags[language]}</span>
                <span className="hidden sm:inline">{languageNames[language]}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('pl')}>
                <span className="mr-2">🇵🇱</span>
                Polski
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                <span className="mr-2">🇬🇧</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('da')}>
                <span className="mr-2">🇩🇰</span>
                Dansk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'admin' ? t('user.admin') : t('user.role')}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {t('user.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('user.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
