// Positions an onboarding spotlight callout (see splash.js SPLASH_CALLOUTS)
// relative to the actual target element it points at, instead of a hardcoded
// pixel offset (#216) — so it stays correctly placed across screen sizes.

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(value, hi))
}

// targetRect/calloutSize are plain {left,top,right,bottom}/{width,height} —
// pass DOMRect-likes (e.g. from getBoundingClientRect()) or plain objects.
// opts.side: 'below' (default) | 'above' | 'left' | 'right'.
// opts.align: 'left' (default) | 'right' — only applies to 'below'/'above'.
export function calloutPosition(targetRect, viewport, calloutSize, opts = {}) {
  const gap = opts.gap ?? 10
  const margin = opts.margin ?? 8
  const side = opts.side || 'below'

  let top
  if (side === 'above') top = targetRect.top - gap - calloutSize.height
  else if (side === 'below') top = targetRect.bottom + gap
  else top = targetRect.top

  let left
  if (side === 'left') left = targetRect.left - gap - calloutSize.width
  else if (side === 'right') left = targetRect.right + gap
  else left = opts.align === 'right' ? targetRect.right - calloutSize.width : targetRect.left

  return {
    top: clamp(top, margin, viewport.height - calloutSize.height - margin),
    left: clamp(left, margin, viewport.width - calloutSize.width - margin),
  }
}

// Bounding box enclosing every given rect — used to anchor one callout to a
// cluster of target elements (e.g. the FAB stack) rather than a single one.
export function unionRect(rects) {
  const left = Math.min(...rects.map((r) => r.left))
  const top = Math.min(...rects.map((r) => r.top))
  const right = Math.max(...rects.map((r) => r.right))
  const bottom = Math.max(...rects.map((r) => r.bottom))
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}
