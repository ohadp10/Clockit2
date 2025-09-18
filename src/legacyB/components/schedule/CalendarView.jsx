
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  X,
  PlayCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { he } from 'date-fns/locale';

export default function CalendarView({ videos = [], posts = [], clients = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null); // NEW: Modal state
  const [selectedDayPosts, setSelectedDayPosts] = useState([]); // NEW: Modal posts

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const postsByDate = useMemo(() => {
    const grouped = {};
    posts.forEach(post => {
      const dateKey = format(new Date(post.scheduled_time), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });
    // Sort posts within each day by time
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
    });
    return grouped;
  }, [posts]);

  // FIX: תיקון כיוון החצים
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // NEW: Handle day click - open modal
  const handleDayClick = (day, dayPosts) => {
    if (dayPosts.length > 0) {
      setSelectedDay(day);
      setSelectedDayPosts(dayPosts);
    }
  };

  const weekDayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-center flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              {format(currentMonth, 'MMMM yyyy', { locale: he })}
            </h2>
            <div className="flex items-center gap-2">
              {/* FIX: החלפת כיוון החצים */}
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {/* Calendar Grid - FIX: Mobile optimization */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 bg-gray-50 p-1 md:p-4 rounded-lg">
            {/* Day Headers */}
            {weekDayNames.map(dayName => (
              <div key={dayName} className="text-center font-bold text-sm md:text-lg text-gray-700 py-2 md:py-3 bg-white rounded-lg">
                {dayName}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayPosts = postsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const hasEvents = dayPosts.length > 0;

              return (
                <div 
                  key={dateKey} 
                  className={`
                    border-2 rounded-xl p-2 md:p-3 min-h-[80px] md:min-h-[120px] flex flex-col overflow-hidden cursor-pointer
                    ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100'}
                    ${isToday ? 'border-blue-500 border-2 bg-blue-50' : ''}
                    ${hasEvents ? 'hover:shadow-md hover:border-blue-300' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => handleDayClick(day, dayPosts)}
                >
                  {/* Day Number */}
                  <div className="flex justify-between items-center mb-1 md:mb-2">
                    <span className={`
                      font-bold text-sm md:text-lg
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isToday ? 'text-blue-600' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayPosts.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {dayPosts.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Posts for this day - Mobile optimized */}
                  <div className="flex-1 overflow-y-hidden space-y-1">
                    {dayPosts.slice(0, 2).map((post, index) => {
                       const client = clients.find(c => c.id === post.client_id);
                       const video = videos.find(v => v.id === post.video_id);
                       
                       const getStatusColor = () => {
                         switch (post.status) {
                           case 'scheduled': return 'bg-blue-100 text-blue-800';
                           case 'published': return 'bg-green-100 text-green-800';
                           case 'failed': return 'bg-red-100 text-red-800';
                           default: return 'bg-gray-100 text-gray-800';
                         }
                       };

                       return (
                         <div key={post.id} className={`p-1 md:p-2 rounded-lg text-xs ${getStatusColor()}`}>
                           <div className="flex items-center gap-1 mb-1">
                             <Clock className="w-2 h-2 md:w-3 md:h-3 flex-shrink-0" />
                             <span className="font-bold text-xs">
                               {format(new Date(post.scheduled_time), 'HH:mm')}
                             </span>
                           </div>
                           {/* FIX: Mobile truncation */}
                           <p className="font-medium truncate text-xs" title={video?.filename || 'וידאו לא נמצא'}>
                             {video?.filename?.substring(0, 10) || 'וידאו'}
                             {video?.filename?.length > 10 ? '...' : ''}
                           </p>
                         </div>
                       );
                    })}
                    
                    {/* Show "more" indicator */}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-gray-500 text-center py-1 bg-gray-50 rounded">
                        +{dayPosts.length - 2} עוד
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 md:gap-6 mt-4 md:mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>מתוזמן</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>פורסם</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span>נכשל</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW: Day Details Modal */}
      <Dialog open={!!selectedDay} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {selectedDay && format(selectedDay, 'dd MMMM yyyy', { locale: he })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedDayPosts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">אין פוסטים מתוזמנים ליום זה</p>
            ) : (
              selectedDayPosts.map((post) => {
                const client = clients.find(c => c.id === post.client_id);
                const video = videos.find(v => v.id === post.video_id);
                
                const getStatusColor = () => {
                  switch (post.status) {
                    case 'scheduled': return 'bg-blue-50 border-blue-200';
                    case 'published': return 'bg-green-50 border-green-200';
                    case 'failed': return 'bg-red-50 border-red-200';
                    default: return 'bg-gray-50 border-gray-200';
                  }
                };

                return (
                  <Card key={post.id} className={`border-2 ${getStatusColor()}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Video Thumbnail */}
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {video?.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video?.filename} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayCircle className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Post Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-bold text-lg">
                              {format(new Date(post.scheduled_time), 'HH:mm')}
                            </span>
                            <Badge className={
                              post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              post.status === 'published' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {post.status === 'scheduled' ? 'מתוזמן' : 
                               post.status === 'published' ? 'פורסם' : 'נכשל'}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1">
                            {video?.filename || 'וידאו לא נמצא'}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {client?.name || 'לקוח לא ידוע'}
                          </p>
                          
                          {/* Platforms */}
                          <div className="flex gap-1 flex-wrap mb-2">
                            {post.platforms?.map(platform => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform === 'tiktok' ? 'TikTok' :
                                 platform === 'instagram' ? 'Instagram Post' : // Updated
                                 platform === 'instagram_story' ? 'Instagram Story' : // New
                                 platform === 'facebook' ? 'Facebook' : 'YouTube'}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Caption Preview */}
                          {post.caption && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded text-right">
                              {post.caption.length > 100 ? 
                                `${post.caption.substring(0, 100)}...` : 
                                post.caption
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
