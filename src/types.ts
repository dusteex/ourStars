export interface Star {
  id: string;
  name: string;
  position: [number, number, number];
  date: string;
  description: string;
  images: string[];
  audioUrl?: string;
  constellationId?: number
}

export interface Constellation {
  id: string;
  name: string;
  stars: Star[];
  cameraPosition: number[];
  cameraLookAt: number[];
  connections: Connection[];
}

export interface Connection {
  star1Id: string;
  star2Id: string;
  width?: number; // опциональная толщина линии
}
