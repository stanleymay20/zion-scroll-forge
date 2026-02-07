/**
 * CompletionSeal Component
 * 
 * A visible, verifiable seal component that indicates a course or program
 * has met ScrollUniversity's academic quality standards.
 * 
 * Criteria (enforced by logic, not text):
 * - Minimum 4 content-rich modules (500+ chars each)
 * - At least 2 assessments with rubrics
 * - At least 1 video OR audio script per module
 * - Study guide present
 * 
 * Seal automatically revokes if criteria are violated.
 */

import React, { useEffect, useState } from "react";
import { Shield, ShieldCheck, ShieldX, Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompletionSeal, type CompletionSeal as SealType, type SealCriteria } from "@/services/QualityGateService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CompletionSealProps {
  entityType: 'degree_program' | 'course';
  entityId: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function CompletionSeal({
  entityType,
  entityId,
  size = 'md',
  showDetails = false,
  className
}: CompletionSealProps) {
  const [seal, setSeal] = useState<SealType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeal() {
      try {
        setLoading(true);
        const data = await getCompletionSeal(entityType, entityId);
        setSeal(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (entityId) {
      fetchSeal();
    }
  }, [entityType, entityId]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-muted-foreground")} />
        {showDetails && <span className="text-muted-foreground text-sm">Verifying...</span>}
      </div>
    );
  }

  if (error || !seal) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Shield className={cn(sizeClasses[size], "text-muted-foreground/50")} />
        {showDetails && <span className="text-muted-foreground text-sm">Not evaluated</span>}
      </div>
    );
  }

  const isVerified = seal.seal_status === 'verified';
  const isRevoked = seal.seal_status === 'revoked';
  const isPending = seal.seal_status === 'pending';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className={cn(
              "relative rounded-full p-1 transition-all",
              isVerified && "bg-emerald-500/10 ring-2 ring-emerald-500/30",
              isRevoked && "bg-destructive/10 ring-2 ring-destructive/30",
              isPending && "bg-amber-500/10 ring-2 ring-amber-500/30"
            )}>
              {isVerified && (
                <ShieldCheck className={cn(
                  sizeClasses[size],
                  "text-emerald-500 drop-shadow-sm"
                )} />
              )}
              {isRevoked && (
                <ShieldX className={cn(
                  sizeClasses[size],
                  "text-destructive drop-shadow-sm"
                )} />
              )}
              {isPending && (
                <Shield className={cn(
                  sizeClasses[size],
                  "text-amber-500 drop-shadow-sm"
                )} />
              )}
            </div>
            
            {showDetails && (
              <div className="flex flex-col">
                <span className={cn(
                  "font-semibold",
                  textSizes[size],
                  isVerified && "text-emerald-600 dark:text-emerald-400",
                  isRevoked && "text-destructive",
                  isPending && "text-amber-600 dark:text-amber-400"
                )}>
                  {isVerified && "Quality Verified"}
                  {isRevoked && "Seal Revoked"}
                  {isPending && "Pending Verification"}
                </span>
                {seal.verified_at && isVerified && (
                  <span className="text-xs text-muted-foreground">
                    Verified {new Date(seal.verified_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="bottom" className="w-80 p-4">
          <SealDetailsPopover seal={seal} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SealDetailsPopover({ seal }: { seal: SealType }) {
  const criteria = seal.verification_criteria?.criteria as SealCriteria | undefined;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {seal.seal_status === 'verified' ? (
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        ) : seal.seal_status === 'revoked' ? (
          <ShieldX className="w-5 h-5 text-destructive" />
        ) : (
          <Shield className="w-5 h-5 text-amber-500" />
        )}
        <span className="font-semibold">
          ScrollUniversity Completion Seal
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        This seal verifies that the content meets ScrollUniversity's 
        academic quality standards for launch-ready programs.
      </p>
      
      {criteria && (
        <div className="space-y-2 border-t pt-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Verification Criteria
          </span>
          
          <CriteriaRow 
            label="Content-rich modules (4+)"
            passed={criteria.content_rich_modules?.passed}
            actual={criteria.content_rich_modules?.actual}
            required={criteria.content_rich_modules?.required}
          />
          
          <CriteriaRow 
            label="Assessments with rubrics (2+)"
            passed={criteria.assessments_with_rubrics?.passed}
            actual={criteria.assessments_with_rubrics?.actual}
            required={criteria.assessments_with_rubrics?.required}
          />
          
          <CriteriaRow 
            label="Media scripts per module"
            passed={criteria.modules_with_media?.passed}
            actual={criteria.modules_with_media?.actual}
            required={criteria.modules_with_media?.required}
          />
          
          <CriteriaRow 
            label="Study guide present"
            passed={criteria.has_study_guide?.passed}
            actual={criteria.has_study_guide?.actual}
            required={criteria.has_study_guide?.required}
          />
        </div>
      )}
      
      {seal.seal_status === 'revoked' && seal.revocation_reason && (
        <div className="bg-destructive/10 text-destructive text-xs p-2 rounded">
          <strong>Revoked:</strong> {seal.revocation_reason}
        </div>
      )}
      
      {seal.verified_at && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          Last verified: {new Date(seal.verified_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function CriteriaRow({ 
  label, 
  passed, 
  actual, 
  required 
}: { 
  label: string; 
  passed?: boolean; 
  actual?: number; 
  required?: number;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5">
        {passed ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-destructive" />
        )}
        <span className={passed ? "text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
      </div>
      <Badge variant={passed ? "default" : "secondary"} className="text-[10px] h-5">
        {actual ?? 0}/{required ?? 0}
      </Badge>
    </div>
  );
}

export default CompletionSeal;
