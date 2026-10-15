import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import "./MemberCard.css";

// The card a reader gets for joining the waitlist (WaitlistDialog, once the form
// is in): a silver metal card after a payment card's layout — sunburst lines
// round a soft disc, a notch in the edge, a chip — with Flash's mark top left,
// QuantHive's lockup in the far corner and the reader's name engraved along the
// foot, letter by letter. Landscape on wider screens, portrait on phones
// (MemberCard.css).
//
// Over it, the pointer tilts the card a little and moves the light across the
// metal; on touch screens it sways gently on its own.

const MAX_TILT = 4; // degrees: a hint of give, no more

export default function MemberCard({ name }: { name: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // The pointer's place over the card, -1..1 each way, eased into the tilt and
  // the light by CSS transitions (MemberCard.css).
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card) return;
    const box = card.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 2 - 1;
    const y = ((event.clientY - box.top) / box.height) * 2 - 1;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty("--rx", `${(-y * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((x + 1) * 50).toFixed(1)}%`);
      card.style.setProperty("--my", `${((y + 1) * 50).toFixed(1)}%`);
      card.dataset.tilt = "";
    });
  };

  const onLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(frame.current);
    delete card.dataset.tilt;
    for (const property of ["--rx", "--ry", "--mx", "--my"]) card.style.removeProperty(property);
  };

  // Engraved a letter at a time: each one arrives as a hot, bright mark and
  // cools into the metal (MemberCard.css). Long names set a little smaller.
  const letters = Array.from(name.trim() || "Early member");
  const size = letters.length > 22 ? 0.78 : letters.length > 16 ? 0.88 : 1;

  return (
    <div className="member-card__stage" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="member-card" ref={cardRef}>
        <div className="member-card__body">
          <div className="member-card__metal" aria-hidden />
          <div className="member-card__shine" aria-hidden />

          <span className="member-card__flash" aria-hidden />
          <span className="member-card__chip" aria-hidden>
            <svg className="member-card__contactless" viewBox="0 0 16 22">
              <path d="M3 6.5a7 7 0 0 1 0 9M6.5 4a10.5 10.5 0 0 1 0 14M10 1.5a14 14 0 0 1 0 19" />
            </svg>
            <span className="member-card__chip-plate" />
          </span>

          <div className="member-card__foot">
            <span className="member-card__label">Early access</span>
            <span className="member-card__name" style={{ "--size": size } as CSSProperties} aria-label={name}>
              {letters.map((letter, index) => (
                <span key={index} style={{ "--i": index } as CSSProperties} aria-hidden>
                  {letter === " " ? " " : letter}
                </span>
              ))}
            </span>
          </div>

          <span className="member-card__brand" role="img" aria-label="QuantHive" />
        </div>
      </div>
    </div>
  );
}
