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
    'inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all sm:min-h-9 touch-manipulation',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

export function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const links = (
    <>
      <NavLink to="/questionnaire" className={linkClass} onClick={() => setMobileNavOpen(false)}>
        <ListChecksIcon className="h-4 w-4 shrink-0 opacity-90" />
        Questionnaire
      </NavLink>
      <NavLink to="/homes" className={linkClass} onClick={() => setMobileNavOpen(false)}>
        <HomeIcon className="h-4 w-4 shrink-0 opacity-90" />
        Homes
      </NavLink>
      <NavLink to="/favorites" className={linkClass} onClick={() => setMobileNavOpen(false)}>
        <HeartIcon className="h-4 w-4 shrink-0 opacity-90" />
        Favorites
      </NavLink>
    </>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 shadow-sm shadow-black/[0.03] backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6">
          <div className="flex items-center gap-3">
            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 rounded-xl sm:hidden" aria-label="Open menu">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="left-0 top-0 flex h-full max-h-none w-[min(100%,20rem)] translate-x-0 translate-y-0 rounded-none border-r sm:max-w-lg sm:rounded-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-lg">Menu</DialogTitle>
                </DialogHeader>
                <nav className="flex flex-col gap-2 pt-2">{links}</nav>
              </DialogContent>
            </Dialog>
            <NavLink
              to="/questionnaire"
              className="group flex items-center gap-2.5 rounded-xl py-1 pr-1 text-left transition-opacity hover:opacity-90"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-[1.02]">
                <HomeIcon className="h-5 w-5" aria-hidden />
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-display text-lg font-semibold tracking-tight text-foreground">Clayton Homes</span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Your home journey</span>
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground sm:hidden">Clayton</span>
            </NavLink>
          </div>
          <nav className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 p-1 sm:flex">{links}</nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[12rem] truncate text-xs text-muted-foreground md:inline" title={user?.email}>
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-border/80 shadow-sm"
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border/70 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HomeIcon className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-display text-lg font-semibold">Clayton Homes</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Discover floor plans and communities matched to how you want to live.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <NavLink to="/questionnaire" className="hover:text-foreground">
                    Buyer questionnaire
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/homes" className="hover:text-foreground">
                    Browse homes
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/favorites" className="hover:text-foreground">
                    Saved favorites
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="pointer-events-none opacity-60">
                    Help center
                  </a>
                </li>
                <li>
                  <a href="#" className="pointer-events-none opacity-60">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="pointer-events-none opacity-60">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="pointer-events-none opacity-60">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Clayton Homes. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
