"use client";

import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import {
  AGE_CUT,
  LACTATE_CUT,
  type Admission,
  type Stage,
} from "@/lib/lab/teaching-tree";

type V3 = [number, number, number];

/** A card in the diagram. Questions have no patients. Leaves and mixed nodes do. */
type NodeId = "all" | "root" | "low" | "high" | "age" | "young" | "old";

type SceneProps = {
  rows: Admission[];
  stage: Stage;
  probe: { lactate: number; age: number } | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

const CARD = {
  all: { at: [0.15, 0.55, 0] as V3, w: 3.3, h: 1.7 },
  root: { at: [0.05, 2.15, 0] as V3, w: 2.0, h: 0.72 },
  low: { at: [-1.45, 0.2, 0] as V3, w: 1.5, h: 1.16 },
  high: { at: [1.55, 0.2, 0] as V3, w: 1.65, h: 1.16 },
  age: { at: [1.45, 0.95, 0] as V3, w: 1.85, h: 0.7 },
  young: { at: [0.5, -0.62, 0] as V3, w: 1.42, h: 1.12 },
  old: { at: [2.35, -0.62, 0] as V3, w: 1.42, h: 1.12 },
};

/**
 * Which node a patient is standing on for the current stage.
 * Before any question, everyone shares the root pile. After a question, they sit on the child they reached.
 */
export function nodeFor(row: Pick<Admission, "lactate" | "age">, stage: Stage): NodeId {
  if (stage === "none") return "all";
  if (row.lactate <= LACTATE_CUT) return "low";
  if (stage === "first") return "high";
  return row.age <= AGE_CUT ? "young" : "old";
}

/**
 * The teaching tree as a diagram: a question on each branch, patients on the node they have reached.
 * Loaded only in the browser. The parent decides how many questions are visible.
 */
export function LabCanvas(props: SceneProps) {
  return (
    <Canvas camera={{ position: [0.4, 0.62, 9.6], fov: 32 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={["#101820"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 8, 6]} intensity={1.05} />
      <Suspense fallback={null}>
        <Diagram {...props} />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan
        target={[0.4, 0.62, 0]}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.65}
        minDistance={6}
        maxDistance={13}
      />
    </Canvas>
  );
}

function Diagram({ rows, stage, probe, selectedIndex, onSelect }: SceneProps) {
  const focus = probe ?? (selectedIndex !== null ? rows[selectedIndex] : null);
  const focusNode = focus ? nodeFor(focus, stage) : null;
  const groups = useMemo(() => groupRows(rows, stage), [rows, stage]);

  return (
    <group>
      {stage === "none" ? (
        <NodeCard
          id="all"
          tone="mixed"
          title="8 patients"
          subtitle="6 label 0 · 2 label 1"
          active={focusNode === "all"}
          members={groups.all ?? []}
          rows={rows}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          probeHere={probe !== null}
        />
      ) : (
        <NodeCard id="root" tone="question" title="lactate ≤ 1.80" subtitle="ask everyone" active={false} members={[]} rows={rows} selectedIndex={null} onSelect={onSelect} probeHere={false} />
      )}
      {stage !== "none" ? (
        <>
          <Edge from="root" to="low" label="yes" hot={focusNode === "low"} />
          <NodeCard
            id="low"
            tone="zero"
            title="predict 0"
            subtitle="p = 1.00 · n = 4"
            active={focusNode === "low"}
            members={groups.low ?? []}
            rows={rows}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            probeHere={probe !== null && focusNode === "low"}
          />
        </>
      ) : null}
      {stage === "first" ? (
        <>
          <Edge from="root" to="high" label="no" hot={focusNode === "high"} />
          <NodeCard
            id="high"
            tone="mixed"
            title="lactate > 1.80"
            subtitle="2 and 2, still mixed"
            active={focusNode === "high"}
            members={groups.high ?? []}
            rows={rows}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            probeHere={probe !== null && focusNode === "high"}
          />
        </>
      ) : null}
      {stage === "both" ? (
        <>
          <Edge from="root" to="age" label="no" hot={focusNode === "young" || focusNode === "old"} />
          <NodeCard id="age" tone="question" title="age ≤ 64.50" subtitle="only this side" active={false} members={[]} rows={rows} selectedIndex={null} onSelect={onSelect} probeHere={false} />
          <Edge from="age" to="young" label="yes" hot={focusNode === "young"} />
          <Edge from="age" to="old" label="no" hot={focusNode === "old"} />
          <NodeCard
            id="young"
            tone="zero"
            title="predict 0"
            subtitle="p = 1.00 · n = 2"
            active={focusNode === "young"}
            members={groups.young ?? []}
            rows={rows}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            probeHere={probe !== null && focusNode === "young"}
          />
          <NodeCard
            id="old"
            tone="one"
            title="predict 1"
            subtitle="p = 1.00 · n = 2"
            active={focusNode === "old"}
            members={groups.old ?? []}
            rows={rows}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            probeHere={probe !== null && focusNode === "old"}
          />
        </>
      ) : null}
    </group>
  );
}

/** Bucket training rows by the node they occupy, preserving their original index for clicks. */
function groupRows(rows: Admission[], stage: Stage): Partial<Record<NodeId, number[]>> {
  const groups: Partial<Record<NodeId, number[]>> = {};
  rows.forEach((row, index) => {
    const id = nodeFor(row, stage);
    const list = groups[id] ?? [];
    list.push(index);
    groups[id] = list;
  });
  return groups;
}

const TONE = {
  question: "#1c2836",
  zero: "#1c4a3a",
  one: "#6a3030",
  mixed: "#3a3428",
} as const;

function NodeCard({
  id,
  tone,
  title,
  subtitle,
  active,
  members,
  rows,
  selectedIndex,
  onSelect,
  probeHere,
}: {
  id: NodeId;
  tone: keyof typeof TONE;
  title: string;
  subtitle: string;
  active: boolean;
  members: number[];
  rows: Admission[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  probeHere: boolean;
}) {
  const { at, w, h } = CARD[id];
  const slots = slotOffsets(members.length, w);
  return (
    <group position={at}>
      {active ? (
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[w + 0.12, h + 0.12, 0.05]} />
          <meshStandardMaterial color="#e2b340" emissive="#8a6a20" emissiveIntensity={0.4} />
        </mesh>
      ) : null}
      <RoundedBox args={[w, h, 0.1]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color={TONE[tone]} />
      </RoundedBox>
      <Text position={[0, members.length > 0 ? 0.34 : 0.1, 0.08]} fontSize={0.16} color="#f4f0e8" anchorX="center" anchorY="middle" maxWidth={w - 0.25}>
        {title}
      </Text>
      <Text position={[0, members.length > 0 ? 0.12 : -0.14, 0.08]} fontSize={0.11} color="#d9d2c5" anchorX="center" anchorY="middle" maxWidth={w - 0.25}>
        {subtitle}
      </Text>
      {members.map((index, slot) => {
        const row = rows[index];
        if (!row) return null;
        const [x, y] = slots[slot] ?? [0, -0.28];
        const selected = selectedIndex === index;
        return (
          <mesh
            key={index}
            position={[x, y, 0.16]}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(index);
            }}
          >
            <sphereGeometry args={[selected ? 0.16 : 0.12, 24, 24]} />
            <meshStandardMaterial
              color={row.y === 1 ? "#c4564a" : "#2f9d78"}
              emissive={selected ? "#ffffff" : "#000000"}
              emissiveIntensity={selected ? 0.25 : 0}
            />
          </mesh>
        );
      })}
      {probeHere ? (
        <mesh position={[w / 2 - 0.22, h / 2 - 0.2, 0.18]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#e2b340" emissive="#8a6a20" emissiveIntensity={0.45} />
        </mesh>
      ) : null}
    </group>
  );
}

/** Evenly spaced seats along the lower half of a card. */
function slotOffsets(count: number, width: number): Array<[number, number]> {
  if (count === 0) return [];
  const cols = Math.min(4, count);
  const gap = Math.min(0.38, (width - 0.4) / cols);
  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const rowCount = Math.min(cols, count - row * cols);
    const x = (col - (rowCount - 1) / 2) * gap;
    const y = -0.22 - row * 0.32;
    return [x, y];
  });
}

