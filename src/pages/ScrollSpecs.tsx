import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Plus, Search, GitBranch, Clock, 
  User, Star, Download, Eye, Edit3 
} from "lucide-react";

const ScrollSpecs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockSpecs = [
    {
      id: 1,
      title: "Scroll University Architecture",
      description: "Complete system architecture for the ScrollUniversity platform",
      author: "System Architect",
      version: "2.1.4",
      status: "Active",
      lastModified: "2 hours ago",
      tags: ["architecture", "system-design", "core"],
      stars: 24,
      downloads: 156
    },
    {
      id: 2,
      title: "AI Tutor Specification",
      description: "Defines the behavior and capabilities of AI tutoring agents",
      author: "AI Team",
      version: "1.8.2",
      status: "Draft",
      lastModified: "1 day ago",
      tags: ["ai", "tutoring", "agents"],
      stars: 18,
      downloads: 89
    },
    {
      id: 3,
      title: "ScrollCoin Economic Model",
      description: "Token economics and reward mechanisms for the ScrollCoin system",
      author: "Economics Team",
      version: "3.0.1",
      status: "Active",
      lastModified: "3 days ago",
      tags: ["economics", "tokens", "rewards"],
      stars: 31,
      downloads: 203
    }
  ];

  const filteredSpecs = mockSpecs.filter(spec =>
    spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Draft": return "bg-yellow-500";
      case "Deprecated": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Scroll Specifications</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and version your system specifications
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Spec
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search specifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <GitBranch className="h-4 w-4 mr-2" />
          Version Control
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Specs ({filteredSpecs.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredSpecs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No specifications found matching your search.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSpecs.map((spec) => (
                <Card key={spec.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{spec.title}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(spec.status)} text-white`}
                          >
                            {spec.status}
                          </Badge>
                        </div>
                        <CardDescription>{spec.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {spec.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {spec.lastModified}
                          </span>
                          <span>v{spec.version}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {spec.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {spec.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {spec.downloads}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Active specifications will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Draft specifications will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Specification templates will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrollSpecs;