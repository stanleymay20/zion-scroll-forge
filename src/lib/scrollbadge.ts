import { supabase } from "@/integrations/supabase/client";
import {
  type BadgeAchievement,
  BadgeCredentialType,
  type BadgeProfileData,
  type ScrollBadge,
} from "@/types/scrollbadge";

type CourseCertificateRow = {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  completion_date: string | null;
  created_at: string | null;
  scroll_badge_earned: boolean | null;
  courses?: { title: string | null } | { title: string | null }[] | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export interface PublicBadgeProfileData extends BadgeProfileData {
  avatarUrl?: string | null;
}

const getCourseTitle = (course: CourseCertificateRow["courses"]) => {
  if (Array.isArray(course)) return course[0]?.title ?? null;
  return course?.title ?? null;
};

const buildTokenId = (id: string, fallback: number) => {
  const digits = id.replace(/\D/g, "");
  return Number.parseInt(digits.slice(0, 9) || `${fallback}`, 10);
};

const buildAchievements = (badges: ScrollBadge[]): BadgeAchievement[] => {
  const achievements: BadgeAchievement[] = [];

  if (badges.length >= 1) {
    achievements.push({
      type: "FIRST_BADGE",
      name: "First Credential",
      description: "Earned your first verified ScrollBadge credential.",
      earnedAt: badges[0].createdAt,
      badgeCount: 1,
    });
  }

  if (badges.length >= 5) {
    achievements.push({
      type: "FIVE_BADGES",
      name: "Faithful Finisher",
      description: "Collected five or more course credentials.",
      earnedAt: badges[4].createdAt,
      badgeCount: badges.length,
    });
  }

  const certificateCount = badges.filter(
    badge => badge.credentialType === BadgeCredentialType.CERTIFICATE
  ).length;

  if (certificateCount >= 3) {
    achievements.push({
      type: "CERTIFICATE_TRACK",
      name: "Certificate Track",
      description: "Completed three or more certificate-bearing courses.",
      earnedAt: badges[0]?.createdAt ?? new Date().toISOString(),
      badgeCount: certificateCount,
    });
  }

  return achievements;
};

export const buildPublicBadgeUrl = (userId: string) => {
  if (typeof window === "undefined") return `/badges/public/${userId}`;
  return `${window.location.origin}/badges/public/${userId}`;
};

export async function fetchUserScrollBadges(
  userId: string,
  studentName = "Scroll Scholar"
): Promise<ScrollBadge[]> {
  const { data, error } = await supabase
    .from("course_certificates")
    .select(`
      id,
      user_id,
      course_id,
      certificate_url,
      completion_date,
      created_at,
      scroll_badge_earned,
      courses ( title )
    `)
    .eq("user_id", userId)
    .order("completion_date", { ascending: false });

  if (error) throw error;

  return ((data as CourseCertificateRow[] | null) ?? [])
    .filter(row => row.scroll_badge_earned !== false)
    .map((row, index) => ({
      id: row.id,
      tokenId: buildTokenId(row.id, index + 1),
      userId: row.user_id,
      courseId: row.course_id,
      courseName: getCourseTitle(row.courses) ?? "Completed Course",
      studentName,
      completionDate: row.completion_date ?? row.created_at ?? new Date().toISOString(),
      grade: 100,
      credentialType: BadgeCredentialType.CERTIFICATE,
      ipfsHash: "",
      metadataUri: row.certificate_url ?? "",
      blockchainTxHash: undefined,
      blockNumber: undefined,
      isRevoked: false,
      revokedReason: undefined,
      revokedAt: undefined,
      isPublic: Boolean(row.scroll_badge_earned),
      ownerAddress: row.user_id,
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.created_at ?? new Date().toISOString(),
    }));
}

export async function fetchBadgeProfile(userId: string): Promise<PublicBadgeProfileData> {
  let profile: ProfileRow | null = null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (!error) {
      profile = (data as ProfileRow | null) ?? null;
    }
  } catch (error) {
    console.warn("Unable to load public profile details", error);
  }

  const userName =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "Scroll Scholar";

  const badges = await fetchUserScrollBadges(userId, userName);

  return {
    userId,
    userName,
    avatarUrl: profile?.avatar_url ?? null,
    badges,
    totalBadges: badges.length,
    publicBadges: badges.filter(badge => badge.isPublic).length,
    achievements: buildAchievements(badges),
    profileUrl: buildPublicBadgeUrl(userId),
  };
}