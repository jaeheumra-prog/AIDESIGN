export type SeatId =
  | "window-a"
  | "window-b"
  | "window-c"
  | "window-d"
  | "library-a"
  | "library-b"
  | "library-c"
  | "library-d";

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
  "window-a": "Window Desk A",
  "window-b": "Window Desk B",
  "window-c": "Window Desk C",
  "window-d": "Window Desk D",
  "library-a": "Library Table A",
  "library-b": "Library Table B",
  "library-c": "Library Table C",
  "library-d": "Library Table D",
};

export const seatDescriptions: Record<SeatId, string> = {
  "window-a": "A quiet corner under the far-left window, softly tucked into the room's warm edge.",
  "window-b": "A centered window seat with a gentle lamp glow and a steady view across the lounge.",
  "window-c": "A balanced desk where the window light and the room's hush meet in the middle.",
  "window-d": "A far-right window perch with a little more privacy and a long view of the study floor.",
  "library-a": "Near the left-side shelves, like studying inside a low-poly storybook.",
  "library-b": "An inner table with easy sightlines and a comfortable middle-lounge rhythm.",
  "library-c": "A warm central table seat with room to breathe and plenty of surrounding light.",
  "library-d": "Closer to the right stacks, for when you want a quieter nook near the wall.",
};

export const seatDefinitions: SeatDefinition[] = [
  {
    id: "window-a",
    label: "Window Desk A",
    chairPosition: [-6.3, 0, -3.55],
    tablePosition: [-6.3, 0, -4.75],
    cameraPosition: [-6.3, 1.55, -2.7],
    lookAt: [-6.3, 1.06, -4.95],
  },
  {
    id: "window-b",
    label: "Window Desk B",
    chairPosition: [-2.1, 0, -3.55],
    tablePosition: [-2.1, 0, -4.75],
    cameraPosition: [-2.1, 1.55, -2.7],
    lookAt: [-2.1, 1.06, -4.95],
  },
  {
    id: "window-c",
    label: "Window Desk C",
    chairPosition: [2.1, 0, -3.55],
    tablePosition: [2.1, 0, -4.75],
    cameraPosition: [2.1, 1.55, -2.7],
    lookAt: [2.1, 1.06, -4.95],
  },
  {
    id: "window-d",
    label: "Window Desk D",
    chairPosition: [6.3, 0, -3.55],
    tablePosition: [6.3, 0, -4.75],
    cameraPosition: [6.3, 1.55, -2.7],
    lookAt: [6.3, 1.06, -4.95],
  },
  {
    id: "library-a",
    label: "Library Table A",
    chairPosition: [-6.3, 0, 3.15],
    tablePosition: [-6.3, 0, 2.05],
    cameraPosition: [-6.3, 1.55, 3.95],
    lookAt: [-6.3, 1.06, 1.9],
  },
  {
    id: "library-b",
    label: "Library Table B",
    chairPosition: [-2.1, 0, 3.15],
    tablePosition: [-2.1, 0, 2.05],
    cameraPosition: [-2.1, 1.55, 3.95],
    lookAt: [-2.1, 1.06, 1.9],
  },
  {
    id: "library-c",
    label: "Library Table C",
    chairPosition: [2.1, 0, 3.15],
    tablePosition: [2.1, 0, 2.05],
    cameraPosition: [2.1, 1.55, 3.95],
    lookAt: [2.1, 1.06, 1.9],
  },
  {
    id: "library-d",
    label: "Library Table D",
    chairPosition: [6.3, 0, 3.15],
    tablePosition: [6.3, 0, 2.05],
    cameraPosition: [6.3, 1.55, 3.95],
    lookAt: [6.3, 1.06, 1.9],
  },
];
