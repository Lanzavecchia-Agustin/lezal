import { Scene } from "./roomsStore"; // Importa la interfaz `Scene`

export const storyData: Record<string, Scene> = {
  scene1: {
    id: "scene1",
    text: "Te encuentras en un camino oscuro. Sientes que algo te observa. ¿Qué harás?",
    options: [
      { id: 1, text: "Avanzar con cautela por el camino", nextSceneId: "scene2" },
      { id: 2, text: "Regresar a pedir ayuda a la aldea", nextSceneId: "endingA" },
    ],
  },
  scene2: {
    id: "scene2",
    text: "Tras avanzar, descubres una cueva misteriosa. La entrada está cubierta de runas antiguas.",
    options: [
      { id: 1, text: "Entrar a la cueva", nextSceneId: "scene3" },
      { id: 2, text: "Dar media vuelta y buscar un camino alterno", nextSceneId: "endingB" },
    ],
  },
  scene3: {
    id: "scene3",
    text: "Dentro de la cueva, hallas un altar con un orbe brillante. Al tocarlo, un ser ancestral despierta...",
    options: [
      { id: 1, text: "Hablar con el ser ancestral", nextSceneId: "endingA" },
      { id: 2, text: "Huir con el orbe", nextSceneId: "endingB" },
    ],
  },
  endingA: {
    id: "endingA",
    text: "Final A: Aceptas la ayuda del ser ancestral y el mundo se llena de luz. ¡Felicidades!",
    options: [],
    isEnding: true,
  },
  endingB: {
    id: "endingB",
    text: "Final B: Escapas a toda prisa, pero lo desconocido se cierne sobre ti... ¡Fin incierto!",
    options: [],
    isEnding: true,
  },
};
