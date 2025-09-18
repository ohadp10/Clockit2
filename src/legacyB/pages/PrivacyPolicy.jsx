
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-700" />
            מדיניות פרטיות
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
          <p>Clockit ("אנחנו", "שלנו") מחויבת להגן על פרטיותך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, חושפים ושומרים על המידע שלך בעת השימוש בשירות שלנו.</p>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">1. איזה מידע אנו אוספים</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>מידע אישי:</strong> שם, כתובת דוא"ל, ופרטים נוספים שאתה מספק בעת יצירת חשבון.</li>
              <li><strong>נתוני שימוש:</strong> מידע על אופן השימוש שלך בשירות, כגון כתובות IP, סוג דפדפן, ודפים שנצפו.</li>
              <li><strong>מידע מרשתות חברתיות:</strong> כאשר אתה מחבר את חשבונות המדיה החברתית שלך, אנו עשויים לאסוף מידע פרופיל בסיסי ומזהי חשבון, בהתאם להרשאות שאתה מעניק.</li>
               <li><strong>מידע על תשלומים:</strong> פרטי התשלום שלך מעובדים על ידי ספקי צד שלישי מאובטחים. איננו שומרים את פרטי כרטיס האשראי המלאים שלך.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">2. כיצד אנו משתמשים במידע שלך</h2>
            <p>אנו משתמשים במידע שאנו אוספים כדי:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>לספק, לתפעל ולתחזק את השירות שלנו.</li>
              <li>לנהל את חשבונך ולספק לך תמיכת לקוחות.</li>
              <li>לעבד את העסקאות והתשלומים שלך.</li>
              <li>לשפר את השירות ולפתח תכונות חדשות.</li>
              <li>לתקשר איתך, כולל שליחת עדכוני שירות ומיילים שיווקיים (מהם תוכל לבטל את הרישום).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">3. עם מי אנו חולקים את המידע שלך</h2>
            <p>אנו עשויים לחלוק את המידע שלך עם:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>ספקי שירותים:</strong> חברות צד שלישי המסייעות לנו בתפעול השירות, כגון ספקי אירוח, ספקי תשלומים (למשל, PayPlus), וספקי אינטגרציה (למשל, Ayrshare).</li>
              <li><strong>רשויות אכיפת חוק:</strong> אם נידרש לכך על פי חוק או בתגובה לבקשות תקפות של רשויות ציבוריות.</li>
            </ul>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">4. אבטחת מידע</h2>
            <p>אנו משתמשים באמצעי אבטחה סבירים מבחינה מסחרית כדי להגן על המידע שלך, אך איננו יכולים להבטיח את אבטחתו המוחלטת.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">5. זכויותיך</h2>
            <p>בהתאם לחוק החל, ייתכן שתהיה לך הזכות לגשת, לתקן או למחוק את המידע האישי שלך. אנא צור איתנו קשר כדי לממש זכויות אלה.</p>
            <p className="text-sm text-gray-500 font-semibold">כתב ויתור: זהו נוסח משפטי לדוגמה בלבד ואינו מהווה ייעוץ משפטי. יש להתייעץ עם עורך דין מוסמך.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">6. צור קשר</h2>
            <p>אם יש לך שאלות כלשהן לגבי מדיניות פרטיות זו, אנא צור איתנו קשר בכתובת privacy@clockit.example.com.</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
