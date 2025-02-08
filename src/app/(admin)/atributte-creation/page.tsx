'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Define interfaces for the attributes
interface Attribute {
  id: string
  name: string
  unlock_threshold: number
}

const AttributeCreationPage = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]) // List of attributes
  const [form, setForm] = useState<Attribute>({
    id: "",
    name: "",
    unlock_threshold: 0
  }) // Form to create/edit attribute
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null) // State for editing existing attribute
  const [open, setOpen] = useState(false) // To control the modal

  // Fetch attributes
  const fetchAttributes = async () => {
    try {
      const response = await fetch("http://localhost:3001/attributes")
      const data = await response.json()
      setAttributes(data)
    } catch (error) {
      console.error("Error fetching attributes:", error)
      alert("Error loading attributes")
    }
  }

  useEffect(() => {
    fetchAttributes() // Initial fetch when component mounts
  }, [])

  // Handle changes in the form
  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle submitting the form for creating/editing attribute
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (editingAttribute) {
      // Update existing attribute
      try {
        const response = await fetch(`http://localhost:3001/attributes/${editingAttribute.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!response.ok) throw new Error("Failed to update attribute")

        alert("Attribute updated successfully!")
        fetchAttributes() // Refetch attributes after updating
      } catch (error) {
        console.error(error)
        alert("Error updating attribute")
      }
    } else {
      // Create a new attribute
      const newAttribute = {
        ...form,
        id: `${attributes.length}`, // Use the index of the attribute in the array as ID
      }

      try {
        const response = await fetch("http://localhost:3001/attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAttribute),
        })
        if (!response.ok) throw new Error("Failed to create attribute")

        alert("Attribute created successfully!")
        fetchAttributes() // Refetch attributes after creating
      } catch (error) {
        console.error(error)
        alert("Error creating attribute")
      }
    }

    // Clear the form after submit
    setForm({ id: "", name: "", unlock_threshold: 0 })
    setEditingAttribute(null)
    setOpen(false) // Close modal
  }

  // Delete an attribute
  const handleDeleteAttribute = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/attributes/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete attribute")

      alert("Attribute deleted successfully!")
      fetchAttributes() // Refetch attributes after deletion
    } catch (error) {
      console.error(error)
      alert("Error deleting attribute")
    }
  }

  // Open the modal for editing
  const handleEditAttribute = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setForm(attribute)
    setOpen(true) // Open modal
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">Create Attribute</Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editingAttribute ? "Edit Attribute" : "Create Attribute"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Attribute Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleGeneralChange}
                required
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="unlock_threshold">Unlock Threshold</Label>
              <Input
                id="unlock_threshold"
                name="unlock_threshold"
                type="number"
                value={form.unlock_threshold}
                onChange={handleGeneralChange}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full mt-6">
                {editingAttribute ? "Save Changes" : "Create Attribute"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List of Attributes */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white">Attributes List</h3>
        <div className="space-y-4">
          {attributes.map((attribute) => (
            <Card key={attribute.id} className="bg-gray-800">
              <CardHeader>
                <CardTitle>{attribute.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Unlock Threshold:</strong> {attribute.unlock_threshold}</p>
                </div>
              </CardContent>
              <div className="flex justify-between p-4">
                <Button onClick={() => handleEditAttribute(attribute)} className="bg-green-600 hover:bg-green-700">
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteAttribute(attribute.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AttributeCreationPage
