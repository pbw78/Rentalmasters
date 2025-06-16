import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building, Globe } from "lucide-react";

export default function Landing() {
  const { language, setLanguage, t } = useLanguage();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-8 px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">RentalMaster</h1>
              <p className="text-sm text-gray-600 mt-2">
                {language === 'pl' ? 'Zarządzanie Nieruchomościami' : 
                 language === 'en' ? 'Property Management' : 
                 'Ejendomsforvaltning'}
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('pl')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'pl' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇵🇱 PL
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'en' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇬🇧 EN
                </button>
                <button
                  onClick={() => setLanguage('da')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'da' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇩🇰 DA
                </button>
              </div>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              <Button 
                onClick={handleLogin} 
                className="w-full h-12 text-base font-medium"
              >
                {language === 'pl' ? 'Zaloguj się przez Replit' : 
                 language === 'en' ? 'Sign In with Replit' : 
                 'Log ind med Replit'}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {language === 'pl' ? 'lub' : 
                   language === 'en' ? 'or' : 
                   'eller'}
                </span>
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/demo-login');
                    if (response.ok) {
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Demo login failed:', error);
                  }
                }}
                variant="outline" 
                className="w-full h-12 text-base font-medium"
              >
                {language === 'pl' ? 'Dostęp demo (testowy)' : 
                 language === 'en' ? 'Demo Access (Test)' : 
                 'Demo adgang (test)'}
              </Button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                {language === 'pl' ? 'Demo: admin/admin' : 
                 language === 'en' ? 'Demo: admin/admin' : 
                 'Demo: admin/admin'}
              </p>
            </div>

            {/* Features Preview */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {language === 'pl' ? 'Zarządzanie nieruchomościami' : 
                 language === 'en' ? 'Property management' : 
                 'Ejendomsstyring'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {language === 'pl' ? 'Śledzenie płatności' : 
                 language === 'en' ? 'Payment tracking' : 
                 'Betalingsopfølgning'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {language === 'pl' ? 'Zarządzanie umowami' : 
                 language === 'en' ? 'Contract management' : 
                 'Kontraktstyring'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {language === 'pl' ? 'Raporty i analityka' : 
                 language === 'en' ? 'Reports and analytics' : 
                 'Rapporter og analyser'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
