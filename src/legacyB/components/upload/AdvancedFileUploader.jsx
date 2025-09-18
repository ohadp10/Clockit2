
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UploadCloud,
  FileVideo,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Info,
  Zap,
  Settings
} from "lucide-react";
import { UploadFile } from '@/api/integrations';
import VideoQualityChecker from '../video/VideoQualityChecker';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILES_PER_UPLOAD = 10;

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',     // .MOV files (iPhone)
  'video/x-msvideo',     // .AVI
  'video/webm',
  'video/x-ms-wmv',      // .WMV
  'video/3gpp',          // .3GP (mobile)
  'video/x-flv',         // .FLV
  'video/mp2t',          // .MTS/.M2TS
  'video/x-matroska'     // .MKV
];

const SUPPORTED_EXTENSIONS = [
  '.mp4', '.mov', '.avi', '.webm', '.wmv', '.3gp', '.flv', '.mts', '.m2ts', '.mkv'
];

export default function AdvancedFileUploader({ 
  onFilesUploaded, 
  maxFiles = MAX_FILES_PER_UPLOAD,
  maxSizeMB = MAX_FILE_SIZE_MB,
  showQualityCheck = true
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ 
    completed: 0, 
    failed: 0, 
    total: 0 
  });

  const validateFiles = useCallback((fileList) => {
    const validatedFiles = [];
    const errors = [];

    if (fileList.length > maxFiles) {
      errors.push(`ניתן להעלות עד ${maxFiles} קבצים בבת אחת`);
      return { files: [], errors };
    }

    Array.from(fileList).forEach((file, index) => {
      const fileSizeMB = file.size / (1024 * 1024);
      const fileErrors = [];
      const fileWarnings = [];

      // בדיקת גודל
      if (fileSizeMB > maxSizeMB) {
        fileErrors.push(`קובץ גדול מדי (${fileSizeMB.toFixed(1)}MB > ${maxSizeMB}MB)`);
      } else if (fileSizeMB > maxSizeMB * 0.8) {
        fileWarnings.push(`קובץ גדול (${fileSizeMB.toFixed(1)}MB)`);
      }

      // בדיקת פורמט
      if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
        fileErrors.push(`פורמט לא נתמך. השתמש ב-${SUPPORTED_EXTENSIONS.map(ext => ext.toUpperCase().replace('.', '')).join(', ')}`);
      }

      const fileData = {
        id: `file-${Date.now()}-${index}`,
        file,
        status: fileErrors.length > 0 ? 'invalid' : 'pending',
        errors: fileErrors,
        warnings: fileWarnings,
        progress: 0,
        sizeMB: fileSizeMB,
        uploadedUrl: null,
        metadata: null
      };

      validatedFiles.push(fileData);
    });

    return { files: validatedFiles, errors };
  }, [maxFiles, maxSizeMB]);

  const extractVideoMetadata = useCallback((file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: Math.round(video.duration) || 0,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          aspectRatio: calculateAspectRatio(video.videoWidth, video.videoHeight)
        });
      };

      video.onerror = () => {
        resolve(null);
      };

      video.src = URL.createObjectURL(file);
    });
  }, []);

  const calculateAspectRatio = (width, height) => {
    if (!width || !height) return '16:9';
    
    const ratio = width / height;
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    return `${width}:${height}`;
  };

  const handleFileSelect = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const { files: validatedFiles, errors } = validateFiles(selectedFiles);

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // הוספת מטדטה לקבצים תקינים
    const filesWithMetadata = await Promise.all(
      validatedFiles.map(async (fileData) => {
        if (fileData.status === 'pending') {
          const metadata = await extractVideoMetadata(fileData.file);
          return {
            ...fileData,
            metadata: metadata ? {
              duration_seconds: metadata.duration,
              aspect_ratio: metadata.aspectRatio,
              resolution: { width: metadata.width, height: metadata.height },
              file_size_mb: fileData.sizeMB
            } : null
          };
        }
        return fileData;
      })
    );

    setFiles(prev => [...prev, ...filesWithMetadata]);
    
    // איפוס input
    event.target.value = '';
  };

  const uploadFile = async (fileData) => {
    try {
      setUploadProgress(prev => ({ ...prev, [fileData.id]: 10 }));

      // סימולציית התקדמות
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: Math.min((prev[fileData.id] || 0) + 15, 85)
        }));
      }, 300);

      // העלאה בפועל
      const result = await UploadFile({ file: fileData.file });
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileData.id]: 100 }));

      return result.file_url;
      
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [fileData.id]: 0 }));
      throw error;
    }
  };

  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      alert('אין קבצים תקינים להעלאה');
      return;
    }

    setIsUploading(true);
    setUploadStats({ completed: 0, failed: 0, total: pendingFiles.length });

    for (const fileData of pendingFiles) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ));

        const uploadedUrl = await uploadFile(fileData);

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'completed', 
            uploadedUrl,
            progress: 100 
          } : f
        ));

        setUploadStats(prev => ({ 
          ...prev, 
          completed: prev.completed + 1 
        }));

      } catch (error) {
        console.error('Upload failed:', error);
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'failed',
            errors: [...f.errors, `העלאה נכשלה: ${error.message}`]
          } : f
        ));

        setUploadStats(prev => ({ 
          ...prev, 
          failed: prev.failed + 1 
        }));
      }
    }

    setIsUploading(false);
    
    // קריאה ל-callback עם הקבצים שהועלו בהצלחה
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0 && onFilesUploaded) {
      onFilesUploaded(completedFiles);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const retryFile = (fileId) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'pending', 
        errors: f.errors.filter(e => !e.includes('העלאה נכשלה'))
      } : f
    ));
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
  };

  const getStatusIcon = (file) => {
    switch (file.status) {
      case 'pending': return <FileVideo className="w-5 h-5 text-blue-600" />;
      case 'uploading': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'invalid': return <X className="w-5 h-5 text-red-600" />;
      default: return <FileVideo className="w-5 h-5 text-gray-600" />;
    }
  };

  const validFiles = files.filter(f => f.status !== 'invalid');
  const completedFiles = files.filter(f => f.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              גרור קבצים לכאן או לחץ לבחירה
            </h3>
            <p className="text-gray-500 mb-2">
              עד {maxFiles} קבצים, מקסימום {maxSizeMB}MB לקובץ
            </p>
            <p className="text-sm text-gray-400">
              נתמכים: {SUPPORTED_EXTENSIONS.map(ext => ext.toUpperCase().replace('.', '')).join(', ')}
            </p>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            accept={SUPPORTED_VIDEO_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress Summary */}
      {isUploading && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            מעלה קבצים... ({uploadStats.completed}/{uploadStats.total})
            {uploadStats.failed > 0 && ` - ${uploadStats.failed} נכשלו`}
          </AlertDescription>
        </Alert>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                קבצים להעלאה ({validFiles.length}/{files.length})
              </CardTitle>
              
              {validFiles.length > 0 && !isUploading && (
                <Button 
                  onClick={startUpload} 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <UploadCloud className="w-4 h-4" />
                  העלה {validFiles.length} קבצים
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => (
                <Card key={file.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(file)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {file.file.name}
                          </h4>
                          
                          <div className="flex gap-2">
                            {file.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => retryFile(file.id)}
                                className="gap-1"
                              >
                                <UploadCloud className="w-3 h-3" />
                                נסה שוב
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file.id)}
                              className="w-6 h-6 text-gray-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex gap-4 text-sm text-gray-500 mb-2">
                          <span>{file.sizeMB.toFixed(1)} MB</span>
                          {file.metadata && (
                            <>
                              <span>{file.metadata.duration_seconds}s</span>
                              <span>{file.metadata.aspect_ratio}</span>
                              {file.metadata.resolution && (
                                <span>{file.metadata.resolution.width}x{file.metadata.resolution.height}</span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mb-2">
                            <Progress 
                              value={uploadProgress[file.id] || 0} 
                              className="h-2" 
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {uploadProgress[file.id] || 0}% הושלם
                            </p>
                          </div>
                        )}

                        {/* Status Messages */}
                        {file.status === 'completed' && (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>הועלה בהצלחה</span>
                          </div>
                        )}

                        {file.errors.length > 0 && (
                          <div className="space-y-1">
                            {file.errors.map((error, i) => (
                              <p key={i} className="text-sm text-red-600">
                                • {error}
                              </p>
                            ))}
                          </div>
                        )}

                        {file.warnings.length > 0 && (
                          <div className="space-y-1">
                            {file.warnings.map((warning, i) => (
                              <p key={i} className="text-sm text-yellow-600">
                                ⚠ {warning}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Quality Check */}
                        {showQualityCheck && file.status === 'pending' && file.metadata && (
                          <div className="mt-3">
                            <VideoQualityChecker 
                              video={{
                                ...file.metadata,
                                filename: file.file.name
                              }}
                              targetPlatforms={['instagram', 'tiktok']}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Stats */}
      {files.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{validFiles.length}</div>
                <div className="text-sm text-gray-600">קבצים תקינים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedFiles.length}</div>
                <div className="text-sm text-gray-600">הועלו</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {validFiles.reduce((sum, f) => sum + f.sizeMB, 0).toFixed(1)}MB
                </div>
                <div className="text-sm text-gray-600">נפח כולל</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
