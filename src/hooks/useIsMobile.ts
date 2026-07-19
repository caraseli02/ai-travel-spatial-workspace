import { useEffect, useState } from "react";

const DEFAULT_MOBILE_BREAKPOINT_PX = 768;

export function useIsMobile(breakpointPx: number = DEFAULT_MOBILE_BREAKPOINT_PX): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpointPx,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpointPx);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpointPx]);

  return isMobile;
}
