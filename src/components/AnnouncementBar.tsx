import { useEffect, useRef, useState } from "react";
import "./AnnouncementBar.css";

interface AnnouncementBarProps {
  onClose?: () => void;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export default function AnnouncementBar({
  onClose,
  ctaHref = "#",
  onCtaClick,
}: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!visible) {
      document.documentElement.style.setProperty("--announcement-h", "0px");
      return;
    }

    const el = barRef.current;
    if (!el) return;

    const measureAndSet = () => {
      const height = el.offsetHeight;
      document.documentElement.style.setProperty(
        "--announcement-h",
        `${height}px`
      );
    };

    measureAndSet();

    const observer = new ResizeObserver(() => {
      if (!closing) {
        measureAndSet();
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--announcement-h", "0px");
    };
  }, [visible, closing]);

  const handleDismiss = () => {
    setClosing(true);
    // Smoothly reset the navbar top offset in sync with exit animation
    document.documentElement.style.setProperty("--announcement-h", "0px");
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 320);
  };

  if (!visible) return null;

  return (
    <aside
      ref={barRef}
      className={`announcement-bar${closing ? " announcement-bar--closing" : ""}`}
      role="banner"
      aria-label="Announcement"
    >
      <div className="announcement-bar__content">
        <span className="announcement-bar__text">
          <strong className="announcement-bar__strong">Introducing Flash</strong>
          <span className="announcement-bar__desc-desktop">
            {" "}— The fastest path to actionable investment intelligence.
          </span>
          <span className="announcement-bar__desc-mobile">
            {" "}— Fast investment intelligence.
          </span>
        </span>
        <a
          href={ctaHref}
          className="announcement-bar__cta"
          onClick={(e) => {
            if (onCtaClick) {
              e.preventDefault();
              onCtaClick();
            }
          }}
        >
          <span className="announcement-bar__cta-desktop">Explore now</span>
          <span className="announcement-bar__cta-mobile">Explore</span>{" "}
          <span className="announcement-bar__arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>

      <button
        type="button"
        className="announcement-bar__close"
        onClick={handleDismiss}
        aria-label="Close announcement"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 2L11 11M2 11L11 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </aside>
  );
}
