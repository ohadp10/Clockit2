
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  RotateCcw,
  Search,
  FileVideo,
  ImageIcon, 
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function PostsQueue({ posts, videos, clients, onCancelPost, onRetryPost }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { icon: Clock, color: 'bg-blue-100 text-blue-800', text: 'מתוכנן', iconColor: 'text-blue-600' };
      case 'publishing':
        return { icon: Loader2, color: 'bg-yellow-100 text-yellow-800', text: 'מפרסם', iconColor: 'text-yellow-600' };
      case 'published':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'פורסם', iconColor: 'text-green-600' };
      case 'failed':
        return { icon: AlertCircle, color: 'bg-red-100 text-red-800', text: 'נכשל', iconColor: 'text-red-600' };
      case 'cancelled':
        return { icon: X, color: 'bg-gray-100 text-gray-800', text: 'בוטל', iconColor: 'text-gray-600' };
      default:
        return { icon: Clock, color: 'bg-gray-100 text-gray-800', text: 'לא ידוע', iconColor: 'text-gray-600' };
    }
  };

  const getPlatformBadges = (platforms) => {
    const platformInfo = {
      'tiktok': { name: 'TikTok', color: 'bg-black text-white' },
      'instagram': { name: 'Instagram Post', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
      'instagram_story': { name: 'Instagram Story', color: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' },
      'facebook': { name: 'Facebook', color: 'bg-blue-600 text-white' },
      'youtube': { name: 'YouTube', color: 'bg-red-600 text-white' },
      'twitter': { name: 'X (Twitter)', color: 'bg-gray-800 text-white' },
      'linkedin': { name: 'LinkedIn', color: 'bg-blue-700 text-white' },
      'threads': { name: 'Threads', color: 'bg-gray-900 text-white' }
    };
    return platforms?.map(p => platformInfo[p] || { name: p, color: 'bg-gray-500 text-white' }) || [];
  };

  const filteredPosts = posts.filter(post => {
    const video = videos.find(v => v.id === post.video_id);
    const client = clients.find(c => c.id === post.client_id);
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesSearch = !searchTerm || 
      video?.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  const statusCounts = {
      all: posts.length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      published: posts.filter(p => p.status === 'published').length,
      failed: posts.filter(p => p.status === 'failed').length,
      cancelled: posts.filter(p => p.status === 'cancelled').length,
  };

  const isPostActionable = (post) => ['scheduled', 'failed'].includes(post.status);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              תור הפוסטים ({filteredPosts.length}) 
            </CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="חיפוש פוסט..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל ({statusCounts.all})</SelectItem>
                  <SelectItem value="scheduled">מתוכנן ({statusCounts.scheduled})</SelectItem>
                  <SelectItem value="published">פורסם ({statusCounts.published})</SelectItem>
                  <SelectItem value="failed">נכשל ({statusCounts.failed})</SelectItem>
                  <SelectItem value="cancelled">בוטל ({statusCounts.cancelled})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredPosts.length === 0 ? (
        <Card className="border-0 shadow-lg"><CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">אין פוסטים בתור</h3>
          <p className="text-gray-500">{posts.length === 0 ? 'לא תוזמנו פוסטים עדיין.' : 'לא נמצאו פוסטים...'}</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const video = videos.find(v => v.id === post.video_id);
            const client = clients.find(c => c.id === post.client_id);
            const statusInfo = getStatusInfo(post.status);
            const platforms = getPlatformBadges(post.platforms);
            return (
              <Card key={post.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-6 md:items-center">
                    <div className="flex items-center gap-4">
                      {video?.thumbnail_url ? (
                        <div className="relative w-16 h-12 flex-shrink-0">
                          <img src={video.thumbnail_url} alt={video?.filename} className="w-full h-full object-cover rounded-lg" />
                           <div className="absolute top-1 left-1 bg-black/50 p-1 rounded-full">
                            {video.media_type === 'video' ? <FileVideo className="w-2 h-2 text-white"/> : <ImageIcon className="w-2 h-2 text-white"/>}
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><FileVideo className="w-6 h-6 text-gray-400" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {video?.filename || 'תוכן לא נמצא'}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">{client?.name || 'לקוח לא ידוע'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><statusInfo.icon className={`w-4 h-4 ${statusInfo.iconColor} ${post.status === 'publishing' ? 'animate-spin' : ''}`} /><Badge className={statusInfo.color}>{statusInfo.text}</Badge></div>
                      <p className="text-sm text-gray-600">{format(new Date(post.scheduled_time), 'dd/MM HH:mm', { locale: he })}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-1 flex-wrap">{platforms.map((p, i) => (<Badge key={i} variant="secondary" className={`text-xs ${p.color} border-0`}>{p.name}</Badge>))}</div>
                      {post.caption && (
                        <p className="text-sm text-gray-600 break-words">
                          {post.caption.length > 50 ? `${post.caption.substring(0, 50)}...` : post.caption}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 justify-start md:justify-end">
                      {post.status === 'published' && post.published_urls && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2" 
                          onClick={() => {
                            if (post.published_urls && Object.values(post.published_urls).length > 0) {
                              window.open(Object.values(post.published_urls)[0], '_blank');
                            }
                          }}
                        >
                          <Eye className="w-3 h-3" />צפה
                        </Button>
                      )}
                      {post.status === 'failed' && (<Button variant="outline" size="sm" onClick={() => onRetryPost(post.id)} className="gap-2 text-blue-600 hover:text-blue-700"><RotateCcw className="w-3 h-3" />נסה שוב</Button>)}
                      {isPostActionable(post) && (<Button variant="outline" size="sm" onClick={() => onCancelPost(post.id)} className="gap-2 text-red-600 hover:text-red-700"><X className="w-3 h-3" />בטל</Button>)}
                    </div>
                  </div>
                  {post.status === 'failed' && post.error_message && (<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-700"><AlertCircle className="w-4 h-4 inline ml-1" />{post.error_message}</p></div>)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
