"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  Search, 
  User, 
  LogOut,
  Github 
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!userId) {
    return null;
  }

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
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Github className="w-8 h-8 text-primary" />
            <span className="ml-2 text-lg font-bold">PR Analyzer</span>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Welcome back</p>
                <p className="text-xs text-muted-foreground truncate">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
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
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout at bottom */}
          <div className="p-4 border-t border-border">
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              onClick={() => router.push('/sign-in')}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}