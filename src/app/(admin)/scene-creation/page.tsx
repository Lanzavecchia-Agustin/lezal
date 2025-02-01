// app/scene-creation/page.tsx
"use client";

import React, { Suspense } from "react";
import SceneCreationContent from "@/components/scene-creation/SceneCreationContent";

export default function SceneCreationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SceneCreationContent />
    </Suspense>
  );
}
