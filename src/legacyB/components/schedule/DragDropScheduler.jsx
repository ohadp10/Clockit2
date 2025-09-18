
import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock,
  Video,
  GripVertical,
  Save,
  RotateCcw,
  ChevronLeft, // Added import
  ChevronRight // Added import
} from "lucide-react";
import { 
  format, 
  addDays, 
  startOfWeek, 
  subMonths, // Added import
  addMonths, // Added import
  isSameDay, // Added import
  isBefore, // Added import
  startOfDay // Added import
} from 'date-fns';
import { he } from 'date-fns/locale';

// Helper function to determine if a date is today
const isToday = (date) => isSameDay(date, new Date());

// Helper function to determine if a date is in the past (before the start of today)
const isPastDate = (date) => isBefore(date, startOfDay(new Date()));

// Helper function for status badge color
const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-500';
    case 'published':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'draft':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
};

export default function DragDropScheduler({ 
  videos = [], 
  scheduledPosts = [], 
  onScheduleUpdate,
  selectedClientId,
  onPostClick // Added onPostClick prop
}) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [draggedItems, setDraggedItems] = useState({});

  // יצירת רשימת ימי השבוע
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(weekStart, i);
  });

  // קיבוץ פוסטים לפי יום
  const postsByDay = useCallback(() => {
    const grouped = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = scheduledPosts.filter(post => {
        // Ensure post.scheduled_time is a valid date string
        const postDate = new Date(post.scheduled_time);
        if (isNaN(postDate.getTime())) {
          console.warn('Invalid scheduled_time for post:', post);
          return false;
        }
        return format(postDate, 'yyyy-MM-dd') === dayKey;
      });
    });
    
    return grouped;
  }, [scheduledPosts, weekDays]);

  // וידאו שעדיין לא תוזמנו
  const unscheduledVideos = videos.filter(video => 
    video.client_id === selectedClientId &&
    !scheduledPosts.some(post => post.video_id === video.id)
  );

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    // אם נגרר לאותו מקום
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // טיפול בגרירה מרשימת הוידאו לתאריך
    if (source.droppableId === 'unscheduled' && destination.droppableId.startsWith('day-')) {
      const videoId = draggableId;
      const targetDate = destination.droppableId.replace('day-', '');
      
      setDraggedItems(prev => ({
        ...prev,
        [videoId]: {
          date: targetDate,
          time: '10:00', // Default time, can be made configurable later
          platforms: ['instagram'], // Default platform, can be made configurable later
          tempId: `temp-${Date.now()}` // Unique ID for tracking temporary state
        }
      }));
    }
    
    // טיפול בשינוי סדר בתוך יום - not implemented yet but placeholder is there
    if (source.droppableId === destination.droppableId && 
        destination.droppableId.startsWith('day-')) {
      // כאן נטפל בשינוי סדר פוסטים בתוך אותו יום
      // For now, we don't track reordering within a day in draggedItems as it might not affect persistence.
      // If server needs specific order, this needs to be implemented.
    }
    
    // טיפול במעבר פוסט בין ימים
    if (source.droppableId !== destination.droppableId && 
        destination.droppableId.startsWith('day-') && // Fixed syntax error: 'both' removed
        source.droppableId.startsWith('day-')) {
      
      const postId = draggableId; // draggableId for existing posts is post.id
      const newDate = destination.droppableId.replace('day-', '');
      
      // עדכון זמני של הפוסט
      setDraggedItems(prev => ({
        ...prev,
        [postId]: {
          newDate: newDate,
          tempId: `moved-${Date.now()}` // Unique ID for tracking temporary state
        }
      }));
    }
  }, []);

  const saveScheduleChanges = async () => {
    const updates = [];
    
    // עיבוד וידאו חדשים שנגררו או פוסטים שזזו
    Object.entries(draggedItems).forEach(([id, dragData]) => {
      // Check if it's a new video being scheduled (from unscheduled to a day)
      // `id` will be `videoId` for new videos, and `postId` for moved posts.
      // `dragData.date` indicates a new video drag (from unscheduled).
      // `dragData.newDate` indicates an existing post being moved between days.
      
      if (dragData.date && !dragData.newDate) { // This means it's a new video from the unscheduled list
        const video = videos.find(v => v.id === id); // Find the original video details
        if (video) {
          const scheduledTime = new Date(`${dragData.date}T${dragData.time}`).toISOString();
          
          updates.push({
            type: 'create',
            data: {
              video_id: id, // The draggableId for new videos is video.id
              client_id: selectedClientId,
              platforms: dragData.platforms,
              scheduled_time: scheduledTime,
              caption: '', // Default empty
              hashtags: '' // Default empty
            }
          });
        }
      } else if (dragData.newDate) { // This means an existing post was moved to a new date
        const existingPost = scheduledPosts.find(p => p.id === id); // The draggableId for existing posts is post.id
        if (existingPost) {
          // Preserve existing time from the original scheduled_time
          const newTime = format(new Date(existingPost.scheduled_time), 'HH:mm');
          const scheduledTime = new Date(`${dragData.newDate}T${newTime}`).toISOString();
          
          updates.push({
            type: 'update',
            id: id, // The ID of the post to update
            data: { scheduled_time: scheduledTime }
          });
        }
      }
    });

    if (updates.length > 0 && onScheduleUpdate) {
      await onScheduleUpdate(updates);
      setDraggedItems({}); // Clear dragged items after successful update
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setWeekStart(subMonths(weekStart, 1))}
              className="gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              חודש קודם
            </Button>
            
            <h3 className="text-lg font-semibold">
              {format(weekStart, 'MMMM yyyy', { locale: he })}
            </h3>
            
            <Button
              variant="outline"
              onClick={() => setWeekStart(addMonths(weekStart, 1))}
              className="gap-2"
            >
              חודש הבא
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {Object.keys(draggedItems).length > 0 && (
            <div className="flex justify-center mt-4 gap-3">
              <Button onClick={saveScheduleChanges} className="gap-2">
                <Save className="w-4 h-4" />
                שמור שינויים ({Object.keys(draggedItems).length})
              </Button>
              <Button variant="outline" onClick={() => setDraggedItems({})} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                בטל
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-8 gap-6">
          {/* Unscheduled Videos */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-gray-600" />
                וידאו ללא תזמון
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="unscheduled">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-purple-50' : ''
                    }`}
                  >
                    {unscheduledVideos.length === 0 && (
                      <p className="text-center text-gray-500 text-sm mt-4">אין וידאו ללא תזמון.</p>
                    )}
                    {unscheduledVideos.map((video, index) => (
                      <Draggable key={video.id} draggableId={video.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-3 border rounded-lg bg-white cursor-move transition-all ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center gap-2"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <Video className="w-4 h-4 text-purple-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {video.filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {video.duration_seconds}s • {video.aspect_ratio}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Calendar Days */}
          <div className="lg:col-span-6 grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayPosts = postsByDay()[dayKey] || [];
              const isCurrentDay = isToday(day);
              const dayIsPast = isPastDate(day); // Renamed to avoid conflict with `isPast` inside draggable

              return (
                <Card 
                  key={dayKey} 
                  className={`border-0 shadow-md ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm text-center">
                      <div className={`font-bold ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                        {format(day, 'dd/MM')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(day, 'EEEE', { locale: he })}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-2">
                    <Droppable droppableId={`day-${dayKey}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[150px] space-y-2 p-1 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-green-50 border-2 border-green-300' : ''
                          } ${dayIsPast ? 'opacity-60' : ''}`}
                        >
                          {dayPosts.map((post, index) => {
                            // Check if the post has been temporarily moved by drag, apply temp state if so
                            const tempMoved = draggedItems[post.id]?.newDate === dayKey;
                            const isPast = isPastDate(new Date(post.scheduled_time));

                            return (
                              <Draggable 
                                key={post.id} 
                                draggableId={post.id} 
                                index={index}
                                isDragDisabled={isPast || post.status === 'published'} // Disable drag for past or published posts
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-2 border rounded-lg bg-white text-xs transition-all ${
                                      snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-sm'
                                    } ${tempMoved ? 'border-dashed border-blue-500 bg-blue-50' : ''}
                                    ${isPast || post.status === 'published' ? 'cursor-not-allowed' : 'cursor-grab'}
                                    `}
                                    onClick={() => onPostClick && onPostClick(post)}
                                  >
                                    <div className="flex items-center gap-1 mb-1">
                                      <div className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`}></div>
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        {/* Ensure scheduled_time is a valid date */}
                                        {post.scheduled_time && !isNaN(new Date(post.scheduled_time).getTime()) 
                                          ? format(new Date(post.scheduled_time), 'HH:mm') 
                                          : 'N/A'}
                                      </span>
                                    </div>
                                    
                                    <p className="font-medium truncate">
                                      {/* Safely access video filename */}
                                      {post.video?.filename || 'וידאו לא ידוע'}
                                    </p>
                                    
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                      {post.platforms?.map(platform => (
                                        <Badge key={platform} variant="secondary" className="text-[8px] py-0 px-1">
                                          {platform === 'tiktok' ? 'TT' :
                                           platform === 'instagram' ? 'IG' :
                                           platform === 'instagram_story' ? 'IGS' : // Added this line for Instagram Story
                                           platform === 'facebook' ? 'FB' : 'YT'}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {dayPosts.length === 0 && !snapshot.isDraggingOver && (
                            <p className="text-center text-gray-400 text-xs mt-4">גרור לכאן פוסטים</p>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
