import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CONVERSATIONS } from "../../../entities/chat";
import {
  CURRENT_USER_SLUG,
  profileHeadingTitle,
  resolveProfile,
} from "../../../entities/profile";
import { RiEdit2Line } from "react-icons/ri";
import { Avatar } from "../../../shared/ui/Avatar";

export default function ProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  if (slug === CURRENT_USER_SLUG) {
    return <Navigate to="/profile" replace />;
  }

  const profile = resolveProfile(slug);
  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const isOwnProfile = !slug;
  const directConversation = CONVERSATIONS.find(
    (conversation) =>
      conversation.category === "direct" && conversation.title === profile.displayName,
  );
  const fallbackConversation = CONVERSATIONS.find(
    (conversation) => conversation.category === "direct",
  );

  const handleSendMessage = () => {
    const targetChatId = directConversation?.id ?? fallbackConversation?.id;
    if (!targetChatId) {
      return;
    }
    navigate(`/chat/${targetChatId}`);
  };

  const handleEditProfile = () => {
    navigate("/profile");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-r-lg border border-white/20 p-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/20 bg-white/3 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#eff5ff]">
              {profileHeadingTitle(profile, isOwnProfile)}
            </h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                MENTOR
              </span>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#4f80d6]/60 bg-[#1a2f5a]/70 px-3 py-1 text-xs font-medium text-[#d6e6ff] transition hover:bg-[#21407d]"
                >
                  <RiEdit2Line className="text-sm" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Avatar
              user={{ name: profile.displayName, avatarUrl: profile.avatarUrl }}
              size="lg"
            />
            <div>
              <p className="text-lg font-semibold text-[#eff5ff]">{profile.displayName}</p>
              <p className="text-sm text-[#9bb4df]">{profile.role}</p>
              <p className="mt-1 text-xs text-[#7bdcb7]">{profile.statusLabel}</p>
            </div>
          </div>

          {isOwnProfile && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/2 p-3">
                <p className="text-xs text-[#9bb4df]">Direct chats</p>
                <p className="mt-1 text-xl font-semibold text-[#eff5ff]">{profile.directChats}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/2 p-3">
                <p className="text-xs text-[#9bb4df]">Group chat</p>
                <p className="mt-1 text-xl font-semibold text-[#eff5ff]">{profile.groupChats}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/2 p-3">
                <p className="text-xs text-[#9bb4df]">Unread</p>
                <p className="mt-1 text-xl font-semibold text-[#eff5ff]">{profile.unreadCount}</p>
              </div>
            </div>
          )}
        </article>

        {isOwnProfile ? (
          <article className="rounded-2xl border border-white/20 bg-white/3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#9bb4df]">
              Preferences
            </h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/20 bg-white/2 px-4 py-3">
                <p className="text-sm font-medium text-[#eff5ff]">Notifications</p>
                <p className="text-xs text-[#9bb4df]">All mentions and direct messages</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/2 px-4 py-3">
                <p className="text-sm font-medium text-[#eff5ff]">Theme</p>
                <p className="text-xs text-[#9bb4df]">Midnight blue (auto)</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/2 px-4 py-3">
                <p className="text-sm font-medium text-[#eff5ff]">Language</p>
                <p className="text-xs text-[#9bb4df]">English</p>
              </div>
            </div>
          </article>
        ) : (
          <article className="flex flex-col justify-between">
            <div className="rounded-2xl h-full border border-white/20 bg-white/3 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#9bb4df]">
                Contact
              </h2>
              <p className="mt-3 text-sm text-[#9bb4df]">
                Message this mentor from the chat or mention them in a group.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-[#2a6de5] bg-[#1a3f85] px-4 py-2 text-sm font-semibold text-[#e7f0ff] shadow-[0_8px_20px_rgba(13,47,109,0.35)] transition hover:bg-[#2456b2]"
              onClick={handleSendMessage}
            >
              Send Message
            </button>
          </article>
        )}
      </div>

      <article className="mt-4 rounded-2xl border border-white/20 bg-white/3 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#9bb4df]">About</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#d7e5ff]">{profile.about}</p>
      </article>
    </section>
  );
}
