'use client'
import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define interfaces for the complete game configuration
interface GameConfigItem {
  id: string
  value: number
}

const GameConfigPage = () => {
  const [gameConfig, setGameConfig] = useState<GameConfigItem[]>([])
  const [form, setForm] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetch("http://localhost:3001/gameConfig")
      .then((response) => response.json())
      .then((data: GameConfigItem[]) => {
        const configData: { [key: string]: number } = {};
        data.forEach((item: GameConfigItem) => {
          configData[item.id] = item.value;
        });

        setGameConfig(data);
        setForm(configData);
      })
      .catch(error => {
        console.error('Error fetching config:', error);
        alert('Error loading configuration');
      });
  }, [])

  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) })
  }

  const saveGeneralConfig = async (id: string) => {
    const value = form[id];
    if (value === undefined) return;

    // Buscamos el item con ese id en el array
    const itemToUpdate = gameConfig.find(item => item.id === id);
    if (!itemToUpdate) return;

    // Creamos el objeto para actualizar
    const updatedItem = { ...itemToUpdate, value };

    try {
      console.log('Sending update:', updatedItem);

      const response = await fetch(`http://localhost:3001/gameConfig/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),  // Enviar solo el valor actualizado
      });

      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }

      const updatedData = await response.json();
      console.log('Update response:', updatedData);

      // Actualizamos el estado local con el valor actualizado
      setGameConfig(gameConfig.map(item => (item.id === id ? updatedItem : item)));
      alert("Configuration updated successfully!");
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert("Failed to update configuration. Please try again.");
    }
  };

  if (!gameConfig.length) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="text-white">Loading...</div>
    </div>
  )

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <Card className="bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>General Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {gameConfig.map((item) => (
              <div key={item.id} className="space-y-2">
                <Label htmlFor={item.id}>
                  {item.id.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + 
                   item.id.replace(/([A-Z])/g, " $1").slice(1).toLowerCase()}
                </Label>
                <Input
                  id={item.id}
                  className="bg-gray-700 text-white"
                  name={item.id}
                  value={form[item.id] || item.value}  // Manejo de valores por defecto
                  onChange={handleGeneralChange}
                  type="number"
                  min="0"
                />
                <Button 
                  onClick={() => saveGeneralConfig(item.id)} 
                  className="bg-blue-600 hover:bg-blue-700 w-full mt-2"
                >
                  Save {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GameConfigPage
