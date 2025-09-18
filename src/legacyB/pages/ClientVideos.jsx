
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Search, 
  FileVideo, 
  ImageIcon,
  Upload,
  Calendar,
  Clock,
  Trash2,
  Eye,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Client } from '@/legacyB/_compat/entities';
import { VideoAsset } from '@/legacyB/_compat/entities';
import { User } from '@/legacyB/_compat/entities';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function ClientVideos() {
  const [client, setClient] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewingMedia, setViewingMedia] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const params = new URLSearchParams(location.search);
        const clientId = params.get('client_id');
        
        if (clientId) {
          const clientData = await Client.get(clientId);
          setClient(clientData);

          const videosData = await VideoAsset.filter({ client_id: clientId });
          setVideos(videosData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [location.search]);

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await VideoAsset.delete(mediaToDelete.id);
      setVideos(prevVideos => prevVideos.filter(v => v.id !== mediaToDelete.id));
      setMediaToDelete(null);
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('אירעה שגיאה במחיקת המדיה.');
    }
  };

  const filteredVideos = videos.filter(video =>
    video.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMediaIcon = (mediaType) => {
    return mediaType === 'video' 
      ? <FileVideo className="w-8 h-8 text-purple-600" />
      : <ImageIcon className="w-8 h-8 text-green-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-4">לקוח לא נמצא</h2>
          <Link to={createPageUrl('Clients')}>
            <Button variant="outline">חזור ללקוחות</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Clients')}>
              <Button variant="outline" className="gap-2 text-sm px-3 py-2">
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">חזור</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {client.logo_url ? (
              <img src={client.logo_url} alt={client.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">{client.name.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{client.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">{videos.length} סרטונים ותמונות</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חפש תוכן..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Link to={createPageUrl(`VideoUpload?client_id=${client.id}`)} className="w-full sm:w-auto">
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700 w-full text-sm px-4 py-2">
                <Upload className="w-4 h-4" />
                העלה תוכן
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredVideos.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="flex gap-2">
                  <FileVideo className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                {videos.length === 0 ? 'אין סרטונים ותמונות' : 'לא נמצא תוכן'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 px-4">
                {videos.length === 0
                  ? 'לא הועלו סרטונים או תמונות עבור הלקוח הזה'
                  : 'נסה מונח חיפוש אחר'
                }
              </p>
              {videos.length === 0 && (
                <Link to={createPageUrl(`VideoUpload?client_id=${client.id}`)}>
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                    <Upload className="w-4 h-4" />
                    העלה תוכן
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.filename} className="w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 object-cover rounded-lg flex-shrink-0"/>
                      ) : (
                        <div className="w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getMediaIcon(video.media_type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{video.filename}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1">
                          <Badge variant={video.media_type === 'video' ? 'default' : 'secondary'} className="text-xs">
                            {video.media_type === 'video' ? 'וידאו' : 'תמונה'}
                          </Badge>
                          <span>{video.file_size_mb?.toFixed(1)} MB</span>
                          {video.resolution && <span className="hidden sm:inline">{video.resolution.width}×{video.resolution.height}</span>}
                          <span className="hidden md:inline">הועלה ב-{format(new Date(video.created_date), 'dd/MM/yy', { locale: he })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto" onClick={() => setViewingMedia(video)}>
                        <Eye className="w-3 h-3"/>
                        הצג
                      </Button>
                      <Link to={createPageUrl(`Schedule?client_id=${client.id}`)} className="w-full sm:w-auto">
                        <Button size="sm" className="gap-1 w-full">
                          <Calendar className="w-3 h-3"/>
                          תזמן
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" className="gap-1 w-full sm:w-auto" onClick={() => setMediaToDelete(video)}>
                        <Trash2 className="w-3 h-3"/>
                        מחק
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Media Dialog */}
      <Dialog open={!!viewingMedia} onOpenChange={() => setViewingMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewingMedia?.filename}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[80vh] overflow-auto">
            {viewingMedia?.media_type === 'image' && (
              <img src={viewingMedia.file_url} alt={viewingMedia.filename} className="max-w-full h-auto mx-auto rounded-lg"/>
            )}
            {viewingMedia?.media_type === 'video' && (
              <video src={viewingMedia.file_url} controls autoPlay className="w-full rounded-lg">
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!mediaToDelete} onOpenChange={() => setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>אישור מחיקה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את "{mediaToDelete?.filename}"? לא ניתן לשחזר פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMediaToDelete(null)}>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              כן, מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
