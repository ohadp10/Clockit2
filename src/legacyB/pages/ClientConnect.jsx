
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, ExternalLink, Info } from "lucide-react";
import { Client } from '@/legacyB/_compat/entities';

export default function ClientConnect() {
  const location = useLocation();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clientId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setError('לא נמצא מזהה לקוח.');
        setIsLoading(false);
        return;
      }

      try {
        const fetchedClient = await Client.get(clientId);
        setClient(fetchedClient);
      } catch (e) {
        setError('לא ניתן היה לטעון את פרטי הלקוח.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  const handleConnectSocialMedia = () => {
    // כפתור ללא פונקציונליות כרגע
    console.log('חיבור רשתות חברתיות - בפיתוח');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertTitle>שגיאה</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            {client?.logo_url ? (
              <img src={client.logo_url} alt={client.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">{client?.name?.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-2xl">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                חיבור רשתות
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-600">עבור {client?.name}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>חיבור רשתות חברתיות</AlertTitle>
        <AlertDescription className="text-sm">
          לחץ על הכפתור למטה כדי להתחיל את תהליך חיבור הרשתות החברתיות עבור הלקוח.
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8 md:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <ExternalLink className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">חיבור רשתות חברתיות</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4 leading-relaxed">
            חבר את הרשתות החברתיות של הלקוח כדי להתחיל לפרסם תוכן אוטומטית.
          </p>
          <Button 
            onClick={handleConnectSocialMedia} 
            size="lg" 
            className="px-6 sm:px-8 py-3 text-sm sm:text-base md:text-lg bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            חבר רשתות חברתיות
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
