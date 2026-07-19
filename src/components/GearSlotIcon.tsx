import type { ReactNode } from "react";
import type { GearItem, GearSlot, GearType } from "../game/types";

export type GearIconKind = "head" | "chest" | "pants" | "boots" | "ring" | "oneHanded" | "twoHanded" | "offHand";

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
  const paths: Record<GearIconKind, ReactNode> = {
    head: <><path d="M5 20v-7a7 7 0 0 1 14 0v7" /><path d="M4 14h16M8 14v5M16 14v5M10 5V2.5h4V5" /></>,
    chest: <><path d="m8 3-4 3 2 5v10h12V11l2-5-4-3-2 3h-4L8 3Z" /><path d="M9 6v15M15 6v15M9 12h6" /></>,
    pants: <><path d="M7 3h10l1 18h-5l-1-10-1 10H6L7 3Z" /><path d="M7 7h10M12 3v8" /></>,
    boots: <><path d="M5 3v12l-2 3v3h8v-4l-2-2V3" /><path d="M15 3v12l-2 2v4h8v-3l-2-3V3" /></>,
    ring: <><circle cx="12" cy="14" r="6" /><path d="m9 7 3-4 3 4-3 2-3-2Z" /></>,
    oneHanded: <><path d="m16 3 5-1-1 5L9 18l-3 3-3-3 3-3L16 3Z" /><path d="m6 14 4 4M4 16l4 4" /></>,
    twoHanded: <><path d="m12 2 3 4-2 10h-2L9 6l3-4Z" /><path d="M6.5 16h11M12 16v5M10 21h4" /></>,
    offHand: <><path d="m12 3 7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" /><path d="M12 7v10M8 11h8" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className={className ? `gear-slot-icon ${className}` : "gear-slot-icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}
