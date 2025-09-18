
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ArrowRight,
  Loader2,
  Copy,
  FileVideo,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function ManualScheduling({ selectedVideos, videos, onSchedule, isLoading, onBack }) {
  const [scheduleItems, setScheduleItems] = useState(
    selectedVideos.map(videoId => {
      const video = videos.find(v => v.id === videoId);
      return {
        videoId,
        video,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        platforms: ['instagram'],
        caption: '',
        hashtags: '#תוכן #רשתותחברתיות'
      };
    })
  );

  // FIX: עדכון רשימת הפלטפורמות עם Instagram Story, Twitter, LinkedIn and Threads
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

  const updateScheduleItem = (index, field, value) => {
    setScheduleItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const togglePlatform = (index, platformId) => {
    const currentPlatforms = scheduleItems[index].platforms;
    const newPlatforms = currentPlatforms.includes(platformId)
      ? currentPlatforms.filter(id => id !== platformId)
      : [...currentPlatforms, platformId];

    updateScheduleItem(index, 'platforms', newPlatforms);
  };

  const copyToAll = (field, value) => {
    setScheduleItems(prev => prev.map(item => ({ ...item, [field]: value })));
  };

  const handleSubmit = () => {
    const hasErrors = scheduleItems.some(item =>
      item.platforms.length === 0 || !item.scheduledTime
    );

    if (hasErrors) {
      alert('אנא בדוק שכל הפרטים מולאו בכל הסרטונים');
      return;
    }

    onSchedule(scheduleItems);
  };

  const formatDateTime = (dateTimeString) => {
    return format(new Date(dateTimeString), 'dd/MM/yyyy HH:mm', { locale: he });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              תזמון ידני מתקדם
            </CardTitle>
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              חזור
            </Button>
          </div>
          <p className="text-gray-600">
            קבע זמן ותוכן ספציפיים לכל אחד מ-{selectedVideos.length} הסרטונים
          </p>
        </CardHeader>
      </Card>

      {/* Bulk Actions */}
      <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            פעולות מהירות
          </h3>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToAll('caption', scheduleItems[0]?.caption || '')}
              className="gap-2"
            >
              <Copy className="w-3 h-3" />
              העתק כיתוב לכל הסרטונים
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToAll('hashtags', scheduleItems[0]?.hashtags || '')}
              className="gap-2"
            >
              <Copy className="w-3 h-3" />
              העתק האשטגים לכל הסרטונים
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Items - FIX: Mobile responsive */}
      <div className="space-y-4">
        {scheduleItems.map((item, index) => (
          <Card key={item.videoId} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="p-4 md:p-6">
              {/* FIX: Mobile-first responsive layout */}
              <div className="space-y-4">

                {/* Video Info */}
                <div className="flex items-center gap-3">
                  <FileVideo className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {/* FIX: Truncate video name for mobile */}
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.video.filename}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {Math.round(item.video.duration_seconds)}s • {item.video.aspect_ratio}
                    </p>
                  </div>
                </div>

                {item.video.thumbnail_url && (
                  <img
                    src={item.video.thumbnail_url}
                    alt={item.video.filename}
                    className="w-full h-24 md:h-32 object-cover rounded-lg"
                  />
                )}

                {/* FIX: Mobile responsive form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scheduling fields */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>זמן פרסום</Label>
                      {/* FIX: Constrained width for mobile */}
                      <Input
                        type="datetime-local"
                        value={item.scheduledTime}
                        onChange={(e) => updateScheduleItem(index, 'scheduledTime', e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full max-w-xs"
                      />
                      <p className="text-xs text-gray-500">
                        {formatDateTime(item.scheduledTime)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>פלטפורמות</Label>
                      <div className="flex gap-2 flex-wrap">
                        {platforms.map(platform => (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => togglePlatform(index, platform.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              item.platforms.includes(platform.id)
                                ? platform.color
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content fields */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>כיתוב</Label>
                      {/* FIX: Constrained width for mobile */}
                      <Textarea
                        value={item.caption}
                        onChange={(e) => updateScheduleItem(index, 'caption', e.target.value)}
                        placeholder="כתוב כיתוב לפוסט..."
                        rows={2}
                        className="text-sm w-full max-w-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>האשטגים</Label>
                      {/* FIX: Constrained width for mobile */}
                      <Input
                        value={item.hashtags}
                        onChange={(e) => updateScheduleItem(index, 'hashtags', e.target.value)}
                        placeholder="#האשטג1 #האשטג2"
                        className="text-sm w-full max-w-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Validation */}
                {(item.platforms.length === 0 || !item.scheduledTime) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      ❌ נא למלא את כל השדות הנדרשים
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-purple-900 mb-3">סיכום התזמון</h3>
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {scheduleItems.reduce((sum, item) => sum + item.platforms.length, 0)}
                </div>
                <div className="text-gray-600">פוסטים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{selectedVideos.length}</div>
                <div className="text-gray-600">סרטונים</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isLoading ? 'שומר...' : 'שמור ותזמן'}
        </Button>
      </div>
    </div>
  );
}
