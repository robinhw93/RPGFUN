export interface LayoutRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface InitiativeFlightGeometry {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

export function calculateInitiativeFlight(source: LayoutRect, target: LayoutRect): InitiativeFlightGeometry {
  return {
    x: source.left + source.width / 2 - (target.left + target.width / 2),
    y: source.top + source.height / 2 - (target.top + target.height / 2),
    scaleX: source.width / target.width,
    scaleY: source.height / target.height,
  };
}

export function getInitiativeRowBounds(cards: LayoutRect[]): Pick<LayoutRect, "top" | "left" | "width" | "height"> | null {
  if (cards.length === 0) return null;
  const left = Math.min(...cards.map((card) => card.left));
  const right = Math.max(...cards.map((card) => card.right));
  const top = Math.min(...cards.map((card) => card.top));
  const bottom = Math.max(...cards.map((card) => card.bottom));
  return { top, left, width: right - left, height: bottom - top };
}
