import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, MessageSquare, Heart, BookOpen, Trophy, Globe, 
  Plus, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCommunityPosts, useCreatePost } from "@/hooks/useCommunity";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useState } from "react";
import { toast } from "sonner";

console.info("✝️ ScrollUniversity Community — Christ governs all fellowship");

export default function Community() {
  const { data: posts, isLoading: postsLoading } = useCommunityPosts();
  const { data: studyGroups, isLoading: groupsLoading } = useStudyGroups();
  const createPost = useCreatePost();
  
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createPost.mutateAsync(newPost);
      setNewPost({ title: "", content: "" });
      setShowCreatePost(false);
      toast.success("✝️ Post created — Christ be glorified!");
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  if (postsLoading || groupsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="ScrollUniversity Community"
      description="Connect, collaborate, and grow with fellow believers worldwide"
    >
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active discussions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyGroups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Growing</div>
            <p className="text-xs text-muted-foreground">Community expanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Reach</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Worldwide</div>
            <p className="text-xs text-muted-foreground">Christ's kingdom has no borders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Section */}
          <Card>
            <CardHeader>
              <CardTitle>Share with the Community</CardTitle>
              <CardDescription>Start a discussion, share insights, or ask questions</CardDescription>
            </CardHeader>
            <CardContent>
              {!showCreatePost ? (
                <Button onClick={() => setShowCreatePost(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Post
                </Button>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Post Title</Label>
                    <Input
                      id="title"
                      placeholder="What would you like to discuss?"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createPost.isPending}>
                      {createPost.isPending ? "Posting..." : "Post"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreatePost(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
              <CardDescription>Latest community posts and conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {posts && posts.length > 0 ? (
                posts.map((post: any) => (
                  <div key={post.id} className="flex gap-4 pb-6 border-b last:border-0 last:pb-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profile?.avatar_url} />
                      <AvatarFallback>
                        {post.profile?.full_name?.slice(0, 2).toUpperCase() || post.user_id?.slice(0, 2).toUpperCase() || "SU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{post.profile?.full_name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {post.title && <p className="font-medium mt-2">{post.title}</p>}
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments?.[0]?.count || 0} comments
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No posts yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Be the first to start a discussion!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Study Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Study Groups</CardTitle>
              <CardDescription>Join a community of focused learners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyGroups && studyGroups.length > 0 ? (
                studyGroups.slice(0, 3).map((group: any) => (
                  <div key={group.id} className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{group.name}</h4>
                      <Badge variant="default" className="text-xs">
                        {group.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{group.description}</p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link to={`/study-groups/${group.id}`}>View Group</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No study groups yet. Be the first to create one!
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/study-groups">
                  View All Groups
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Community features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/prayer-requests">
                  <Heart className="mr-2 h-4 w-4" />
                  Prayer Requests
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/study-groups">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Study Groups
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/achievements">
                  <Trophy className="mr-2 h-4 w-4" />
                  Achievements
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Christ-Centered Message */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">✝️ Kingdom Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground italic">
                "For where two or three gather in my name, there am I with them." - Matthew 18:20
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Every interaction in this community is an opportunity to demonstrate Christ's love and encourage one another in faith.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
