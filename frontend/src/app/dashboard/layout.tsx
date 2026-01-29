"use client";

import { SignedIn, SignedOut, RedirectToSignIn, UserButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, User, LogOut, Github } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();

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
          {/* Sidebar */}
          <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card">
            <div className="flex flex-col h-full">

              {/* Logo */}
              <div className="h-16 flex items-center px-6 border-b border-border">
                <Github className="w-8 h-8 text-primary" />
                <span className="ml-2 text-lg font-bold">PR Analyzer</span>
              </div>

              {/* User */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <UserButton />
                  <div>
                    <p className="text-sm font-medium">Welcome</p>
                    <p className="text-xs text-muted-foreground">Dashboard</p>
                  </div>
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
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary text-white"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
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
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="ml-64 min-h-screen">
            <div className="container mx-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  );
}
