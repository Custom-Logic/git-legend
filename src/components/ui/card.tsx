/**
 * @file This file contains the Card component and its subcomponents.
 * @exports Card
 * @exports CardHeader
 * @exports CardFooter
 * @exports CardTitle
 * @exports CardAction
 * @exports CardDescription
 * @exports CardContent
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A container for showing content in a card.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The Card component.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * The header of the card.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The CardHeader component.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * The title of the card.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The CardTitle component.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * The description of the card.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The CardDescription component.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * An action button or element in the card header.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The CardAction component.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * The main content of the card.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The CardContent component.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * The footer of the card.
 * @param {React.ComponentProps<"div">} props - The props for the component.
 * @returns {JSX.Element} The CardFooter component.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
