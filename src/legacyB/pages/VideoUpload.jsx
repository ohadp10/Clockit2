
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  UploadCloud,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Users,
  Info,
  PlayCircle,
  Trash2
} from "lucide-react";
import { Client } from '@/legacyB/_compat/entities';
import { User } from '@/legacyB/_compat/entities';
import { VideoAsset } from "@/legacyB/_compat/entities";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UploadFile } from "@/legacyB/api/integrations";
import useToast from '@/legacyB/components/ui/Toast'; // ADDED: Import useToast

const MAX_FILES = 20;
const TEMP_MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB limit

const SUPPORTED_MEDIA_TYPES = [
  // Video formats
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/avi',
  'video/3gpp',
  'video/x-msvideo',
  
  // Image formats
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/bmp',
  'image/tiff'
];

export default function ContentUpload() {
  const [clients, setClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const { addToast, ToastContainer } = useToast(); // ADDED: Instantiate useToast

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadClients = async () => {
      try {
        const [myClients, sampleClients] = await Promise.all([
          Client.filter({ owner_email: currentUser.email }),
          Client.filter({ owner_email: "user@example.com" })
        ]);
        
        const clientMap = new Map();
        myClients.forEach(client => clientMap.set(client.id, client));
        sampleClients.forEach(client => {
            if (!clientMap.has(client.id)) {
                clientMap.set(client.id, client);
            }
        });
        const fetchedClients = Array.from(clientMap.values());

        setClients(fetchedClients);
        if (fetchedClients.length > 0 && !selectedClientId) {
          setSelectedClientId(fetchedClients[0].id);
        }
      } catch (error) {
        console.error("Failed to load clients:", error);
      }
    };
    loadClients();
  }, [currentUser, selectedClientId]);

  const getMediaMetadata = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve({ 
            type: 'video',
            duration: Math.round(video.duration) || 0, 
            width: video.videoWidth || 0,
            height: video.videoHeight || 0
          });
        };
        video.onerror = () => {
          resolve({ type: 'video', duration: 0, width: 0, height: 0 });
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.onload = () => {
          window.URL.revokeObjectURL(img.src);
          resolve({ 
            type: 'image',
            width: img.naturalWidth || 0,
            height: img.naturalHeight || 0,
            duration: 0
          });
        };
        img.onerror = () => {
          resolve({ type: 'image', width: 0, height: 0, duration: 0 });
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve({ type: 'unknown', duration: 0, width: 0, height: 0 });
      }
    });
  };

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    if ((files.length + selectedFiles.length) > MAX_FILES) {
      addToast(`ניתן להעלות עד ${MAX_FILES} קבצים בבת אחת`, 'error');
      return;
    }

    const invalidFiles = selectedFiles.filter(file => 
      !SUPPORTED_MEDIA_TYPES.includes(file.type) || file.size > TEMP_MAX_FILE_SIZE
    );
    
    if (invalidFiles.length > 0) {
      addToast(`קבצים לא נתמכים או גדולים מדי: ${invalidFiles.map(f => f.name).join(', ')}`, 'error');
      return;
    }

    const newFileEntries = await Promise.all(
      selectedFiles.map(async (file) => {
        const metadata = await getMediaMetadata(file);
        const uploadId = `upload-${Date.now()}-${Math.random()}`;
        
        return {
          id: uploadId,
          file,
          status: 'pending',
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
          metadata: {
            duration_seconds: metadata.duration || 0,
            file_size_mb: file.size / (1024 * 1024),
            width: metadata.width || 0,
            height: metadata.height || 0
          },
          error: null
        };
      })
    );

    setFiles(prev => [...prev, ...newFileEntries]);
  };

  const handleUpload = async () => {
    if (!selectedClientId) {
      addToast('אנא בחר לקוח תחילה', 'error');
      return;
    }

    const filesToUpload = files.filter(f => ['pending', 'failed'].includes(f.status));
    if (filesToUpload.length === 0) {
      addToast('אין קבצים חדשים להעלאה', 'info');
      return;
    }

    setIsUploading(true);

    for (const fileObj of filesToUpload) {
      updateFileStatus(fileObj.id, 'uploading');
      
      try {
        // Simulate progress
        for (let progress = 0; progress <= 90; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // legacy provider removed
        const { file_url } = await UploadFile({ file: fileObj.file });
        
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

        // Create asset record
        const assetData = {
          client_id: selectedClientId,
          filename: fileObj.file.name,
          original_filename: fileObj.file.name,
          file_url: file_url,
          media_type: fileObj.mediaType,
          upload_status: 'completed',
          processing_status: 'completed',
          thumbnail_url: file_url,
          duration_seconds: fileObj.metadata.duration_seconds,
          file_size_mb: fileObj.metadata.file_size_mb,
          resolution: {
            width: fileObj.metadata.width,
            height: fileObj.metadata.height
          }
        };

        await VideoAsset.create(assetData);
        updateFileStatus(fileObj.id, 'completed');
        
      } catch (error) {
        console.error('Upload failed for file:', fileObj.file.name, error);
        updateFileStatus(fileObj.id, 'failed', { error: error.message });
      }
    }

    setIsUploading(false);
    addToast('העלאה הושלמה!', 'success');
  };

  const updateFileStatus = (id, status, extraData = {}) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status, ...extraData } : f));
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setUploadProgress(prev => {
        const newProgress = {...prev};
        delete newProgress[id];
        return newProgress;
    });
  };

  const goToScheduling = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      window.location.href = createPageUrl(`Schedule?client_id=${selectedClientId}`);
    }
  };

  const getFileIcon = (fileObj) => {
    return fileObj.mediaType === 'video' 
      ? <FileVideo className="w-5 h-5 text-purple-500" />
      : <ImageIcon className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-purple-600" />
            העלאת תוכן פשוטה
          </CardTitle>
          <p className="text-gray-600">העלה עד {MAX_FILES} קבצים (מקסימום 500MB כל אחד)</p>
        </CardHeader>
      </Card>

      {/* Client Selection */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500"/>
            בחירת לקוח
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedClientId} value={selectedClientId}>
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="בחר לקוח..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">גרור קבצים לכאן או לחץ לבחירה</h3>
            <p className="text-gray-600 mb-3">מקסימום 500MB לכל קובץ</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>קבצי וידאו נתמכים:</strong> MP4, MOV, AVI, WebM, 3GP</p>
              <p><strong>קבצי תמונה נתמכים:</strong> JPG, PNG, HEIC, WebP, GIF, BMP, TIFF</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept={SUPPORTED_MEDIA_TYPES.join(',')}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">קבצים בתור ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {files.map(fileObj => (
                <div key={fileObj.id} className="p-4 border rounded-lg hover:bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {fileObj.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                      {fileObj.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {fileObj.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {fileObj.status === 'pending' && getFileIcon(fileObj)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileObj.file.name}</p>
                      {fileObj.metadata && (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{fileObj.metadata.file_size_mb.toFixed(1)} MB</span>
                          {fileObj.metadata.width > 0 && (
                            <span>{fileObj.metadata.width}×{fileObj.metadata.height}</span>
                          )}
                          {fileObj.metadata.duration_seconds > 0 && (
                            <span>{fileObj.metadata.duration_seconds}s</span>
                          )}
                        </div>
                      )}
                      {fileObj.status === 'uploading' && <Progress value={uploadProgress[fileObj.id] || 0} className="h-2 mt-2" />}
                      {fileObj.error && <p className="text-sm text-red-600 mt-1">{fileObj.error}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(fileObj.id)} title="הסר מהרשימה">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !selectedClientId || files.filter(f=>['pending', 'failed'].includes(f.status)).length === 0} 
                size="lg" 
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    מעלה...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5"/>
                    העלה קבצים
                  </>
                )}
              </Button>
              {files.some(f => f.status === 'completed') && (
                <Button onClick={goToScheduling} size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                  <PlayCircle className="w-5 h-5" />
                  המשך לפרסום
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
