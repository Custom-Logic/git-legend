/**
 * @file This file contains the AspectRatio component.
 * @exports AspectRatio
 */

"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * A component that displays content within a desired ratio.
 * @param {React.ComponentProps<typeof AspectRatioPrimitive.Root>} props - The props for the component.
 * @returns {JSX.Element} The AspectRatio component.
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
