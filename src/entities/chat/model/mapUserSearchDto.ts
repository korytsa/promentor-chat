import type { ChatSearchOption } from "./types";
import type { SearchUser } from "./fixtures";
import type { AuthUserResponseDto, UserSearchResultDto } from "../../../shared/api/types/user";

export function mapAuthUserToChatOption(u: AuthUserResponseDto): ChatSearchOption {
  return {
    id: u.id,
    name: u.fullName,
    avatarUrl: u.avatarUrl ?? "",
    isUserOnly: true,
  };
}

export function mapUserSearchDtoToSearchUser(dto: UserSearchResultDto): SearchUser {
  return {
    id: dto.id,
    name: dto.fullName,
    avatarUrl: dto.avatarUrl ?? "",
  };
}

export function mapUserSearchDtoToChatOption(dto: UserSearchResultDto): ChatSearchOption {
  return {
    id: dto.id,
    name: dto.fullName,
    avatarUrl: dto.avatarUrl ?? "",
    isUserOnly: true,
  };
}
