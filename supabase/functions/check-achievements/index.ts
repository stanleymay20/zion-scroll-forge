import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkAndAwardAchievements(supabase: any, userId: string) {
  console.log('✝️ Checking achievements for user:', userId);

  // Fetch user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Fetch all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  // Fetch user's earned achievements
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = new Set(earnedAchievements?.map((e: any) => e.achievement_id) || []);
  const newlyEarned = [];

  for (const achievement of allAchievements || []) {
    if (earnedIds.has(achievement.id)) continue;

    let shouldAward = false;

    switch (achievement.requirement_type) {
      case 'courses_completed':
        shouldAward = (stats?.courses_completed || 0) >= achievement.requirement_value;
        break;

      case 'current_streak':
        shouldAward = (stats?.current_streak || 0) >= achievement.requirement_value;
        break;

      case 'total_scrollcoins':
        shouldAward = (stats?.total_scrollcoins || 0) >= achievement.requirement_value;
        break;

      case 'user_created':
        shouldAward = true; // Award on first check
        break;
    }

    if (shouldAward) {
      // Award achievement
      const { error: awardError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

      if (!awardError) {
        newlyEarned.push(achievement);

        // Award rewards
        if (achievement.scrollcoin_reward > 0) {
          await supabase.rpc('earn_scrollcoin', {
            p_user_id: userId,
            p_amount: achievement.scrollcoin_reward,
            p_desc: `Achievement: ${achievement.name}`,
          });
        }

        // Update user stats XP
        if (achievement.xp_reward > 0) {
          await supabase
            .from('user_stats')
            .update({
              total_xp: (stats?.total_xp || 0) + achievement.xp_reward,
            })
            .eq('user_id', userId);
        }

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'achievement',
            title: 'New Achievement Unlocked! 🏆',
            message: `You earned "${achievement.name}"! +${achievement.scrollcoin_reward} ScrollCoins, +${achievement.xp_reward} XP`,
            link: '/achievements',
          });

        console.log(`✓ Awarded achievement: ${achievement.name}`);
      }
    }
  }

  return newlyEarned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newAchievements = await checkAndAwardAchievements(supabase, userId);

    return new Response(
      JSON.stringify({
        success: true,
        newAchievements: newAchievements.length,
        achievements: newAchievements,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking achievements:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
