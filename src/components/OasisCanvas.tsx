"use client";

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DoubleSide, Vector3 } from "three";

type SeatId = "window-left" | "window-right" | "library-left" | "library-right";

type SeatDefinition = {
  id: SeatId;
  label: string;
  chairPosition: [number, number, number];
  tablePosition: [number, number, number];
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
};

type Occupant = {
  id: string;
  name: string;
  seatId: SeatId;
  color: string;
  mood: string;
  kind: "you" | "guest";
};

type OasisCanvasProps = {
  selectedSeat: SeatId | null;
  occupants: Occupant[];
  onSeatSelect: (seatId: SeatId) => void;
  onSeatBlocked: (seatId: SeatId) => void;
};

const seatDefinitions: SeatDefinition[] = [
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

function CameraRig({
  controlsRef,
  selectedSeat,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  selectedSeat: SeatDefinition | null;
}) {
  const camera = useThree((state) => state.camera);
  const desiredPosition = useMemo(() => new Vector3(), []);
  const desiredTarget = useMemo(() => new Vector3(), []);
  const defaultPosition = useMemo(() => new Vector3(7.4, 5.2, 8.1), []);
  const defaultTarget = useMemo(() => new Vector3(0, 1.1, 0), []);

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-delta * 3.4);

    if (selectedSeat) {
      desiredPosition.set(...selectedSeat.cameraPosition);
      desiredTarget.set(...selectedSeat.lookAt);
    } else {
      desiredPosition.copy(defaultPosition);
      desiredTarget.copy(defaultTarget);
    }

    camera.position.lerp(desiredPosition, ease);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget, ease);
      controlsRef.current.update();
    } else {
      camera.lookAt(desiredTarget);
    }
  });

  return null;
}

function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
        <planeGeometry args={[20, 18]} />
        <meshStandardMaterial color="#6a5442" roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[8.4, 0.05, 5.8]} />
        <meshStandardMaterial color="#7b634f" roughness={0.86} />
      </mesh>

      <mesh position={[0, 2.8, -5.2]} receiveShadow>
        <boxGeometry args={[12.8, 5.8, 0.24]} />
        <meshStandardMaterial color="#3f342d" roughness={0.95} />
      </mesh>

      <mesh position={[-6.4, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.24, 5.8, 10.6]} />
        <meshStandardMaterial color="#342a26" roughness={0.95} />
      </mesh>

      <mesh position={[6.4, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.24, 5.8, 10.6]} />
        <meshStandardMaterial color="#342a26" roughness={0.95} />
      </mesh>

      <mesh position={[0, 5.65, 0]} receiveShadow>
        <boxGeometry args={[12.8, 0.2, 10.6]} />
        <meshStandardMaterial color="#2a211e" roughness={0.96} />
      </mesh>

      <mesh position={[-3.2, 2.9, -5.07]}>
        <boxGeometry args={[2.2, 2.5, 0.05]} />
        <meshStandardMaterial color="#91b6c6" emissive="#7aa5b6" emissiveIntensity={0.25} />
      </mesh>

      <mesh position={[3.2, 2.9, -5.07]}>
        <boxGeometry args={[2.2, 2.5, 0.05]} />
        <meshStandardMaterial color="#91b6c6" emissive="#7aa5b6" emissiveIntensity={0.25} />
      </mesh>

      <mesh position={[-3.2, 2.9, -5.11]}>
        <boxGeometry args={[2.45, 2.75, 0.08]} />
        <meshStandardMaterial color="#a27d54" roughness={0.6} metalness={0.1} />
      </mesh>

      <mesh position={[3.2, 2.9, -5.11]}>
        <boxGeometry args={[2.45, 2.75, 0.08]} />
        <meshStandardMaterial color="#a27d54" roughness={0.6} metalness={0.1} />
      </mesh>

      <mesh position={[0, 2.9, -5.11]}>
        <boxGeometry args={[0.18, 2.75, 0.08]} />
        <meshStandardMaterial color="#a27d54" roughness={0.6} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.03, 0]}>
        <ringGeometry args={[3.2, 3.9, 48]} />
        <meshStandardMaterial color="#7b4c2f" roughness={0.92} side={2} />
      </mesh>
    </group>
  );
}

function PendantLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 12]} />
        <meshStandardMaterial color="#201916" metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[0, -0.2, 0]}>
        <coneGeometry args={[0.45, 0.72, 20]} />
        <meshStandardMaterial color="#d4a36a" emissive="#7c4322" emissiveIntensity={0.15} />
      </mesh>

      <pointLight position={[0, -0.38, 0]} intensity={18} distance={9} decay={2} color="#ffbe76" />
    </group>
  );
}

function Shelf({ position }: { position: [number, number, number] }) {
  const books = useMemo(
    () => [
      [-0.75, 0.72, 0.02, "#b77a5e"],
      [-0.45, 0.72, 0.02, "#c8a36d"],
      [-0.15, 0.72, 0.02, "#8f6757"],
      [0.22, 0.72, 0.02, "#5e7d73"],
      [0.56, 0.72, 0.02, "#c08b53"],
      [-0.62, 1.62, 0.02, "#a16048"],
      [-0.2, 1.62, 0.02, "#8e8d6f"],
      [0.18, 1.62, 0.02, "#6f7ea1"],
      [0.62, 1.62, 0.02, "#a17b5b"],
    ],
    [],
  );

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.9, 2.6, 0.38]} />
        <meshStandardMaterial color="#49372d" roughness={0.86} />
      </mesh>

      <mesh position={[0, -0.4, 0.03]}>
        <boxGeometry args={[1.75, 0.08, 0.28]} />
        <meshStandardMaterial color="#7e6048" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.5, 0.03]}>
        <boxGeometry args={[1.75, 0.08, 0.28]} />
        <meshStandardMaterial color="#7e6048" roughness={0.7} />
      </mesh>

      <mesh position={[0, 1.4, 0.03]}>
        <boxGeometry args={[1.75, 0.08, 0.28]} />
        <meshStandardMaterial color="#7e6048" roughness={0.7} />
      </mesh>

      {books.map(([x, y, z, color], index) => (
        <mesh key={`${color}-${index}`} position={[x as number, y as number, z as number]} castShadow>
          <boxGeometry args={[0.2, 0.52, 0.18]} />
          <meshStandardMaterial color={color as string} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.38, 0.28, 0.5, 16]} />
        <meshStandardMaterial color="#8b5c3f" roughness={0.72} />
      </mesh>

      <mesh castShadow position={[0, 0.9, 0]}>
        <coneGeometry args={[0.72, 1.35, 8]} />
        <meshStandardMaterial color="#5e8064" roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0.2, 1.15, 0.05]}>
        <coneGeometry args={[0.48, 1, 8]} />
        <meshStandardMaterial color="#6a8d68" roughness={0.9} />
      </mesh>
    </group>
  );
}

