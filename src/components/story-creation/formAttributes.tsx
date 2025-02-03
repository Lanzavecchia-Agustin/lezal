import type React from "react"
import type { Attributes } from "../../../roomsStore"
import type { Dispatch, SetStateAction } from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface FormAttributesProps {
  formAttributeData: Attributes
  setFormAttributeData: Dispatch<SetStateAction<Attributes>>
}

export default function FormAttributes({
  formAttributeData,
  setFormAttributeData,
}: FormAttributesProps) {
  const { toast } = useToast()
  const [attributes, setAttributes] = useState<Attributes[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAttribute, setEditingAttribute] = useState<Attributes | null>(null)
  const [attributeToDelete, setAttributeToDelete] = useState<Attributes | null>(null)

  // Cargar atributos desde la base de datos (db.json)
  useEffect(() => {
    async function fetchAttributes() {
      try {
        const response = await fetch("http://localhost:3001/attributes")
        if (response.ok) {
          const data = await response.json()
          setAttributes(data)
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los atributos",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching attributes:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los atributos",
          variant: "destructive",
        })
      }
    }
    fetchAttributes()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, type, value, checked } = e.target
    setFormAttributeData((prev) => ({
      ...prev,
      [id]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number.parseInt(value) || 0
          : value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormAttributeData((prev) => ({
      ...prev,
      unlockable: checked,
    }))
  }

  // Función para postear un nuevo atributo
  const postAttribute = async (att: Attributes) => {
    try {
      const response = await fetch("http://localhost:3001/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(att),
      })
      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Atributo agregado con éxito",
          variant: "default",
        })
        setAttributes((prevAttributes) => [...prevAttributes, att])
      } else {
        throw new Error("Error al agregar el atributo")
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo agregar el atributo",
        variant: "destructive",
      })
    }
  }

  // Función para actualizar un atributo existente
  const updateAttribute = async (att: Attributes) => {
    try {
      const response = await fetch(`http://localhost:3001/attributes/${att.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(att),
      })
      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Atributo actualizado con éxito",
          variant: "default",
        })
        // Actualizar la lista local
        setAttributes((prevAttributes) =>
          prevAttributes.map((attr) => (attr.id === att.id ? att : attr))
        )
      } else {
        throw new Error("Error al actualizar el atributo")
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el atributo",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAttribute) {
      const updatedAtt: Attributes = {
        ...formAttributeData,
        id: editingAttribute.id,
        unlock_threshold: !formAttributeData.unlockable ? undefined : formAttributeData.unlock_threshold,
      }
      await updateAttribute(updatedAtt)
      setEditingAttribute(null)
    } else {
      const ultimoAtt: Attributes | undefined = attributes.at(-1)
      const newId = ultimoAtt ? (Number.parseInt(ultimoAtt.id, 10) + 1).toString() : "1"
      const newAtt: Attributes = {
        ...formAttributeData,
        id: newId,
        unlock_threshold: !formAttributeData.unlockable ? undefined : formAttributeData.unlock_threshold,
      }
      await postAttribute(newAtt)
    }
    // Limpiar formulario
    setFormAttributeData({ id: "", name: "", unlockable: false, unlock_threshold: 0 })
  }

  // Función para eliminar un atributo
  const deleteAttribute = async (att: Attributes) => {
    try {
      const response = await fetch(`http://localhost:3001/attributes/${att.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Atributo eliminado correctamente",
          variant: "default",
        })
        setAttributes((prevAttributes) =>
          prevAttributes.filter((item) => item.id !== att.id)
        )
      } else {
        throw new Error("Error al eliminar el atributo")
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el atributo",
        variant: "destructive",
      })
    }
  }

  // Filtrar atributos según el término de búsqueda
  const filteredAttributes = attributes.filter((attr) =>
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar clic en "Editar": carga el atributo en el formulario
  const handleEditClick = (att: Attributes) => {
    setEditingAttribute(att)
    setFormAttributeData(att)
  }

  // Cancelar edición: limpia el formulario y el estado de edición
  const handleCancelEdit = () => {
    setEditingAttribute(null)
    setFormAttributeData({ id: "", name: "", unlockable: false, unlock_threshold: 0 })
  }

  // Manejar clic en "Eliminar": asigna el atributo a eliminar
  const handleDeleteClick = (att: Attributes) => {
    setAttributeToDelete(att)
  }

  // Confirmar eliminación en el modal
  const confirmDelete = async () => {
    if (attributeToDelete) {
      await deleteAttribute(attributeToDelete)
      setAttributeToDelete(null)
    }
  }

  return (
    <div className="space-y-8 w-full p-12 rounded-lg">
      <Card className="bg-white shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Creación de Atributos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingAttribute ? "Editar Atributo" : "Crear Nuevo Atributo"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Nombre del Atributo
                </Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Ej. Rebelde..."
                  value={formAttributeData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unlockable"
                  checked={formAttributeData.unlockable}
                  onCheckedChange={handleCheckboxChange}
                  className="border-gray-300 data-[state=checked]:bg-gray-500 data-[state=checked]:text-white"
                />
                <Label htmlFor="unlockable" className="text-gray-700">
                  ¿Es oculto?
                </Label>
              </div>

              {formAttributeData.unlockable && (
                <div className="space-y-2">
                  <Label htmlFor="unlock_threshold" className="text-gray-700">
                    Nivel Requerido
                  </Label>
                  <Input
                    type="number"
                    id="unlock_threshold"
                    value={formAttributeData.unlock_threshold}
                    onChange={handleChange}
                    min="1"
                    required
                    className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="w-full bg-gray-800 text-white hover:bg-gray-900">
                  {editingAttribute ? "Guardar Cambios" : "Crear Atributo"}
                </Button>
                {editingAttribute && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancelEdit}
                    className="w-full border-gray-800 text-gray-800 hover:bg-gray-200"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold text-gray-800">Listado de Atributos</h3>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar atributos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
        <ScrollArea className="h-[400px] bg-white w-full rounded-md border p-4 border-gray-300">
          {filteredAttributes.length > 0 ? (
            filteredAttributes.map((attr) => (
              <div
                key={attr.id}
                className="mb-4 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center shadow-sm"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{attr.name}</h3>
                  <p className="text-gray-600">
                    {attr.unlockable
                      ? `Oculto - Nivel requerido: ${attr.unlock_threshold}`
                      : "Visible desde el inicio"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(attr)}
                    className="border-gray-800  hover:bg-gray-800 hover:text-white"
                  >
                    Editar
                  </Button>
                  <Dialog open={attributeToDelete !== null}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(attr)}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Eliminar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>
                          ¿Estás seguro de que deseas eliminar el atributo{" "}
                          <strong>{attributeToDelete?.name}</strong>?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setAttributeToDelete(null)}>
                          Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                          Confirmar
                        </Button>
                      </DialogFooter>
                      <DialogClose />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-800 text-center">No se encontraron atributos.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
