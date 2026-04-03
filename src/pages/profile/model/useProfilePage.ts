import { useNavigate, useParams } from "react-router-dom";
import { CONVERSATIONS } from "../../../entities/chat";
import type { UserProfile } from "../../../entities/profile";
import {
  CURRENT_USER_SLUG,
  profileHeadingTitle,
  resolveProfile,
} from "../../../entities/profile";
import { PROFILE_PAGE_ROUTES } from "./constants";

export type ProfilePageRedirect = {
  to: string;
  replace?: boolean;
};

export type ProfilePageReadyViewModel = {
  resolvedProfile: UserProfile;
  isViewingOwnProfile: boolean;
  pageTitle: string;
  chatActivityStatRows: ReadonlyArray<{ label: string; value: number }>;
  onSendMessage: () => void;
  onEditProfile: () => void;
};

export type ProfilePageState =
  | { status: "redirect"; redirect: ProfilePageRedirect }
  | { status: "ready"; viewModel: ProfilePageReadyViewModel };

function buildChatActivityStatRows(profile: UserProfile) {
  return [
    { label: "Direct chats", value: profile.directChats },
    { label: "Group chat", value: profile.groupChats },
    { label: "Unread", value: profile.unreadCount },
  ] as const;
}

export function useProfilePage(): ProfilePageState {
  const { slug: profileSlug } = useParams();
  const navigate = useNavigate();

  if (profileSlug === CURRENT_USER_SLUG) {
    return {
      status: "redirect",
      redirect: { to: PROFILE_PAGE_ROUTES.ownProfile, replace: true },
    };
  }

  const resolvedProfile = resolveProfile(profileSlug);
  if (!resolvedProfile) {
    return {
      status: "redirect",
      redirect: { to: PROFILE_PAGE_ROUTES.chatHome, replace: true },
    };
  }

  const isViewingOwnProfile = !profileSlug;
  const directConversationWithParticipant = CONVERSATIONS.find(
    (conversation) =>
      conversation.category === "direct" &&
      conversation.title === resolvedProfile.displayName,
  );
  const firstDirectConversation = CONVERSATIONS.find(
    (conversation) => conversation.category === "direct",
  );

  const viewModel: ProfilePageReadyViewModel = {
    resolvedProfile,
    isViewingOwnProfile,
    pageTitle: profileHeadingTitle(resolvedProfile, isViewingOwnProfile),
    chatActivityStatRows: buildChatActivityStatRows(resolvedProfile),
    onSendMessage: () => {
      const conversationIdToOpen =
        directConversationWithParticipant?.id ?? firstDirectConversation?.id;
      if (!conversationIdToOpen) {
        return;
      }
      navigate(`/chat/${conversationIdToOpen}`);
    },
    onEditProfile: () => {
      navigate(PROFILE_PAGE_ROUTES.ownProfile);
    },
  };

  return { status: "ready", viewModel };
}
