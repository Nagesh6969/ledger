export default function CategoryBadge({ category }) {
  if (!category) return null;
  const color = category.color || "#1B4332";

  return (
    <span
      className="tag-pill"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category.name}
    </span>
  );
}
