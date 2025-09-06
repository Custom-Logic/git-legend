/**
 * @file This file contains the Popover component and its subcomponents.
 * @exports Popover
 * @exports PopoverTrigger
 * @exports PopoverContent
 * @exports PopoverAnchor
 */

"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * A popover component.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Root>} props - The props for the component.
 * @returns {JSX.Element} The Popover component.
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

/**
 * A trigger that opens the popover.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Trigger>} props - The props for the component.
 * @returns {JSX.Element} The PopoverTrigger component.
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

/**
 * The content of a popover.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Content>} props - The props for the component.
 * @returns {JSX.Element} The PopoverContent component.
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

/**
 * An anchor for a popover.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Anchor>} props - The props for the component.
 * @returns {JSX.Element} The PopoverAnchor component.
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
