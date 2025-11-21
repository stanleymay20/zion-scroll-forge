/**
 * Badge Verification Component
 * "By the Spirit of Truth, we verify credentials"
 * 
 * Component for verifying badge authenticity on the blockchain
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { ScrollBadge, BadgeVerificationResult } from '@/types/scrollbadge';
import { toast } from 'sonner';

interface BadgeVerificationProps {
  badge: ScrollBadge;
}

export const BadgeVerification: React.FC<BadgeVerificationProps> = ({ badge }) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<BadgeVerificationResult | null>(null);
  const [employerEmail, setEmployerEmail] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [verificationPurpose, setVerificationPurpose] = useState('');

  const handleVerifyBadge = async () => {
    try {
      setVerifying(true);
      const response = await fetch('/api/scrollbadge/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenId: badge.tokenId
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      setVerificationResult(data.data);
      
      if (data.data.isValid) {
        toast.success('Badge verified successfully');
      } else {
        toast.error('Badge verification failed');
      }
    } catch (error) {
      console.error('Error verifying badge:', error);
      toast.error('Failed to verify badge');
    } finally {
      setVerifying(false);
    }
  };

  const handleEmployerVerification = async () => {
    if (!employerEmail || !employerName || !verificationPurpose) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch('/api/scrollbadge/verify/employer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenId: badge.tokenId,
          employerName,
          employerEmail,
          verificationPurpose
        })
      });

      if (!response.ok) {
        throw new Error('Employer verification failed');
      }

      const data = await response.json();
      toast.success('Verification request sent to employer');
      
      // Clear form
      setEmployerEmail('');
      setEmployerName('');
      setVerificationPurpose('');
    } catch (error) {
      console.error('Error requesting employer verification:', error);
      toast.error('Failed to send verification request');
    } finally {
      setVerifying(false);
    }
  };

  const getBlockchainExplorerUrl = (): string => {
    return `https://etherscan.io/tx/${badge.blockchainTxHash}`;
  };

  return (
    <div className="space-y-6">
      {/* Quick Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Verify this badge's authenticity against the blockchain
          </p>

          <Button
            onClick={handleVerifyBadge}
            disabled={verifying || !badge.blockchainTxHash}
            className="w-full"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify Badge
              </>
            )}
          </Button>

          {!badge.blockchainTxHash && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This badge has not been minted on the blockchain yet. Verification will be available once the blockchain transaction is confirmed.
              </AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <Alert variant={verificationResult.isValid ? 'default' : 'destructive'}>
              {verificationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {verificationResult.isValid ? (
                  <div className="space-y-2">
                    <p className="font-semibold">Badge is valid and verified!</p>
                    <div className="text-sm space-y-1">
                      <p>Verified at: {new Date(verificationResult.verifiedAt).toLocaleString()}</p>
                      {verificationResult.blockchainData && (
                        <>
                          <p>Owner: {verificationResult.blockchainData.owner.substring(0, 10)}...</p>
                          <p>Token ID: #{verificationResult.blockchainData.tokenId}</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold">Badge verification failed</p>
                    {verificationResult.discrepancies && verificationResult.discrepancies.length > 0 && (
                      <ul className="text-sm list-disc list-inside">
                        {verificationResult.discrepancies.map((discrepancy, index) => (
                          <li key={index}>{discrepancy}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {badge.blockchainTxHash && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(getBlockchainExplorerUrl(), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Blockchain Explorer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Employer Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Employer Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Request a formal verification for employment or educational purposes
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employerName">Employer/Institution Name</Label>
              <Input
                id="employerName"
                placeholder="Enter employer or institution name"
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employerEmail">Employer Email</Label>
              <Input
                id="employerEmail"
                type="email"
                placeholder="employer@company.com"
                value={employerEmail}
                onChange={(e) => setEmployerEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationPurpose">Verification Purpose</Label>
              <Input
                id="verificationPurpose"
                placeholder="e.g., Job application, credential verification"
                value={verificationPurpose}
                onChange={(e) => setVerificationPurpose(e.target.value)}
              />
            </div>

            <Button
              onClick={handleEmployerVerification}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Request Verification'
              )}
            </Button>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              A verification email will be sent to the employer with a secure link to verify this credential.
              The verification will be valid for 30 days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Verification Information */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token ID:</span>
            <span className="font-mono">#{badge.tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credential Type:</span>
            <span>{badge.credentialType.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Issued To:</span>
            <span>{badge.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Course:</span>
            <span>{badge.courseName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Grade:</span>
            <span className="font-semibold">{badge.grade}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completion Date:</span>
            <span>{new Date(badge.completionDate).toLocaleDateString()}</span>
          </div>
          {badge.ipfsHash && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">IPFS Hash:</span>
              <span className="font-mono text-xs">{badge.ipfsHash.substring(0, 10)}...</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={badge.isRevoked ? 'text-red-600' : 'text-green-600'}>
              {badge.isRevoked ? 'Revoked' : 'Valid'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
