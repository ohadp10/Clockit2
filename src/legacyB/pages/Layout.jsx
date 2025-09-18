

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from '@/legacyB/_compat/entities';
import {
  Users,
  Upload,
  Send,
  BarChart3,
  Settings,
  Menu,
  X,
  Clock,
  TrendingUp,
  ShieldAlert,
  Accessibility
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSubscriptionStatus } from "@/legacyB/_compat/billing";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AccessibilityMenu from '@/legacyB/components/AccessibilityMenu';

const LOGO_URL = "/legacyB/assets/placeholder.png"; // legacy provider removed

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 1, // Multiplier for base font size (e.g., 1 = 16px, 1.2 = 19.2px)
    highContrast: false,
    readableFont: false,
    highlightLinks: false,
    stopAnimations: false,
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Load accessibility settings from localStorage on initial load
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setAccessibilitySettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply accessibility settings whenever they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilitySettings));
    
    // Font Size
    // Set root font size relative to the default 16px
    document.documentElement.style.fontSize = `${accessibilitySettings.fontSize * 16}px`;

    // Toggled classes
    const body = document.body;
    body.classList.toggle('high-contrast', accessibilitySettings.highContrast);
    body.classList.toggle('readable-font', accessibilitySettings.readableFont);
    body.classList.toggle('highlight-links', accessibilitySettings.highlightLinks);
    body.classList.toggle('stop-animations', accessibilitySettings.stopAnimations);

  }, [accessibilitySettings]);

  const handleFontSizeIncrease = () => {
    setAccessibilitySettings(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 0.1, 1.5) })); // Max 1.5x
  };

  const handleFontSizeDecrease = () => {
    setAccessibilitySettings(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 0.1, 0.8) })); // Min 0.8x
  };

  const handleToggleHighContrast = () => setAccessibilitySettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  const handleToggleReadableFont = () => setAccessibilitySettings(prev => ({ ...prev, readableFont: !prev.readableFont }));
  const handleToggleHighlightLinks = () => setAccessibilitySettings(prev => ({ ...prev, highlightLinks: !prev.highlightLinks }));
  const handleToggleStopAnimations = () => setAccessibilitySettings(prev => ({ ...prev, stopAnimations: !prev.stopAnimations }));
  
  const handleResetAccessibility = () => {
    setAccessibilitySettings({
      fontSize: 1,
      highContrast: false,
      readableFont: false,
      highlightLinks: false,
      stopAnimations: false,
    });
  };

  useEffect(() => {
    const loadUserAndSubscription = async () => {
      try {
        const [user, subStatus] = await Promise.all([
            User.me(),
            getSubscriptionStatus()
        ]);
        setCurrentUser(user);
        setSubscriptionStatus(subStatus);
      } catch (error) {
        console.error("Failed to load user or subscription data in layout", error);
      }
    };
    loadUserAndSubscription();
  }, [location.pathname]); // Reload on navigation to get fresh status

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleUpgradeClick = () => {
      // שמירת מצב התפריט ב-localStorage
      if (sidebarOpen) {
        localStorage.setItem('sidebarWasOpen', 'true');
      }
      const redirectUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/plans?from=menu&redirect=${redirectUrl}`);
      setSidebarOpen(false); // Close sidebar after clicking upgrade
  };

  // בדיקה אם חזרנו מדף התוכניות ופתיחת התפריט אם צריך
  useEffect(() => {
    const wasOpen = localStorage.getItem('sidebarWasOpen');
    if (wasOpen === 'true') {
      setSidebarOpen(true);
      localStorage.removeItem('sidebarWasOpen');
    }
  }, [location.pathname]);

  const navigationItems = [
    {
      title: "דשבורד ראשי",
      url: createPageUrl("Dashboard"),
      icon: BarChart3,
    },
    {
      title: "ניהול לקוחות",
      url: createPageUrl("Clients"),
      icon: Users,
    },
    {
      title: "העלאת תוכן",
      url: createPageUrl("VideoUpload"),
      icon: Upload,
    },
    {
      title: "פרסום פוסטים",
      url: createPageUrl("Schedule"),
      icon: Send,
    },
    {
      title: "אנליטיקות",
      url: createPageUrl("Analytics"),
      icon: TrendingUp,
    },
    // REMOVED: Notifications link
  ];

  const isActivePage = (url) => {
    return location.pathname === url ||
           (url.includes('Dashboard') && location.pathname === '/') ||
           (url.includes(currentPageName) && currentPageName);
  };

  const showSubscriptionBanner = subscriptionStatus && !['active', 'trialing'].includes(subscriptionStatus.status);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap');

        * {
          font-family: 'Heebo', sans-serif;
        }

        :root {
          --clockit-primary: #2B5A87;
          --clockit-primary-dark: #1A3A5A;
          --clockit-primary-light: #3D6B9A;
          --clockit-secondary: #F1F5F9;
          --clockit-accent: #0EA5E9;
          --clockit-text: #1E293B;
          --clockit-text-light: #64748B;
          --clockit-white: #FFFFFF;
          --clockit-gray-50: #F8FAFC;
          --clockit-gray-100: #F1F5F9;
        }

        .modern-card {
          background: var(--clockit-white);
          box-shadow: 0 10px 15px -3px rgba(43, 90, 135, 0.1), 0 4px 6px -2px rgba(43, 90, 135, 0.05);
          border: 1px solid #E2E8F0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-card:hover {
          box-shadow: 0 20px 25px -5px rgba(43, 90, 135, 0.15), 0 10px 10px -5px rgba(43, 90, 135, 0.1);
          transform: translateY(-2px);
        }

        .modern-button {
          background: linear-gradient(135deg, var(--clockit-primary) 0%, var(--clockit-primary-dark) 100%);
          color: var(--clockit-white);
          border-radius: 12px;
          box-shadow: 0 4px 14px 0 rgba(43, 90, 135, 0.25);
          transition: all 0.3s ease;
          border: none;
          font-weight: 600;
        }

        .modern-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px 0 rgba(43, 90, 135, 0.35);
          background: linear-gradient(135deg, var(--clockit-primary-dark) 0%, var(--clockit-primary) 100%);
        }

        .nav-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 12px;
        }

        .nav-item:hover {
          background-color: rgba(43, 90, 135, 0.05);
        }

        .nav-item.active {
          background: linear-gradient(135deg, var(--clockit-primary) 0%, var(--clockit-primary-light) 100%);
          color: var(--clockit-white);
          box-shadow: 0 4px 14px 0 rgba(43, 90, 135, 0.25);
        }

        .profile-badge {
          background: linear-gradient(135deg, var(--clockit-primary) 0%, var(--clockit-accent) 100%);
          box-shadow: 0 4px 14px 0 rgba(43, 90, 135, 0.25);
        }

        /* MOBILE SAFETY: Prevent any element from breaking mobile layout */
        * {
          box-sizing: border-box;
        }
        
        html, body {
          overflow-x: hidden;
        }

        /* Accessibility Styles */
        body.high-contrast {
            background-color: #fff !important;
            color: #000 !important;
        }
        
        body.high-contrast * {
            color: #000 !important;
            background-color: #fff !important;
            border-color: #000 !important;
        }
        
        body.high-contrast .modern-card, 
        body.high-contrast .bg-white, 
        body.high-contrast .bg-white\\/80, 
        body.high-contrast header, 
        body.high-contrast aside, 
        body.high-contrast .dialog-content {
            background: #fff !important;
            color: #000 !important;
            border-color: #000 !important;
        }

        body.high-contrast [class*="bg-gray-"], 
        body.high-contrast [class*="bg-blue-"], 
        body.high-contrast [class*="bg-green-"], 
        body.high-contrast [class*="bg-red-"], 
        body.high-contrast [class*="bg-yellow-"], 
        body.high-contrast [class*="bg-purple-"] {
            background: #fff !important;
            color: #000 !important;
            border: 2px solid #000 !important;
        }
        
        body.high-contrast button,
        body.high-contrast a,
        body.high-contrast span,
        body.high-contrast p,
        body.high-contrast h1,
        body.high-contrast h2,
        body.high-contrast h3,
        body.high-contrast h4,
        body.high-contrast div {
            color: #000 !important;
            background-color: #fff !important;
        }

        body.readable-font * { 
            font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important; 
            letter-spacing: 0.5px; 
            word-spacing: 1px; 
        }

        body.highlight-links a { 
            text-decoration: underline !important; 
            background-color: yellow !important; 
            color: black !important; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-weight: bold; 
        }
        
        body.stop-animations * { 
            transition: none !important; 
            animation: none !important; 
        }
      `}</style>

      <div className="flex flex-1 overflow-x-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                  <img src={LOGO_URL} alt="Clockit Logo" className="w-full h-full object-cover bg-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-800">Clockit</h2>
                  <p className="text-sm text-gray-600 font-medium">מנהל תוכן חכם</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2 overflow-y-auto flex-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePage(item.url);

                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      nav-item flex items-center gap-4 p-4 transition-all duration-200 group
                      ${active
                        ? 'active'
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors duration-200`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}`} />
                    </div>
                    <span className="font-medium text-lg">{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Upgrade Button Section */}
            <div className="px-6 py-4">
              <Button onClick={handleUpgradeClick} variant="outline" className="w-full gap-2 modern-button text-white">
                <TrendingUp className="w-4 h-4" />
                שדרוג תוכנית
              </Button>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              {currentUser && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 profile-badge rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {currentUser.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-600 truncate">{currentUser.email}</p>
                  </div>
                  <Link to={createPageUrl("Settings")}>
                    <button className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200">
                      <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </aside>

        {/* Main content area */}
        <div className="lg:mr-72 flex-1 flex flex-col min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
          
          {/* Global Subscription Banner */}
          {showSubscriptionBanner && (
            <div className="bg-red-600 text-white p-3 text-center text-sm flex items-center justify-center gap-4">
              <ShieldAlert className="w-5 h-5"/>
              <span>המנוי שלך אינו פעיל.</span>
              <Link to={createPageUrl('plans')} className="underline font-bold hover:text-red-200">
                בחר תוכנית
              </Link>
            </div>
          )}

          {/* Top Header for Desktop */}
          <header className="hidden lg:flex bg-white/80 backdrop-blur-sm p-6 items-center justify-between sticky top-0 z-30 m-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-xl text-gray-800">
                  {navigationItems.find(item => isActivePage(item.url))?.title || 'דשבורד'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                  {currentUser && (
                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-gray-100">
                      <div className="w-8 h-8 profile-badge rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {currentUser.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm">{currentUser.full_name}</p>
                      </div>
                    </div>
                  )}
              </div>
          </header>

          {/* Mobile Header */}
          <header className="lg:hidden bg-white/80 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-30 mx-2 my-2 rounded-2xl shadow-lg border border-gray-100">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl bg-white/70 hover:bg-white/90 flex items-center justify-center transition-all duration-200"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-800" /> : <Menu className="w-5 h-5 text-gray-800" />}
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">Clockit</h1>
            </div>

            <div className="w-10 h-10" /> {/* Placeholder to keep alignment */}
          </header>

          {/* Page Content - CRITICAL: overflow-x-hidden and proper padding */}
          <main className="flex-1 overflow-x-hidden px-2 sm:px-4 pb-6">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="px-4 sm:px-6 py-4 text-center text-xs text-gray-500 border-t border-gray-200 bg-white/50">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs">
              <Link to={createPageUrl('TermsOfService')} className="hover:text-blue-600">תקנון ותנאי שירות</Link>
              <span>|</span>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-blue-600">מדיניות פרטיות</Link>
            </div>
            <p className="mt-2 text-xs">© {new Date().getFullYear()} Clockit. כל הזכויות שמורות.</p>
          </footer>
        </div>
      </div>
      
      {/* Accessibility Menu & Button */}
      <AccessibilityMenu 
        isOpen={isAccessibilityMenuOpen}
        onClose={() => setIsAccessibilityMenuOpen(false)}
        settings={accessibilitySettings}
        onFontSizeIncrease={handleFontSizeIncrease}
        onFontSizeDecrease={handleFontSizeDecrease}
        onToggleHighContrast={handleToggleHighContrast}
        onToggleReadableFont={handleToggleReadableFont}
        onToggleHighlightLinks={handleToggleHighlightLinks}
        onToggleStopAnimations={handleToggleStopAnimations}
        onReset={handleResetAccessibility}
      />
      <TooltipProvider>
          <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                      variant="default"
                      className="fixed bottom-6 left-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg z-50 flex items-center justify-center modern-button"
                      onClick={() => setIsAccessibilityMenuOpen(prev => !prev)}
                      aria-label="פתח תפריט נגישות"
                  >
                      <Accessibility className="w-6 h-6 sm:w-7 sm:h-7" />
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                  <p>נגישות</p>
              </TooltipContent>
          </Tooltip>
      </TooltipProvider>
    </div>
  );
}
