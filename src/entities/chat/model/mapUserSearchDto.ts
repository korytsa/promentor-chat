import type { ChatSearchOption } from "./types";
import type { SearchUser } from "./fixtures";
import type { UserSearchResultDto } from "../../../shared/api/types/user";

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
