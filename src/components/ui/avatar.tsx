/**
 * @file This file contains the Avatar component and its subcomponents.
 * @exports Avatar
 * @exports AvatarImage
 * @exports AvatarFallback
 */

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * An image element with a fallback for representing the user.
 * @param {React.ComponentProps<typeof AvatarPrimitive.Root>} props - The props for the component.
 * @returns {JSX.Element} The Avatar component.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * The image of the avatar.
 * @param {React.ComponentProps<typeof AvatarPrimitive.Image>} props - The props for the component.
 * @returns {JSX.Element} The AvatarImage component.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * A fallback for when the avatar image is not available.
 * @param {React.ComponentProps<typeof AvatarPrimitive.Fallback>} props - The props for the component.
 * @returns {JSX.Element} The AvatarFallback component.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
