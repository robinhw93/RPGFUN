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

function resolveGearIconUrl(slot: GearSlot | GearType, item?: GearItem): string {
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
      decoding="async"
    />
  );
}
