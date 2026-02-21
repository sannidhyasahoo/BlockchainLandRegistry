/**
 * components/StatusBadge.jsx
 */
import { STATUS } from "../constants";

export default function StatusBadge({ status }) {
  const s = STATUS[status] ?? { label: "Unknown", color: "#888", bg: "#111" };
  return (
    <span
      className="status-badge"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}
    >
      {status === 0 && "● "}
      {status === 1 && "◌ "}
      {status === 2 && "✓ "}
      {status === 3 && "⚠ "}
      {s.label}
    </span>
  );
}
