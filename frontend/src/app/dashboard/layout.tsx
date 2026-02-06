"use client";

import { SignedIn, SignedOut, RedirectToSignIn, UserButton, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Search, User, LogOut, Sparkles, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { cn } from "@/src/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "New Analysis",
      href: "/dashboard/analyze",
      icon: Search,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  return (
    <>
      {/* If NOT logged in → Clerk handles redirect */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* If logged in → show dashboard */}
      <SignedIn>
        <div className="min-h-screen bg-background">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b z-50" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Previo</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
                style={{ color: 'var(--foreground)' }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r bg-card z-40" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col h-full">

              {/* Logo */}
              <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <span className="ml-2 text-lg font-bold" style={{ color: 'var(--foreground)' }}>Previo</span>
              </div>

              {/* User */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserButton />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Welcome</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{user?.firstName || user?.username || 'User'}</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                            isActive
                              ? ""
                              : ""
                          )}
                          style={
                            isActive
                              ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                              : { color: 'var(--muted-foreground)' }
                          }
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'var(--secondary)';
                              e.currentTarget.style.color = 'var(--foreground)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--muted-foreground)';
                            }
                          }}
                        >
                          <Icon className="w-5 h-5" />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--secondary)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--muted-foreground)';
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Sidebar - Mobile */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50" 
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Sidebar content */}
              <aside className="absolute left-0 top-16 bottom-0 w-64 bg-card border-r" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-col h-full">
                  {/* User */}
                  <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <UserButton />
                        <div>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Welcome</p>
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{user?.firstName || user?.username || 'User'}</p>
                        </div>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Nav */}
                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                isActive
                                  ? ""
                                  : ""
                              )}
                              style={
                                isActive
                                  ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                                  : { color: 'var(--muted-foreground)' }
                              }
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = 'var(--secondary)';
                                  e.currentTarget.style.color = 'var(--foreground)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'var(--muted-foreground)';
                                }
                              }}
                            >
                              <Icon className="w-5 h-5" />
                              {item.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Logout */}
                  <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--secondary)';
                        e.currentTarget.style.color = 'var(--foreground)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--muted-foreground)';
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Main */}
          <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  );
}
