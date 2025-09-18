
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader2, AlertTriangle, TrendingUp, Plus, Minus, Crown, CheckCircle, Badge, Info, Check } from 'lucide-react';
import { User } from '@/legacyB/_compat/entities';
import { getSubscriptionStatus, createCheckoutSession } from '@/legacyB/_compat/billing';
import useToast from '@/legacyB/components/ui/Toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const CLIENT_PRICING = { 1: 50, 5: 70, 10: 160, 15: 260, 20: 300 };
const BUSINESS_PLAN_PRICE = 400;

export default function PlansPage() {
  const navigate = useNavigate();
  const { addToast, ToastContainer } = useToast();

  const [subscription, setSubscription] = useState(null);
  const [selectedClients, setSelectedClients] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(null);

  const loadSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const subData = await getSubscriptionStatus();
      setSubscription(subData);
      if (subData.planId?.startsWith('clients_')) {
        setSelectedClients(subData.quantity);
      }
    } catch (err) {
      console.error("Failed to load subscription data:", err);
      addToast("שגיאה בטעינת נתוני המנוי שלך.", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handlePlanSelection = async (planId, quantity) => {
    setIsRedirecting(planId);
    try {
      const { checkoutUrl } = await createCheckoutSession(planId, quantity);
      window.location.href = checkoutUrl;
    } catch (err) {
      addToast('שגיאה ביצירת סשן תשלום. נסה שוב.', 'error');
      setIsRedirecting(null);
    }
  };

  const adjustClientCount = (direction) => {
    const availableCounts = Object.keys(CLIENT_PRICING).map(Number).sort((a, b) => a - b);
    const currentIndex = availableCounts.indexOf(selectedClients);
    
    if (direction === 'up' && currentIndex < availableCounts.length - 1) {
      setSelectedClients(availableCounts[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setSelectedClients(availableCounts[currentIndex - 1]);
    }
  };

  const isCurrentPlan = (planId, quantity) => {
    if (!subscription || subscription.status === 'free') return false;
    if (planId === 'business' && subscription.planId === 'business') return true;
    if (planId.startsWith('clients_') && subscription.planId === planId && subscription.quantity === quantity) return true;
    return false;
  };
  
  const isDowngrade = (planType, quantity) => {
    if (!subscription || subscription.status !== 'active') return false;
    
    const currentPrice = subscription.planId === 'business' 
      ? BUSINESS_PLAN_PRICE 
      : CLIENT_PRICING[subscription.quantity];
      
    const newPrice = planType === 'business'
      ? BUSINESS_PLAN_PRICE
      : CLIENT_PRICING[quantity];

    return newPrice < currentPrice;
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600">טוען תוכניות...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8" dir="rtl">
      <ToastContainer />
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3">
                תוכניות שמתאימות לך
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                בחר את החבילה המושלמת עבורך. כל התוכניות כוללות תקופת נסיון של 7 ימים.
            </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Flexible Plan Card */}
          <div className="relative pt-6">
            {selectedClients === 10 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg border-2 border-white">
                        הכי פופולרי
                    </div>
                </div>
            )}
            <Card className={`border-2 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full ${selectedClients === 10 ? 'border-purple-500' : 'border-gray-200'}`}>
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2 text-center">תוכנית גמישה</CardTitle>
                <p className="text-gray-500 text-center">שלם רק על כמות הלקוחות שאתה צריך.</p>
              </CardHeader>
              
              <CardContent className="p-8 flex-grow flex flex-col">
              <div className="bg-gray-100 rounded-xl p-6 mb-8">
                <p className="text-center text-sm font-medium text-gray-600 mb-4">כמה לקוחות תרצה לנהל?</p>
                <div className="flex items-center justify-center gap-6">
                  <Button variant="outline" size="icon" onClick={() => adjustClientCount('down')} disabled={selectedClients === 1} className="w-12 h-12 rounded-full"><Minus className="w-5 h-5" /></Button>
                  <div>
                    <div className="text-5xl font-bold text-blue-600">{selectedClients}</div>
                    <div className="text-sm text-gray-500 tracking-wider">לקוחות</div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => adjustClientCount('up')} disabled={selectedClients === 20} className="w-12 h-12 rounded-full"><Plus className="w-5 h-5" /></Button>
                </div>
              </div>

              <div className="text-center mb-8">
                <span className="text-5xl font-extrabold text-gray-800">₪{CLIENT_PRICING[selectedClients]}</span>
                <span className="text-xl text-gray-500"> / לחודש</span>
              </div>
              
              <ul className="space-y-3 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>עד {selectedClients} לקוחות</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>פרסום לכל הרשתות</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>דוחות אנליטיקס</span></li>
              </ul>

              <div className="mt-8">
                {isDowngrade('clients', selectedClients) && (
                  <div className="text-center text-xs text-orange-600 bg-orange-50 p-2 rounded-md mb-2">
                    השינוי ייכנס לתוקף בסוף תקופת החיוב הנוכחית.
                  </div>
                )}
                <Button
                  onClick={() => handlePlanSelection(`clients_${selectedClients}`, selectedClients)}
                  disabled={isRedirecting || isCurrentPlan(`clients_${selectedClients}`, selectedClients)}
                  className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRedirecting === `clients_${selectedClients}` && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
                  {isCurrentPlan(`clients_${selectedClients}`, selectedClients) ? "התוכנית הנוכחית" : isDowngrade('clients', selectedClients) ? "תזמן שינוי" : "בחר תוכנית"}
                </Button>
              </div>
            </CardContent>
            </Card>
          </div>

          {/* Business Plan Card */}
          <div className="relative pt-6">
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                <CardHeader className="p-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">תוכנית ביזנס</CardTitle>
                        <Crown className="w-8 h-8 text-yellow-500"/>
                    </div>
                  <p className="text-gray-500">כל מה שצריך כדי לצמוח, ללא הגבלות.</p>
                </CardHeader>
                <CardContent className="p-8 flex-grow flex flex-col">
                  <div className="text-center mb-8">
                    <span className="text-5xl font-extrabold text-gray-800">₪{BUSINESS_PLAN_PRICE}</span>
                    <span className="text-xl text-gray-500"> / לחודש</span>
                  </div>
                  <ul className="space-y-3 flex-grow">
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><b>ללא הגבלת</b> לקוחות</li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>תמיכה וליווי אישי</span></li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>גישה לפיצ'רים עתידיים</span></li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>הכל מהתוכנית הגמישה</span></li>
                  </ul>
                  <div className="mt-8">
                    {isDowngrade('business', null) && (
                      <div className="text-center text-xs text-orange-600 bg-orange-50 p-2 rounded-md mb-2">
                        השינוי ייכנס לתוקף בסוף תקופת החיוב הנוכחית.
                      </div>
                    )}
                    <Button
                      onClick={() => handlePlanSelection('business', null)}
                      disabled={isRedirecting || isCurrentPlan('business')}
                      className="w-full text-lg py-6 modern-button"
                    >
                      {isRedirecting === 'business' && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
                      {isCurrentPlan('business') ? "התוכנית הנוכחית" : isDowngrade('business', null) ? "תזמן שינוי" : "בחר תוכנית"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
