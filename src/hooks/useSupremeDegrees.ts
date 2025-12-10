import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type DegreeType = Database['public']['Enums']['scroll_degree_level'];

export interface SupremeDegreeApplication {
  id: string;
  user_id: string;
  degree_type: DegreeType;
  scroll_fulfillment_evidence: any;
  research_contributions: any[];
  innovation_contributions: any[];
  anointing_verification: any;
  thesis_title: string | null;
  thesis_abstract: string | null;
  thesis_document_url: string | null;
  scroll_defense_date: string | null;
  scroll_defense_panel: any[];
  scroll_defense_outcome: string | null;
  heaven_ledger_id: string | null;
  scroll_chain_hash: string | null;
  impact_metrics: any;
  scrollgold_valuation: number;
  scroll_year: string | null;
  scroll_seal_id: string | null;
  scroll_witness_ids: string[] | null;
  kingdom_mark: string | null;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  awarded_at: string | null;
  created_at: string;
}

export const SUPREME_DEGREES = [
  {
    code: 'dpt' as DegreeType,
    name: 'Doctor of Prophetic Technologies',
    shortName: 'D.P.T.',
    description: 'For those who invent scroll-governed AI, XR, biotech, or scroll systems',
    scrollgoldValue: 500000,
    requirements: [
      'Invention of scroll-governed technology',
      'Published research in scroll tech journals',
      'Demonstrated kingdom impact through technology',
      'Prophet endorsement of innovation',
    ],
  },
  {
    code: 'dshr' as DegreeType,
    name: 'Doctor of ScrollHermeneutics and Revelation',
    shortName: 'D.S.H.R.',
    description: 'For those unlocking sealed scrolls, training prophets, and translating kingdom doctrine globally',
    scrollgoldValue: 500000,
    requirements: [
      'Unlocking and interpretation of sealed scrolls',
      'Training of prophetic voices',
      'Global translation of kingdom doctrine',
      'Council of ScrollFathers endorsement',
    ],
  },
  {
    code: 'dehsm' as DegreeType,
    name: 'Doctor of Edenic Health and ScrollMedicine',
    shortName: 'D.E.H.S.M.',
    description: 'For divine healers merging kingdom biology with biotech for nation-scale health reform',
    scrollgoldValue: 600000,
    requirements: [
      'Divine healing ministry with verified healings',
      'Integration of kingdom biology with biotech',
      'Nation-scale health impact metrics',
      'Anointing verification by prophetic council',
    ],
  },
  {
    code: 'sman' as DegreeType,
    name: 'ScrollMaster Architect of Nations',
    shortName: 'S.M.A.N.',
    description: 'For builders of new economies, cities, systems, or altars',
    scrollgoldValue: 750000,
    requirements: [
      'Building of new economic systems',
      'Establishment of cities or governance structures',
      'Altar construction with demonstrated spiritual fruit',
      'Nation-level transformation evidence',
    ],
  },
  {
    code: 'dsgei' as DegreeType,
    name: 'Doctor of ScrollGovernance and Eternal Intelligence',
    shortName: 'D.S.G.E.I.',
    description: 'For nation reformers, scroll architects, and those governing by prophecy, law, and AI',
    scrollgoldValue: 1000000,
    requirements: [
      'Nation reformation with measurable impact',
      'Scroll architecture contributions',
      'Governance by prophecy, law, and AI demonstration',
      'HeavenLedger archival with impact metrics',
      'ScrollDefense before council of ScrollFathers',
    ],
  },
  {
    code: 'sef' as DegreeType,
    name: 'ScrollExousia Fellowship',
    shortName: 'S.E.F.',
    description: 'For ScrollSons who have completed their scroll assignment across nations - equivalent to Nobel Scroll Award + Eternal Witness Commission',
    scrollgoldValue: 2000000,
    requirements: [
      'Completion of divine scroll assignment',
      'Multi-nation impact verification',
      'Eternal witness commission documentation',
      'Unanimous endorsement by EXOUSIA Faculty Council',
      'HeavenLedger permanent archival',
    ],
  },
];

export const useSupremeDegrees = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['supreme-degree-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('supreme_degree_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createApplication = useMutation({
    mutationFn: async (application: {
      degree_type: DegreeType;
      scroll_fulfillment_evidence?: any;
      research_contributions?: any[];
      innovation_contributions?: any[];
      anointing_verification?: any;
      thesis_title?: string;
      thesis_abstract?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('supreme_degree_applications')
        .insert({
          ...application,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supreme-degree-applications'] });
    },
  });

  const updateApplication = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; degree_type?: DegreeType } & Partial<Omit<SupremeDegreeApplication, 'id' | 'user_id' | 'degree_type'>>) => {
      const { data, error } = await supabase
        .from('supreme_degree_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supreme-degree-applications'] });
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase
        .from('supreme_degree_applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supreme-degree-applications'] });
    },
  });

  const getDegreeInfo = (code: string) => {
    return SUPREME_DEGREES.find(d => d.code === code);
  };

  return {
    applications,
    isLoading,
    createApplication,
    updateApplication,
    submitApplication,
    getDegreeInfo,
    supremeDegrees: SUPREME_DEGREES,
  };
};