function OccupantAvatar({
  occupant,
  chairPosition,
}: {
  occupant: Occupant;
  chairPosition: [number, number, number];
}) {
  const bodyColor = occupant.kind === "you" ? "#ffcf96" : occupant.color;

  return (
    <group position={chairPosition}>
      <mesh castShadow position={[0, 0.56, 0.02]}>
        <capsuleGeometry args={[0.2, 0.42, 8, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.68} />
      </mesh>

      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshStandardMaterial color="#f0cfb3" roughness={0.92} />
      </mesh>

      <mesh castShadow position={[0, 1.18, 0]}>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshStandardMaterial color="#3b2d29" roughness={0.9} />
      </mesh>

      <mesh castShadow rotation={[0.1, 0, 0.55]} position={[-0.14, 0.64, 0.14]}>
        <capsuleGeometry args={[0.035, 0.24, 6, 8]} />
        <meshStandardMaterial color="#e9c3a7" roughness={0.88} />
      </mesh>

      <mesh castShadow rotation={[0.08, 0, -0.55]} position={[0.14, 0.64, 0.14]}>
        <capsuleGeometry args={[0.035, 0.24, 6, 8]} />
        <meshStandardMaterial color="#e9c3a7" roughness={0.88} />
      </mesh>

      <mesh castShadow rotation={[1.15, 0.08, 0.08]} position={[-0.09, 0.26, 0.18]}>
        <capsuleGeometry args={[0.04, 0.3, 6, 8]} />
        <meshStandardMaterial color="#3d332d" roughness={0.9} />
      </mesh>

      <mesh castShadow rotation={[1.15, -0.08, -0.08]} position={[0.09, 0.26, 0.18]}>
        <capsuleGeometry args={[0.04, 0.3, 6, 8]} />
        <meshStandardMaterial color="#3d332d" roughness={0.9} />
      </mesh>

      <Text
        position={[0, 1.52, 0]}
        fontSize={0.16}
        color="#f6e4cf"
        anchorX="center"
        anchorY="middle"
        outlineColor="#120f0d"
        outlineWidth={0.02}
      >
        {occupant.name}
      </Text>
    </group>
  );
}

function DeskCluster({
  seat,
  selectedSeatId,
  hoveredSeatId,
  occupant,
  onSeatSelect,
  onSeatHover,
  onSeatBlocked,
}: {
  seat: SeatDefinition;
  selectedSeatId: SeatId | null;
  hoveredSeatId: SeatId | null;
  occupant: Occupant | null;
  onSeatSelect: (seatId: SeatId) => void;
  onSeatHover: (seatId: SeatId | null) => void;
  onSeatBlocked: (seatId: SeatId) => void;
}) {
  const isActive = selectedSeatId === seat.id;
  const isHovered = hoveredSeatId === seat.id;
  const isTakenByGuest = occupant?.kind === "guest";
  const glowColor = isTakenByGuest
    ? "#8a6b68"
    : isActive
      ? "#ffbf7a"
      : isHovered
        ? "#ffe2a8"
        : "#d9b68a";

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSeatHover(seat.id);
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSeatHover(null);
  };

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (occupant && occupant.kind === "guest") {
      onSeatBlocked(seat.id);
      return;
    }

    onSeatSelect(seat.id);
  };

  return (
    <group>
      <group position={seat.tablePosition}>
        <mesh castShadow receiveShadow position={[0, 0.82, 0]}>
          <boxGeometry args={[1.8, 0.16, 1.05]} />
          <meshStandardMaterial color="#8f674a" roughness={0.66} />
        </mesh>

        {[
          [-0.68, 0.38, -0.34],
          [0.68, 0.38, -0.34],
          [-0.68, 0.38, 0.34],
          [0.68, 0.38, 0.34],
        ].map((leg, index) => (
          <mesh key={index} castShadow receiveShadow position={leg as [number, number, number]}>
            <boxGeometry args={[0.12, 0.76, 0.12]} />
            <meshStandardMaterial color="#5d4637" roughness={0.7} />
          </mesh>
        ))}

        <mesh castShadow position={[0.46, 1.04, -0.12]}>
          <boxGeometry args={[0.22, 0.18, 0.18]} />
          <meshStandardMaterial color="#d7c1a4" roughness={0.4} />
        </mesh>

        <mesh castShadow position={[0.54, 1.18, -0.12]} rotation={[0, 0, -0.32]}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 10]} />
          <meshStandardMaterial color="#201916" />
        </mesh>

        <mesh castShadow position={[0.63, 1.3, -0.12]} rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.12, 0.18, 12]} />
          <meshStandardMaterial color="#d6a067" emissive="#6c341d" emissiveIntensity={0.18} />
        </mesh>
      </group>

      <group position={seat.chairPosition}>
        <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[0.68, 0.12, 0.68]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={isTakenByGuest ? 0.18 : isActive ? 0.28 : isHovered ? 0.12 : 0.02}
          />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.72, -0.26]}>
          <boxGeometry args={[0.68, 0.82, 0.12]} />
          <meshStandardMaterial color="#63483b" roughness={0.74} />
        </mesh>

        {[
          [-0.24, 0.16, -0.24],
          [0.24, 0.16, -0.24],
          [-0.24, 0.16, 0.24],
          [0.24, 0.16, 0.24],
        ].map((leg, index) => (
          <mesh key={index} castShadow receiveShadow position={leg as [number, number, number]}>
            <boxGeometry args={[0.08, 0.32, 0.08]} />
            <meshStandardMaterial color="#49352c" roughness={0.82} />
          </mesh>
        ))}

        <mesh
          position={[0, 0.82, 0.04]}
          onClick={handleSelect}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <boxGeometry args={[0.9, 1.7, 0.9]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {isActive ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.42, 0.54, 32]} />
            <meshStandardMaterial
              color="#ffcc8b"
              emissive="#ffb25c"
              emissiveIntensity={0.52}
              side={DoubleSide}
            />
          </mesh>
        ) : isTakenByGuest ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.42, 0.54, 32]} />
            <meshStandardMaterial
              color="#8b6c67"
              emissive="#5b2f2f"
              emissiveIntensity={0.32}
              side={DoubleSide}
            />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

