"use client";

import { SignIn } from "@clerk/nextjs";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}