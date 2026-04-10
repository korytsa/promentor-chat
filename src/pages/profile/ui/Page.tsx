import { Navigate } from "react-router-dom";
import { Typography, Avatar, Button } from "@promentorapp/ui-kit";
import { RiEdit2Line } from "react-icons/ri";
import type { UserProfile } from "../../../entities/profile";
import { MobileBackLink } from "../../../shared/ui/MobileBackLink";
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
      <div className="flex items-center gap-4">
        <MobileBackLink />
        <Typography component="h1" variantStyle="title">
          {pageTitle}
        </Typography>
      </div>
      <div className="flex items-center gap-2">
        <Typography
          variantStyle="label"
          className="rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-green-300"
        >
          Mentor
        </Typography>
        {isViewingOwnProfile && (
          <Button type="button" onClick={onEditProfile} variant="outlined">
            <RiEdit2Line className="text-sm" />
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}

function ProfileIdentity({ profile }: { profile: UserProfile }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <Avatar user={{ name: profile.displayName, avatarUrl: profile.avatarUrl }} size="lg" />
      <div>
        <Typography component="p" variantStyle="title">
          {profile.displayName}
        </Typography>
        <Typography component="p" variantStyle="caption">
          {profile.role}
        </Typography>
        <Typography component="p" className="text-xs text-green-600">
          {profile.statusLabel}
        </Typography>
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
        <div key={label} className="rounded-lg border border-white/20 bg-white/2 p-3">
          <Typography component="p" variantStyle="label">
            {label}
          </Typography>
          <Typography component="p" variantStyle="caption">
            {value}
          </Typography>
        </div>
      ))}
    </div>
  );
}

function ProfilePreferences() {
  return (
    <article className={PROFILE_PAGE_STYLES.panel}>
      <Typography component="h2" className={PROFILE_PAGE_STYLES.sectionTitle}>
        Preferences
      </Typography>
      <div className="mt-4 space-y-3">
        {PROFILE_PREFERENCE_ITEMS.map(({ label, description }) => (
          <div key={label} className={PROFILE_PAGE_STYLES.preferenceRow}>
            <Typography component="p" variantStyle="label">
              {label}
            </Typography>
            <Typography component="p" variantStyle="caption">
              {description}
            </Typography>
          </div>
        ))}
      </div>
    </article>
  );
}

function ProfileContact({ onSendMessage }: { onSendMessage: () => void }) {
  return (
    <article className="flex flex-col justify-between">
      <div className={`${PROFILE_PAGE_STYLES.panel} h-full`}>
        <Typography component="h2" className={PROFILE_PAGE_STYLES.sectionTitle}>
          Contact
        </Typography>
        <Typography component="p" variantStyle="caption">
          Message this mentor from the chat or mention them in a group.
        </Typography>
      </div>
      <Button type="button" className="mt-4" variant="contained" fullWidth onClick={onSendMessage}>
        Send Message
      </Button>
    </article>
  );
}

function ProfileAbout({ about }: { about: string }) {
  return (
    <article className={`mt-4 ${PROFILE_PAGE_STYLES.panel}`}>
      <Typography component="h2" className={PROFILE_PAGE_STYLES.sectionTitle}>
        About
      </Typography>
      <Typography component="p" variantStyle="caption" className="text-sm sm:text-base">
        {about}
      </Typography>
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
    <section className="flex min-h-0 flex-1 flex-col rounded-lg sm:border border-white/20 p-4">
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

        {isViewingOwnProfile ? (
          <ProfilePreferences />
        ) : (
          <ProfileContact onSendMessage={onSendMessage} />
        )}
      </div>

      <ProfileAbout about={resolvedProfile.about} />
    </section>
  );
}
