
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader, CardTitle
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileVideo,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Play,
  Plus // Added Plus
} from "lucide-react";

export default function FileUploader({
  selectedClientId,
  onFilesAdded,
  onFileRemove,
  filesToUpload = [],
  isUploading,
  onUploadStart
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file) => {
    const errors = [];
    const warnings = [];

    // File size check
    const maxSizeMB = 100;
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      errors.push(`הקובץ גדול מדי (${fileSizeMB.toFixed(1)}MB > ${maxSizeMB}MB)`);
    }

    // File type check
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('פורמט קובץ לא נתמך - השתמש ב-MP4, MOV או AVI');
    }

    return { errors, warnings, isValid: errors.length === 0 };
  };

  const getVideoMetadata = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const { duration, videoWidth, videoHeight } = video;
        let aspectRatio = '16:9';

        if (videoWidth && videoHeight) {
          const ratio = videoWidth / videoHeight;
          if (Math.abs(ratio - 9/16) < 0.1) aspectRatio = '9:16';
          else if (Math.abs(ratio - 1) < 0.1) aspectRatio = '1:1';
          else if (Math.abs(ratio - 4/3) < 0.1) aspectRatio = '4:3';
        }

        window.URL.revokeObjectURL(video.src);
        resolve({
          duration: Math.round(duration),
          width: videoWidth,
          height: videoHeight,
          aspectRatio: aspectRatio,
          fileSizeMB: file.size / (1024 * 1024)
        });
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('לא ניתן לקרוא מטדטה של הוידאו'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const processFiles = useCallback(async (files) => {
    if (!selectedClientId) {
      alert('אנא בחר לקוח תחילה');
      return;
    }

    const processedFiles = await Promise.all(
      Array.from(files).map(async (file, index) => {
        const validation = validateFile(file);
        let metadata = null;

        if (validation.isValid) {
          try {
            metadata = await getVideoMetadata(file);
          } catch (error) {
            validation.errors.push('שגיאה בקריאת מטדטה של הוידאו');
          }
        }

        return {
          id: `${Date.now()}-${index}`,
          file,
          filename: file.name,
          status: validation.isValid ? 'pending' : 'invalid',
          progress: 0,
          errors: validation.errors,
          warnings: validation.warnings,
          metadata: metadata ? {
            duration_seconds: metadata.duration,
            file_size_mb: metadata.fileSizeMB,
            aspect_ratio: metadata.aspectRatio
          } : null
        };
      })
    );

    onFilesAdded(processedFiles);
  }, [selectedClientId, onFilesAdded]); // Added selectedClientId and onFilesAdded as dependencies

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  }, [processFiles]); // Depends on processFiles

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
  };

  const getStatusIcon = (file) => {
    switch (file.status) {
      case 'pending': return <FileVideo className="w-5 h-5 text-gray-500" />;
      case 'uploading': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'invalid': return <X className="w-5 h-5 text-red-500" />;
      default: return <FileVideo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (file) => {
    switch (file.status) {
      case 'pending': return <Badge variant="outline">ממתין</Badge>;
      case 'uploading': return <Badge className="bg-blue-100 text-blue-800">מעלה</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800">הושלם</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">נכשל</Badge>;
      case 'invalid': return <Badge className="bg-red-100 text-red-800">לא תקין</Badge>;
      default: return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-25'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => document.getElementById('file-input').click()}
      >
        <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          גרור וידאו לכאן או לחץ לבחירה
        </h3>
        <p className="text-gray-500 mb-4">
          תומך בקבצי MP4, MOV, AVI • עד 100MB לקובץ • עד 20 קבצים במקביל
        </p>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          בחר קבצים
        </Button>

        <input
          id="file-input"
          type="file"
          multiple
          accept="video/mp4,video/quicktime,video/x-msvideo"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Files List */}
      {filesToUpload.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>קבצים להעלאה ({filesToUpload.length})</CardTitle>
              <Button
                onClick={onUploadStart}
                disabled={isUploading || !selectedClientId || filesToUpload.every(f => f.status === 'completed' || f.status === 'invalid')}
                className="gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? 'מעלה...' : 'העלה הכל'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filesToUpload.map(file => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(file)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{file.filename}</h4>
                      {getStatusBadge(file)}
                    </div>

                    {file.metadata && (
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>{file.metadata.duration_seconds}s</span>
                        <span>{file.metadata.file_size_mb.toFixed(1)}MB</span>
                        <span>{file.metadata.aspect_ratio}</span>
                      </div>
                    )}

                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-2" />
                    )}

                    {file.errors.length > 0 && (
                      <div className="text-sm text-red-600">
                        {file.errors.map((error, i) => (
                          <p key={i}>• {error}</p>
                        ))}
                      </div>
                    )}

                    {file.warnings.length > 0 && (
                      <div className="text-sm text-yellow-600">
                        {file.warnings.map((warning, i) => (
                          <p key={i}>⚠ {warning}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileRemove(file.id)}
                    disabled={isUploading && file.status === 'uploading'}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
