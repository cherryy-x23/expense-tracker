// Decorative sticker wallpaper: money & expense themed, die-cut look (see .sticker in styles.css)
const EMOJI = [
  ["💰", 3, 10, 66, -12], ["💸", 90, 8, 58, 14], ["🧾", 80, 30, 60, -8], ["🪙", 6, 36, 52, 18],
  ["💳", 92, 52, 56, -14], ["🏦", 4, 62, 60, 8], ["📈", 86, 74, 62, -6], ["🛒", 12, 86, 56, 12],
  ["🍔", 50, 92, 50, -10], ["✈️", 70, 90, 50, 16], ["🧮", 28, 4, 50, 10], ["💵", 62, 3, 56, -16],
  ["🐷", 94, 28, 54, 6], ["🎁", 2, 82, 46, -18], ["☕", 40, 95, 44, 8], ["🏷️", 18, 20, 44, -20],
];
const TAGS = [
  ["PAID ✓", 15, 52, -9, "#3ddc97"], ["BUDGET!", 76, 14, 7, "#ffd93d"],
  ["SAVE ₹", 84, 88, -7, "#ff9ec4"], ["−₹250", 22, 72, 8, "#a99bff"],
];

export default function Stickers() {
  return (
    <div className="stickers" aria-hidden="true">
      {EMOJI.map(([e, x, y, size, rot], i) => (
        <span key={i} className="sticker" style={{ left: `${x}%`, top: `${y}%`, fontSize: size, transform: `rotate(${rot}deg)` }}>{e}</span>
      ))}
      {TAGS.map(([t, x, y, rot, bg], i) => (
        <span key={t} className={"tag" + (i > 1 ? " hide-sm" : "")} style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${rot}deg)`, background: bg }}>{t}</span>
      ))}
    </div>
  );
}
