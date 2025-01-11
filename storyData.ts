import {  SceneOption } from "./roomsStore";

/** ------------------------------------------------------------------
 * Definición de la historia con requirement & maxVotes
 * ------------------------------------------------------------------*/
interface StoryData {
  [key: string]: {
    id: string;
    text: string;
    options: SceneOption[];
    isEnding?: boolean;
  };
}

export const storyData: StoryData = {
  scene1: {
    id: "scene1",
    text: "Te despiertas en un bosque misterioso bajo un cielo cubierto de nubes rojas. Frente a ti, ves una cabaña antigua, un sendero que se pierde en la oscuridad, y un extraño altar tallado en piedra.",
    options: [
      {
        id: 1,
        text: "Entrar a la cabaña a investigar.",
        requirement: "inteligente",
        nextSceneId: {
          success: "sceneCabanaExitosa",
          failure: "sceneCabanaFallida",
          partial: "sceneCabanaParcial",
        },
      },
      {
        id: 2,
        text: "Seguir el sendero oscuro.",
        requirement: "carismatico",
        nextSceneId: {
          success: "sceneSenderoExitosa",
          failure: "sceneSenderoFallida",
          partial: "sceneSenderoParcial",
        },
      },
      {
        id: 3,
        text: "Examinar el altar tallado.",
        requirement: "otaku",
        nextSceneId: {
          success: "sceneAltarExitosa",
          failure: "sceneAltarFallida",
        },
      },
    ],
  },

  // Escena de la cabaña
  sceneCabanaExitosa: {
    id: "sceneCabanaExitosa",
    text: "Con tus conocimientos deduces cómo abrir una puerta secreta dentro de la cabaña. Encuentras un mapa antiguo que señala un tesoro oculto.",
    options: [
      {
        id: 1,
        text: "Seguir las indicaciones del mapa.",
        nextSceneId: {
          success: "sceneTesoro",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Ignorar el mapa y explorar la cabaña más a fondo.",
        nextSceneId: {
          success: "sceneCabanaProfunda",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },
  
  sceneCabanaFallida: {
    id: "sceneCabanaFallida",
    text: "No comprendes los mecanismos de la cabaña y quedas atrapado en una trampa. Fin de tu aventura.",
    options: [],
    isEnding: true,
  },
  sceneCabanaParcial: {
    id: "sceneCabanaParcial",
    text: "Encuentras un par de pistas, pero accidentalmente activas una trampa que te hiere. Aún puedes continuar, aunque con dificultad.",
    options: [
      {
        id: 1,
        text: "Salir de la cabaña y buscar ayuda.",
        nextSceneId: {
          success: "sceneSenderoExitosa",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del sendero
  sceneSenderoExitosa: {
    id: "sceneSenderoExitosa",
    text: "Tu carisma atrae a un misterioso guía que te lleva a un lugar seguro, donde aprendes más sobre el bosque.",
    options: [
      {
        id: 1,
        text: "Seguir al guía hacia un lugar de descanso.",
        nextSceneId: {
          success: "sceneRefugio",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },
  sceneSenderoFallida: {
    id: "sceneSenderoFallida",
    text: "Te pierdes en la oscuridad y terminas en un pantano peligroso. No logras escapar.",
    options: [],
    isEnding: true,
  },
  sceneSenderoParcial: {
    id: "sceneSenderoParcial",
    text: "Te topas con un grupo de criaturas hostiles, pero logras escapar con algunos rasguños.",
    options: [
      {
        id: 1,
        text: "Regresar al punto de inicio.",
        nextSceneId: {
          success: "scene1",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del altar
  sceneAltarExitosa: {
    id: "sceneAltarExitosa",
    text: "Reconoces inscripciones antiguas relacionadas con tu anime favorito y descubres un pasaje secreto bajo el altar.",
    options: [
      {
        id: 1,
        text: "Descender por el pasaje.",
        nextSceneId: {
          success: "sceneSubterraneo",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },
  sceneAltarFallida: {
    id: "sceneAltarFallida",
    text: "No comprendes las inscripciones y accidentalmente activas una maldición que te convierte en piedra.",
    options: [],
    isEnding: true,
  },

  // Más escenas
  sceneTesoro: {
    id: "sceneTesoro",
    text: "Sigues el mapa y encuentras un cofre lleno de riquezas. ¡Has triunfado!",
    options: [],
    isEnding: true,
  },
  sceneCabanaProfunda: {
    id: "sceneCabanaProfunda",
    text: "Descubres una biblioteca secreta llena de conocimiento arcano. Tu mente se expande.",
    options: [],
    isEnding: true,
  },
  sceneRefugio: {
    id: "sceneRefugio",
    text: "Llegas a un refugio seguro donde puedes descansar y preparar tu próximo movimiento.",
    options: [],
    isEnding: true,
  },
  sceneSubterraneo: {
    id: "sceneSubterraneo",
    text: "El pasaje te lleva a una cámara oculta con tecnología avanzada. Encuentras un artefacto poderoso.",
    options: [],
    isEnding: true,
  },

  // Escena genérica de fallo
  sceneFailGenerico: {
    id: "sceneFailGenerico",
    text: "Algo salió mal y tu aventura terminó.",
    options: [],
    isEnding: true,
  },
};

