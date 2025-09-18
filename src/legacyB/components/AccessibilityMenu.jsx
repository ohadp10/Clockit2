import React from 'react';
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Type,
  Link,
  Ban,
  RotateCcw,
  X
} from "lucide-react";

export default function AccessibilityMenu({
  isOpen,
  onClose,
  settings,
  onFontSizeIncrease,
  onFontSizeDecrease,
  onToggleHighContrast,
  onToggleReadableFont,
  onToggleHighlightLinks,
  onToggleStopAnimations,
  onReset
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-6 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 w-80 p-4 transition-all duration-300" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">תפריט נגישות</h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="סגור תפריט נגישות">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-16 flex-col gap-1" onClick={onFontSizeIncrease}>
          <ZoomIn className="w-5 h-5" />
          <span className="text-xs">הגדל טקסט</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-1" onClick={onFontSizeDecrease}>
          <ZoomOut className="w-5 h-5" />
          <span className="text-xs">הקטן טקסט</span>
        </Button>
        <Button variant={settings.highContrast ? 'default' : 'outline'} className="h-16 flex-col gap-1" onClick={onToggleHighContrast}>
          {settings.highContrast ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-xs">ניגודיות גבוהה</span>
        </Button>
        <Button variant={settings.readableFont ? 'default' : 'outline'} className="h-16 flex-col gap-1" onClick={onToggleReadableFont}>
          <Type className="w-5 h-5" />
          <span className="text-xs">גופן קריא</span>
        </Button>
        <Button variant={settings.highlightLinks ? 'default' : 'outline'} className="h-16 flex-col gap-1" onClick={onToggleHighlightLinks}>
          <Link className="w-5 h-5" />
          <span className="text-xs">הדגש קישורים</span>
        </Button>
        <Button variant={settings.stopAnimations ? 'default' : 'outline'} className="h-16 flex-col gap-1" onClick={onToggleStopAnimations}>
          <Ban className="w-5 h-5" />
          <span className="text-xs">עצור אנימציות</span>
        </Button>
      </div>
      <div className="mt-4">
        <Button variant="destructive" className="w-full gap-2" onClick={onReset}>
          <RotateCcw className="w-4 h-4" />
          אפס הגדרות
        </Button>
      </div>
    </div>
  );
}