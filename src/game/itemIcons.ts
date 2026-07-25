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
};

export function getItemIconUrl(itemId: string): string | undefined {
  return ITEM_ICON_URLS[itemId];
}
