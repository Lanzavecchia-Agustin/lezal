"use client";
import SceneFlowView from "@/components/scene-view/SceneFlowView";
import db from "../../../db.json";

export default function ScenesPage() {
    return (
         <SceneFlowView scenes={db.scenes} />
    );
  }