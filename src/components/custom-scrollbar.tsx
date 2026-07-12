"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export default function CustomScrollbar({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [show, setShow] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateThumb = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumbHeight(0);
      return;
    }
    const viewportH = window.innerHeight;
    const ratio = viewportH / scrollHeight;
    const minThumb = 60;
    const h = Math.max(minThumb, Math.round(viewportH * ratio));
    const maxTop = viewportH - h;
    const scrollable = scrollHeight - clientHeight;
    const t = scrollable > 0 ? Math.round((scrollTop / scrollable) * maxTop) : 0;
    setThumbHeight(h);
    setThumbTop(t);
  }, [scrollContainerRef]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    window.addEventListener("resize", updateThumb);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      ro.disconnect();
      window.removeEventListener("resize", updateThumb);
    };
  }, [scrollContainerRef, updateThumb]);

  const showScrollbar = useCallback(() => {
    setShow(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShow(false), 1500);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => showScrollbar();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef, showScrollbar]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const el = scrollContainerRef.current;
    if (!el) return;
    const startY = e.clientY;
    const startScroll = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const viewportH = window.innerHeight;
    const scrollable = scrollHeight - clientHeight;
    const maxTop = viewportH - thumbHeight;

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientY - startY;
      const scrollDelta = maxTop > 0 ? (delta / maxTop) * scrollable : 0;
      el.scrollTop = startScroll + scrollDelta;
    };
    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      showScrollbar();
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [scrollContainerRef, thumbHeight, showScrollbar]);

  if (thumbHeight === 0) return null;

  return (
    <div
      className={`fixed right-0 top-0 z-[100] w-4 transition-opacity duration-300 pointer-events-none ${show || isDragging ? "opacity-100" : "opacity-0"}`}
      style={{ height: "100vh" }}
      onPointerEnter={showScrollbar}
    >
      <div
        ref={thumbRef}
        className="absolute right-1 w-2 rounded-full bg-text-muted/40 hover:bg-text-muted/70 transition-colors duration-200 pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          height: thumbHeight,
          top: thumbTop,
          transition: isDragging ? "none" : "top 0.1s ease-out",
        }}
        onPointerDown={handlePointerDown}
      />
    </div>
  );
}
