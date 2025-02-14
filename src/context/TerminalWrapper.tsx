import type React from "react"
import { Terminal } from "@/components/magicui/terminal"

interface TerminalWrapperProps {
  children: React.ReactNode
}

export function TerminalWrapper({ children }: TerminalWrapperProps) {
  return (
    <Terminal className="min-h-screen  bg-transparent text-green-500 font-mono p-4 overflow-auto">{children}</Terminal>
  )
}

