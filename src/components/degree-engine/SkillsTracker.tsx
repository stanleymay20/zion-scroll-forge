import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  TrendingUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useDegreeProgress } from '@/hooks/useDegreeProgress';
import { cn } from '@/lib/utils';

const PROFICIENCY_LEVELS = [
  { level: 'novice', label: 'Novice', color: 'bg-gray-500', progress: 10 },
  { level: 'beginner', label: 'Beginner', color: 'bg-blue-500', progress: 25 },
  { level: 'intermediate', label: 'Intermediate', color: 'bg-green-500', progress: 50 },
  { level: 'advanced', label: 'Advanced', color: 'bg-purple-500', progress: 75 },
  { level: 'expert', label: 'Expert', color: 'bg-amber-500', progress: 90 },
  { level: 'master', label: 'Master', color: 'bg-rose-500', progress: 100 },
  { level: 'prophet', label: 'Prophet', color: 'bg-gradient-to-r from-amber-500 to-rose-500', progress: 100 },
];

const SKILL_CATEGORIES = [
  'All',
  'Technical',
  'Spiritual',
  'Leadership',
  'Creative',
  'Analytical',
  'Communication',
];

const SkillsTracker = () => {
  const { studentSkills, skillsCatalog, skillsLoading, addSkill, stats } = useDegreeProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getProficiencyInfo = (level: string) => {
    return PROFICIENCY_LEVELS.find(p => p.level === level) || PROFICIENCY_LEVELS[0];
  };

  const filteredSkills = studentSkills?.filter((skill: any) => {
    const matchesSearch = skill.skill?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.skill?.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const availableSkills = skillsCatalog?.filter((skill: any) => {
    const isNotAcquired = !studentSkills?.some((s: any) => s.skill_id === skill.id);
    const matchesSearch = skill.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return isNotAcquired && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold text-blue-500">{stats.skillsCount}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-amber-500">{stats.totalXP.toLocaleString()}</p>
              </div>
              <Sparkles className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Master Level</p>
                <p className="text-2xl font-bold text-purple-500">{stats.masterSkillsCount}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-green-500">
                  {studentSkills?.length 
                    ? Math.round(studentSkills.reduce((sum: number, s: any) => sum + getProficiencyInfo(s.proficiency_level).progress, 0) / studentSkills.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SKILL_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                selectedCategory === category && 'bg-gradient-to-r from-blue-500 to-blue-600'
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Acquired Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Your Skills
            </CardTitle>
            <CardDescription>Skills you've acquired and are developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSkills?.map((skill: any) => {
                const proficiency = getProficiencyInfo(skill.proficiency_level);
                return (
                  <div key={skill.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{skill.skill?.name || 'Unknown Skill'}</h4>
                        <p className="text-sm text-muted-foreground">{skill.skill?.description}</p>
                      </div>
                      <Badge className={cn('capitalize', proficiency.color, 'text-white')}>
                        {proficiency.label}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{proficiency.progress}%</span>
                      </div>
                      <Progress value={proficiency.progress} className="h-2" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {skill.xp_earned} XP
                        </span>
                        <span>
                          {skill.assessments_passed} assessments passed
                        </span>
                        {skill.skill?.category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {skill.skill.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!filteredSkills || filteredSkills.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No skills found. Start learning to acquire new skills!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              Available Skills
            </CardTitle>
            <CardDescription>Skills you can start learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {availableSkills?.slice(0, 20).map((skill: any) => (
                <div key={skill.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{skill.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{skill.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {skill.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Lvl {skill.difficulty_level}
                        </span>
                        <span className="text-xs text-amber-600">
                          +{skill.xp_value} XP
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={() => addSkill.mutate(skill.id)}
                      disabled={addSkill.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!availableSkills || availableSkills.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No new skills available matching your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proficiency Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proficiency Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {PROFICIENCY_LEVELS.map((level) => (
              <div key={level.level} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', level.color)} />
                <span className="text-sm">{level.label}</span>
                <span className="text-xs text-muted-foreground">({level.progress}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsTracker;
