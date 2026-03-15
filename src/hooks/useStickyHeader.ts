import { RefObject, useEffect, useState } from "react";

/**
 * Watches a ref element with IntersectionObserver.
 * Returns true once the element scrolls out of the viewport.
 */
export const useStickyHeader = (ref: RefObject<HTMLDivElement>) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-10px 0px 0px 0px",
      }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [ref]);

  return isSticky;
};
