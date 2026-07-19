export const CHARACTER_AVATARS = [
  { id: "male-01", group: "male", label: "Male 1", imageUrl: "/assets/avatars/male-01.webp" },
  { id: "male-02", group: "male", label: "Male 2", imageUrl: "/assets/avatars/male-02.webp" },
  { id: "male-03", group: "male", label: "Male 3", imageUrl: "/assets/avatars/male-03.webp" },
  { id: "male-04", group: "male", label: "Male 4", imageUrl: "/assets/avatars/male-04.webp" },
  { id: "male-05", group: "male", label: "Male 5", imageUrl: "/assets/avatars/male-05.webp" },
  { id: "female-01", group: "female", label: "Female 1", imageUrl: "/assets/avatars/female-01.webp" },
  { id: "female-02", group: "female", label: "Female 2", imageUrl: "/assets/avatars/female-02.webp" },
  { id: "female-03", group: "female", label: "Female 3", imageUrl: "/assets/avatars/female-03.webp" },
  { id: "female-04", group: "female", label: "Female 4", imageUrl: "/assets/avatars/female-04.webp" },
  { id: "female-05", group: "female", label: "Female 5", imageUrl: "/assets/avatars/female-05.webp" },
] as const;

export type CharacterAvatar = (typeof CHARACTER_AVATARS)[number];
export type CharacterAvatarId = CharacterAvatar["id"];
export type CharacterAvatarGroup = CharacterAvatar["group"];

export const DEFAULT_CHARACTER_AVATAR_ID: CharacterAvatarId = "male-01";

const AVATAR_IDS = new Set<string>(CHARACTER_AVATARS.map((avatar) => avatar.id));

export function normalizeCharacterAvatarId(value: unknown): CharacterAvatarId {
  return typeof value === "string" && AVATAR_IDS.has(value)
    ? value as CharacterAvatarId
    : DEFAULT_CHARACTER_AVATAR_ID;
}

export function getCharacterAvatar(value: unknown): CharacterAvatar {
  const id = normalizeCharacterAvatarId(value);
  return CHARACTER_AVATARS.find((avatar) => avatar.id === id) ?? CHARACTER_AVATARS[0];
}
