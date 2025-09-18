import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/utils';

export default function SubscriptionRequired() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4" dir="rtl">
            <Card className="max-w-xl w-full text-center shadow-xl border-t-4 border-orange-500">
                <CardHeader className="pt-10">
                    <ShieldAlert className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-800">נדרש מנוי פעיל</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <p className="text-gray-600 text-lg">
                        הגישה לדף זה מוגבלת למשתמשים עם מנוי פעיל או בתקופת נסיון.
                        אנא בחר תוכנית כדי להמשיך.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <Button asChild size="lg" className="text-lg py-6 modern-button">
                            <Link to={createPageUrl('plans')}>
                                בחר תוכנית
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="text-lg py-6">
                            <Link to={createPageUrl('Dashboard')}>
                                <ArrowLeft className="ml-2 w-5 h-5"/>
                                חזור לדשבורד
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}