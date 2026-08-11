export const assetMap: Record<string, string> = {
  lal: "/assets/crops/lal.png",
  ala: "/assets/crops/ala.png",
  lll: "/assets/crops/lll.png",
  mediana: "/assets/crops/mediana.png",
  bissetriz: "/assets/crops/bissetriz.png",
  altura: "/assets/crops/altura.png",
  "isosceles-base": "/assets/crops/isosceles-base.png",
  "isosceles-inverso": "/assets/crops/isosceles-inverso.png",
  "isosceles-especial": "/assets/crops/isosceles-especial.png",
  quest: "/assets/crops/quest-banner.png",
  boss: "/assets/crops/boss-proof.png",
  sheet: "/assets/geometria_rpg_assets/00_mega_asset_sheet.png",
};

export function getAsset(key?: string) {
  return key ? assetMap[key] : undefined;
}
