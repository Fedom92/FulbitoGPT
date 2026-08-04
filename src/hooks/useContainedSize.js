import { useLayoutEffect, useState } from 'react';

// Computes the largest pixel size with ratioWidth:ratioHeight that fits
// inside containerRef, so the field box and the SVG viewBox can share the
// exact same pixel rect on every browser (no dependency on how well a given
// engine implements CSS aspect-ratio inside a flex/dvh layout).
export function useContainedSize(containerRef, ratioWidth, ratioHeight) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targetRatio = ratioWidth / ratioHeight;

    const compute = () => {
      const style = getComputedStyle(el);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const cw = el.clientWidth - paddingX;
      const ch = el.clientHeight - paddingY;
      if (cw <= 0 || ch <= 0) return;
      let width = cw;
      let height = width / targetRatio;
      if (height > ch) {
        height = ch;
        width = height * targetRatio;
      }
      setSize({ width, height });
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, ratioWidth, ratioHeight]);

  return size;
}
