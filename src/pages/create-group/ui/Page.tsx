import { Typography } from "@promentorapp/ui-kit";
import { Avatar } from "../../../shared/ui/Avatar";
import { CREATE_GROUP_PAGE_COPY } from "../model/constants";
import { useCreateGroupPage } from "../model/useCreateGroupPage";

export default function CreateGroupPage() {
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
  } = useCreateGroupPage();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-r-lg border border-white/20 p-4">
      <div className="rounded-lg border border-white/20 bg-white/3 p-4">
        <Typography variant="h5"variantStyle="title">{CREATE_GROUP_PAGE_COPY.title}</Typography>
        <Typography variantStyle="caption">{CREATE_GROUP_PAGE_COPY.subtitle}</Typography>
        
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Typography variantStyle="label">{CREATE_GROUP_PAGE_COPY.groupNameLabel}</Typography>
            <input
              type="text"
              placeholder={CREATE_GROUP_PAGE_COPY.groupNamePlaceholder}
              className="h-11 rounded-lg border border-white/20 bg-transparent px-3 text-sm text-[#eaf2ff] outline-none placeholder:text-[#88a2d2] focus:border-[#2a6de5]"
            />
          </div>

          <div className="grid gap-2">
            <Typography variantStyle="label">{CREATE_GROUP_PAGE_COPY.inviteMembersLabel}</Typography>
            <div
              ref={selectorRef}
              className="rounded-lg border border-[#7ec5ff] bg-transparent"
              onClick={onSelectorAreaClick}
            >
              <div className="flex min-h-[52px] items-center gap-2 px-3 py-2">
                <div className="hide-scrollbar flex max-h-[70px] flex-1 flex-wrap gap-2 overflow-y-auto pr-1">
                  {selectedMembers.map((member) => (
                    <button
                      onClick={() => removeMember(member.id)}
                      key={member.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-white/18 p-1.5 text-sm font-medium text-[#eff5ff]"
                    >
                      <Avatar
                        user={{ name: member.name, avatarUrl: member.avatarUrl }}
                        size="sm"
                      />
                      <Typography component="span" variantStyle="label">{member.name}</Typography>
                    </button>
                  ))}

                  <input
                    type="text"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder={selectedMembers.length ? "" : CREATE_GROUP_PAGE_COPY.inviteInputPlaceholder}
                    className="h-8 min-w-[160px] flex-1 bg-transparent text-sm text-[#eaf2ff] outline-none placeholder:text-[#88a2d2]"
                  />
                </div>
              </div>

              {isDropdownOpen ? (
                <div className="hide-scrollbar max-h-[268px] overflow-y-auto border-t border-white/15 bg-transparent p-2">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedMemberIds.includes(member.id);

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={[
                          "mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left leading-5 transition last:mb-0",
                          isSelected
                            ? "border-[#7ec5ff]/60 bg-[#45525e] text-white"
                            : "border-white/12 bg-white/8 text-[#e3ebf7] hover:bg-white/12",
                        ].join(" ")}
                      >
                        <Typography component="span" variantStyle="label" className="flex items-center gap-3">
                          <Avatar
                            user={{ name: member.name, avatarUrl: member.avatarUrl }}
                            size="sm"
                          />
                          <Typography component="span" variantStyle="body">{member.name}</Typography>
                        </Typography>
                        {isSelected ? (
                          <Typography component="span" variantStyle="caption">{CREATE_GROUP_PAGE_COPY.selectedBadge}</Typography>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="rounded-lg border border-[#2a6de5] bg-[#1b4fae] px-4 py-2 text-sm font-semibold text-[#eff5ff] transition hover:bg-[#2362d4]">
            {CREATE_GROUP_PAGE_COPY.createButton}
          </button>
          <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-[#cfe0ff] transition hover:border-white/30 hover:bg-white/5">
            {CREATE_GROUP_PAGE_COPY.cancelButton}
          </button>
        </div>
      </div>
    </section>
  );
}
