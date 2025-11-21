import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, Settings, LogOut, GraduationCap, 
  Coins, Trophy, Heart, FileText, Shield 
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useScrollCoin";

export const UserProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: walletData } = useWallet();

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = () => {
    // Get role from user metadata or profile
    const role = user?.user_metadata?.role || profile?.role || "student";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
              alt={profile?.full_name || user?.email || "User"} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || "Faithful Scholar"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">{getUserRole()}</span>
              <div className="flex items-center space-x-1">
                <Coins className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-semibold">
                  {walletData?.wallet?.balance?.toFixed(0) || "0"}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/transcript">
            <DropdownMenuItem>
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Transcript</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/scrollcoin-wallet">
            <DropdownMenuItem>
              <Coins className="mr-2 h-4 w-4" />
              <span>ScrollCoin Wallet</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/achievements">
            <DropdownMenuItem>
              <Trophy className="mr-2 h-4 w-4" />
              <span>Achievements</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/spiritual-formation">
            <DropdownMenuItem>
              <Heart className="mr-2 h-4 w-4" />
              <span>Spiritual Formation</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          {(getUserRole() === "Admin" || getUserRole() === "Faculty") && (
            <Link to="/admin">
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
