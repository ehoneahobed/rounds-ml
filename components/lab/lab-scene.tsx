"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LACTATE_CUT, LACTATE_MAX, LACTATE_MIN, AGE_CUT, AGE_MAX, AGE_MIN, type Admission } from "@/lib/lab/teaching-tree";

const SPAN = 8;

/** Map a lactate value onto the table's x axis. */
export function lactateToX(lactate: number): number {
  return ((lactate - LACTATE_MIN) / (LACTATE_MAX - LACTATE_MIN)) * SPAN - SPAN / 2;
}

/** Map an age onto the table's z axis. Age increases toward the back of the table. */
export function ageToZ(age: number): number {
  return ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * SPAN - SPAN / 2;
}

type SceneProps = {
  rows: Admission[];
  showLactateWall: boolean;
  showAgeWall: boolean;
  regions: "none" | "first" | "both";
  probe: { lactate: number; age: number } | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

/**
 * The teaching table: patients as spheres, cuts as walls.
 * Loaded only in the browser. The parent owns which walls are visible.
 */
export function LabCanvas(props: SceneProps) {
  return (
    <Canvas camera={{ position: [7.2, 6.4, 7.2], fov: 38 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={["#101820"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 10, 4]} intensity={1.15} />
      <Table {...props} />
      <OrbitControls makeDefault enablePan maxPolarAngle={Math.PI / 2.05} minDistance={5} maxDistance={16} target={[0, 0.4, 0]} />
    </Canvas>
  );
}

function Table({ rows, showLactateWall, showAgeWall, regions, probe, selectedIndex, onSelect }: SceneProps) {
  const xCut = lactateToX(LACTATE_CUT);
  const zCut = ageToZ(AGE_CUT);
  const x0 = lactateToX(LACTATE_MIN);
  const x1 = lactateToX(LACTATE_MAX);
  const z0 = ageToZ(AGE_MIN);
  const z1 = ageToZ(AGE_MAX);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN + 0.4, SPAN + 0.4]} />
        <meshStandardMaterial color="#18222e" />
      </mesh>
      <gridHelper args={[SPAN, 8, "#3d4a5c", "#243140"]} position={[0, 0.01, 0]} />
      {regions === "first" || regions === "both" ? (
        <Slab x0={x0} x1={xCut} z0={z0} z1={z1} color="#1c4a3a" />
      ) : null}
      {regions === "first" ? <Slab x0={xCut} x1={x1} z0={z0} z1={z1} color="#3a3428" /> : null}
      {regions === "both" ? (
        <>
          <Slab x0={xCut} x1={x1} z0={z0} z1={zCut} color="#1c4a3a" />
          <Slab x0={xCut} x1={x1} z0={zCut} z1={z1} color="#6a3030" />
        </>
      ) : null}
      {showLactateWall ? <Wall axis="x" at={xCut} from={z0} to={z1} /> : null}
      {showAgeWall ? <Wall axis="z" at={zCut} from={xCut} to={x1} /> : null}
      {rows.map((row, index) => (
        <Patient
          key={`${row.lactate}-${row.age}`}
          row={row}
          selected={selectedIndex === index}
          onSelect={() => onSelect(index)}
        />
      ))}
      {probe ? (
        <mesh position={[lactateToX(probe.lactate), 0.42, ageToZ(probe.age)]}>
          <sphereGeometry args={[0.22, 28, 28]} />
          <meshStandardMaterial color="#e2b340" emissive="#8a6a20" emissiveIntensity={0.35} />
        </mesh>
      ) : null}
    </group>
  );
}

/** A flat region of the table, slightly above the grid so the color reads. */
function Slab({ x0, x1, z0, z1, color }: { x0: number; x1: number; z0: number; z1: number; color: string }) {
  const width = Math.abs(x1 - x0);
  const depth = Math.abs(z1 - z0);
  return (
    <mesh position={[(x0 + x1) / 2, 0.03, (z0 + z1) / 2]}>
      <boxGeometry args={[width, 0.04, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * A cut drawn as a translucent wall.
 * `axis: "x"` is a lactate cut (constant x). `axis: "z"` is an age cut (constant z).
 */
function Wall({ axis, at, from, to }: { axis: "x" | "z"; at: number; from: number; to: number }) {
  const span = Math.abs(to - from);
  const mid = (from + to) / 2;
  const position: [number, number, number] = axis === "x" ? [at, 1.05, mid] : [mid, 1.05, at];
  const args: [number, number, number] = axis === "x" ? [0.045, 2.1, span] : [span, 2.1, 0.045];
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#e7d7a8" transparent opacity={0.42} />
    </mesh>
  );
}

function Patient({ row, selected, onSelect }: { row: Admission; selected: boolean; onSelect: () => void }) {
  const color = row.y === 1 ? "#c4564a" : "#2f9d78";
  return (
    <mesh
      position={[lactateToX(row.lactate), 0.28, ageToZ(row.age)]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <sphereGeometry args={[selected ? 0.24 : 0.18, 24, 24]} />
      <meshStandardMaterial color={color} emissive={selected ? "#ffffff" : "#000000"} emissiveIntensity={selected ? 0.18 : 0} />
    </mesh>
  );
}
