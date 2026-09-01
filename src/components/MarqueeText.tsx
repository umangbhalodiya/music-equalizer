import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface MarqueeTextProps {
  text: string
  className?: string
  style?: CSSProperties
}

// Pixels of scroll per second — keeps the marquee speed consistent
// regardless of how long the track name is.
const SPEED_PX_PER_SEC = 40
const MIN_DURATION_SEC = 4

function MarqueeText({ text, className, style }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [duration, setDuration] = useState(MIN_DURATION_SEC)

  useEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const isOverflowing = measure.scrollWidth > container.clientWidth
    setOverflowing(isOverflowing)
    if (isOverflowing) {
      setDuration(Math.max(MIN_DURATION_SEC, measure.scrollWidth / SPEED_PX_PER_SEC))
    }
  }, [text])

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className ?? ''}`} style={style}>
      {overflowing ? (
        <div className="inline-flex w-max" style={{ animation: `yt-marquee ${duration}s linear infinite` }}>
          <span ref={measureRef} className="pr-10">
            {text}
          </span>
          <span aria-hidden className="pr-10">
            {text}
          </span>
        </div>
      ) : (
        <span ref={measureRef} className="block text-center">
          {text}
        </span>
      )}
    </div>
  )
}

export default MarqueeText
