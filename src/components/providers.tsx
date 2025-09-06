/**
 * @file This file contains the Providers component, which wraps the application with the necessary providers.
 * @exports Providers
 */

"use client"

import { SessionProvider } from "next-auth/react"

/**
 * Represents the props for the Providers component.
 * @interface
 */
interface ProvidersProps {
  children: React.ReactNode
}

/**
 * A component that wraps the application with the necessary providers.
 * @param {ProvidersProps} props - The props for the component.
 * @returns {JSX.Element} The Providers component.
 */
export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>
}