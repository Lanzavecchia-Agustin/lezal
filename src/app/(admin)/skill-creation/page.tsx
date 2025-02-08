'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRouter, useSearchParams } from "next/navigation"

// Define interfaces para Skill y Subskill
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

// Función para generar un ID único usando crypto.randomUUID (o fallback a otro método)
const generateUniqueId = (): string => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
}

const SkillCreationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Si se recibe un parámetro "scene" en la query (o similar para skills), podrías
  // usarlo para determinar modo edición. Aquí asumiremos que si existe un parámetro "skill"
  // se está editando una skill. (Ajusta el nombre del parámetro según necesites).
  const isEditing = Boolean(searchParams.get("skill"));

  const [skills, setSkills] = useState<Skill[]>([]); // Lista de skills existentes
  const [form, setForm] = useState<Skill>({
    id: "",
    name: "",
    subskills: []
  }); // Formulario para crear/editar skill
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null); // Modo edición
  const [open, setOpen] = useState(false); // Controla el modal

  // Función para obtener las skills desde la API
  const fetchSkills = async () => {
    try {
      const response = await fetch("http://localhost:3001/skills");
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
      alert("Error loading skills");
    }
  };

  useEffect(() => {
    fetchSkills(); // Cargar skills al montar el componente
  }, []);

  // Manejar cambios en los campos generales del formulario (para la skill)
  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Manejar cambios en el input de cada subskill
  const handleSubskillsChange = (e: ChangeEvent<HTMLInputElement>, subskillId: string) => {
    setForm((prevForm) => {
      const updatedSubskills = prevForm.subskills.map((subskill) => {
        if (subskill.id === subskillId) {
          return { ...subskill, name: e.target.value };
        }
        return subskill;
      });
      return { ...prevForm, subskills: updatedSubskills };
    });
  };

  // Agregar una nueva subskill al formulario (con un ID único)
  const handleAddSubskill = () => {
    const newSubskill: Subskill = {
      id: generateUniqueId(), // Genera un ID único para el subskill
      name: "",
    };
    setForm((prevForm) => ({
      ...prevForm,
      subskills: [...prevForm.subskills, newSubskill]
    }));
  };

  // Enviar el formulario para crear o editar una skill
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Skill data:", form);

    if (editingSkill) {
      // Modo edición: actualizamos la skill existente (usando PUT o PATCH)
      try {
        const response = await fetch(`http://localhost:3001/skills/${editingSkill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error("Failed to update skill");

        const updatedSkill = await response.json();
        setSkills((prevSkills) =>
          prevSkills.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill))
        );
        alert("Skill updated successfully!");
        fetchSkills(); // Recargar la lista de skills
      } catch (error) {
        console.error(error);
        alert("Error updating skill");
      }
    } else {
      // Modo creación: asignamos nuevos IDs únicos para la skill y sus subskills
      const newSkill: Skill = {
        ...form,
        id: generateUniqueId(), // Nuevo ID único para la skill
        subskills: form.subskills.map((subskill) => ({
          ...subskill,
          id: generateUniqueId() // Nuevo ID único para cada subskill
        }))
      };

      try {
        const response = await fetch("http://localhost:3001/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSkill),
        });
        if (!response.ok) throw new Error("Failed to create skill");

        setSkills((prevSkills) => [...prevSkills, newSkill]);
        alert("Skill created successfully!");
        fetchSkills(); // Recargar la lista de skills
      } catch (error) {
        console.error(error);
        alert("Error creating skill");
      }
    }

    // Limpiar el formulario y reiniciar el modo edición
    setForm({ id: "", name: "", subskills: [] });
    setEditingSkill(null);
    setOpen(false); // Cerrar el modal
  };

  // Función para eliminar una skill
  const handleDeleteSkill = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/skills/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete skill");

      setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== id));
      alert("Skill deleted successfully!");
      fetchSkills(); // Recargar skills después de eliminar
    } catch (error) {
      console.error(error);
      alert("Error deleting skill");
    }
  };

  // Función para eliminar un subskill de la skill actual
  const handleDeleteSubskill = (subskillId: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      subskills: prevForm.subskills.filter((subskill) => subskill.id !== subskillId)
    }));
  };

  // Abrir el modal para editar una skill existente
  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setForm(skill);
    setOpen(true);
  };

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

            {/* Sección para los subskills */}
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

      {/* Lista de skills */}
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
  );
}

export default SkillCreationPage;
