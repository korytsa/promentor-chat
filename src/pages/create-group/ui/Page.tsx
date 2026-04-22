import { Typography, Avatar, Button, TextField } from "@promentorapp/ui-kit";
import type { MouseEvent } from "react";
import { UserListItem } from "../../../shared/ui/UserListItem";
import { MobileBackLink } from "../../../shared/ui/MobileBackLink";
import { CREATE_GROUP_PAGE_COPY } from "../model/constants";
import { useCreateGroupPage } from "../model/useCreateGroupPage";
import { Link } from "react-router-dom";

type CreateGroupPageState = ReturnType<typeof useCreateGroupPage>;
type Member = CreateGroupPageState["selectedMembers"][number];

type MembersSelectorProps = {
  state: CreateGroupPageState;
};

function SelectedMemberChip({
  member,
  onRemove,
}: {
  member: Member;
  onRemove: (memberId: string) => void;
}) {
  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove(member.id);
  };

  return (
    <Button type="button" variant="outlined" onClick={handleRemoveClick}>
      <Avatar user={{ name: member.name, avatarUrl: member.avatarUrl }} size="sm" />
      <Typography component="span" variantStyle="label">
        {member.name}
      </Typography>
    </Button>
  );
}

function MembersSelector({ state }: MembersSelectorProps) {
  const {
    selectorRef,
    query,
    onQueryChange,
    isDropdownOpen,
    selectedMemberIds,
    selectedMembers,
    filteredMembers,
    searchLoading,
    searchError,
    toggleMember,
    removeMember,
    onSelectorAreaClick,
    onInviteInputFocus,
  } = state;

  const invitePlaceholder = selectedMembers.length
    ? ""
    : CREATE_GROUP_PAGE_COPY.inviteInputPlaceholder;

  return (
    <div className="grid gap-2">
      <Typography id="invite-members-label" variantStyle="label">
        {CREATE_GROUP_PAGE_COPY.inviteMembersLabel}
      </Typography>
      <div
        ref={selectorRef}
        role="group"
        aria-labelledby="invite-members-label"
        className="rounded-lg border border-white/20"
        onClick={onSelectorAreaClick}
      >
        <div className="flex min-h-[52px] items-center gap-2 px-3 py-2">
          <div className="hide-scrollbar flex max-h-[70px] flex-1 flex-wrap gap-2 overflow-y-auto pr-1">
            {selectedMembers.map((member) => (
              <SelectedMemberChip key={member.id} member={member} onRemove={removeMember} />
            ))}

            <div className="min-w-[160px] flex-1 [&>label]:gap-0 [&>label>p]:sr-only">
              <TextField
                label="Invite members"
                aria-label={CREATE_GROUP_PAGE_COPY.inviteMembersLabel}
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                onFocus={onInviteInputFocus}
                placeholder={invitePlaceholder}
                size="sm"
                className="h-8 border-0 bg-transparent px-0 outline-none ring-0"
                aria-expanded={isDropdownOpen}
                aria-controls={isDropdownOpen ? "create-group-members-listbox" : undefined}
                aria-autocomplete="list"
              />
            </div>
          </div>
        </div>

        {isDropdownOpen ? (
          <div
            role="listbox"
            id="create-group-members-listbox"
            aria-labelledby="invite-members-label"
            className="hide-scrollbar max-h-[268px] overflow-y-auto border-t border-white/15 bg-transparent p-2"
          >
            {searchLoading ? (
              <Typography component="p" variantStyle="caption" className="px-1 py-2">
                {CREATE_GROUP_PAGE_COPY.searchingMembers}
              </Typography>
            ) : null}
            {searchError ? (
              <Typography
                component="p"
                variantStyle="caption"
                className="px-1 py-2 text-amber-200/90"
              >
                {searchError}
              </Typography>
            ) : null}
            {!searchLoading && !searchError
              ? filteredMembers.map((member) => (
                  <UserListItem
                    key={member.id}
                    name={member.name}
                    avatarUrl={member.avatarUrl}
                    onClick={() => toggleMember(member.id)}
                    isSelected={selectedMemberIds.includes(member.id)}
                    selectedLabel={CREATE_GROUP_PAGE_COPY.selectedBadge}
                    className="mb-2 last:mb-0"
                  />
                ))
              : null}
            {!searchLoading &&
            !searchError &&
            filteredMembers.length === 0 &&
            query.trim().length > 0 ? (
              <Typography component="p" variantStyle="caption" className="px-1 py-2">
                No users match your search.
              </Typography>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ActionButtonsProps = {
  onSubmit: () => void;
  submitBusy: boolean;
  canSubmit: boolean;
};

function ActionButtons({ onSubmit, submitBusy, canSubmit }: ActionButtonsProps) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <Button
        type="button"
        variant="contained"
        className="rounded-lg"
        onClick={onSubmit}
        disabled={submitBusy || !canSubmit}
      >
        {submitBusy ? "Creating…" : CREATE_GROUP_PAGE_COPY.createButton}
      </Button>
      <Link to="/" className="rounded-lg border border-white/20 px-4 py-1 hover:border-white/40">
        {CREATE_GROUP_PAGE_COPY.cancelButton}
      </Link>
    </div>
  );
}

export default function CreateGroupPage() {
  const state = useCreateGroupPage();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg sm:border border-white/20 sm:p-4">
      <div className="rounded-lg sm:border border-white/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <MobileBackLink />
          <Typography component="h1" variantStyle="title">
            {CREATE_GROUP_PAGE_COPY.title}
          </Typography>
        </div>
        <Typography variantStyle="caption" className="text-sm">
          {CREATE_GROUP_PAGE_COPY.subtitle}
        </Typography>

        <div className="mt-4 grid gap-4">
          <TextField
            label={CREATE_GROUP_PAGE_COPY.groupNameLabel}
            aria-label={CREATE_GROUP_PAGE_COPY.groupNameLabel}
            name="groupName"
            placeholder={CREATE_GROUP_PAGE_COPY.groupNamePlaceholder}
            size="sm"
            value={state.groupName}
            onChange={(event) => state.onGroupNameChange(event.target.value)}
            className="border-white/20 bg-transparent focus:border-[#2a6de5]"
          />
          <MembersSelector state={state} />
        </div>
        {state.submitError ? (
          <Typography component="p" variantStyle="caption" className="mt-3 text-amber-200/90">
            {state.submitError}
          </Typography>
        ) : null}
        <ActionButtons
          onSubmit={state.onSubmit}
          submitBusy={state.submitBusy}
          canSubmit={state.canSubmit}
        />
      </div>
    </section>
  );
}
