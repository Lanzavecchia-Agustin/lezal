import { SceneOption } from "./roomsStore";

/** ------------------------------------------------------------------
 * Definición de la historia con requirement, maxVotes, etc.
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
  // Escena inicial
  scene1: {
    id: "scene1",
    text: "Te despiertas en un bosque misterioso bajo un cielo cubierto de nubes rojas. Frente a ti, ves una cabaña antigua, un sendero que se pierde en la oscuridad, y un extraño altar tallado en piedra.",
    options: [
      // Opción con único requerimiento ("inteligente"): solo success/failure
      {
        id: 1,
        text: "Entrar a la cabaña a investigar.",
        requirement: ["inteligente"],
        maxVotes: 1,
        nextSceneId: {
          success: "sceneCabanaExitosa",
          failure: "sceneCabanaFallida",
        },
      },
      // Opción con único requerimiento ("carismatico"): solo success/failure
      {
        id: 2,
        text: "Seguir el sendero oscuro.",
        requirement: ["carismatico"],
        maxVotes: 1,
        nextSceneId: {
          success: "sceneSenderoExitosa",
          failure: "sceneSenderoFallida",
        },
      },
      // Opción con dos requerimientos ("otaku" y "inteligente"): se requiere partial
      {
        id: 3,
        text: "Examinar el altar tallado.",
        requirement: ["otaku", "inteligente"],
        maxVotes: 1,
        nextSceneId: {
          success: "sceneAltarExitosa",
          failure: "sceneAltarFallida",
          partial: "sceneAltarParcial", // nueva escena para partial
        },
      },
    ],
  },

  // Escena de la cabaña (éxito)
  sceneCabanaExitosa: {
    id: "sceneCabanaExitosa",
    text: "Con tus conocimientos deduces cómo abrir una puerta secreta dentro de la cabaña. Encuentras un mapa antiguo y un diario que menciona 'la llave del altar' como crucial.",
    options: [
      {
        id: 1,
        text: "Seguir las indicaciones del mapa.",
        nextSceneId: {
          success: "sceneTesoro",
          failure: "scenePantano",
        },
      },
      {
        id: 2,
        text: "Buscar la llave mencionada en el diario.",
        nextSceneId: {
          success: "sceneLlaveEncontrada",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena de la cabaña (fallo)
  sceneCabanaFallida: {
    id: "sceneCabanaFallida",
    text: "No comprendes los mecanismos de la cabaña y accidentalmente activas una trampa que te atrapa. Tras horas, logras liberarte, pero ahora estás débil.",
    options: [
      {
        id: 1,
        text: "Salir de la cabaña y tomar el sendero oscuro.",
        nextSceneId: {
          success: "sceneSenderoExitosa",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena de la cabaña (resultado parcial)
  sceneCabanaParcial: {
    id: "sceneCabanaParcial",
    text: "Encuentras algunas pistas en la cabaña, pero activas una trampa que destruye parte del diario. Decides salir en busca de más información.",
    options: [
      {
        id: 1,
        text: "Examinar el altar para buscar conexiones con el diario dañado.",
        nextSceneId: {
          success: "sceneAltarExitosa",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del sendero (éxito)
  sceneSenderoExitosa: {
    id: "sceneSenderoExitosa",
    text: "Tu carisma atrae a un misterioso guía que te cuenta sobre una 'torre de las sombras' y sobre un peligroso pantano que se extiende más adelante.",
    options: [
      {
        id: 1,
        text: "Pedir que te lleve a la torre de las sombras.",
        nextSceneId: {
          success: "sceneTorreSombras",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Explorar el pantano por tu cuenta.",
        nextSceneId: {
          success: "scenePantano",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del sendero (fallo)
  sceneSenderoFallida: {
    id: "sceneSenderoFallida",
    text: "Te pierdes en la oscuridad y terminas en un pantano peligroso, donde cada paso es un riesgo.",
    options: [
      {
        id: 1,
        text: "Intentar regresar al punto de inicio.",
        nextSceneId: {
          success: "scene1",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del sendero (parcial)
  sceneSenderoParcial: {
    id: "sceneSenderoParcial",
    text: "Logras evitar algunos peligros, pero terminas en un cruce incierto. Debes elegir entre seguir hacia una luz lejana o adentrarte en un sendero estrecho rodeado de árboles.",
    options: [
      {
        id: 1,
        text: "Seguir el camino hacia la luz lejana.",
        nextSceneId: {
          success: "sceneRefugio",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Adentrarte en el sendero oscuro entre los árboles.",
        nextSceneId: {
          success: "sceneTorreSombras",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del altar (éxito)
  sceneAltarExitosa: {
    id: "sceneAltarExitosa",
    text: "Estudias las inscripciones del altar y descubres que mencionan 'la llave del bosque' y un ritual ancestral que requiere un objeto perdido.",
    options: [
      {
        id: 1,
        text: "Buscar la llave mencionada en el mapa que viste en la cabaña.",
        nextSceneId: {
          success: "sceneLlaveEncontrada",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Intentar realizar el ritual sin esperar por el objeto perdido.",
        nextSceneId: {
          success: "sceneRitual",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del altar (fallo)
  sceneAltarFallida: {
    id: "sceneAltarFallida",
    text: "Las inscripciones te superan y, sin comprender su significado, liberas accidentalmente un espíritu hostil. Huyes con dificultad.",
    options: [
      {
        id: 1,
        text: "Correr hacia el sendero oscuro en busca de refugio.",
        nextSceneId: {
          success: "sceneSenderoExitosa",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del altar (resultado parcial) – creada para opciones con múltiples requerimientos
  sceneAltarParcial: {
    id: "sceneAltarParcial",
    text: "Aunque tus conocimientos no son suficientes para descifrar completamente las inscripciones, logras entender parte del ritual. La información que obtienes te permite avanzar, pero con ciertas incertidumbres.",
    options: [
      {
        id: 1,
        text: "Continuar intentando comprender el ritual por tu cuenta.",
        nextSceneId: {
          success: "sceneRitual",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Buscar ayuda para descifrar el resto de las inscripciones.",
        nextSceneId: {
          success: "sceneConocimiento",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena de la llave encontrada
  sceneLlaveEncontrada: {
    id: "sceneLlaveEncontrada",
    text: "Tras buscar en los alrededores, encuentras una llave oculta bajo unas raíces cerca del altar. Esta parece ser la pieza que conecta los misterios del diario y el altar.",
    options: [
      {
        id: 1,
        text: "Regresar al altar y realizar el ritual con la llave.",
        nextSceneId: {
          success: "sceneRitualCompleto",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del ritual (sin llave): resultado de intentar el ritual sin la llave
  sceneRitual: {
    id: "sceneRitual",
    text: "Decides intentar el ritual sin esperar la llave. El proceso es inestable y fuerzas invisibles se desatan, llevándote a un estado de confusión.",
    options: [
      {
        id: 1,
        text: "Recobrar la compostura y buscar ayuda en el bosque.",
        nextSceneId: {
          success: "sceneConocimiento",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del ritual completado (con llave)
  sceneRitualCompleto: {
    id: "sceneRitualCompleto",
    text: "El ritual se completa de manera exitosa gracias a la llave, y una puerta mágica se abre revelando una cámara oculta llena de misterios.",
    options: [
      {
        id: 1,
        text: "Entrar por la puerta mágica.",
        nextSceneId: {
          success: "sceneSubterraneo",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena Subterránea, tras la puerta mágica
  sceneSubterraneo: {
    id: "sceneSubterraneo",
    text: "Descendiendo por una escalera oculta, llegas a una cámara subterránea con inscripciones arcanas y artefactos olvidados. Sientes que este lugar guarda la llave de antiguos secretos.",
    options: [
      {
        id: 1,
        text: "Explorar la cámara en busca de respuestas.",
        nextSceneId: {
          success: "sceneConocimiento",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena Torre de las Sombras
  sceneTorreSombras: {
    id: "sceneTorreSombras",
    text: "Llegas a una torre oscura, alta y amenazante. Un ser enigmático te espera en la entrada, ofreciendo conocimiento a cambio de un sacrificio.",
    options: [
      {
        id: 1,
        text: "Aceptar la oferta del ser enigmático.",
        nextSceneId: {
          success: "sceneConocimiento",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Rechazar la oferta y explorar la torre por tu cuenta.",
        nextSceneId: {
          success: "sceneRefugio",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena de Conocimiento (resultado de ritual, torre o ritual sin llave)
  sceneConocimiento: {
    id: "sceneConocimiento",
    text: "El conocimiento y los secretos que adquieres te abren la mente a nuevos caminos. Comprendes que tu destino está ligado a la antigua magia del bosque.",
    options: [
      {
        id: 1,
        text: "Usar el conocimiento para encontrar el tesoro perdido.",
        nextSceneId: {
          success: "sceneTesoro",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Buscar el origen del poder que acabas de conocer.",
        nextSceneId: {
          success: "sceneSubterraneo",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena de Refugio
  sceneRefugio: {
    id: "sceneRefugio",
    text: "Llegas a un refugio seguro oculto en el bosque, donde puedes recobrar energías y planificar tus próximos movimientos con calma.",
    options: [
      {
        id: 1,
        text: "Revisar el mapa y continuar la aventura.",
        nextSceneId: {
          success: "sceneTesoro",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Descansar y estudiar los escritos antiguos encontrados.",
        nextSceneId: {
          success: "sceneConocimiento",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del Pantano
  scenePantano: {
    id: "scenePantano",
    text: "El pantano es inhóspito, con aguas turbias y lodo traicionero. A pesar de los peligros, sientes que esconde secretos olvidados hace mucho.",
    options: [
      {
        id: 1,
        text: "Buscar pistas entre la vegetación y las aguas.",
        nextSceneId: {
          success: "sceneTesoro",
          failure: "sceneFailGenerico",
        },
      },
      {
        id: 2,
        text: "Intentar encontrar una ruta segura a través del pantano.",
        nextSceneId: {
          success: "sceneRefugio",
          failure: "sceneFailGenerico",
        },
      },
    ],
  },

  // Escena del Tesoro
  sceneTesoro: {
    id: "sceneTesoro",
    text: "Sigues las pistas y finalmente descubres un cofre repleto de riquezas y conocimientos ancestrales. ¡Has triunfado en tu aventura!",
    options: [],
    isEnding: true,
  },

  // Escena de fallo genérico
  sceneFailGenerico: {
    id: "sceneFailGenerico",
    text: "Algo salió mal y tu aventura terminó abruptamente. El misterio del bosque permanece sin resolver.",
    options: [],
    isEnding: true,
  },
};
