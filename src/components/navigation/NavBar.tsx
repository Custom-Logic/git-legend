
"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, GitBranch, BrainCircuit } from "lucide-react"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "GitLegend Developer",
    href: "/developer",
    description:
      "Advanced Git visualization, analytics, and team collaboration tools.",
  },
  {
    title: "GitLegend MCP",
    href: "/mcp",
    description:
      "A high-performance Model Context Protocol (MCP) server for AI agents.",
  },
]

export function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      <ListItem
                        href="/developer"
                        title="GitLegend Developer"
                        icon={<GitBranch className='h-6 w-6 text-blue-500' />}
                      >
                        Advanced Git visualization, analytics, and team collaboration.
                      </ListItem>
                      <ListItem
                        href="/mcp"
                        title="GitLegend MCP"
                        icon={<BrainCircuit className='h-6 w-6 text-purple-500' />}
                      >
                        High-performance MCP server for AI agents.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/docs" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Documentation
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/blog" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Blog
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="px-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 p-4">
                <Link href="/" className="flex items-center space-x-2">
                  <Icons.logo className="h-6 w-6" />
                  <span className="font-bold">{siteConfig.name}</span>
                </Link>
                <Link href="/developer" onClick={() => setIsMobileMenuOpen(false)}>Developer</Link>
                <Link href="/mcp" onClick={() => setIsMobileMenuOpen(false)}>MCP</Link>
                <Link href="/docs" onClick={() => setIsMobileMenuOpen(false)}>Documentation</Link>
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden items-center space-x-2 md:flex">
            <Link
              href="/auth/signin"
            >
              <Button variant="ghost">Login</Button>
            </Link>
            <Link
              href="/auth/signin"
            >
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-3">
            {icon}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
