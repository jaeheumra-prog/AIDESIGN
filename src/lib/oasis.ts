export type SeatId = "window-left" | "window-right" | "library-left" | "library-right";

export type SeatDefinition = {
  id: SeatId;
  label: string;
  chairPosition: [number, number, number];
  tablePosition: [number, number, number];
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
};

export type PresenceRecord = {
  id: string;
  name: string;
  seatId: SeatId | null;
  color: string;
  mood: string;
  updatedAt: number;
};

export const seatLabels: Record<SeatId, string> = {
  "window-left": "Window Desk A",
  "window-right": "Window Desk B",
  "library-left": "Library Table A",
  "library-right": "Library Table B",
};

export const seatDescriptions: Record<SeatId, string> = {
  "window-left": "A quiet corner with the window glow and a soft desk lamp.",
  "window-right": "A balanced seat for deep focus and a wider room view.",
  "library-left": "Closer to the shelves, like studying between old stories.",
  "library-right": "Warm overhead light and a little more breathing room.",
};

export const seatDefinitions: SeatDefinition[] = [
  {
    id: "window-left",
    label: "Window Desk A",
    chairPosition: [-3.4, 0, -1.9],
    tablePosition: [-3.4, 0, -2.9],
    cameraPosition: [-3.4, 1.55, -1.15],
    lookAt: [-3.4, 1.08, -3.1],
  },
  {
    id: "window-right",
    label: "Window Desk B",
    chairPosition: [3.4, 0, -1.9],
    tablePosition: [3.4, 0, -2.9],
    cameraPosition: [3.4, 1.55, -1.15],
    lookAt: [3.4, 1.08, -3.1],
  },
  {
    id: "library-left",
    label: "Library Table A",
    chairPosition: [-2.25, 0, 2.4],
    tablePosition: [-2.25, 0, 1.5],
    cameraPosition: [-2.25, 1.55, 3.2],
    lookAt: [-2.25, 1.06, 1.42],
  },
  {
    id: "library-right",
    label: "Library Table B",
    chairPosition: [2.25, 0, 2.4],
    tablePosition: [2.25, 0, 1.5],
    cameraPosition: [2.25, 1.55, 3.2],
    lookAt: [2.25, 1.06, 1.42],
  },
];
