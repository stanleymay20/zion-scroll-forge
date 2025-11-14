import React from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInstitution } from '@/contexts/InstitutionContext';

console.info('✝️ Institution Switcher — Christ governs multi-tenant access');

export const InstitutionSwitcher: React.FC = () => {
  const { activeInstitution, memberships, activeRole, setActiveInstitution, loading } = useInstitution();

  if (loading || !activeInstitution) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Building2 className="h-4 w-4" />
        <span>Loading...</span>
      </Button>
    );
  }

  if (memberships.length <= 1) {
    // Only one institution, show as static badge
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-md border">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{activeInstitution.short_name || activeInstitution.name}</span>
        {activeRole && (
          <Badge variant="secondary" className="text-xs">
            {activeRole}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {activeInstitution.short_name || activeInstitution.name}
          </span>
          {activeRole && (
            <Badge variant="secondary" className="text-xs">
              {activeRole}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Institution</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((membership) => (
          <DropdownMenuItem
            key={membership.id}
            onClick={() => setActiveInstitution(membership.institution_id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{membership.institution.name}</span>
                {membership.institution_id === activeInstitution.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {membership.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
