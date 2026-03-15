"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Zap,
  Menu,
  LogOut,
  Plus,
  Activity,
  Shield,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50"></div>

      <div className="relative flex px-6 h-20 max-w-screen items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-3 px-3 py-2 text-base hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 md:hidden rounded-xl transition-all duration-300"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="pr-0 bg-gradient-to-b from-card to-card/80 border-border/30"
          >
            <MobileNav onSignOut={handleSignOut} />
          </SheetContent>
        </Sheet>

        <div className="mr-6 hidden md:flex">
          <a
            href="/dashboard"
            className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
              <Zap className="w-6 h-6 text-primary-foreground animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Zaplane
            </span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <div className="flex items-center space-x-2">
            <a href="/workflow/create">
              <Button
                className="hidden sm:flex bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 rounded-xl font-medium"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </a>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-border/30 hover:ring-primary/30 transition-all duration-300">
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                      {data?.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-card/95 backdrop-blur-lg border-border/30 shadow-2xl shadow-primary/10"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {data?.user.username}
                      </p>
                      <Shield className="h-3 w-3 text-accent" />
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {data?.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border/30" />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg mx-2 my-1 transition-all duration-200"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <a href="/dashboard" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
          <Zap className="w-6 h-6 text-primary-foreground animate-pulse" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Zaplane
        </span>
      </a>

      <div className="space-y-4">
        <Button
          asChild
          className="w-full justify-start bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 rounded-xl font-medium h-12"
        >
          <a href="/workflow/create" className="flex items-center space-x-3">
            <Plus className="h-5 w-5" />
            <span>Create Workflow</span>
          </a>
        </Button>
        <Button
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg mx-2 my-1 transition-all duration-200"
          onClick={onSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border/30">
        <div className="flex items-center space-x-3">
          <Activity className="h-4 w-4 text-accent animate-pulse" />
          <span className="text-sm font-medium text-accent">System Status</span>
        </div>
        <span className="text-xs text-muted-foreground">
          All systems operational
        </span>
      </div>
    </div>
  );
}
