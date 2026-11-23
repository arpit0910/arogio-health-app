/** Reserve the complete centre label and card rectangles before choosing an orbit. */
export function orbitGeometry(size: number) {
  const cardWidth = Math.min(86, Math.max(72, size * 0.23));
  const cardHeight = 46;
  const centerWidth = Math.min(88, size * 0.25);
  const centerHeight = Math.min(84, size * 0.24);
  const gap = size < 340 ? 8 : 10;
  const minRadius = Math.hypot(centerWidth / 2 + cardWidth / 2 + gap, centerHeight / 2 + cardHeight / 2 + gap);
  const maxRadius = size / 2 - cardWidth / 2 - 4;
  const height = 2 * (maxRadius + cardHeight / 2 + 4);
  return { cardWidth, cardHeight, centerWidth, centerHeight, gap, minRadius, maxRadius, height };
}

/** A closed expanding/contracting spiral with upright, evenly spaced cards. */
export function spiralMotion(size: number, phase: number) {
  const { minRadius, maxRadius } = orbitGeometry(size);
  const inputRange = Array.from({ length: 97 }, (_, index) => index / 96);
  const points = inputRange.map(progress => {
    const angle = progress * Math.PI * 2 + phase;
    const radius = (minRadius + maxRadius) / 2 + (maxRadius - minRadius) / 2 * Math.sin(progress * Math.PI * 2);
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
  return { inputRange, x: points.map(point => point.x), y: points.map(point => point.y) };
}
