'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Define interfaces for the skills and subskills
interface Subskill {
  id: string
  name: string
  unlock_threshold?: number
}

interface Skill {
  id: string
  name: string
  subskills: Subskill[]
}

const SkillCreationPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]) // List of skills
  const [form, setForm] = useState<Skill>({
    id: "",
    name: "",
    subskills: []
  }) // Form to create/edit skill
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null) // State for editing existing skill
  const [open, setOpen] = useState(false) // To control the modal

  // Fetch skills
  const fetchSkills = async () => {
    try {
      const response = await fetch("http://localhost:3001/skills")
      const data = await response.json()
      setSkills(data)
    } catch (error) {
      console.error("Error fetching skills:", error)
      alert("Error loading skills")
    }
  }

  useEffect(() => {
    fetchSkills() // Initial fetch when component mounts
  }, [])

  // Handle changes in the form
  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle changes in subskills' input
  const handleSubskillsChange = (e: ChangeEvent<HTMLInputElement>, subskillId: string) => {
    setForm((prevForm) => {
      const updatedSubskills = prevForm.subskills.map((subskill) => {
        if (subskill.id === subskillId) {
          return { ...subskill, name: e.target.value }
        }
        return subskill
      })
      return { ...prevForm, subskills: updatedSubskills }
    })
  }

  // Add a new subskill
  const handleAddSubskill = () => {
    const newSubskill = {
      id: `${form.subskills.length}`, // Use the index of the subskill as ID
      name: "",
    }
    setForm((prevForm) => ({
      ...prevForm,
      subskills: [...prevForm.subskills, newSubskill]
    }))
  }

  // Handle submitting the form for creating/editing skill
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (editingSkill) {
      // Update existing skill
      try {
        const response = await fetch(`http://localhost:3001/skills/${editingSkill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!response.ok) throw new Error("Failed to update skill")

        const updatedSkill = await response.json()
        setSkills((prevSkills) =>
          prevSkills.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill))
        )
        alert("Skill updated successfully!")
        fetchSkills() // Refetch skills after updating
      } catch (error) {
        console.error(error)
        alert("Error updating skill")
      }
    } else {
      // Create a new skill with index-based IDs for skills and subskills
      const newSkill = { 
        ...form, 
        id: `${skills.length}`, // Use the index of the skill in the array as ID
        subskills: form.subskills.map((subskill, index) => ({
          ...subskill,
          id: `${index}` // Use index of subskill in the array as ID
        }))
      }
      
      try {
        const response = await fetch("http://localhost:3001/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSkill),
        })
        if (!response.ok) throw new Error("Failed to create skill")

        setSkills((prevSkills) => [...prevSkills, newSkill])
        alert("Skill created successfully!")
        fetchSkills() // Refetch skills after creating
      } catch (error) {
        console.error(error)
        alert("Error creating skill")
      }
    }

    // Clear the form after submit
    setForm({ id: "", name: "", subskills: [] })
    setEditingSkill(null)
    setOpen(false) // Close modal
  }

  // Delete a skill
  const handleDeleteSkill = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/skills/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete skill")

      setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== id))
      alert("Skill deleted successfully!")
      fetchSkills() // Refetch skills after deletion
    } catch (error) {
      console.error(error)
      alert("Error deleting skill")
    }
  }

  // Delete a subskill
  const handleDeleteSubskill = (subskillId: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      subskills: prevForm.subskills.filter((subskill) => subskill.id !== subskillId)
    }))
  }

  // Open the modal for editing
  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill)
    setForm(skill)
    setOpen(true) // Open modal
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">Create Skill</Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Create Skill"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleGeneralChange}
                required
              />
            </div>

            {/* Subskills */}
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white">Subskills</h3>
              {form.subskills.map((subskill) => (
                <div key={subskill.id} className="space-y-2">
                  <Label htmlFor={subskill.id}>Subskill Name</Label>
                  <Input
                    id={subskill.id}
                    value={subskill.name}
                    onChange={(e) => handleSubskillsChange(e, subskill.id)}
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => handleDeleteSubskill(subskill.id)}
                    className="bg-red-600 hover:bg-red-700 w-full mt-2"
                  >
                    Delete Subskill
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={handleAddSubskill}
                className="bg-green-600 hover:bg-green-700 w-full mt-4"
              >
                Add Subskill
              </Button>
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full mt-6">
                {editingSkill ? "Save Changes" : "Create Skill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List of Skills */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white">Skills List</h3>
        <div className="space-y-4">
          {skills.map((skill) => (
            <Card key={skill.id} className="bg-gray-800">
              <CardHeader>
                <CardTitle>{skill.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4>Subskills</h4>
                  {skill.subskills.map((subskill) => (
                    <div key={subskill.id} className="ml-4">
                      <p>{subskill.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="flex justify-between p-4">
                <Button onClick={() => handleEditSkill(skill)} className="bg-green-600 hover:bg-green-700">
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteSkill(skill.id)}
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

export default SkillCreationPage
