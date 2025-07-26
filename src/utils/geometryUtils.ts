// src/utils/geometryUtils.ts
import { Wall } from '../types';

interface Point {
  x: number;
  y: number;
}

// Shoelace formula for polygon area
const calculatePolygonArea = (vertices: Point[]): number => {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area / 2);
};

// Simple sort for vertices of a (likely convex or simple concave) polygon
const orderVertices = (vertices: Point[]): Point[] => {
  const center = vertices.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  center.x /= vertices.length;
  center.y /= vertices.length;

  return vertices.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });
};

export const calculateRoomArea = (walls: Wall[]): number => {
  if (walls.length < 3) return 0;

  const points: Point[] = [];
  walls.forEach(w => {
    points.push({ x: w.x1, y: w.y1 });
    points.push({ x: w.x2, y: w.y2 });
  });

  // Get unique vertices
  const uniquePoints = Array.from(new Map(points.map(p => [`${p.x},${p.y}`, p])).values());

  if (uniquePoints.length < 3) return 0;
  
  const ordered = orderVertices(uniquePoints);
  return calculatePolygonArea(ordered);
};
