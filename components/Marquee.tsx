export default function Marquee() {
  const words = [
    "Hanubees", "★", "Design", "★", "3D", "★", "Motion", "★",
    "WebGL", "★", "Precision", "★", "Liquid", "★", "Craft", "★",
    "Hanubees", "★", "Design", "★", "3D", "★", "Motion", "★",
    "WebGL", "★", "Precision", "★", "Liquid", "★", "Craft", "★",
  ];

  return (
    <div
      className="overflow-hidden py-5 border-y"
      style={{ borderColor: "rgba(245,166,35,0.2)", background: "rgba(245,166,35,0.04)" }}
    >
      <div className="flex whitespace-nowrap marquee-inner">
        {words.map((w, i) => (
          <span
            key={i}
            className="font-berthold text-sm mx-5"
            style={{ color: i % 2 === 0 ? "var(--fg)" : "var(--amber)" }}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
