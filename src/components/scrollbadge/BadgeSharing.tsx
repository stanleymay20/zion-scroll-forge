/**
 * Badge Sharing Component
 * "By the Spirit of Excellence, we share our achievements"
 * 
 * Component for sharing badges on social media platforms
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Linkedin, Twitter, Facebook, Mail, Link, Copy, CheckCircle } from 'lucide-react';
import { ScrollBadge, SharePlatform } from '@/types/scrollbadge';
import { toast } from 'sonner';

interface BadgeSharingProps {
  badge: ScrollBadge;
}

export const BadgeSharing: React.FC<BadgeSharingProps> = ({ badge }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateShareUrl = (): string => {
    // Generate public badge profile URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/badges/public/${badge.tokenId}`;
  };

  const getDefaultMessage = (): string => {
    return `I just earned a ${badge.credentialType.replace('_', ' ')} badge for completing ${badge.courseName} with a grade of ${badge.grade}%! 🎓 #ScrollUniversity #Achievement`;
  };

  const handleShare = async (platform: SharePlatform) => {
    try {
      const url = generateShareUrl();
      const message = customMessage || getDefaultMessage();

      let shareLink = '';

      switch (platform) {
        case SharePlatform.LINKEDIN:
          shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case SharePlatform.TWITTER:
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
          break;
        case SharePlatform.FACEBOOK:
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case SharePlatform.EMAIL:
          shareLink = `mailto:?subject=${encodeURIComponent('Check out my achievement!')}&body=${encodeURIComponent(message + '\n\n' + url)}`;
          break;
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
        
        // Track share event
        await fetch('/api/scrollbadge/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            tokenId: badge.tokenId,
            platform,
            message
          })
        });

        toast.success(`Badge shared on ${platform}`);
      }
    } catch (error) {
      console.error('Error sharing badge:', error);
      toast.error('Failed to share badge');
    }
  };

  const handleCopyLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Badge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custom Message */}
        <div className="space-y-2">
          <Label>Custom Message (Optional)</Label>
          <Textarea
            placeholder={getDefaultMessage()}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Customize your message or leave blank to use the default
          </p>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <Label>Share On</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare(SharePlatform.LINKEDIN)}
              className="justify-start"
            >
              <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare(SharePlatform.TWITTER)}
              className="justify-start"
            >
              <Twitter className="h-4 w-4 mr-2 text-sky-500" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare(SharePlatform.FACEBOOK)}
              className="justify-start"
            >
              <Facebook className="h-4 w-4 mr-2 text-blue-700" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare(SharePlatform.EMAIL)}
              className="justify-start"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </div>

        {/* Copy Link */}
        <div className="space-y-2">
          <Label>Direct Link</Label>
          <div className="flex gap-2">
            <Input
              value={generateShareUrl()}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link directly with anyone
          </p>
        </div>

        {/* Embed Code */}
        <div className="space-y-2">
          <Label>Embed Code</Label>
          <Textarea
            value={`<iframe src="${generateShareUrl()}/embed" width="400" height="300" frameborder="0"></iframe>`}
            readOnly
            rows={3}
            className="font-mono text-xs resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Embed this badge on your website or portfolio
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Your badge must be set to public for others to view it.
            {!badge.isPublic && (
              <span className="text-orange-600">
                {' '}Your badge is currently private. Change it to public in the Details tab to share it.
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
