import type { GearItem, GearSlot, GearType } from "../game/types";

export type GearIconKind = "head" | "chest" | "pants" | "boots" | "ring" | "oneHanded" | "twoHanded" | "offHand";

const GEAR_ICON_URLS: Record<GearIconKind, string> = {
  head: "/assets/gear-icons/head.webp",
  chest: "/assets/gear-icons/chest.webp",
  pants: "/assets/gear-icons/pants.webp",
  boots: "/assets/gear-icons/boots.webp",
  ring: "/assets/gear-icons/ring.webp",
  oneHanded: "/assets/gear-icons/one-handed.webp",
  twoHanded: "/assets/gear-icons/two-handed.webp",
  offHand: "/assets/gear-icons/offhand.webp",
};

function resolveGearIconKind(slot: GearSlot | GearType, item?: GearItem): GearIconKind {
  const itemSlot = item?.slot ?? slot;
  if (itemSlot === "ring" || itemSlot === "ring1" || itemSlot === "ring2") return "ring";
  if (itemSlot === "mainHand") return item?.weaponType === "twoHanded" ? "twoHanded" : "oneHanded";
  return itemSlot;
}

export function GearSlotIcon({ slot, item, size = 24, className }: {
  slot: GearSlot | GearType;
  item?: GearItem;
  size?: number;
  className?: string;
}) {
  const kind = resolveGearIconKind(slot, item);

  return (
    <img
      aria-hidden="true"
      className={className ? `gear-slot-icon ${className}` : "gear-slot-icon"}
      src={GEAR_ICON_URLS[kind]}
      alt=""
      width={size}
      height={size}
      draggable={false}
      decoding="async"
    />
  );
}
