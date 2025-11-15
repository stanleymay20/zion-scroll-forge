import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

console.info("✝️ Messaging — Christ governs communication");

const conversations = [
  {
    id: "1",
    name: "Study Group Alpha",
    lastMessage: "See you at tomorrow's meeting!",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    unread: 2,
    isGroup: true,
  },
  {
    id: "2",
    name: "Pastor Michael",
    lastMessage: "Great question about sanctification...",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    unread: 0,
    isGroup: false,
  },
  {
    id: "3",
    name: "Sarah Williams",
    lastMessage: "Thanks for the prayer support!",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    unread: 1,
    isGroup: false,
  },
];

const messages = [
  {
    id: "1",
    sender: "Pastor Michael",
    content: "Great question about sanctification. Let me share some thoughts...",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    content: "Thank you! That really helps clarify things.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isOwn: true,
  },
  {
    id: "3",
    sender: "Pastor Michael",
    content: "I'd also recommend reading Romans 6. It's foundational.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isOwn: false,
  },
  {
    id: "4",
    sender: "You",
    content: "Will do! Appreciate your guidance.",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    isOwn: true,
  },
];

export default function Messaging() {
  const [selectedConvo, setSelectedConvo] = useState(conversations[1]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSend = () => {
    if (messageText.trim()) {
      // Mock send
      setMessageText("");
    }
  };

  return (
    <PageTemplate title="Messages" description="Connect with your community">
      <div className="max-w-7xl mx-auto">
        <Card className="h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full sm:w-80 border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-73px)]">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`w-full p-4 border-b hover:bg-muted/50 text-left transition-colors ${
                      selectedConvo?.id === convo.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{convo.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm truncate">{convo.name}</p>
                          {convo.unread > 0 && (
                            <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                              {convo.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(convo.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedConvo.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedConvo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConvo.isGroup ? "Study Group" : "Active now"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${msg.isOwn ? "order-2" : "order-1"}`}>
                        {!msg.isOwn && (
                          <p className="text-xs text-muted-foreground mb-1">{msg.sender}</p>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            msg.isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageTemplate>
  );
}
