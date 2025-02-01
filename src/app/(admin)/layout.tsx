"use client"

import type React from "react"
import Link from "next/link"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className=" mx-auto  py-4 flex justify-between items-center border  px-12">
          <h1 className="text-2xl font-bold text-gray-800">Lezale game</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/scene-creation" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Crear Escena
                </Link>
              </li>
           
              <li>
                <Link
                  href="/create-attributes"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Crear Atributos
                </Link>
              </li>
              <li>
                <Link href="/scenes-view" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Ver  Escenas
                </Link>
              </li>
              <li>
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Jugar
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

