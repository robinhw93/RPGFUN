import { FlaskConical, Package } from "lucide-react";
import { getItemIconUrl } from "../game/itemIcons";
import { isConsumableItem, isGearItem } from "../game/items";
import type { GearSlot, InventoryItem } from "../game/types";
import { GearSlotIcon } from "./GearSlotIcon";

export function ItemIcon({ item, size = 32, className }: { item: InventoryItem; size?: number; className?: string }) {
  const iconUrl = item.iconUrl?.startsWith("/assets/items/") ? item.iconUrl : getItemIconUrl(item.id);
  if (iconUrl) {
    return <img aria-hidden="true" className={className ? `item-icon ${className}` : "item-icon"} src={iconUrl} alt="" width={size} height={size} draggable={false} decoding="sync" />;
  }
  if (isGearItem(item)) return <GearSlotIcon slot={item.slot} item={item} size={size} className={className} />;
  return isConsumableItem(item) ? <FlaskConical className={className} size={size} /> : <Package className={className} size={size} />;
}

export function EquipmentSlotIcon({ slot, item, size = 24 }: { slot: GearSlot; item?: InventoryItem; size?: number }) {
  return item ? <ItemIcon item={item} size={size} /> : <GearSlotIcon slot={slot} size={size} />;
}
