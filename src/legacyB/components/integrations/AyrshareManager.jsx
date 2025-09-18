
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings,
  Key,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react";
import AyrshareService from './AyrshareService';
import { User } from '@/legacyB/_compat/entities';
import { Client } from '@/legacyB/_compat/entities';

export default function AyrshareManager({ 
  clientId, 
  onConnectionUpdate,
  showApiKeySetup = false 
}) {
  const [apiKey, setApiKey] = useState('');
  const [profileKey, setProfileKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectedPlatforms, setConnectedPlatforms] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [ayrshareService, setAyrshareService] = useState(null);

  // checkConnectionStatus is called inside initializeAyrshare, so it needs to be defined first or also memoized.
  // For the purpose of the outline, we assume it's correctly handled or stable by context,
  // but typically, checkConnectionStatus would also be useCallback'd if initializeAyrshare depends on it.
  const checkConnectionStatus = async (service) => {
    try {
      const profiles = await service.getProfiles();
      const socialAccounts = await service.getSocialAccounts();
      
      setConnectedPlatforms(socialAccounts);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Error checking Ayrshare status:', error);
      setConnectionStatus('error');
    }
  };

  const initializeAyrshare = React.useCallback(async () => {
    try {
      const user = await User.me();
      if (user.ayrshare_profile_key) {
        setProfileKey(user.ayrshare_profile_key);
        
        // אם יש API key שמור במשתנה סביבה או בהגדרות
        const service = new AyrshareService();
        service.setProfileKey(user.ayrshare_profile_key);
        setAyrshareService(service);
        
        await checkConnectionStatus(service);
      } else {
        setConnectionStatus('not_configured');
      }
    } catch (error) {
      console.error('Error initializing Ayrshare:', error);
      setConnectionStatus('error');
    }
  }, []); // Empty dependency array as per outline. Note: If checkConnectionStatus were to change, this would capture a stale version.

  useEffect(() => {
    initializeAyrshare();
  }, [initializeAyrshare]); // initializeAyrshare is now a stable dependency due to useCallback.

  const setupApiKey = async () => {
    if (!apiKey.trim()) {
      alert('אנא הזן API Key');
      return;
    }

    setIsConnecting(true);
    try {
      const service = new AyrshareService(apiKey);
      
      // בדיקת תקינות ה-API Key
      const profiles = await service.getProfiles();
      
      let currentProfileKey = profileKey; // Use a local variable to ensure current value
      if (profiles.length === 0) {
        // יצירת פרופיל חדש
        const newProfile = await service.createProfile('ניהול רשתות חברתיות');
        setProfileKey(newProfile.profileKey);
        service.setProfileKey(newProfile.profileKey);
        currentProfileKey = newProfile.profileKey;
      } else {
        // שימוש בפרופיל הראשון
        setProfileKey(profiles[0].profileKey);
        service.setProfileKey(profiles[0].profileKey);
        currentProfileKey = profiles[0].profileKey;
      }

      // שמירת המפתחות
      await User.updateMyUserData({
        ayrshare_profile_key: currentProfileKey // Use the updated value
      });

      setAyrshareService(service);
      await checkConnectionStatus(service);
      
      alert('Ayrshare הוגדר בהצלחה!');
      
    } catch (error) {
      console.error('Error setting up Ayrshare:', error);
      alert('שגיאה בהגדרת Ayrshare. בדוק את ה-API Key');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectPlatform = async (platform) => {
    if (!ayrshareService) {
      alert('אנא הגדר את Ayrshare תחילה');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await ayrshareService.addSocialAccount(platform);
      
      if (result.url) {
        // פתיחת חלון אימות
        const authWindow = window.open(
          result.url,
          'ayrshare_auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // המתנה לסגירת החלון או השלמת האימות
        const checkAuth = setInterval(async () => {
          if (authWindow.closed) {
            clearInterval(checkAuth);
            await checkConnectionStatus(ayrshareService);
            setIsConnecting(false);
          }
        }, 1000);
        
        // timeout אחרי 5 דקות
        setTimeout(() => {
          clearInterval(checkAuth);
          if (!authWindow.closed) {
            authWindow.close();
          }
          setIsConnecting(false);
        }, 300000);
      }
      
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert(`שגיאה בחיבור ל-${platform}`);
      setIsConnecting(false);
    }
  };

  const disconnectPlatform = async (platform) => {
    if (!ayrshareService) return;
    
    if (confirm(`האם אתה בטוח שברצונך לנתק את ${platform}?`)) {
      try {
        await ayrshareService.removeSocialAccount(platform);
        await checkConnectionStatus(ayrshareService);
        
        // עדכון לקוח אם זה רכיב ספציפי ללקוח
        if (clientId) {
          const client = await Client.filter({ id: clientId });
          if (client.length > 0) {
            const updatedSocialAccounts = { ...client[0].social_accounts };
            updatedSocialAccounts[platform] = false;
            await Client.update(clientId, { social_accounts: updatedSocialAccounts });
          }
        }
        
        onConnectionUpdate && onConnectionUpdate();
        
      } catch (error) {
        console.error('Error disconnecting platform:', error);
        alert(`שגיאה בניתוק ${platform}`);
      }
    }
  };

  const platforms = [
    { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600 text-white' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600 text-white' }
  ];

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected': return <Badge className="bg-green-100 text-green-800">מחובר</Badge>;
      case 'not_configured': return <Badge className="bg-yellow-100 text-yellow-800">לא מוגדר</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">שגיאה</Badge>;
      case 'checking': return <Badge variant="outline">בודק...</Badge>;
      default: return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Setup */}
      {(showApiKeySetup || connectionStatus === 'not_configured') && (
        <Card className="border-0 shadow-lg border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-600" />
              הגדרת Ayrshare API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                נדרש API Key של Ayrshare כדי להתחיל. 
                <a href="https://app.ayrshare.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline mr-1">
                  קבל את המפתח כאן
                </a>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">Ayrshare API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="הזן את ה-API Key שלך..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={setupApiKey} 
              disabled={isConnecting || !apiKey.trim()}
              className="w-full gap-2"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isConnecting ? 'מגדיר...' : 'הגדר Ayrshare'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              סטטוס חיבור Ayrshare
            </CardTitle>
            {getConnectionStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {connectionStatus === 'connected' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platforms.map(platform => {
                const isConnected = connectedPlatforms[platform.id];
                
                return (
                  <div key={platform.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{platform.name}</h4>
                      {isConnected ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant={isConnected ? 'default' : 'outline'} className="w-full justify-center">
                        {isConnected ? 'מחובר' : 'לא מחובר'}
                      </Badge>
                      
                      <Button
                        variant={isConnected ? 'destructive' : 'default'}
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => isConnected ? disconnectPlatform(platform.id) : connectPlatform(platform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isConnected ? (
                          <LinkIcon className="w-3 h-3" />
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                        {isConnected ? 'נתק' : 'חבר'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                שגיאה בחיבור ל-Ayrshare. בדוק את ה-API Key או נסה שוב מאוחר יותר.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
