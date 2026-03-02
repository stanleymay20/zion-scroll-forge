/**
 * DiplomaSeal Component
 * 
 * A stricter completion seal for ScrollDiploma-level courses.
 * Criteria (enforced by logic):
 * - ≥5 content-rich modules (700+ chars each)
 * - ≥3 assessments: 1 knowledge check, 1 applied project, 1 synthesis
 * - Media scripts for core modules
 * - Study guide present
 */

import React, { useEffect, useState } from "react";
import { Shield, ShieldCheck, ShieldX, Loader2, CheckCircle, XCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompletionSeal, type CompletionSeal as SealType, type DiplomaSealCriteria } from "@/services/QualityGateService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface DiplomaSealProps {
  entityType: 'diploma_course' | 'diploma_program';
  entityId: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function DiplomaSeal({
  entityType,
  entityId,
  size = 'md',
  showDetails = false,
  className
}: DiplomaSealProps) {
  const [seal, setSeal] = useState<SealType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeal() {
      try {
        setLoading(true);
        const data = await getCompletionSeal(entityType as any, entityId);
        setSeal(data);
      } finally {
        setLoading(false);
      }
    }
    if (entityId) fetchSeal();
  }, [entityType, entityId]);

  const sizeClasses = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-muted-foreground")} />
      </div>
    );
  }

  if (!seal) {
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
              isVerified && "bg-blue-500/10 ring-2 ring-blue-500/30",
              isRevoked && "bg-destructive/10 ring-2 ring-destructive/30",
              isPending && "bg-amber-500/10 ring-2 ring-amber-500/30"
            )}>
              {isVerified && <Award className={cn(sizeClasses[size], "text-blue-500 drop-shadow-sm")} />}
              {isRevoked && <ShieldX className={cn(sizeClasses[size], "text-destructive drop-shadow-sm")} />}
              {isPending && <Shield className={cn(sizeClasses[size], "text-amber-500 drop-shadow-sm")} />}
            </div>
            
            {showDetails && (
              <div className="flex flex-col">
                <span className={cn(
                  "font-semibold", textSizes[size],
                  isVerified && "text-blue-600 dark:text-blue-400",
                  isRevoked && "text-destructive",
                  isPending && "text-amber-600 dark:text-amber-400"
                )}>
                  {isVerified && "Diploma Seal Verified"}
                  {isRevoked && "Diploma Seal Revoked"}
                  {isPending && "Pending Diploma Verification"}
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
          <DiplomaSealDetails seal={seal} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DiplomaSealDetails({ seal }: { seal: SealType }) {
  const criteria = seal.verification_criteria?.criteria as DiplomaSealCriteria | undefined;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-blue-500" />
        <span className="font-semibold">ScrollDiploma Completion Seal</span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Diploma-tier seal with stricter criteria: deeper content, 
        three assessment types, and applied mastery verification.
      </p>
      
      {criteria && (
        <div className="space-y-2 border-t pt-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Diploma Criteria
          </span>
          <CriteriaRow label="Content-rich modules (5+, 700+ chars)" passed={criteria.content_rich_modules?.passed} actual={criteria.content_rich_modules?.actual} required={criteria.content_rich_modules?.required} />
          <CriteriaRow label="Knowledge checks (1+)" passed={criteria.knowledge_checks?.passed} actual={criteria.knowledge_checks?.actual} required={criteria.knowledge_checks?.required} />
          <CriteriaRow label="Applied projects (1+)" passed={criteria.applied_projects?.passed} actual={criteria.applied_projects?.actual} required={criteria.applied_projects?.required} />
          <CriteriaRow label="Synthesis assessments (1+)" passed={criteria.synthesis_assessments?.passed} actual={criteria.synthesis_assessments?.actual} required={criteria.synthesis_assessments?.required} />
          <CriteriaRow label="Media scripts" passed={criteria.modules_with_media?.passed} actual={criteria.modules_with_media?.actual} required={criteria.modules_with_media?.required} />
          <CriteriaRow label="Study guide present" passed={criteria.has_study_guide?.passed} actual={criteria.has_study_guide?.actual} required={criteria.has_study_guide?.required} />
        </div>
      )}
      
      {seal.seal_status === 'revoked' && seal.revocation_reason && (
        <div className="bg-destructive/10 text-destructive text-xs p-2 rounded">
          <strong>Revoked:</strong> {seal.revocation_reason}
        </div>
      )}
    </div>
  );
}

function CriteriaRow({ label, passed, actual, required }: { label: string; passed?: boolean; actual?: number; required?: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5">
        {passed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
        <span className={passed ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      </div>
      <Badge variant={passed ? "default" : "secondary"} className="text-[10px] h-5">
        {actual ?? 0}/{required ?? 0}
      </Badge>
    </div>
  );
}

export default DiplomaSeal;
