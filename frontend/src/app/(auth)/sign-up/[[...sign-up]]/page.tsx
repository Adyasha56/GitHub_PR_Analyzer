"use client";

import { SignUp } from "@clerk/nextjs";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}