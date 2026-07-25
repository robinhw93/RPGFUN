import { getArmorMaterial, getWeaponEquipType, getWeaponKind } from "../game/gear";
import type { ArmorMaterial, GearItem, GearSlot, GearType, WeaponKind } from "../game/types";

const ARMOR_ICON_URLS: Record<"head" | "chest" | "pants" | "boots", Record<ArmorMaterial, string>> = {
  head: {
    plate: "/assets/gear-icons/head.webp",
    leather: "/assets/gear-icons/head-leather.webp",
    cloth: "/assets/gear-icons/head-cloth.webp",
  },
  chest: {
    plate: "/assets/gear-icons/chest.webp",
    leather: "/assets/gear-icons/chest-leather.webp",
    cloth: "/assets/gear-icons/chest-cloth.webp",
  },
  pants: {
    plate: "/assets/gear-icons/pants-plate.webp",
    leather: "/assets/gear-icons/pants-leather.webp",
    cloth: "/assets/gear-icons/pants.webp",
  },
  boots: {
    plate: "/assets/gear-icons/boots-plate.webp",
    leather: "/assets/gear-icons/boots.webp",
    cloth: "/assets/gear-icons/boots-cloth.webp",
  },
};

const MAIN_HAND_ICON_URLS: Partial<Record<WeaponKind, string>> = {
  sword: "/assets/gear-icons/one-handed.webp",
  axe: "/assets/gear-icons/main-axe.webp",
  mace: "/assets/gear-icons/main-mace.webp",
  dagger: "/assets/gear-icons/main-dagger.webp",
  wand: "/assets/gear-icons/main-wand.webp",
};

const OFF_HAND_ICON_URLS: Partial<Record<WeaponKind, string>> = {
  shield: "/assets/gear-icons/offhand.webp",
  tome: "/assets/gear-icons/offhand-tome.webp",
};

const TWO_HAND_ICON_URLS: Partial<Record<WeaponKind, string>> = {
  sword: "/assets/gear-icons/two-handed.webp",
  axe: "/assets/gear-icons/twohand-axe.webp",
  mace: "/assets/gear-icons/twohand-mace.webp",
  staff: "/assets/gear-icons/twohand-staff.webp",
  polearm: "/assets/gear-icons/twohand-polearm.webp",
};

export type GearIconCategory = "head" | "chest" | "pants" | "boots" | "ring" | WeaponKind;

export const GEAR_ICON_VARIANTS: Record<GearIconCategory, readonly string[]> = {
  head: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/head-${String(variant).padStart(2, "0")}.webp`),
  chest: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/chest-${String(variant).padStart(2, "0")}.webp`),
  pants: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/pants-${String(variant).padStart(2, "0")}.webp`),
  boots: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/boots-${String(variant).padStart(2, "0")}.webp`),
  ring: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/ring-${String(variant).padStart(2, "0")}.webp`),
  sword: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/sword-${String(variant).padStart(2, "0")}.webp`),
  axe: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/axe-${String(variant).padStart(2, "0")}.webp`),
  mace: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/mace-${String(variant).padStart(2, "0")}.webp`),
  dagger: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/dagger-${String(variant).padStart(2, "0")}.webp`),
  wand: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/wand-${String(variant).padStart(2, "0")}.webp`),
  shield: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/shield-${String(variant).padStart(2, "0")}.webp`),
  tome: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/tome-${String(variant).padStart(2, "0")}.webp`),
  staff: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/staff-${String(variant).padStart(2, "0")}.webp`),
  polearm: [1, 2, 3, 4, 5].map((variant) => `/assets/gear-icons/polearm-${String(variant).padStart(2, "0")}.webp`),
};

export const GEAR_ICON_URLS = [...new Set([
  ...Object.values(ARMOR_ICON_URLS).flatMap((icons) => Object.values(icons)),
  ...Object.values(MAIN_HAND_ICON_URLS),
  ...Object.values(OFF_HAND_ICON_URLS),
  ...Object.values(TWO_HAND_ICON_URLS),
  "/assets/gear-icons/ring.webp",
  ...Object.values(GEAR_ICON_VARIANTS).flat(),
].filter((url): url is string => Boolean(url)))];

export function getGearIconCategory(item: GearItem): GearIconCategory {
  if (item.slot === "head" || item.slot === "chest" || item.slot === "pants" || item.slot === "boots" || item.slot === "ring") {
    return item.slot;
  }
  return getWeaponKind(item) ?? (item.slot === "offHand" ? "shield" : "sword");
}

export function getGearIconChoices(item: GearItem): string[] {
  const category = getGearIconCategory(item);
  if (category === "head" || category === "chest" || category === "pants" || category === "boots") {
    return [...new Set([...Object.values(ARMOR_ICON_URLS[category]), ...GEAR_ICON_VARIANTS[category]])];
  }
  if (category === "ring") return ["/assets/gear-icons/ring.webp", ...GEAR_ICON_VARIANTS.ring];

  const legacy = [MAIN_HAND_ICON_URLS[category], OFF_HAND_ICON_URLS[category], TWO_HAND_ICON_URLS[category]]
    .filter((url): url is string => Boolean(url));
  return [...new Set([...legacy, ...GEAR_ICON_VARIANTS[category]])];
}

export function resolveGearIconUrl(slot: GearSlot | GearType, item?: GearItem): string {
  if (item?.iconUrl) return item.iconUrl;
  const itemSlot = item?.slot ?? slot;
  if (itemSlot === "ring" || itemSlot === "ring1" || itemSlot === "ring2") return "/assets/gear-icons/ring.webp";
  if (itemSlot === "head" || itemSlot === "chest" || itemSlot === "pants" || itemSlot === "boots") {
    return ARMOR_ICON_URLS[itemSlot][getArmorMaterial(item, itemSlot)];
  }

  const equipType = getWeaponEquipType(item);
  const kind = getWeaponKind(item);
  if (equipType === "twoHand") return TWO_HAND_ICON_URLS[kind ?? "sword"] ?? TWO_HAND_ICON_URLS.sword!;
  if (equipType === "offHand" || itemSlot === "offHand") return OFF_HAND_ICON_URLS[kind ?? "shield"] ?? OFF_HAND_ICON_URLS.shield!;
  return MAIN_HAND_ICON_URLS[kind ?? "sword"] ?? MAIN_HAND_ICON_URLS.sword!;
}

export function GearSlotIcon({ slot, item, size = 24, className }: {
  slot: GearSlot | GearType;
  item?: GearItem;
  size?: number;
  className?: string;
}) {
  return (
    <img
      aria-hidden="true"
      className={className ? `gear-slot-icon ${className}` : "gear-slot-icon"}
      src={resolveGearIconUrl(slot, item)}
      alt=""
      width={size}
      height={size}
      draggable={false}
      decoding="sync"
    />
  );
}
