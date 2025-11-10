import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Upload, Sparkles, Save, RefreshCw } from 'lucide-react';
import { ReadyPlayerMeAvatar } from '@/components/ReadyPlayerMeAvatar';

const PRESET_AVATARS = [
  'https://models.readyplayer.me/6501c4fee8d3f50f2c1d1e84.glb',
  'https://models.readyplayer.me/65a7f5e8e8d3f50f2c1d1234.glb',
  'https://models.readyplayer.me/65a7f5e8e8d3f50f2c1d5678.glb',
  'https://models.readyplayer.me/65a7f5e8e8d3f50f2c1d9abc.glb',
];

export default function AvatarCustomization() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(PRESET_AVATARS[0]);

  const openReadyPlayerMe = () => {
    setIsGenerating(true);
    
    const subdomain = 'demo';
    const frame = document.createElement('iframe');
    frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
    frame.allow = 'camera *; microphone *';
    frame.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 9999;
    `;

    document.body.appendChild(frame);

    window.addEventListener('message', (event) => {
      const json = parse(event);

      if (json?.source !== 'readyplayerme') {
        return;
      }

      if (json.eventName === 'v1.frame.ready') {
        console.log('Ready Player Me frame is ready');
      }

      if (json.eventName === 'v1.avatar.exported') {
        console.log('Avatar URL:', json.data.url);
        setAvatarUrl(json.data.url);
        setPreviewUrl(json.data.url);
        document.body.removeChild(frame);
        setIsGenerating(false);
        toast({
          title: 'Avatar Generated!',
          description: 'Your custom 3D avatar is ready. Click Save to apply it to your profile.',
        });
      }

      if (json.eventName === 'v1.user.set') {
        console.log('User ID:', json.data.id);
      }
    });
  };

  const parse = (event: MessageEvent) => {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    setAvatarUrl(preset);
    setPreviewUrl(preset);
    toast({
      title: 'Avatar Selected',
      description: 'Click Save to apply this avatar to your profile.',
    });
  };

  const handleCustomUrl = () => {
    if (!avatarUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Ready Player Me avatar URL',
        variant: 'destructive',
      });
      return;
    }
    setPreviewUrl(avatarUrl);
    toast({
      title: 'Avatar Preview Updated',
      description: 'Click Save to apply this avatar to your profile.',
    });
  };

  const saveAvatar = async () => {
    if (!avatarUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please select or create an avatar first',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          academic_profile: {
            avatar_url: avatarUrl,
            avatar_type: 'readyplayerme',
            updated_at: new Date().toISOString(),
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your 3D avatar has been saved to your profile.',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save avatar',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Avatar Customization</h1>
        <p className="text-muted-foreground">
          Create your personalized 3D avatar for AI tutor sessions and virtual classrooms
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              3D Avatar Preview
            </CardTitle>
            <CardDescription>
              Your avatar will appear in AI tutor sessions and XR classrooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg overflow-hidden border-2 border-primary/20">
              <ReadyPlayerMeAvatar
                avatarUrl={previewUrl}
                isSpeaking={false}
                isThinking={false}
                audioElement={null}
              />
            </div>
            
            <Button 
              onClick={saveAvatar} 
              disabled={isSaving || !avatarUrl}
              className="w-full mt-4"
              size="lg"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customize Your Avatar
            </CardTitle>
            <CardDescription>
              Choose from presets, create from photo, or use a custom Ready Player Me avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="custom">Custom URL</TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select from our curated preset avatars
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_AVATARS.map((preset, index) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetSelect(preset)}
                      className={`relative aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                        selectedPreset === preset
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback>A{index + 1}</AvatarFallback>
                        </Avatar>
                      </div>
                      {selectedPreset === preset && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a personalized avatar using Ready Player Me's advanced creator
                </p>
                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Upload Your Photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a realistic 3D avatar from your photo using AI
                    </p>
                    <Button
                      onClick={openReadyPlayerMe}
                      disabled={isGenerating}
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Open Avatar Creator
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have a Ready Player Me avatar? Paste your .glb URL here
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://models.readyplayer.me/..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleCustomUrl} className="w-full">
                    Preview Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Visit{' '}
                    <a
                      href="https://readyplayer.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      readyplayer.me
                    </a>{' '}
                    to create your avatar and get the URL
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
