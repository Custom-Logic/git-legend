/**
 * @file This file contains the Breadcrumb component and its subcomponents.
 * @exports Breadcrumb
 * @exports BreadcrumbList
 * @exports BreadcrumbItem
 * @exports BreadcrumbLink
 * @exports BreadcrumbPage
 * @exports BreadcrumbSeparator
 * @exports BreadcrumbEllipsis
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A breadcrumb navigation component.
 * @param {React.ComponentProps<"nav">} props - The props for the component.
 * @returns {JSX.Element} The Breadcrumb component.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/**
 * A list of breadcrumb items.
 * @param {React.ComponentProps<"ol">} props - The props for the component.
 * @returns {JSX.Element} The BreadcrumbList component.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * An item in a breadcrumb list.
 * @param {React.ComponentProps<"li">} props - The props for the component.
 * @returns {JSX.Element} The BreadcrumbItem component.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * A link in a breadcrumb item.
 * @param {React.ComponentProps<"a"> & { asChild?: boolean }} props - The props for the component.
 * @returns {JSX.Element} The BreadcrumbLink component.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

/**
 * The current page in a breadcrumb list.
 * @param {React.ComponentProps<"span">} props - The props for the component.
 * @returns {JSX.Element} The BreadcrumbPage component.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

/**
 * A separator between breadcrumb items.
 * @param {React.ComponentProps<"li">} props - The props for the component.
 * @returns {JSX.Element} The BreadcrumbSeparator component.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

/**
 * An ellipsis in a breadcrumb list, used to indicate that there are more items.
 * @param {React.ComponentProps<"span">} props - The props for the component.
 * @returns {JSX.Element} The BreadcrumbEllipsis component.
 */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
