/**
 * @file This file contains the `useIsMobile` hook, which detects whether the user is on a mobile device.
 * @exports useIsMobile
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * A custom React hook that detects whether the user is on a mobile device.
 * @returns {boolean} A boolean indicating whether the user is on a mobile device.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
