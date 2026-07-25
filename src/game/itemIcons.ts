export const ITEM_ICON_URLS: Record<string, string> = {
  "consumable-ms0e3hjh-5bewd": "/assets/items/yumberries.webp",
  "consumable-ms0e551z-v6qcf": "/assets/items/minor-healing-potion.webp",
  "gear-ms0h89t2-sczql": "/assets/items/windsong-staff.webp",
  "gear-ms0h9jvh-cpg4y": "/assets/items/windsong-sword.webp",
  "gear-ms0haj6d-e8pmv": "/assets/items/windsong-dagger.webp",
  "gear-ms0hb5cw-j14wj": "/assets/items/dusty-cowl.webp",
  "gear-ms0hdxb1-bxamd": "/assets/items/dusty-boots.webp",
  "gear-ms0hf0m3-j3pcx": "/assets/items/old-armor.webp",
  "gear-ms0hfvkg-yni9w": "/assets/items/old-leather-pants.webp",
  "gear-ms0hgg09-w6afk": "/assets/items/old-robes.webp",
  "consumable-ms0ifcle-isww5": "/assets/items/small-bloodberry.webp",
  "item-ms0jd8ky-lu2zb": "/assets/items/fur.webp",
  "item-ms0jdzsp-pnyoa": "/assets/items/wolf-fang.webp",
  "item-ms0jej41-7sii2": "/assets/items/rats-tail.webp",
  "item-ms0jf0sp-z8hcl": "/assets/items/wisp-essence.webp",
  "item-ms0jgblm-ko16i": "/assets/items/bear-claw.webp",
  "gear-ms0l8elz-4jlgf": "/assets/items/mystical-ring.webp",
  "item-ms0ss0dt-z4bke": "/assets/items/metal-scrap.webp",
  "gear-ms0svay5-evj17": "/assets/gear-icons/head-01.webp",
  "gear-ms0sx064-zq3n5": "/assets/gear-icons/chest-01.webp",
  "gear-ms0syhpj-m13xr": "/assets/gear-icons/boots-01.webp",
  "gear-ms0t0crb-p4hdm": "/assets/gear-icons/pants-01.webp",
};

export const CRAFTING_MATERIAL_ARTWORK_URLS = [
  "/assets/items/metal-scrap.webp",
  "/assets/items/iron-ore.webp",
  "/assets/items/copper-ore.webp",
  "/assets/items/silver-ore.webp",
  "/assets/items/gold-ore.webp",
  "/assets/items/coal.webp",
  "/assets/items/hardwood.webp",
  "/assets/items/ancient-bark.webp",
  "/assets/items/tanned-leather.webp",
  "/assets/items/fine-cloth.webp",
  "/assets/items/spider-silk.webp",
  "/assets/items/arcane-crystal.webp",
  "/assets/items/frost-shard.webp",
  "/assets/items/ember-core.webp",
  "/assets/items/storm-essence.webp",
  "/assets/items/poison-gland.webp",
  "/assets/items/bone-fragments.webp",
  "/assets/items/monster-hide.webp",
  "/assets/items/moonpetal.webp",
  "/assets/items/glowcap-mushrooms.webp",
  "/assets/items/empty-alchemy-vial.webp",
] as const;

export const ITEM_ARTWORK_URLS = [...new Set([
  ...Object.values(ITEM_ICON_URLS).filter((url) => url.startsWith("/assets/items/")),
  ...CRAFTING_MATERIAL_ARTWORK_URLS,
])];

export function getItemIconUrl(itemId: string): string | undefined {
  return ITEM_ICON_URLS[itemId];
}
