import { Typography, Avatar, Button, TextField } from "@promentorapp/ui-kit";
import { UserListItem } from "../../../shared/ui/UserListItem";
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
  return (
    <Button type="button" variant="outlined" onClick={() => onRemove(member.id)}>
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
    toggleMember,
    removeMember,
    onSelectorAreaClick,
  } = state;

  const invitePlaceholder = selectedMembers.length
    ? ""
    : CREATE_GROUP_PAGE_COPY.inviteInputPlaceholder;

  return (
    <div className="grid gap-2">
      <Typography variantStyle="label">{CREATE_GROUP_PAGE_COPY.inviteMembersLabel}</Typography>
      <div
        ref={selectorRef}
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
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={invitePlaceholder}
                size="sm"
                className="h-8! border-0! bg-transparent! px-0! outline-none! ring-0!"
              />
            </div>
          </div>
        </div>

        {isDropdownOpen ? (
          <div className="hide-scrollbar max-h-[268px] overflow-y-auto border-t border-white/15 bg-transparent p-2">
            {filteredMembers.map((member) => (
              <UserListItem
                key={member.id}
                name={member.name}
                avatarUrl={member.avatarUrl}
                onClick={() => toggleMember(member.id)}
                isSelected={selectedMemberIds.includes(member.id)}
                selectedLabel={CREATE_GROUP_PAGE_COPY.selectedBadge}
                className="mb-2 last:mb-0"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="mt-6 flex items-center gap-3">
      <Button type="button" variant="contained" className="rounded-lg!">
        {CREATE_GROUP_PAGE_COPY.createButton}
      </Button>
      <Link to="/chat" className="rounded-lg border border-white/20 px-4 py-1 hover:border-white/40">
        {CREATE_GROUP_PAGE_COPY.cancelButton}
      </Link>
    </div>
  );
}

export default function CreateGroupPage() {
  const state = useCreateGroupPage();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-r-lg border border-white/20 p-4">
      <div className="rounded-lg border border-white/20 bg-white/3 p-4">
        <Typography variant="h5" variantStyle="title">
          {CREATE_GROUP_PAGE_COPY.title}
        </Typography>
        <Typography variantStyle="caption">{CREATE_GROUP_PAGE_COPY.subtitle}</Typography>

        <div className="mt-4 grid gap-4">
          <TextField
            label={CREATE_GROUP_PAGE_COPY.groupNameLabel}
            placeholder={CREATE_GROUP_PAGE_COPY.groupNamePlaceholder}
            size="sm"
            className="border-white/20! bg-transparent! focus:border-[#2a6de5]!"
          />
          <MembersSelector state={state} />
        </div>
        <ActionButtons />
      </div>
    </section>
  );
}
