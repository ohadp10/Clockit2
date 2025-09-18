
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Palette,
  Database,
  Save,
  Loader2,
  Info,
  CreditCard,
  FileText,
  BadgeCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { User as UserEntity } from '@/legacyB/_compat/entities';
import {
  getSubscriptionStatus,
  cancelSubscription,
  resumeSubscription,
  getPortalUrl
} from '@/legacyB/_compat/billing';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useToast from '@/legacyB/components/ui/Toast';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { createPageUrl } from '@/utils';


export default function Settings() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState({ company_name: '' });
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const { addToast, ToastContainer } = useToast();
  const lastLoadTimeRef = useRef(0); // Add ref to track last load time
  const navigate = useNavigate(); // Initialize useNavigate hook

  const loadInitialData = useCallback(async () => {
    // Rate limiting protection: prevent calls within 5 seconds of each other
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 5000) {
      console.log('Skipping loadInitialData - too soon since last call');
      return;
    }
    lastLoadTimeRef.current = now;

    setIsLoading(true);
    try {
      // Add small delay to prevent rapid-fire requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const [currentUser, subData] = await Promise.all([
        UserEntity.me(),
        getSubscriptionStatus()
      ]);
      
      setUser(currentUser);
      setSubscription(subData);

      if (currentUser.company_name) {
        setUserSettings(prev => ({ ...prev, company_name: currentUser.company_name }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      
      // Specific handling for rate limiting
      if (error.message && error.message.includes('429')) {
        addToast('יותר מדי בקשות. אנא המתן רגע ונסה שוב', 'error');
        // Retry after a delay
        setTimeout(() => {
          loadInitialData();
        }, 3000);
      } else {
        addToast('שגיאה בטעינת נתונים', 'error');
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // addToast is stable from the custom hook, safe to omit

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Depend on loadInitialData

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await UserEntity.updateMyUserData({ company_name: userSettings.company_name });
      addToast('הגדרות נשמרו בהצלחה!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('שגיאה בשמירת הגדרות', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
      try {
        await UserEntity.logout();
        navigate('/auth');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  const handleChangePassword = () => {
    navigate(createPageUrl('change-password')); // Navigate to a dedicated change-password page
  };

  const handleCancelSub = async (mode) => {
    setIsBillingLoading(true);
    try {
      await cancelSubscription(mode);
      addToast('הוראת הביטול התקבלה', 'success');
      await loadInitialData(); // Refresh subscription status
    } catch (err) {
      addToast('שגיאה בביטול המנוי', 'error');
    } finally {
      setIsBillingLoading(false);
    }
  };
  
  const handleResumeSub = async () => {
    setIsBillingLoading(true);
    try {
      await resumeSubscription();
      addToast('המנוי חודש בהצלחה!', 'success');
      await loadInitialData();
    } catch(err) {
      addToast('שגיאה בחידוש המנוי', 'error');
    } finally {
      setIsBillingLoading(false);
    }
  };
  
  const handlePortalRedirect = async () => {
      setIsBillingLoading(true);
      try {
          const { portalUrl } = await getPortalUrl();
          window.open(portalUrl, '_blank');
      } catch (err) {
          addToast('לא ניתן לגשת לפורטל החיובים כרגע', 'error');
      } finally {
          setIsBillingLoading(false);
      }
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'trialing': return <Badge variant="default" className="bg-blue-500">בתקופת נסיון</Badge>;
      case 'active': return <Badge variant="default" className="bg-green-500">פעיל</Badge>;
      case 'past_due': return <Badge variant="destructive">תשלום נכשל</Badge>;
      case 'canceled': return <Badge variant="secondary">בוטל</Badge>;
      default: return <Badge variant="outline">לא פעיל</Badge>;
    }
  };

  const renderSubscriptionInfo = () => {
    if (!subscription || subscription.status === 'free') {
      return <p>אינך רשום לאף תוכנית. <Link to={createPageUrl('plans')} className="text-blue-600 underline">בחר תוכנית</Link></p>;
    }

    const planName = subscription.planId === 'business' ? 'תוכנית ביזנס' : `תוכנית גמישה (${subscription.quantity} לקוחות)`;

    return (
      <div className="space-y-4">
        {subscription.status === 'past_due' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600"/>
              <p className="text-sm text-red-800">התשלום האחרון נכשל. אנא עדכן את אמצעי התשלום שלך.</p>
          </div>
        )}
        
        {subscription.pending_downgrade && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
              <Info className="w-5 h-5 text-orange-600"/>
              <p className="text-sm text-orange-800">שינוי תוכנית ממתין. תוכניתך תוחלף ל-`{subscription.pending_downgrade.planId}` בתאריך {format(new Date(subscription.pending_downgrade.effectiveOn), 'dd/MM/yyyy')}.</p>
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>שם התוכנית</Label><p className="font-semibold">{planName}</p></div>
          <div><Label>סטטוס</Label><div>{getStatusBadge(subscription.status)}</div></div>
          {subscription.trial_end && <div><Label>סיום תקופת נסיון</Label><p>{format(new Date(subscription.trial_end), 'dd/MM/yyyy')}</p></div>}
          {subscription.current_period_end && <div><Label>תאריך חיוב הבא</Label><p>{format(new Date(subscription.current_period_end), 'dd/MM/yyyy')}</p></div>}
           {subscription.status === 'canceled' && subscription.effectiveOn && <div><Label>תאריך סיום</Label><p>{format(new Date(subscription.effectiveOn), 'dd/MM/yyyy')}</p></div>}
        </div>
      </div>
    );
  };
  
  const renderSubscriptionActions = () => {
      if (!subscription || subscription.status === 'free') return null;

      return (
        <div className="pt-4 border-t mt-4 space-y-4">
          <h4 className="font-semibold text-gray-700">פעולות</h4>
          <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to={createPageUrl('plans')}>שנה תוכנית</Link></Button>
              <Button variant="outline" onClick={handlePortalRedirect} disabled={isBillingLoading}>
                  {isBillingLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin"/>}
                  נהל אמצעי תשלום
              </Button>
              
              {subscription.status === 'canceled' ? (
                  <Button onClick={handleResumeSub} disabled={isBillingLoading} className="bg-green-600 hover:bg-green-700">
                    {isBillingLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RotateCcw className="w-4 h-4"/>}
                    הפעל מנוי מחדש
                  </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isBillingLoading}>בטל מנוי</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ביטול מנוי</AlertDialogTitle>
                      <AlertDialogDescription>
                        תוכל לבטל את המנוי באופן מיידי (הגישה תסתיים מיד) או בסוף תקופת החיוב הנוכחית (הגישה תמשיך עד הסוף).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>חזור</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCancelSub('period_end')} className="bg-orange-500 hover:bg-orange-600">בטל בסוף התקופה</AlertDialogAction>
                      <AlertDialogAction onClick={() => handleCancelSub('immediate')}>בטל מיידית</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
          </div>
        </div>
      );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <Card className="border-0 shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><SettingsIcon className="w-6 h-6" />הגדרות מערכת</CardTitle></CardHeader></Card>

      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" />מנוי וחיובים</CardTitle></CardHeader>
        <CardContent>
          {renderSubscriptionInfo()}
          {renderSubscriptionActions()}
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />פרופיל משתמש</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>שם מלא</Label><Input value={user?.full_name || ''} disabled /></div>
            <div><Label>אימייל</Label><Input value={user?.email || ''} disabled /></div>
          </div>
          <div><Label htmlFor="company">שם החברה/הסוכנות</Label><Input id="company" value={userSettings.company_name} onChange={(e) => setUserSettings(p => ({ ...p, company_name: e.target.value }))} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          שמור הגדרות
        </Button>
      </div>

      <Card className="border-0 shadow-lg border-t-4 border-red-500">
        <CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><Shield className="w-5 h-5" />אבטחה וחשבון</CardTitle></CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-4">
                <Button variant="destructive" onClick={handleLogout}>התנתק מהמערכת</Button>
                {/* Changed the "Change Password" button to be active and navigate */}
                <Button variant="outline" onClick={handleChangePassword}>שנה סיסמה</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
