export const PROFILE_PAGE_ROUTES = {
  ownProfile: "/chat/profile",
  chatHome: "/chat",
} as const;

export const PROFILE_PAGE_STYLES = {
  panel: "rounded-lg border border-white/20 bg-white/3 p-5",
  sectionTitle:
    "text-sm font-semibold uppercase tracking-[0.08em] !text-[#9bb4df]",
  preferenceRow: "rounded-lg border border-white/20 bg-white/2 px-4 py-3",
} as const;

export const PROFILE_PREFERENCE_ITEMS: ReadonlyArray<{ label: string; description: string }> = [
  { label: "Notifications", description: "All mentions and direct messages" },
  { label: "Theme", description: "Midnight blue (auto)" },
  { label: "Language", description: "English" },
];
