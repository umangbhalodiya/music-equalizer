import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "rizzui";

export interface VerticalRangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  formatter?: (value: number) => string;
}

const TRACK_HEIGHT = 140;
const TRACK_WIDTH = 10;
const THUMB_SIZE = 18;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function VerticalRangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  formatter,
}: VerticalRangeSliderProps) {
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  // Holds the active drag gesture's teardown, so unmounting mid-drag still
  // removes the window listeners.
  const endDragRef = useRef<(() => void) | null>(null);

  const ratio = (value - min) / (max - min);
  const displayValue = formatter ? formatter(value) : `${value}${unit}`;

  const commitValue = useCallback(
    (raw: number) => {
      const stepped = Math.round(raw / step) * step;
      onChange(clamp(stepped, min, max));
    },
    [step, min, max, onChange],
  );

  const valueFromClientY = useCallback(
    (clientY: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return value;
      const positionRatio = clamp((rect.bottom - clientY) / rect.height, 0, 1);
      return min + positionRatio * (max - min);
    },
    [min, max, value],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    trackRef.current?.focus();
    setDragging(true);
    document.body.style.userSelect = "none";
    commitValue(valueFromClientY(e.clientY));

    const handleMove = (moveEvent: PointerEvent) => {
      commitValue(valueFromClientY(moveEvent.clientY));
    };

    const handleUp = () => {
      setDragging(false);
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      endDragRef.current = null;
    };

    endDragRef.current = handleUp;
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  useEffect(() => {
    return () => {
      endDragRef.current?.();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        e.preventDefault();
        commitValue(value + step);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        e.preventDefault();
        commitValue(value - step);
        break;
      case "Home":
        e.preventDefault();
        commitValue(min);
        break;
      case "End":
        e.preventDefault();
        commitValue(max);
        break;
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ fontFamily: "var(--yt-font)" }}
    >
      <Text
        className="mt-2 text-center text-xs font-medium tracking-wide"
        style={{ color: "var(--yt-text-secondary)" }}
      >
        {label}
      </Text>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className="eq-knob relative flex justify-center rounded-full"
        style={{
          width: THUMB_SIZE + 8,
          height: TRACK_HEIGHT,
          cursor: dragging ? "ns-resize" : undefined,
        }}
      >
        <div
          className="pointer-events-none absolute top-0 rounded-full"
          style={{
            width: TRACK_WIDTH,
            height: "100%",
            background: "var(--eq-knob-bg)",
            border: "1px solid var(--eq-knob-bg-highlight)",
            overflow: "hidden",
          }}
        >
          <div
            className="absolute bottom-0 left-0 w-full rounded-full"
            style={{
              height: `${ratio * 100}%`,
              background: "var(--eq-knob-accent)",
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            bottom: `calc(${ratio * 100}% - ${THUMB_SIZE / 2}px)`,
            background: "var(--eq-knob-accent)",
            border: "2px solid var(--eq-knob-bg-highlight)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      <span
        className="text-sm font-semibold"
        style={{ color: "var(--yt-text-primary)" }}
      >
        {displayValue}
      </span>
    </div>
  );
}

export default VerticalRangeSlider;
