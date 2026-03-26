import { HeartIcon, HomeIcon, ListChecksIcon, LogOutIcon, MenuIcon } from 'lucide-react'
import * as React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:min-h-9 touch-manipulation',
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
  )

export function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const links = (
    <>
      <NavLink to="/homes" className={linkClass} onClick={() => setMobileNavOpen(false)}>
        <HomeIcon className="h-4 w-4 shrink-0" />
        Homes
      </NavLink>
      <NavLink to="/questionnaire" className={linkClass} onClick={() => setMobileNavOpen(false)}>
        <ListChecksIcon className="h-4 w-4 shrink-0" />
        Questionnaire
      </NavLink>
      <NavLink to="/favorites" className={linkClass} onClick={() => setMobileNavOpen(false)}>
        <HeartIcon className="h-4 w-4 shrink-0" />
        Favorites
      </NavLink>
    </>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden" aria-label="Open menu">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="left-0 top-0 flex h-full max-h-none w-[min(100%,20rem)] translate-x-0 translate-y-0 rounded-none sm:max-w-lg sm:rounded-lg">
                <DialogHeader>
                  <DialogTitle>Menu</DialogTitle>
                </DialogHeader>
                <nav className="flex flex-col gap-1">{links}</nav>
              </DialogContent>
            </Dialog>
            <NavLink to="/homes" className="text-lg font-semibold text-primary">
              Clayton Homes
            </NavLink>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">{links}</nav>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => {
                void logout()
              }}
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Clayton Homes. All rights reserved.
      </footer>
    </div>
  )
}
