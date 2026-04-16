export const CREATE_GROUP_PAGE_COPY = {
  title: "Create Group",
  subtitle: "Set up a new group conversation and invite your team members.",
  groupNameLabel: "Group name",
  groupNamePlaceholder: "e.g. Product Launch Squad",
  inviteMembersLabel: "Invite members",
  inviteInputPlaceholder: "Type names...",
  selectedBadge: "Selected",
  createButton: "Create group",
  cancelButton: "Cancel",
  validationHint: "Enter a group name and invite at least one member.",
  searchingMembers: "Searching…",
} as const;

export const CREATE_GROUP_SEARCH_FAILURE = {
  fallback: "Could not search members.",
  unauthorized: "Sign in to search members.",
  rateLimited: "Too many searches. Wait a moment and try again.",
} as const;

export const CREATE_GROUP_CREATE_FAILURE = {
  fallback: "Could not create the group.",
  unauthorized: "Sign in to create a group.",
} as const;
