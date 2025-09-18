
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-gray-700" />
            תקנון ותנאי שירות
          </CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
          <p>ברוכים הבאים ל-Clockit ("השירות"). תנאי שירות אלה ("התנאים") מסדירים את הגישה והשימוש שלך בשירות. אנא קרא אותם בעיון.</p>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">1. הסכמה לתנאים</h2>
            <p>על ידי גישה או שימוש בשירות, אתה מסכים להיות מחויב לתנאים אלה. אם אינך מסכים לתנאים, אינך רשאי להשתמש בשירות.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">2. חשבונות משתמשים</h2>
            <p>עליך ליצור חשבון כדי להשתמש ברוב תכונות השירות. אתה אחראי לשמירה על סודיות סיסמתך וחשבונך. אתה מסכים להודיע לנו מיד על כל שימוש בלתי מורשה בחשבונך.</p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">3. תוכן המשתמש</h2>
            <p>אתה שומר על כל הזכויות בתוכן שאתה מעלה, מפרסם או מציג באמצעות השירות ("תוכן משתמש"). על ידי מתן תוכן משתמש, אתה מעניק לנו רישיון עולמי, לא בלעדי, ללא תמלוגים, להשתמש, להעתיק, לשכפל, לעבד, להתאים, לשנות, לפרסם, להעביר, להציג ולהפיץ את תוכן המשתמש שלך אך ורק לצורך תפעול, פיתוח, מתן ושיפור השירות.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">4. מנויים ותשלומים</h2>
            <p>השירות מוצע במסגרת תוכניות מנוי שונות. על ידי בחירת תוכנית מנוי, אתה מסכים לשלם את העמלות החלות. כל העמלות אינן ניתנות להחזר. אנו עשויים לשנות את תמחור התוכניות שלנו, ונודיע לך על כך מראש.</p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">5. קניין רוחני</h2>
            <p>השירות וכל התוכן המקורי שלו (למעט תוכן משתמש), התכונות והפונקציונליות הם ויישארו בבעלותה הבלעדית של Clockit ומעניקי הרישיונות שלה.</p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">6. הגבלת אחריות</h2>
            <p>בשום מקרה Clockit, וגם לא הדירקטורים, העובדים, השותפים, הסוכנים, הספקים או השותפים העסקיים שלה, לא יהיו אחראים לכל נזק עקיף, מקרי, מיוחד, תוצאתי או עונשי, לרבות אך לא רק, אובדן רווחים, נתונים, שימוש, מוניטין, או הפסדים לא מוחשיים אחרים.</p>
             <p className="text-sm text-gray-500 font-semibold">כתב ויתור: זהו נוסח משפטי לדוגמה בלבד ואינו מהווה ייעוץ משפטי. יש להתייעץ עם עורך דין מוסמך.</p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">7. שינויים בתנאים</h2>
            <p>אנו שומרים לעצמנו את הזכות, לפי שיקול דעתנו הבלעדי, לשנות או להחליף תנאים אלה בכל עת. אם שינוי הוא מהותי, נספק הודעה של 30 יום לפחות לפני כניסת התנאים החדשים לתוקף.</p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">8. צור קשר</h2>
            <p>אם יש לך שאלות כלשהן לגבי תנאים אלה, אנא צור איתנו קשר בכתובת support@clockit.example.com.</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
