import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Video, CheckCircle, AlertCircle, FileVideo, Loader2 } from 'lucide-react';

interface VideoUploadProps {
  lectureId: string;
  onUploadComplete?: (videoData: VideoData) => void;
  onCancel?: () => void;
}

interface VideoData {
  id: string;
  url: string;
  resolution: string;
  format: string;
  duration: number;
  fileSize: number;
  captions?: string[];
  streamingUrls?: string[];
}

interface UploadProgress {
  stage: 'uploading' | 'processing' | 'generating-captions' | 'optimizing' | 'complete';
  percentage: number;
  message: string;
}

export const VideoUploader: React.FC<VideoUploadProps> = ({
  lectureId,
  onUploadComplete,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [captionLanguages, setCaptionLanguages] = useState<string[]>(['en']);
  const [resolution, setResolution] = useState<string>('1080p');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid video file');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid video file');
      }
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      
      // Stage 1: Upload
      setUploadProgress({
        stage: 'uploading',
        percentage: 0,
        message: 'Uploading video file...'
      });

      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('lectureId', lectureId);
      formData.append('resolution', resolution);
      formData.append('captionLanguages', JSON.stringify(captionLanguages));

      const uploadResponse = await fetch('/api/course-content/videos', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { videoId } = await uploadResponse.json();

      // Stage 2: Processing
      setUploadProgress({
        stage: 'processing',
        percentage: 25,
        message: 'Processing video with professional editing...'
      });

      await pollProcessingStatus(videoId, 'processing');

      // Stage 3: Caption Generation
      setUploadProgress({
        stage: 'generating-captions',
        percentage: 50,
        message: 'Generating captions and transcripts...'
      });

      await pollProcessingStatus(videoId, 'captions');

      // Stage 4: Streaming Optimization
      setUploadProgress({
        stage: 'optimizing',
        percentage: 75,
        message: 'Optimizing for adaptive bitrate streaming...'
      });

      await pollProcessingStatus(videoId, 'streaming');

      // Stage 5: Complete
      setUploadProgress({
        stage: 'complete',
        percentage: 100,
        message: 'Video processing complete!'
      });

      // Fetch final video data
      const videoResponse = await fetch(`/api/course-content/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const finalVideoData = await videoResponse.json();
      setVideoData(finalVideoData);
      onUploadComplete?.(finalVideoData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(null);
    }
  };

  const pollProcessingStatus = async (videoId: string, stage: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/course-content/videos/${videoId}/status`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const { status, progress } = await response.json();
          
          if (status === 'completed') {
            clearInterval(interval);
            resolve();
          } else if (status === 'failed') {
            clearInterval(interval);
            reject(new Error('Processing failed'));
          }
          
          // Update progress within stage
          const baseProgress = uploadProgress?.percentage || 0;
          setUploadProgress(prev => prev ? {
            ...prev,
            percentage: baseProgress + (progress * 0.25)
          } : null);
          
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 2000);

      // Timeout after 30 minutes
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Processing timeout'));
      }, 30 * 60 * 1000);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Lecture Upload</CardTitle>
          <CardDescription>
            Upload high-quality video lectures with automatic caption generation and streaming optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!selectedFile && !uploadProgress && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                Drag and drop your video file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="video-upload" className="cursor-pointer">
                  Select Video File
                </label>
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: MP4, MOV, AVI, MKV (Max 5GB)
              </p>
            </div>
          )}

          {/* Selected File Info */}
          {selectedFile && !uploadProgress && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <FileVideo className="h-10 w-10 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="1440p">1440p 2K</SelectItem>
                      <SelectItem value="2160p">2160p 4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Caption Languages</Label>
                  <Select
                    value={captionLanguages[0]}
                    onValueChange={(val) => setCaptionLanguages([val])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={uploadVideo}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Process
                </Button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium">{uploadProgress.message}</p>
                    <p className="text-sm text-gray-500">
                      Stage: {uploadProgress.stage.replace('-', ' ')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">{uploadProgress.percentage}%</span>
              </div>
              <Progress value={uploadProgress.percentage} className="h-2" />

              <div className="grid grid-cols-5 gap-2 mt-4">
                {['uploading', 'processing', 'generating-captions', 'optimizing', 'complete'].map(
                  (stage, index) => (
                    <div key={stage} className="text-center">
                      <div
                        className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                          uploadProgress.stage === stage
                            ? 'bg-blue-600 text-white'
                            : uploadProgress.percentage > index * 20
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {uploadProgress.percentage > index * 20 ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        {stage.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Completed Video Info */}
          {videoData && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Video processing complete!</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Resolution</Label>
                  <p className="font-medium">{videoData.resolution}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Duration</Label>
                  <p className="font-medium">{formatDuration(videoData.duration)}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">File Size</Label>
                  <p className="font-medium">{formatFileSize(videoData.fileSize)}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Format</Label>
                  <p className="font-medium">{videoData.format.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Features</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">
                    <Video className="mr-1 h-3 w-3" />
                    Adaptive Streaming
                  </Badge>
                  {videoData.captions && videoData.captions.length > 0 && (
                    <Badge variant="default">
                      Captions ({videoData.captions.length} languages)
                    </Badge>
                  )}
                  <Badge variant="default">Transcript Generated</Badge>
                  <Badge variant="default">CDN Optimized</Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedFile(null);
                  setVideoData(null);
                  setUploadProgress(null);
                }}>
                  Upload Another Video
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Video Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Minimum Resolution</span>
            <Badge variant="outline">1080p</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Audio Quality</span>
            <Badge variant="outline">Clear, Professional</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration</span>
            <Badge variant="outline">15-45 minutes</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Captions</span>
            <Badge variant="outline">Auto-generated</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Streaming</span>
            <Badge variant="outline">Adaptive Bitrate</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoUploader;
