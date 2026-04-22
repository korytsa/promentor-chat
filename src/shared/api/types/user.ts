export type UserRole = "MENTOR" | "REGULAR_USER";

export type AuthUserResponseDto = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  about?: string | null;
};

export type UsersListPageDto = {
  items: AuthUserResponseDto[];
  total: number;
  limit: number;
  offset: number;
};

export type UserSearchResultDto = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
};

export type UserSearchItemDto = UserSearchResultDto;
