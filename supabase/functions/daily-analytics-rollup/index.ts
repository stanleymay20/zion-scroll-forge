import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`✝️ [analytics] Rolling up data for ${dateStr}`);

    // 1. LEARNING ANALYTICS
    const { data: learningData } = await supabase
      .from('enrollments')
      .select('course_id, user_id, created_at')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const { data: modulesData } = await supabase
      .from('module_progress')
      .select('course_id, user_id, completed')
      .eq('completed', true)
      .gte('completed_at', `${dateStr}T00:00:00`)
      .lt('completed_at', `${dateStr}T23:59:59`);

    // Aggregate by course
    const learningByCourse = new Map();
    learningData?.forEach(e => {
      const key = `${e.course_id}-${e.user_id}`;
      if (!learningByCourse.has(key)) {
        learningByCourse.set(key, {
          course_id: e.course_id,
          user_id: e.user_id,
          enrollments_count: 0,
          completed_modules_count: 0,
        });
      }
      learningByCourse.get(key).enrollments_count++;
    });

    modulesData?.forEach(m => {
      const key = `${m.course_id}-${m.user_id}`;
      if (learningByCourse.has(key)) {
        learningByCourse.get(key).completed_modules_count++;
      }
    });

    for (const stats of learningByCourse.values()) {
      await supabase
        .from('learning_analytics_daily')
        .upsert({
          date: dateStr,
          course_id: stats.course_id,
          user_id: stats.user_id,
          enrollments_count: stats.enrollments_count,
          completed_modules_count: stats.completed_modules_count,
          quiz_attempts: 0,
          avg_score: null,
        }, { onConflict: 'date,course_id,user_id' });
    }

    // 2. SCROLLCOIN ANALYTICS
    const { data: earnedData } = await supabase
      .from('scrollcoin_transactions')
      .select('amount, source')
      .eq('type', 'earned')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const { data: spentData } = await supabase
      .from('scrollcoin_transactions')
      .select('amount')
      .eq('type', 'spent')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const totalEarned = earnedData?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    const totalSpent = spentData?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const { data: activeUsersData } = await supabase
      .from('scrollcoin_transactions')
      .select('user_id')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const uniqueUsers = new Set(activeUsersData?.map(t => t.user_id)).size;

    await supabase
      .from('scrollcoin_analytics_daily')
      .upsert({
        date: dateStr,
        total_earned: totalEarned,
        total_spent: totalSpent,
        net_change: totalEarned - totalSpent,
        active_users: uniqueUsers,
        top_sources: [],
      }, { onConflict: 'date' });

    // 3. SPIRITUAL ANALYTICS
    const { data: prayersData } = await supabase
      .from('prayer_journal')
      .select('user_id, status')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const uniquePrayerUsers = new Set(prayersData?.map(p => p.user_id)).size;
    const answeredPrayers = prayersData?.filter(p => p.status === 'answered').length || 0;

    await supabase
      .from('spiritual_analytics_daily')
      .upsert({
        date: dateStr,
        unique_prayer_users: uniquePrayerUsers,
        total_prayers: prayersData?.length || 0,
        answered_prayers: answeredPrayers,
        avg_prayer_streak: null,
      }, { onConflict: 'date' });

    // 4. SYSTEM ANALYTICS
    const { data: sessionsData } = await supabase
      .from('ai_tutor_sessions')
      .select('id')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const { data: messagesData } = await supabase
      .from('ai_tutor_messages')
      .select('id')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const { data: appsData } = await supabase
      .from('applications')
      .select('id')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    await supabase
      .from('system_analytics_daily')
      .upsert({
        date: dateStr,
        active_users: uniqueUsers,
        ai_tutor_sessions: sessionsData?.length || 0,
        ai_messages: messagesData?.length || 0,
        new_applications: appsData?.length || 0,
        new_enrollments: learningData?.length || 0,
      }, { onConflict: 'date' });

    // Log spiritual event
    await supabase
      .from('spiritual_events_log')
      .insert({
        scope: 'analytics',
        action: 'daily_rollup',
        details: { date: dateStr },
        severity: 'info',
      });

    console.log(`✝️ [analytics] Rollup complete for ${dateStr}`);

    return new Response(
      JSON.stringify({ success: true, date: dateStr }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [analytics] Rollup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});