function RoomDecor() {
  return (
    <group>
      <Shelf position={[-5.15, 1.35, 2.25]} />
      <Shelf position={[5.15, 1.35, 2.25]} />
      <Plant position={[-5.25, 0, -3.6]} />
      <Plant position={[5.25, 0, -3.6]} />
      <PendantLamp position={[-3.2, 4.8, -2.5]} />
      <PendantLamp position={[3.2, 4.8, -2.5]} />
      <PendantLamp position={[-2.25, 4.7, 1.7]} />
      <PendantLamp position={[2.25, 4.7, 1.7]} />
    </group>
  );
}

function StudyRoom({
  selectedSeatId,
  occupants,
  onSeatSelect,
  onSeatBlocked,
}: {
  selectedSeatId: SeatId | null;
  occupants: Occupant[];
  onSeatSelect: (seatId: SeatId) => void;
  onSeatBlocked: (seatId: SeatId) => void;
}) {
  const [hoveredSeatId, setHoveredSeatId] = useState<SeatId | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const selectedSeat = seatDefinitions.find((seat) => seat.id === selectedSeatId) ?? null;
  const occupantBySeat = useMemo(
    () =>
      occupants.reduce(
        (map, occupant) => {
          map[occupant.seatId] = occupant;
          return map;
        },
        {} as Partial<Record<SeatId, Occupant>>,
      ),
    [occupants],
  );

  return (
    <>
      <color attach="background" args={["#120f0d"]} />
      <fog attach="fog" args={["#120f0d", 8, 22]} />

      <ambientLight intensity={0.48} color="#ffe8c7" />
      <directionalLight
        position={[4.5, 6.5, 1.8]}
        intensity={0.7}
        color="#ffd7a1"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 4.5, 3.2]} intensity={8} distance={14} decay={2.4} color="#ffb36b" />

      <RoomShell />
      <RoomDecor />

      {seatDefinitions.map((seat) => (
        <DeskCluster
          key={seat.id}
          seat={seat}
          selectedSeatId={selectedSeatId}
          hoveredSeatId={hoveredSeatId}
          occupant={occupantBySeat[seat.id] ?? null}
          onSeatSelect={onSeatSelect}
          onSeatHover={setHoveredSeatId}
          onSeatBlocked={onSeatBlocked}
        />
      ))}

      {seatDefinitions.map((seat) => {
        const occupant = occupantBySeat[seat.id];

        if (!occupant) {
          return null;
        }

        return <OccupantAvatar key={occupant.id} occupant={occupant} chairPosition={seat.chairPosition} />;
      })}

      <CameraRig controlsRef={controlsRef} selectedSeat={selectedSeat} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        enabled={!selectedSeat}
        minDistance={5.5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 4.5}
        target={[0, 1.1, 0]}
      />
    </>
  );
}

export default function OasisCanvas({
  selectedSeat,
  occupants,
  onSeatSelect,
  onSeatBlocked,
}: OasisCanvasProps) {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [7.4, 5.2, 8.1], fov: 42 }}
      gl={{ antialias: true }}
    >
      <StudyRoom
        selectedSeatId={selectedSeat}
        occupants={occupants}
        onSeatSelect={onSeatSelect}
        onSeatBlocked={onSeatBlocked}
      />
    </Canvas>
  );
}
