// lib/dealers/map-utils.ts
// Converts geographic lat/lng to percentage positions on the @react-map/india SVG
// The SVG viewBox is "0 0 764.05 792" — these constants are calibrated to that map.

// Geographic bounds of India as represented in the SVG
const MAP_BOUNDS = {
  lng: { min: 68.0, max: 97.5 },
  lat: { min: 6.5, max: 37.0 },
};

// Percentage bounds of the actual India landmass within the SVG viewBox
const SVG_BOUNDS = {
  x: { min: 12, max: 84 },
  y: { min: 7, max: 99 },
};

/**
 * Convert latitude/longitude to percentage position on the India SVG map.
 * Returns { x: number, y: number } where values are 0-100 percentages.
 */
export function latLngToMapPercent(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - MAP_BOUNDS.lng.min) / (MAP_BOUNDS.lng.max - MAP_BOUNDS.lng.min)) *
      (SVG_BOUNDS.x.max - SVG_BOUNDS.x.min) +
    SVG_BOUNDS.x.min;

  // Y is inverted: higher latitude = lower y percentage (north is top)
  const y =
    ((MAP_BOUNDS.lat.max - lat) / (MAP_BOUNDS.lat.max - MAP_BOUNDS.lat.min)) *
      (SVG_BOUNDS.y.max - SVG_BOUNDS.y.min) +
    SVG_BOUNDS.y.min;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}
