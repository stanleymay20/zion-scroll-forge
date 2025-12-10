import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationJob {
  type: 'daily-progress' | 'assignment-reminders' | 'billing-sync' | 'graduation-check' | 'semester-transition';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type } = await req.json() as AutomationJob;

    let result: any;

    switch (type) {
      case 'daily-progress':
        result = await runDailyProgressCheck(supabase);
        break;
      case 'assignment-reminders':
        result = await sendAssignmentReminders(supabase);
        break;
      case 'billing-sync':
        result = await syncBillingCycles(supabase);
        break;
      case 'graduation-check':
        result = await checkGraduationEligibility(supabase);
        break;
      case 'semester-transition':
        result = await handleSemesterTransition(supabase);
        break;
      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Automation error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Daily Progress Check
async function runDailyProgressCheck(supabase: any) {
  console.log("Running daily progress check...");
  
  // Get all active enrollments
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('user_id, course_id, progress')
    .gt('progress', 0);

  if (enrollError) throw enrollError;

  const updates: any[] = [];
  
  for (const enrollment of enrollments || []) {
    // Calculate module progress
    const { data: moduleProgress } = await supabase
      .from('module_progress')
      .select('completed')
      .eq('user_id', enrollment.user_id)
      .eq('course_id', enrollment.course_id);

    const { count: totalModules } = await supabase
      .from('course_modules')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', enrollment.course_id);

    const completedModules = moduleProgress?.filter((m: any) => m.completed).length || 0;
    const newProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    if (newProgress !== enrollment.progress) {
      updates.push({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        progress: newProgress
      });
    }
  }

  // Batch update enrollments
  for (const update of updates) {
    await supabase
      .from('enrollments')
      .update({ progress: update.progress })
      .eq('user_id', update.user_id)
      .eq('course_id', update.course_id);
  }

  console.log(`Updated progress for ${updates.length} enrollments`);
  return { updatedEnrollments: updates.length };
}

// Assignment Reminders
async function sendAssignmentReminders(supabase: any) {
  console.log("Sending assignment reminders...");
  
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Get assignments due in 3 days
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('id, title, due_at, course_id, courses(title)')
    .eq('published', true)
    .gte('due_at', now.toISOString())
    .lte('due_at', threeDaysFromNow.toISOString());

  if (error) throw error;

  const notifications: any[] = [];

  for (const assignment of assignments || []) {
    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', assignment.course_id);

    for (const enrollment of enrollments || []) {
      // Check if reminder already sent
      const { data: existing } = await supabase
        .from('academic_notifications')
        .select('id')
        .eq('user_id', enrollment.user_id)
        .eq('related_id', assignment.id)
        .eq('notification_type', 'assignment_due_soon')
        .single();

      if (!existing) {
        notifications.push({
          user_id: enrollment.user_id,
          notification_type: 'assignment_due_soon',
          title: `Assignment Due Soon: ${assignment.title}`,
          body: `Your assignment "${assignment.title}" for ${assignment.courses?.title} is due in 3 days.`,
          related_id: assignment.id,
          related_type: 'assignment',
          status: 'pending',
          channel: 'both',
        });
      }
    }
  }

  if (notifications.length > 0) {
    await supabase.from('academic_notifications').insert(notifications);
  }

  console.log(`Created ${notifications.length} assignment reminders`);
  return { remindersCreated: notifications.length };
}

// Billing Sync
async function syncBillingCycles(supabase: any) {
  console.log("Syncing billing cycles...");
  
  const now = new Date();
  
  // Get active semester
  const { data: semester } = await supabase
    .from('semesters')
    .select('id')
    .eq('is_active', true)
    .single();

  if (!semester) {
    console.log("No active semester found");
    return { updated: 0 };
  }

  // Mark overdue bills
  const { data: overdueBills, error } = await supabase
    .from('tuition_billing_cycles')
    .update({ status: 'overdue', hold_placed: true })
    .lt('due_date', now.toISOString().split('T')[0])
    .eq('status', 'pending')
    .select();

  if (error) throw error;

  // Send overdue notifications
  const notifications = (overdueBills || []).map((bill: any) => ({
    user_id: bill.user_id,
    notification_type: 'billing_overdue',
    title: 'Tuition Payment Overdue',
    body: `Your tuition payment of $${bill.amount_due - bill.amount_paid} is overdue. A hold has been placed on your account.`,
    related_id: bill.id,
    related_type: 'billing',
    status: 'pending',
    channel: 'both',
  }));

  if (notifications.length > 0) {
    await supabase.from('academic_notifications').insert(notifications);
  }

  console.log(`Marked ${overdueBills?.length || 0} bills as overdue`);
  return { overdueMarked: overdueBills?.length || 0 };
}

// Graduation Eligibility Check
async function checkGraduationEligibility(supabase: any) {
  console.log("Checking graduation eligibility...");
  
  // Get all pending graduation candidates
  const { data: candidates, error } = await supabase
    .from('graduation_candidates')
    .select('*, student_academic_standing(gpa, cumulative_gpa, credits_earned)')
    .eq('status', 'pending');

  if (error) throw error;

  const updates: any[] = [];

  for (const candidate of candidates || []) {
    const standing = candidate.student_academic_standing?.[0];
    
    if (!standing) continue;

    // Check requirements
    const gpaReqMet = standing.cumulative_gpa >= 2.0;
    const creditsReqMet = standing.credits_earned >= 120;

    // Check if all requirements met
    if (gpaReqMet && creditsReqMet && 
        candidate.spiritual_formation_met && 
        candidate.capstone_completed && 
        candidate.financial_clearance) {
      updates.push({
        id: candidate.id,
        status: 'approved',
        gpa_requirement_met: gpaReqMet,
        credits_requirement_met: creditsReqMet,
        reviewed_at: new Date().toISOString(),
      });
    } else {
      updates.push({
        id: candidate.id,
        gpa_requirement_met: gpaReqMet,
        credits_requirement_met: creditsReqMet,
      });
    }
  }

  // Apply updates
  for (const update of updates) {
    await supabase
      .from('graduation_candidates')
      .update(update)
      .eq('id', update.id);
  }

  console.log(`Processed ${updates.length} graduation candidates`);
  return { candidatesProcessed: updates.length };
}

// Semester Transition
async function handleSemesterTransition(supabase: any) {
  console.log("Handling semester transition...");
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Check for semesters ending today
  const { data: endingSemesters } = await supabase
    .from('semesters')
    .select('id, name, academic_year_id')
    .eq('end_date', today)
    .eq('is_active', true);

  for (const semester of endingSemesters || []) {
    // Deactivate ending semester
    await supabase
      .from('semesters')
      .update({ is_active: false })
      .eq('id', semester.id);

    // Find next semester
    const { data: nextSemester } = await supabase
      .from('semesters')
      .select('id, name')
      .eq('academic_year_id', semester.academic_year_id)
      .gt('start_date', today)
      .order('start_date', { ascending: true })
      .limit(1)
      .single();

    if (nextSemester) {
      // Activate next semester on its start date
      console.log(`Next semester: ${nextSemester.name}`);
    }

    // Send semester end notifications
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    const notifications = (students || []).map((student: any) => ({
      user_id: student.id,
      notification_type: 'semester_ending',
      title: `${semester.name} Has Ended`,
      body: `The ${semester.name} has officially ended. Check your grades and prepare for the next semester.`,
      related_id: semester.id,
      related_type: 'semester',
      status: 'pending',
      channel: 'both',
    }));

    if (notifications.length > 0) {
      await supabase.from('academic_notifications').insert(notifications);
    }
  }

  // Check for semesters starting today
  const { data: startingSemesters } = await supabase
    .from('semesters')
    .select('id, name')
    .eq('start_date', today)
    .eq('is_active', false);

  for (const semester of startingSemesters || []) {
    await supabase
      .from('semesters')
      .update({ is_active: true })
      .eq('id', semester.id);

    console.log(`Activated semester: ${semester.name}`);
  }

  return { 
    endedSemesters: endingSemesters?.length || 0,
    startedSemesters: startingSemesters?.length || 0
  };
}
