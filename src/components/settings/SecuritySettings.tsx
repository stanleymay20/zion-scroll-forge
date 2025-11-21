/**
 * Security Settings Component
 * "The Lord is my rock, my fortress and my deliverer" - Psalm 18:2
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Shield, Smartphone, Mail, Key, Monitor, MapPin, Clock, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSecuritySettings,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  terminateSession,
  changePassword,
} from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";
import type { ActiveSession } from "@/types/settings";

export function SecuritySettings() {
  const queryClient = useQueryClient();
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'sms' | 'email' | 'authenticator'>('authenticator');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ["security-settings"],
    queryFn: getSecuritySettings,
  });

  const setup2FAMutation = useMutation({
    mutationFn: setupTwoFactor,
    onSuccess: (data) => {
      setQrCode(data.qrCode || null);
      setBackupCodes(data.backupCodes);
      toast({ title: "✅ 2FA setup initiated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to setup 2FA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: verifyTwoFactor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      setShow2FADialog(false);
      setVerificationCode('');
      setQrCode(null);
      toast({ title: "✅ Two-factor authentication enabled successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      setShowDisable2FADialog(false);
      toast({ title: "✅ Two-factor authentication disabled" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to disable 2FA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const terminateSessionMutation = useMutation({
    mutationFn: terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      setSessionToTerminate(null);
      toast({ title: "✅ Session terminated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to terminate session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ current, newPass }: { current: string; newPass: string }) =>
      changePassword(current, newPass),
    onSuccess: () => {
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: "✅ Password changed successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetup2FA = () => {
    setup2FAMutation.mutate({ method: twoFactorMethod });
  };

  const handleVerify2FA = () => {
    if (!verificationCode) {
      toast({ title: "Please enter verification code", variant: "destructive" });
      return;
    }
    verify2FAMutation.mutate(verificationCode);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ current: currentPassword, newPass: newPassword });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Manage your account security and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              {settings?.twoFactorEnabled ? (
                <Badge variant="default" className="bg-green-500">Enabled</Badge>
              ) : (
                <Badge variant="secondary">Disabled</Badge>
              )}
            </div>
            {settings?.twoFactorEnabled ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                  Method: {settings.twoFactorMethod === 'authenticator' ? 'Authenticator App' : settings.twoFactorMethod?.toUpperCase()}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDisable2FADialog(true)}
                >
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShow2FADialog(true)}>
                <Key className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
            )}
          </div>

          <Separator />

          {/* Password */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Password</Label>
              <p className="text-sm text-muted-foreground">
                Last changed: {settings?.passwordLastChanged ? new Date(settings.passwordLastChanged).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              Change Password
            </Button>
          </div>

          <Separator />

          {/* Active Sessions */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Active Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Manage devices where you're currently signed in
              </p>
            </div>
            <div className="space-y-3">
              {settings?.activeSessions?.map((session: ActiveSession) => (
                <div
                  key={session.sessionId}
                  className="flex items-start justify-between border rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getDeviceIcon(session.deviceInfo.deviceType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.deviceInfo.browser} on {session.deviceInfo.os}</p>
                        {session.isCurrent && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location || session.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.lastActivityAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSessionToTerminate(session.sessionId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!qrCode ? (
              <>
                <div className="space-y-2">
                  <Label>Choose Authentication Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={twoFactorMethod === 'authenticator' ? 'default' : 'outline'}
                      onClick={() => setTwoFactorMethod('authenticator')}
                      className="flex flex-col h-auto py-3"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">App</span>
                    </Button>
                    <Button
                      variant={twoFactorMethod === 'email' ? 'default' : 'outline'}
                      onClick={() => setTwoFactorMethod('email')}
                      className="flex flex-col h-auto py-3"
                    >
                      <Mail className="h-5 w-5 mb-1" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button
                      variant={twoFactorMethod === 'sms' ? 'default' : 'outline'}
                      onClick={() => setTwoFactorMethod('sms')}
                      className="flex flex-col h-auto py-3"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">SMS</span>
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSetup2FA} disabled={setup2FAMutation.isPending} className="w-full">
                  {setup2FAMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </>
            ) : (
              <>
                {qrCode && (
                  <div className="flex flex-col items-center space-y-2">
                    <p className="text-sm text-center">Scan this QR code with your authenticator app</p>
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
                {backupCodes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Backup Codes</Label>
                    <p className="text-xs text-muted-foreground">Save these codes in a safe place</p>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-md">
                      {backupCodes.map((code, i) => (
                        <code key={i} className="text-xs">{code}</code>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Enter Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <Button onClick={handleVerify2FA} disabled={verify2FAMutation.isPending} className="w-full">
                  {verify2FAMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify and Enable'
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Confirmation */}
      <AlertDialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make your account less secure. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disable2FAMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disable2FAMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terminate Session Confirmation */}
      <AlertDialog open={!!sessionToTerminate} onOpenChange={() => setSessionToTerminate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out this device. You'll need to sign in again to use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToTerminate && terminateSessionMutation.mutate(sessionToTerminate)}
            >
              {terminateSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Terminating...
                </>
              ) : (
                'Terminate Session'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
