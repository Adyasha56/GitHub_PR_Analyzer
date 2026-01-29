"use client";

import { SignUp } from "@clerk/nextjs";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}