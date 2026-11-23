import { it } from 'node:test';
import assert from 'node:assert/strict';
import { orbitGeometry, spiralMotion } from '../src/features/app-launch/spiralMotion.ts';

it('carries cards around every quadrant with changing radius and a continuous loop', () => {
  for (const size of [304, 344, 374, 390]) {
    const path = spiralMotion(size, -Math.PI * 0.75);
    assert.equal(path.inputRange.length, path.x.length);
    assert.equal(path.x.length, path.y.length);
    assert.ok(Math.abs(path.x[0] - path.x.at(-1)!) < 1e-8);
    assert.ok(Math.abs(path.y[0] - path.y.at(-1)!) < 1e-8);
    assert.ok(Math.min(...path.x) < -size * 0.25 && Math.max(...path.x) > size * 0.25);
    assert.ok(Math.min(...path.y) < -size * 0.25 && Math.max(...path.y) > size * 0.25);
    const radii = path.x.map((x, i) => Math.hypot(x, path.y[i]));
    assert.ok(Math.max(...radii) - Math.min(...radii) > 5, 'The trajectory must spiral, not stay on a circle.');
    assert.ok(Math.max(...radii) <= orbitGeometry(size).maxRadius + 1e-8);
  }
});

it('keeps all three cards apart, outside the centre, and inside the canvas throughout the loop', () => {
  for (const size of [304, 344, 374, 390]) {
    const g = orbitGeometry(size);
    const paths = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6].map(phase => spiralMotion(size, phase));
    for (let frame = 0; frame < 1920; frame++) {
      const cursor = frame / 1920 * 96, index = Math.floor(cursor), part = cursor - index;
      const points = paths.map(path => ({ x: path.x[index] + (path.x[index + 1] - path.x[index]) * part, y: path.y[index] + (path.y[index + 1] - path.y[index]) * part }));
      for (const point of points) {
        assert.ok(Math.abs(point.x) + g.cardWidth / 2 <= size / 2 - 3.9);
        assert.ok(Math.abs(point.y) + g.cardHeight / 2 <= g.height / 2 - 3.9);
        assert.ok(Math.abs(point.x) > (g.centerWidth + g.cardWidth) / 2 + g.gap - 0.2 || Math.abs(point.y) > (g.centerHeight + g.cardHeight) / 2 + g.gap - 0.2, `Centre clearance at size ${size}, frame ${frame}`);
      }
      for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
        assert.ok(Math.abs(points[i].x - points[j].x) > g.cardWidth + g.gap || Math.abs(points[i].y - points[j].y) > g.cardHeight + g.gap, `Card collision at size ${size}, frame ${frame}`);
      }
    }
  }
});
