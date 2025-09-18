
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Wand2,
  Clock,
  Zap,
  ArrowRight,
  ArrowLeft,
  Video,
  Loader2,
  FileText,
  Hash,
  Edit
} from "lucide-react";
import useToast from '@/legacyB/components/ui/Toast';

const weekDaysMap = [
  { label: "א", value: "0" },
  { label: "ב", value: "1" },
  { label: "ג", value: "2" },
  { label: "ד", value: "3" },
  { label: "ה", value: "4" },
  { label: "ו", value: "5" },
  { label: "ש", value: "6" },
];

export default function SchedulingTemplates({
  selectedVideos = [],
  selectedClientId,
  onScheduleGenerated,
  isLoading,
  onBack
}) {
  const [currentStep, setCurrentStep] = useState('schedule'); // 'schedule', 'content', 'review'
  const { addToast, ToastContainer } = useToast();

  const [customSettings, setCustomSettings] = useState({
    startDate: new Date().toISOString().split('T')[0],
    days: [],
    time: '10:00'
  });

  // תיאור, האשטגים ופלטפורמות לכל סרטון בנפרד
  const [videoContents, setVideoContents] = useState({});

  const availableVideos = selectedVideos.filter(video =>
    video && video.upload_status === 'completed'
  );

  // רשימת הפלטפורמות הזמינות
  const platforms = [
    { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
    { id: 'instagram', name: 'Instagram Post', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
    { id: 'instagram_story', name: 'Instagram Story', color: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600 text-white' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600 text-white' },
    { id: 'twitter', name: 'X (Twitter)', color: 'bg-gray-800 text-white' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700 text-white' },
    { id: 'threads', name: 'Threads', color: 'bg-gray-900 text-white' }
  ];

  // אתחול תוכן לכל סרטון
  React.useEffect(() => {
    if (availableVideos.length === 0) return;
    
    const initialContents = {};
    let shouldUpdate = false;
    
    availableVideos.forEach(video => {
      if (!videoContents[video.id]) {
        shouldUpdate = true;
        initialContents[video.id] = {
          caption: '',
          hashtags: '#תוכן #רשתותחברתיות',
          platforms: ['instagram', 'tiktok'] // ברירת מחדל
        };
      }
    });
    
    if (shouldUpdate && Object.keys(initialContents).length > 0) {
      setVideoContents(prev => ({
        ...prev,
        ...initialContents
      }));
    }
  }, [availableVideos.length]); // רק תלוי באורך המערך, לא במערך עצמו

  const handleDayToggle = (dayValue) => {
    setCustomSettings(prev => {
      const currentDays = prev.days;
      const newDays = currentDays.includes(dayValue)
        ? currentDays.filter(d => d !== dayValue)
        : [...currentDays, dayValue];
      return { ...prev, days: newDays };
    });
  };

  const updateVideoContent = (videoId, field, value) => {
    setVideoContents(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        [field]: value
      }
    }));
  };

  const togglePlatform = (videoId, platformId) => {
    const currentVideo = videoContents[videoId] || { platforms: [] };
    const currentPlatforms = currentVideo.platforms || [];
    const newPlatforms = currentPlatforms.includes(platformId)
      ? currentPlatforms.filter(id => id !== platformId)
      : [...currentPlatforms, platformId];

    updateVideoContent(videoId, 'platforms', newPlatforms);
  };

  const copyContentToAll = (sourceVideoId, field) => {
    const sourceValue = videoContents[sourceVideoId]?.[field] || (field === 'platforms' ? [] : '');
    const updates = {};
    availableVideos.forEach(video => {
      if (video.id !== sourceVideoId) {
        updates[video.id] = {
          ...(videoContents[video.id] || {}),
          [field]: sourceValue
        };
      }
    });
    setVideoContents(prev => ({ ...prev, ...updates }));
    addToast(`${field === 'caption' ? 'כיתוב' : field === 'hashtags' ? 'האשטגים' : 'פלטפורמות'} הועתק לכל הסרטונים`, 'success');
  };

  const handleNextToContent = () => {
    if (customSettings.days.length === 0) {
      addToast('יש לבחור לפחות יום אחד בשבוע', 'error');
      return;
    }
    if (!customSettings.time) {
      addToast('יש לבחור שעת פרסום', 'error');
      return;
    }
    setCurrentStep('content');
  };

  const handleGenerateCustomSchedule = async () => {
    if (availableVideos.length === 0) {
      addToast('אין סרטונים זמינים לתזמון', 'error');
      return;
    }

    // בדיקה שלכל סרטון יש לפחות פלטפורמה אחת נבחרת
    const videosWithoutPlatforms = availableVideos.filter(video => {
      const videoContent = videoContents[video.id] || {};
      return !videoContent.platforms || videoContent.platforms.length === 0;
    });

    if (videosWithoutPlatforms.length > 0) {
      addToast('יש לבחור לפחות פלטפורמה אחת לכל סרטון', 'error');
      return;
    }

    const postsToCreate = [];
    let currentDate = new Date(customSettings.startDate);
    let videoIndex = 0;
    const selectedDays = customSettings.days.map(Number);

    while (videoIndex < availableVideos.length) {
      const dayOfWeek = currentDate.getDay();

      if (selectedDays.includes(dayOfWeek)) {
        const videoToSchedule = availableVideos[videoIndex];
        const [hour, minute] = customSettings.time.split(':');

        const scheduledDateTime = new Date(currentDate);
        scheduledDateTime.setHours(Number(hour), Number(minute), 0, 0);

        if (scheduledDateTime < new Date() && currentDate.toDateString() === new Date().toDateString()) {
          addToast('שעת התזמון שנבחרה בעבר, אנא בחר שעה עתידית או תאריך אחר.', 'warning');
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        const videoContent = videoContents[videoToSchedule.id] || {};
        
        postsToCreate.push({
          client_id: selectedClientId,
          video_id: videoToSchedule.id,
          platforms: videoContent.platforms || ['instagram', 'tiktok'],
          caption: videoContent.caption || `תוכן מתוזמן אוטומטית עבור ${videoToSchedule.filename}`,
          hashtags: videoContent.hashtags || '#תוכן #רשתותחברתיות',
          scheduled_time: scheduledDateTime.toISOString(),
          status: 'scheduled'
        });

        videoIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (postsToCreate.length === 0) {
      addToast('לא ניתן ליצור תזמונים עם ההגדרות הנוכחיות.', 'error');
      return;
    }

    onScheduleGenerated(postsToCreate);
    addToast(`נוצרו ${postsToCreate.length} תזמונים בהצלחה!`, 'success');
  };

  const renderScheduleStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-600" />
            תזמון אוטומטי - הגדרת זמנים
          </CardTitle>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            חזור
          </Button>
        </div>
        <p className="text-gray-500">בחר ימים ושעה, והמערכת תפזר את הסרטונים שלך באופן שווה.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>1. בחר ימים בשבוע לפרסום</Label>
          <div className="flex flex-wrap justify-center gap-2">
            {weekDaysMap.map(day => (
              <Button
                key={day.value}
                variant={customSettings.days.includes(day.value) ? 'default' : 'outline'}
                onClick={() => handleDayToggle(day.value)}
                className="w-16 h-12 flex-col gap-1"
              >
                <span className="font-bold text-lg">{day.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">2. בחר שעת פרסום</Label>
            <Input
              id="startTime"
              type="time"
              value={customSettings.time}
              onChange={(e) => setCustomSettings(p => ({ ...p, time: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">3. בחר תאריך התחלה</Label>
            <Input
              id="startDate"
              type="date"
              value={customSettings.startDate}
              onChange={(e) => setCustomSettings(p => ({ ...p, startDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleNextToContent}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            המשך לעריכת תוכן
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContentStep = () => (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              עריכת תוכן לכל סרטון ({availableVideos.length})
            </CardTitle>
            <Button variant="outline" onClick={() => setCurrentStep('schedule')} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              חזור לזמנים
            </Button>
          </div>
          <p className="text-gray-500">ערוך כיתוב, האשטגים ופלטפורמות לכל סרטון בנפרד.</p>
        </CardHeader>
      </Card>

      {availableVideos.map((video, index) => (
        <Card key={video.id} className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.filename}
                  className="w-16 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {video.filename}
                </h4>
                <p className="text-sm text-gray-500">סרטון {index + 1} מתוך {availableVideos.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Platforms Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>פלטפורמות לפרסום</Label>
                  {index === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContentToAll(video.id, 'platforms')}
                      className="text-xs gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      העתק לכולם
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {platforms.map(platform => {
                    const isSelected = videoContents[video.id]?.platforms?.includes(platform.id) || false;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(video.id, platform.id)}
                        className={`px-3 py-2 rounded-full text-xs font-medium transition-all border ${
                          isSelected
                            ? platform.color + ' shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>כיתוב</Label>
                    {index === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyContentToAll(video.id, 'caption')}
                        className="text-xs gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        העתק לכולם
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={videoContents[video.id]?.caption || ''}
                    onChange={(e) => updateVideoContent(video.id, 'caption', e.target.value)}
                    placeholder={`כיתוב עבור ${video.filename}...`}
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      האשטגים
                    </Label>
                    {index === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyContentToAll(video.id, 'hashtags')}
                        className="text-xs gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        העתק לכולם
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={videoContents[video.id]?.hashtags || ''}
                    onChange={(e) => updateVideoContent(video.id, 'hashtags', e.target.value)}
                    placeholder="#האשטג1 #האשטג2 #האשטג3"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button
          onClick={handleGenerateCustomSchedule}
          disabled={isLoading || availableVideos.length === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              יוצר תזמונים...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              צור {availableVideos.length} תזמונים
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {currentStep === 'schedule' && renderScheduleStep()}
      {currentStep === 'content' && renderContentStep()}

      {/* Video Count Card - Show at bottom */}
      <Card className="border-0 shadow-lg mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600" />
              <span className="font-medium">
                {availableVideos.length} וידאו זמינים לתזמון
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
