import { useEffect, useMemo, useRef, useState } from "react";
import { SEARCH_USERS } from "../../../entities/chat";
import { Avatar } from "../../../shared/ui/Avatar";

export default function CreateGroupPage() {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  const filteredMembers = useMemo(
    () =>
      SEARCH_USERS.filter((member) =>
        member.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  const selectedMembers = useMemo(
    () =>
      SEARCH_USERS.filter((member) => selectedMemberIds.includes(member.id)),
    [selectedMemberIds],
  );

  const closeSelectorIfEmpty = (memberIds: string[]) => {
    if (memberIds.length === 0) {
      setIsDropdownOpen(false);
      setQuery("");
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) => {
      const isSelected = current.includes(memberId);
      const nextSelectedMemberIds = isSelected
        ? current.filter((id) => id !== memberId)
        : [...current, memberId];

      closeSelectorIfEmpty(nextSelectedMemberIds);
      return nextSelectedMemberIds;
    });
  };

  const removeMember = (memberId: string) => {
    setSelectedMemberIds((current) => {
      const nextSelectedMemberIds = current.filter((id) => id !== memberId);
      closeSelectorIfEmpty(nextSelectedMemberIds);
      return nextSelectedMemberIds;
    });
  };

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!selectorRef.current) {
        return;
      }

      if (!selectorRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-r-lg border border-white/20 p-6">
      <div className="rounded-lg border border-white/20 bg-white/3 p-6">
        <h1 className="text-2xl font-semibold text-[#eff5ff]">Create Group</h1>
        <p className="mt-2 text-sm text-[#9bb4df]">
          Set up a new group conversation and invite your team members.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#deebff]">Group name</span>
            <input
              type="text"
              placeholder="e.g. Product Launch Squad"
              className="h-11 rounded-lg border border-white/20 bg-transparent px-3 text-sm text-[#eaf2ff] outline-none placeholder:text-[#88a2d2] focus:border-[#2a6de5]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#deebff]">Invite members</span>
            <div
              ref={selectorRef}
              className="rounded-lg border border-[#7ec5ff] bg-transparent"
              onClick={() => setIsDropdownOpen(true)}
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
                      <span>{member.name}</span>
                    </button>
                  ))}

                  <input
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder={selectedMembers.length ? "" : "Type names..."}
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
                        <span className="flex items-center gap-3 text-base">
                          <Avatar
                            user={{ name: member.name, avatarUrl: member.avatarUrl }}
                            size="sm"
                          />
                          <span>{member.name}</span>
                        </span>
                        {isSelected ? <span className="text-xs text-[#9ed3ff]">Selected</span> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="rounded-lg border border-[#2a6de5] bg-[#1b4fae] px-4 py-2 text-sm font-semibold text-[#eff5ff] transition hover:bg-[#2362d4]">
            Create group
          </button>
          <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-[#cfe0ff] transition hover:border-white/30 hover:bg-white/5">
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
