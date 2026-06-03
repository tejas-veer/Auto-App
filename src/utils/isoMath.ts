import { SIZES } from '../constants/theme';

const { tileW, tileH } = SIZES;

/** Convert grid (col, row) to isometric screen coordinates.
 *  Returns the top-point of the tile's diamond shape. */
export function gridToScreen(
  col: number,
  row: number,
  originX: number,
  originY: number,
): { x: number; y: number } {
  return {
    x: originX + (col - row) * (tileW / 2),
    y: originY + (col + row) * (tileH / 2),
  };
}

/** SVG polygon points string for a flat isometric diamond tile.
 *  (cx, cy) is the top point of the diamond. */
export function tileDiamond(cx: number, cy: number): string {
  return [
    `${cx},${cy}`,
    `${cx + tileW / 2},${cy + tileH / 2}`,
    `${cx},${cy + tileH}`,
    `${cx - tileW / 2},${cy + tileH / 2}`,
  ].join(' ');
}

/** Returns SVG polygon point strings for a 3D isometric box sitting on a tile.
 *  (cx, cy) is the top point of the ground tile diamond.
 *  h is the building visual height in pixels (upward). */
export function buildingPolygons(
  cx: number,
  cy: number,
  h: number,
): { topFace: string; rightWall: string; leftWall: string } {
  const tw2 = tileW / 2;
  const th2 = tileH / 2;

  const topFace = [
    `${cx},${cy - h}`,
    `${cx + tw2},${cy - h + th2}`,
    `${cx},${cy - h + tileH}`,
    `${cx - tw2},${cy - h + th2}`,
  ].join(' ');

  const rightWall = [
    `${cx + tw2},${cy - h + th2}`,
    `${cx},${cy - h + tileH}`,
    `${cx},${cy + tileH}`,
    `${cx + tw2},${cy + th2}`,
  ].join(' ');

  const leftWall = [
    `${cx - tw2},${cy - h + th2}`,
    `${cx},${cy - h + tileH}`,
    `${cx},${cy + tileH}`,
    `${cx - tw2},${cy + th2}`,
  ].join(' ');

  return { topFace, rightWall, leftWall };
}
