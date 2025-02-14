"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Interfaz para el NPC
interface Npc {
  id: string
  name: string
  img: string // Aquí asumimos que guardas la URL de la imagen
}

const NpcCreationPage = () => {
  const [npcs, setNpcs] = useState<Npc[]>([]) // Lista de NPCs
  const [form, setForm] = useState<Npc>({
    id: "",
    name: "",
    img: "",
  }) // Formulario para crear/editar NPC
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null) // Estado para NPC en edición
  const [open, setOpen] = useState(false) // Controla la apertura del modal

  // Obtener NPCs desde la API
  const fetchNpcs = async () => {
    try {
      const response = await fetch("http://localhost:3001/npcs")
      if (!response.ok) throw new Error("Error al obtener NPCs")
      const data = await response.json()
      setNpcs(data)
    } catch (error) {
      console.error("Error fetching NPCs:", error)
      alert("Error al cargar los NPCs")
    }
  }

  useEffect(() => {
    fetchNpcs() // Se ejecuta al montar el componente
  }, [])

  // Manejar cambios en el formulario (campo 'name', campo 'img', etc.)
  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Manejar la creación/edición de NPC
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (editingNpc) {
      // Actualizar un NPC existente
      try {
        const response = await fetch(`http://localhost:3001/npcs/${editingNpc.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!response.ok) throw new Error("Error al actualizar el NPC")

        alert("¡NPC actualizado correctamente!")
        fetchNpcs() // Volver a cargar la lista
      } catch (error) {
        console.error(error)
        alert("Error al actualizar el NPC")
      }
    } else {
      // Crear un nuevo NPC
      const newNpc = {
        ...form,
        id: `${npcs.length}`, // Generar un id simple (puedes ajustar la lógica como necesites)
      }

      try {
        const response = await fetch("http://localhost:3001/npcs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNpc),
        })
        if (!response.ok) throw new Error("Error al crear el NPC")

        alert("¡NPC creado correctamente!")
        fetchNpcs()
      } catch (error) {
        console.error(error)
        alert("Error al crear el NPC")
      }
    }

    // Limpiar formulario y estado de edición
    setForm({ id: "", name: "", img: "" })
    setEditingNpc(null)
    setOpen(false)
  }

  // Manejar la eliminación de un NPC
  const handleDeleteNpc = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/npcs/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar el NPC")

      alert("¡NPC eliminado correctamente!")
      fetchNpcs()
    } catch (error) {
      console.error(error)
      alert("Error al eliminar el NPC")
    }
  }

  // Abrir el modal para editar un NPC
  const handleEditNpc = (npc: Npc) => {
    setEditingNpc(npc)
    setForm(npc)
    setOpen(true)
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Dialog para crear/editar NPC */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">Crear NPC</Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editingNpc ? "Editar NPC" : "Crear NPC"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del NPC</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleGeneralChange}
                required
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="img">URL de la Imagen</Label>
              <Input
                id="img"
                name="img"
                value={form.img}
                onChange={handleGeneralChange}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full mt-6">
                {editingNpc ? "Guardar Cambios" : "Crear NPC"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de NPCs */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white">Lista de NPCs</h3>
        <div className="space-y-4">
          {npcs.map((npc) => (
            <Card key={npc.id} className="bg-gray-800">
              <CardHeader>
                <CardTitle>{npc.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Muestra la imagen (asumiendo que npc.img es una URL válida) */}
                  <img
                    src={npc.img}
                    alt={`Imagen de ${npc.name}`}
                    className="max-h-48 object-cover mt-2"
                  />
                </div>
              </CardContent>
              <div className="flex justify-between p-4">
                <Button onClick={() => handleEditNpc(npc)} className="bg-green-600 hover:bg-green-700">
                  Editar
                </Button>
                <Button
                  onClick={() => handleDeleteNpc(npc.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NpcCreationPage
