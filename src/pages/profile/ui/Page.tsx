import { Navigate } from "react-router-dom";
import { Typography } from "@promentorapp/ui-kit";
import { RiEdit2Line } from "react-icons/ri";
import { Avatar } from "../../../shared/ui/Avatar";
import type { UserProfile } from "../../../entities/profile";
import { PROFILE_PAGE_STYLES, PROFILE_PREFERENCE_ITEMS } from "../model/constants";
import type { ProfilePageReadyViewModel } from "../model/useProfilePage";
import { useProfilePage } from "../model/useProfilePage";

function ProfileHeader({
  pageTitle,
  isViewingOwnProfile,
  onEditProfile,
}: {
  pageTitle: string;
  isViewingOwnProfile: boolean;
  onEditProfile: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Typography component="h1" variantStyle="title">{pageTitle}</Typography>
      <div className="flex items-center gap-2">
        <Typography variantStyle="label" className="inline-flex shrink-0 items-center rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs! font-medium leading-none text-green-300!">
          MENTOR
        </Typography>
        {isViewingOwnProfile && (
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#4f80d6]/60 bg-[#1a2f5a]/70 px-3 py-1 text-xs font-medium leading-none text-[#d6e6ff]! transition hover:bg-[#21407d]"
          >
            <RiEdit2Line className="text-sm" />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileIdentity({ profile }: { profile: UserProfile }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <Avatar user={{ name: profile.displayName, avatarUrl: profile.avatarUrl }}size="lg"/>
      <div>
        <Typography component="p" variantStyle="title">{profile.displayName}</Typography>
        <Typography component="p" variantStyle="caption">{profile.role}</Typography>
        <Typography component="p" className="mt-1 text-xs text-green-600!">{profile.statusLabel}</Typography>
      </div>
    </div>
  );
}

function ProfileActivityStats({
  rows,
}: {
  rows: ProfilePageReadyViewModel["chatActivityStatRows"];
}) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-lg border border-white/20 bg-white/2 p-3"
        >
          <Typography component="p" variantStyle="label">{label}</Typography>
          <Typography component="p" variantStyle="caption">{value}</Typography>
        </div>
      ))}
    </div>
  );
}

function ProfilePreferences() {
  return (
    <article className={PROFILE_PAGE_STYLES.panel}>
      <Typography component="h2" className={PROFILE_PAGE_STYLES.sectionTitle}>Preferences</Typography>
      <div className="mt-4 space-y-3">
        {PROFILE_PREFERENCE_ITEMS.map(({ label, description }) => (
          <div key={label} className={PROFILE_PAGE_STYLES.preferenceRow}>
            <Typography component="p" variantStyle="label">{label}</Typography>
            <Typography component="p" variantStyle="caption">{description}</Typography>
          </div>
        ))}
      </div>
    </article>
  );
}

function ProfileContact({
  onSendMessage,
}: {
  onSendMessage: () => void;
}) {
  return (
    <article className="flex flex-col justify-between">
      <div className={`${PROFILE_PAGE_STYLES.panel} h-full`}>
        <Typography component="h2" className={PROFILE_PAGE_STYLES.sectionTitle}>Contact</Typography>
        <Typography component="p" variantStyle="caption">
          Message this mentor from the chat or mention them in a group.
        </Typography>
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-[#2a6de5] bg-[#1a3f85] px-4 py-2 text-sm font-semibold !text-[#e7f0ff] shadow-[0_8px_20px_rgba(13,47,109,0.35)] transition hover:bg-[#2456b2]"
        onClick={onSendMessage}
      >
        Send Message
      </button>
    </article>
  );
}

function ProfileAbout({ about }: { about: string }) {
  return (
    <article className={`mt-4 ${PROFILE_PAGE_STYLES.panel}`}>
      <Typography component="h2" className={PROFILE_PAGE_STYLES.sectionTitle}>About</Typography>
      <Typography component="p" variantStyle="caption">{about}</Typography>
    </article>
  );
}

export default function ProfilePage() {
  const state = useProfilePage();

  if (state.status === "redirect") {
    const { to, replace } = state.redirect;
    return <Navigate to={to} replace={replace} />;
  }

  const {
    resolvedProfile,
    isViewingOwnProfile,
    pageTitle,
    chatActivityStatRows,
    onSendMessage,
    onEditProfile,
  } = state.viewModel;

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-r-lg border border-white/20 p-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className={PROFILE_PAGE_STYLES.panel}>
          <ProfileHeader
            pageTitle={pageTitle}
            isViewingOwnProfile={isViewingOwnProfile}
            onEditProfile={onEditProfile}
          />
          <ProfileIdentity profile={resolvedProfile} />
          {isViewingOwnProfile && <ProfileActivityStats rows={chatActivityStatRows} />}
        </article>

        {isViewingOwnProfile ? <ProfilePreferences /> : <ProfileContact onSendMessage={onSendMessage} />}
      </div>

      <ProfileAbout about={resolvedProfile.about} />
    </section>
  );
}
