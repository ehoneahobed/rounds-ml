import figures from "@/data/figures.json";

type TraceNode = {
  leaf: boolean;
  prediction: number;
  feature?: string;
  threshold?: number;
  left?: TraceNode;
  right?: TraceNode;
};

type Region = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  prediction: number;
};

const X_MIN = 0;
const X_MAX = 4;
const Y_MIN = 30;
const Y_MAX = 100;

/**
 * The eight-row teaching tree as boxes in the lactate × age plane.
 * Left of a split is `feature <= threshold`.
 */
export function PartitionFigure() {
  const tree = figures.trace.tree as TraceNode;
  const regions: Region[] = [];
  collectRegions(tree, X_MIN, X_MAX, Y_MIN, Y_MAX, regions);

  const width = 640;
  const height = 380;
  const pad = { left: 52, right: 16, top: 16, bottom: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const sx = (value: number) => pad.left + ((value - X_MIN) / (X_MAX - X_MIN)) * innerW;
  const sy = (value: number) => pad.top + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * innerH;

  return (
    <figure className="my-6">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-3xl" role="img" aria-label="Partition of lactate and age into three leaves">
        <rect x="0" y="0" width={width} height={height} fill="#f7f4ee" />
        {regions.map((region, index) => (
          <rect
            key={index}
            x={sx(region.x0)}
            y={sy(region.y1)}
            width={Math.max(0, sx(region.x1) - sx(region.x0))}
            height={Math.max(0, sy(region.y0) - sy(region.y1))}
            fill={region.prediction === 1 ? "#f3d2cc" : "#d5ebe3"}
            stroke="#1c1916"
            strokeOpacity="0.25"
          />
        ))}
        {figures.trace.rows.map((row, index) => (
          <g key={index}>
            <circle cx={sx(row.lactate)} cy={sy(row.age)} r="6" fill={row.y === 1 ? "#8d342c" : "#0f5c45"} stroke="#f7f4ee" strokeWidth="1.5" />
          </g>
        ))}
        <text x={width / 2} y={height - 12} textAnchor="middle" fill="#5e584e" fontSize="13" fontFamily="Source Sans 3, sans-serif">
          lactate
        </text>
        <text
          x="16"
          y={height / 2}
          textAnchor="middle"
          fill="#5e584e"
          fontSize="13"
          fontFamily="Source Sans 3, sans-serif"
          transform={`rotate(-90 16 ${height / 2})`}
        >
          age
        </text>
      </svg>
      <figcaption className="mt-2 max-w-3xl text-sm text-muted">
        Green points did not deteriorate. Rust points did. Pale boxes are leaves that predict 0. The rose box predicts 1. The cuts are lactate 1.80 and, on the high-lactate side, age 64.50.
      </figcaption>
    </figure>
  );
}

function collectRegions(node: TraceNode, x0: number, x1: number, y0: number, y1: number, out: Region[]): void {
  if (node.leaf || node.threshold === undefined || !node.left || !node.right) {
    out.push({ x0, x1, y0, y1, prediction: node.prediction });
    return;
  }
  if (node.feature === "lactate") {
    collectRegions(node.left, x0, node.threshold, y0, y1, out);
    collectRegions(node.right, node.threshold, x1, y0, y1, out);
    return;
  }
  collectRegions(node.left, x0, x1, y0, node.threshold, out);
  collectRegions(node.right, x0, x1, node.threshold, y1, out);
}
