/**
 * @file This file contains the Collapsible component and its subcomponents.
 * @exports Collapsible
 * @exports CollapsibleTrigger
 * @exports CollapsibleContent
 */

"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * A component that can be collapsed or expanded.
 * @param {React.ComponentProps<typeof CollapsiblePrimitive.Root>} props - The props for the component.
 * @returns {JSX.Element} The Collapsible component.
 */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/**
 * A button that toggles the open state of a collapsible component.
 * @param {React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>} props - The props for the component.
 * @returns {JSX.Element} The CollapsibleTrigger component.
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

/**
 * The content of a collapsible component.
 * @param {React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>} props - The props for the component.
 * @returns {JSX.Element} The CollapsibleContent component.
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