/** A branch from the bottom of one card to the top of the next, labeled yes or no. */
function Edge({ from, to, label, hot }: { from: NodeId; to: NodeId; label: string; hot: boolean }) {
  const startCard = CARD[from];
  const endCard = CARD[to];
  const start: V3 = [startCard.at[0], startCard.at[1] - startCard.h / 2, 0.02];
  const end: V3 = [endCard.at[0], endCard.at[1] + endCard.h / 2, 0.02];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];
  const length = Math.hypot(dx, dy, dz);
  const mid: V3 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, 0.08];
  const direction = new Vector3(dx, dy, dz).normalize();
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction);
  const side = end[0] >= start[0] ? 0.34 : -0.34;
  return (
    <group>
      <mesh position={mid} quaternion={quaternion}>
        <cylinderGeometry args={[hot ? 0.035 : 0.02, hot ? 0.035 : 0.02, length, 10]} />
        <meshStandardMaterial color={hot ? "#e2b340" : "#8a8072"} emissive={hot ? "#8a6a20" : "#000000"} emissiveIntensity={hot ? 0.35 : 0} />
      </mesh>
      <Text position={[mid[0] + side, mid[1], 0.1]} fontSize={0.13} color={hot ? "#e2b340" : "#e7e1d4"} anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}
