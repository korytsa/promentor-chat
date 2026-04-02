import type { UserProfile } from "./types";

export const CURRENT_USER_SLUG = "alex-rivera";

export const CURRENT_USER_PROFILE: UserProfile = {
  slug: CURRENT_USER_SLUG,
  displayName: "Alex Rivera",
  role: "Product Designer - ProMentor",
  avatarUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
  statusLabel: "Online now",
  about:
    "Leading product design at ProMentor. Focused on mentorship workflows, dashboard UX, and scalable design systems that improve learner outcomes.",
  directChats: 3,
  groupChats: 2,
  unreadCount: 2,
};

const OTHER_PROFILES: UserProfile[] = [
  {
    slug: "sarah-chen",
    displayName: "Sarah Chen",
    role: "Design Lead - ProMentor",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    statusLabel: "Online now",
    about:
      "Design systems and mobile UX. Passionate about accessible interfaces and mentor-learner collaboration.",
    directChats: 8,
    groupChats: 4,
    unreadCount: 0,
  },
  {
    slug: "marcus-thorne",
    displayName: "Marcus Thorne",
    role: "Engineering Mentor",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    statusLabel: "Away",
    about:
      "Full-stack mentor focused on performance, clarity in code reviews, and sustainable team practices.",
    directChats: 5,
    groupChats: 3,
    unreadCount: 7,
  },
];

export const PROFILE_BY_SLUG: Record<string, UserProfile> = Object.fromEntries(
  OTHER_PROFILES.map((profile) => [profile.slug, profile]),
);

export function resolveProfile(slug: string | undefined): UserProfile | null {
  if (!slug) {
    return CURRENT_USER_PROFILE;
  }
  return PROFILE_BY_SLUG[slug] ?? null;
}

export function profileHeadingTitle(profile: UserProfile, isOwnProfile: boolean): string {
  if (isOwnProfile) {
    return "Profile";
  }
  const [first] = profile.displayName.split(" ");
  return `${first}'s Profile`;
}
