import { Avatar, Button, Typography } from "@promentorapp/ui-kit";

type UserListItemProps = {
  name: string;
  avatarUrl?: string | null;
  onClick: () => void;
  isSelected?: boolean;
  selectedLabel?: string;
  className?: string;
};

const getUserListItemSx = (isSelected: boolean) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "8px",
  border: isSelected ? "1px solid rgba(126,197,255,0.6)" : "1px solid rgba(255,255,255,0.12)",
  backgroundColor: isSelected ? "rgba(69,82,94,1)" : "rgba(255,255,255,0.08)",
  color: isSelected ? "#ffffff" : "#e3ebf7",
  padding: "6px 12px",
  textAlign: "left" as const,
  lineHeight: 1.25,
  "&:hover": {
    backgroundColor: isSelected ? "rgba(69,82,94,1)" : "rgba(255,255,255,0.12)",
  },
});

export function UserListItem({
  name,
  avatarUrl,
  onClick,
  isSelected = false,
  selectedLabel,
  className,
}: UserListItemProps) {
  return (
    <Button type="button" onClick={onClick} className={className} sx={getUserListItemSx(isSelected)}>
      <span className="flex items-center gap-3">
        <Avatar user={{ name, avatarUrl }} size="sm" />
        <Typography component="span" variantStyle="body">
          {name}
        </Typography>
      </span>
      {isSelected && selectedLabel ? (
        <Typography component="span" variantStyle="caption">
          {selectedLabel}
        </Typography>
      ) : null}
    </Button>
  );
}
