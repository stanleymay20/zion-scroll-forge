/**
 * Course Preview Video Component
 *
 * Supports native video files plus common hosted preview links (YouTube/Vimeo).
 * Fails gracefully with a visible fallback instead of showing a dead player.
 */

import { useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, ExternalLink, VideoOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CoursePreviewVideoProps {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title: string;
  duration?: string;
}

type HostedVideo =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'vimeo'; embedUrl: string }
  | null;

function getHostedVideo(url?: string | null): HostedVideo {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '');
      return id ? { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` } : null;
    }

    if (host.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
      return id ? { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` } : null;
    }

    if (host.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id ? { kind: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}` } : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getMimeType(videoUrl: string) {
  const url = videoUrl.toLowerCase().split('?')[0];
  if (url.endsWith('.webm')) return 'video/webm';
  if (url.endsWith('.mov')) return 'video/quicktime';
  if (url.endsWith('.ogg') || url.endsWith('.ogv')) return 'video/ogg';
  if (url.endsWith('.m3u8')) return 'application/x-mpegURL';
  return 'video/mp4';
}

export function CoursePreviewVideo({
  videoUrl,
  thumbnailUrl,
  title,
  duration,
}: CoursePreviewVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hostedVideo = useMemo(() => getHostedVideo(videoUrl), [videoUrl]);

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video || hasError) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setHasError(true);
      setIsPlaying(false);
      // Keep detail for dev diagnostics without leaking to users.
      console.warn('Course preview video failed to play', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  if (!videoUrl) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-lg">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Preview video coming soon</p>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-black/70 text-white">Preview</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hostedVideo) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black overflow-hidden rounded-lg">
            <iframe
              title={`${title} preview video`}
              src={`${hostedVideo.embedUrl}?rel=0&modestbranding=1`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <div className="absolute top-4 right-4 pointer-events-none">
              <Badge variant="secondary" className="bg-black/70 text-white">
                Preview {duration && `• ${duration}`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mimeType = getMimeType(videoUrl);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black group overflow-hidden rounded-lg">
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
              <VideoOff className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium">Preview video could not play here</p>
                <p className="text-sm text-muted-foreground">
                  The source may be unavailable or use a format this browser cannot stream.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  Open video source <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster={thumbnailUrl || undefined}
              preload="metadata"
              playsInline
              controls={isPlaying}
              onLoadedData={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => {
                setIsLoading(false);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
            >
              <source src={videoUrl} type={mimeType} />
              Your browser does not support the video tag.
            </video>
          )}

          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}

          {!hasError && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-black/70 text-white">
                Preview {duration && `• ${duration}`}
              </Badge>
            </div>
          )}

          {!isPlaying && !isLoading && !hasError && (
            <button
              type="button"
              aria-label="Play course preview video"
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={handlePlayPause}
            >
              <span className="bg-primary rounded-full p-6 hover:scale-110 transition-transform">
                <Play className="h-12 w-12 text-white fill-white" />
              </span>
            </button>
          )}

          {!hasError && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handlePlayPause} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={handleMuteToggle} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <div className="flex-1" />

                <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white hover:bg-white/20">
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
