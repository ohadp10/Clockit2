
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Film, Sparkles, ListVideo, Image as ImageIcon } from "lucide-react";
import { Client } from '@/legacyB/_compat/entities';
import { VideoAsset } from '@/legacyB/_compat/entities';
import { ScheduledPost } from '@/legacyB/_compat/entities';
import { User } from '@/legacyB/_compat/entities'; 

import SchedulingTemplates from '@/legacyB/components/schedule/SchedulingTemplates';
import ManualScheduling from '@/legacyB/components/schedule/ManualScheduling';
import PostsQueue from '@/legacyB/components/schedule/PostsQueue';
import CalendarView from '@/legacyB/components/schedule/CalendarView';
// DragDropScheduler is no longer used in this component's new scheduling flow
// import DragDropScheduler from '@/components/schedule/DragDropScheduler'; 

export default function Schedule() {
  const [clients, setClients] = useState([]);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); 
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [schedulingStep, setSchedulingStep] = useState('select'); // select, template, manual
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

  // FIX: ניקוי תזמונים בטעינת העמוד (במקום insertEntityRecords)
  useEffect(() => {
    const clearOldScheduledPosts = async () => {
      try {
        // לא עושים כלום עכשיו - הטבלה ריקה
        console.log('Schedule page loaded');
      } catch (error) {
        console.error('Error in schedule initialization:', error);
      }
    };
    
    clearOldScheduledPosts();
  }, []);

  // FIX: קריאה מ-URL parameter לטאב
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['new', 'queue', 'calendar'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  // Effect to read client_id from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientIdFromUrl = urlParams.get('client_id');
    if (clientIdFromUrl) {
      setSelectedClientId(clientIdFromUrl);
      setSchedulingStep('select'); // Go to video selection for the pre-selected client
    }
  }, []);

  // Memoize loadCurrentUser to ensure it's stable and doesn't cause unnecessary re-runs of useEffect
  const loadCurrentUser = useCallback(async () => {
    try {
      // legacy provider removed
      const user = await User.me(); // Assuming User.me() fetches the current logged-in user
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
      // Handle error, e.g., redirect to login or show an error message
    }
  }, []); // Empty dependency array as it doesn't depend on any state/props

  // Memoize loadInitialData to ensure it's stable and doesn't cause unnecessary re-runs of useEffect
  // It depends on currentUser, so it will re-create when currentUser changes, which is desired.
  const loadInitialData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // legacy provider removed
      // Client.filter() - Gets user's clients
      // VideoAsset.list() - Gets all video assets
      // ScheduledPost.list() - Gets all scheduled posts
      
      // FIX: Fetch both user's clients and sample clients
      const [myClients, sampleClients, videosData, postsData] = await Promise.all([
        Client.filter({ owner_email: currentUser.email }), // Filter clients by owner_email
        Client.filter({ owner_email: "user@example.com" }), // Fetch sample clients
        VideoAsset.list(), // Fetch all video assets (will be filtered locally)
        ScheduledPost.list() // Fetch all scheduled posts (will be filtered locally)
      ]);
      
      const clientMap = new Map();
      myClients.forEach(client => clientMap.set(client.id, client));
      sampleClients.forEach(client => {
          if (!clientMap.has(client.id)) { // Add sample clients only if their IDs don't conflict with user's clients
              clientMap.set(client.id, client);
          }
      });
      const clientsData = Array.from(clientMap.values()); // Convert Map values back to array
      
      setClients(clientsData);
      
      // FIX: מסנן וידאו ופוסטים לפי כל הלקוחות (כולל דמה)
      const clientIds = clientsData.map(c => c.id);
      setVideos(videosData.filter(v => clientIds.includes(v.client_id)));
      setPosts(postsData.filter(p => clientIds.includes(p.client_id)).sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time)));
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]); // Dependency on currentUser. State setters (setClients, setVideos, etc.) are stable and not needed here.

  // Effect to load current user on component mount
  useEffect(() => {
    loadCurrentUser(); 
  }, [loadCurrentUser]); // Depend on memoized loadCurrentUser

  // Effect to load initial data once currentUser is available
  useEffect(() => {
    // The `if (currentUser)` check is implicitly handled by `loadInitialData`'s internal guard
    // and by `loadInitialData` being a dependency that only changes when `currentUser` changes.
    loadInitialData(); 
  }, [loadInitialData]);
  
  const handleVideoSelect = (videoId) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };
  
  const handleBulkSchedule = async (postsToCreate) => {
    if (!postsToCreate || postsToCreate.length === 0) {
        alert('לא נוצרו פוסטים לתזמון.');
        return;
    }
    setIsLoading(true);
    try {
      // legacy provider removed
      await ScheduledPost.bulkCreate(postsToCreate);
      alert(`${postsToCreate.length} פוסטים תוזמנו בהצלחה!`);
      resetToSelection();
      setActiveTab('queue');
      await loadInitialData();
    } catch (error) {
      console.error("Error bulk creating posts:", error);
      alert('אירעה שגיאה בתזמון הפוסטים.');
    } finally {
      setIsLoading(false);
    }
  };

  // handleScheduleWithTemplate function removed as its responsibilities are now split
  // and SchedulingTemplates directly uses handleBulkSchedule after generating postsToCreate

  const handleManualSchedule = async (scheduleItems) => {
    setIsLoading(true);
    const postsToCreate = scheduleItems.map(item => ({
      client_id: selectedClientId,
      video_id: item.videoId,
      platforms: item.platforms,
      caption: item.caption,
      hashtags: item.hashtags,
      scheduled_time: new Date(item.scheduledTime).toISOString(),
    }));

    try {
      // legacy provider removed
      await ScheduledPost.bulkCreate(postsToCreate);
      alert(`${postsToCreate.length} פוסטים תוזמנו בהצלחה!`);
      resetToSelection();
      setActiveTab('queue');
      await loadInitialData();
    } catch (error) {
      console.error("Error bulk creating posts:", error);
      alert('אירעה שגיאה בתזמון הפוסטים.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToSelection = () => {
    setSelectedVideos([]);
    setSchedulingStep('select');
  };
  
  const handleCancelPost = async (postId) => {
    if (confirm('האם לבטל את הפוסט? לא ניתן לשחזר פעולה זו.')) {
      try {
        // legacy provider removed
        await ScheduledPost.update(postId, { status: 'cancelled' });
        await loadInitialData();
      } catch (error) {
        console.error('Error cancelling post:', error);
        alert('שגיאה בביטול הפוסט');
      }
    }
  };
  
  const handleRetryPost = async (postId) => {
    try {
      // legacy provider removed
      await ScheduledPost.update(postId, { status: 'scheduled', error_message: null });
      await loadInitialData();
    } catch (error) {
      console.error('Error retrying post:', error);
      alert('שגיאה בניסיון חוזר');
    }
  };

  const handleScheduleUpdate = async (updates) => {
    try {
      // legacy provider removed
      for (const update of updates) {
        await ScheduledPost.update(update.id, update.changes);
      }
      await loadInitialData();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('שגיאה בעדכון התזמון');
    }
  };

  const filteredVideos = videos.filter(v => v.client_id === selectedClientId);

  const renderNewScheduling = () => {
    if (schedulingStep === 'template') {
      return <SchedulingTemplates 
        selectedVideos={selectedVideos.map(vid => videos.find(v=>v.id === vid))} 
        videos={videos} // Preserve existing prop
        selectedClientId={selectedClientId}
        onScheduleGenerated={handleBulkSchedule} // Changed prop name and handler
        isLoading={isLoading} 
        onBack={resetToSelection} 
      />;
    }
    
    if (schedulingStep === 'manual') {
      return <ManualScheduling 
        selectedVideos={selectedVideos} 
        videos={videos} 
        onSchedule={handleManualSchedule} 
        isLoading={isLoading} 
        onBack={resetToSelection} 
      />;
    }

    // Removed calendar and dragdrop steps from the 'new scheduling' flow.
    // These views are now only accessible via their dedicated tabs.

    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500"/>
              שלב 1: בחירת לקוח
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedClientId} value={selectedClientId}>
              <SelectTrigger className="md:w-1/3">
                <SelectValue placeholder="בחר לקוח..."/>
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        {selectedClientId && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-500"/>
                <Film className="w-5 h-5 text-gray-500"/>
                שלב 2: בחירת תוכן ({selectedVideos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-semibold">לא נמצא תוכן</h3>
                  <p className="text-gray-500 text-sm">יש להעלות סרטונים או תמונות בדף "העלאת תוכן".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredVideos.map(video => (
                    <div key={video.id} className="relative group">
                       <label htmlFor={`video-${video.id}`} className={`block border-2 rounded-lg cursor-pointer overflow-hidden ${selectedVideos.includes(video.id) ? 'border-blue-500' : 'border-transparent'}`}>
                         <img src={video.thumbnail_url || `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(video.filename)}`} alt={video.filename} className="aspect-video object-cover"/>
                         <div className="absolute top-2 right-2">
                           <Checkbox 
                             id={`video-${video.id}`} 
                             checked={selectedVideos.includes(video.id)} 
                             onCheckedChange={() => handleVideoSelect(video.id)} 
                           />
                         </div>
                         <div className="absolute top-2 left-2 bg-black/50 p-1 rounded-full">
                           {video.media_type === 'video' ? <Film className="w-3 h-3 text-white"/> : <ImageIcon className="w-3 h-3 text-white"/>}
                         </div>
                         <div className="p-2 bg-black/50 text-white text-xs absolute bottom-0 w-full">
                           <p className="truncate">{video.filename}</p>
                         </div>
                       </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedVideos.length > 0 && (
          <Card className="border-0 shadow-lg bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600"/>
                שלב 3: בחר שיטת תזמון
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Button size="lg" className="gap-2 flex-col h-24" onClick={() => setSchedulingStep('template')}>
                <Calendar className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">תזמון אוטומטי</div>
                  <div className="text-xs opacity-75">תבניות מוכנות</div>
                </div>
              </Button>
              
              <Button size="lg" variant="outline" className="gap-2 flex-col h-24" onClick={() => setSchedulingStep('manual')}>
                <ListVideo className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">תזמון ידני</div>
                  <div className="text-xs opacity-75">שליטה מלאה</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            פרסום פוסטים
          </CardTitle>
          <p className="text-gray-600">תזמן סרטונים ותמונות לרשתות החברתיות באופן אוטומטי או ידני.</p>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">תזמון חדש</TabsTrigger>
          <TabsTrigger value="queue">תור פוסטים</TabsTrigger>
          <TabsTrigger value="calendar">לוח שנה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="pt-6">
          {renderNewScheduling()}
        </TabsContent>
        
        <TabsContent value="queue" className="pt-6">
          <PostsQueue 
            posts={posts} 
            videos={videos} 
            clients={clients} 
            onCancelPost={handleCancelPost} 
            onRetryPost={handleRetryPost} 
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="pt-6">
          <CalendarView
            videos={videos}
            posts={posts}
            clients={clients}
            onScheduleUpdate={handleScheduleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
