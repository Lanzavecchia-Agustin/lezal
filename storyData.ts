import { Scene, SceneOption } from "./roomsStore";
import db from "./db.json";
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

/*
  En este ejemplo se usan 3 caminos:
   - "sceneNormal..." → camino por defecto.
   - "sceneChiInutil..." → camino especial si se ha desbloqueado "chi-inutil".
   - "sceneChiResponsable..." → camino especial si se ha desbloqueado "chi-responsable".
  
  Cada opción define:
   - En "success" la ruta normal.
   - En "partial" la ruta especial a tomar si se cumple el desbloqueo.
  
  Durante la historia, algunas opciones (a través de lockedAttributeIncrement)
  acumulan puntos para desbloquear uno u otro atributo oculto.
*/

// export const storyData: StoryData = {
//   // Escena 1: Introducción
//   scene1: {
//     id: "scene1",
//     text: "Doctor, nos encontramos en el hospital central. Tus decisiones definirán si eres responsable, o un completo inútil.",
//     options: [
//       {
//         id: 1,
//         text: "quién es el paciente de mayor urgencia?.",
//         requirement: ["inteligente"],
//         maxVotes: 1,
//         // Suma 2 puntos para 'chi-responsable'
//         lockedAttributeIncrement: { attribute: "chi-responsable", increment: 2 },
//         nextSceneId: {
//           success: "sceneNormal2",  // Por defecto
//           failure: "sceneNormal2"
//         },
//       },
//       {
//         id: 2,
//         text: "Debería alimentarme para pensar mejor",
//         requirement: ["carismatico"],
//         maxVotes: 1,
//         // Suma 1 punto para 'chi-responsable'
//         lockedAttributeIncrement: { attribute: "chi-responsable", increment: 1 },
//         nextSceneId: {
//           success: "sceneNormal2",
//           failure: "sceneNormal2"
//         },
//       },
//       {
//         id: 3,
//         text: "Acercarte a la bella mujer de mirada triste que se encuentra en el pasillo.",
//         requirement: ["carismatico", "fuerte"],
//         maxVotes: 1,
//         // No suma puntos, pero abre la posibilidad de una ruta especial:
//         // Si se ha desbloqueado "chi-responsable", se redirige a esa rama.
//         nextSceneId: {
//           success: "sceneChiResponsableIntro",
//           failure: "sceneNormal2",
//           partial: "sceneNormal2"
//         },
//       },
//     ],
//   },

//   // Escena 2: Camino normal (continúa la aventura)
//   sceneNormal2: {
//     id: "sceneNormal2",
//     text: "Una puerta se abre de golpe antes de que puedas reaccionar. Una enfermera lleva a una niña en una camilla a toda velocidad, rodeada por 2 médicos más.",
//     options: [
//       {
//         id: 1,
//         text: "Entrar a socorrer.",
//         requirement: ["carismatico", "Inteligente"],
//         // Suma 1 punto para 'chi-inutil'
//         lockedAttributeIncrement: { attribute: "chi-inutil", increment: 1 },
//         nextSceneId: {
//           success: "sceneNormal3",
//           failure: "sceneChiresponsableintro",
//           partial: "sceneChiInutilIntro"  
//         },
//       },
//       {
//         id: 2,
//         text: "Exigir que te brinden información sobre la muchacha, quizás tu ojo experto pueda ayudar.",
//         requirement: ["autista", "Inteligente"],
//  // Suma 1 punto para 'chi-responsable'
//         lockedAttributeIncrement: { attribute: "chi-responsable", increment: 1 },
//         nextSceneId: {
//           success: "sceneNormal3",
//           failure: "sceneChiresponsableintro",
//         },
//       },
//     ],
//   },

//   // Escena 3: Continuación del camino normal
//   sceneNormal3: {
//     id: "sceneNormal3",
//     text: "Sarcoidosis. Lo que pensabas. Están por operar. ¿Qué es lo que los otros médicos no han visto?",
//     options: [
//       {
//         id: 1,
//         text: "No tiene salvación. Morirá de todas formas, es innecesario operar.",
//         requirement: ["autista", "Inteligente"],
//         nextSceneId: {
//           success: "sceneNormalFinal",
//           failure: "sceneFailGenerico",
//         },
//       },
//     ],
//   },

//   // Final normal
//   sceneNormalFinal: {
//     id: "sceneNormalFinal",
//     text: "Has salvado los órganos, gente en terapia intensiva te lo agradecerá, la niña muere de manera pacífica.",
//     options: [],
//     isEnding: true,
//   },

//   // Rama especial: Introducción a "chi-inutil"
//   sceneChiInutilIntro: {
//     id: "sceneChiInutilIntro",
//     text: "El poder caótico de 'chi-inutil' comienza a manifestarse en ti. Sientes una energía inusual que te prepara para desafíos únicos en un nuevo camino.",
//     options: [
//       {
//         id: 1,
//         text: "Seguir el camino influenciado por 'chi-inutil'.",
//         nextSceneId: {
//           success: "sceneFinalChiInutil",
//           failure: "sceneFailGenerico",
//         },
//       },
//     ],
//   },

//   // Rama especial: Final Chi-Inutil
//   sceneFinalChiInutil: {
//     id: "sceneFinalChiInutil",
//     text: "Cjjjjjjjjjj",
//     options: [],
//     isEnding: true,
//   },

//   // Rama especial: Introducción a "chi-responsable"
//   sceneChiresponsableintro: {
//     id: "sceneChiResponsableIntro",
//     text: "Tu ojo no falla. La mujer del pasillo te cuenta que su hija está en grave peligro. Los médicos dicen que es Sarcoidosis, pero tú notas algo distinto solo con verla",
//     options: [
//       {
//         id: 1,
//         text: "Las manchas en su mano'.",
//         maxVotes: 1,
//         // Suma 0 punto para 'chi-responsable'
//         lockedAttributeIncrement: { attribute: "chi-responsable", increment: 0 },
//         nextSceneId: {
//           success: "sceneFinalChiResponsable",
//           failure: "sceneFailGenerico",
//         },
//       },
//         {
//         id: 2,
//         text: "Su falta de cabello.",
//         maxVotes: 1,
//         // Suma 3 punto para 'chi-responsable'
//         lockedAttributeIncrement: { attribute: "chi-responsable", increment: 3 },
//         nextSceneId: {
//           success: "sceneFinalChiResponsable",
//           failure: "sceneFailGenerico",
//         },
//       }
//     ],
//   },

//   // Rama especial: Final Chi-Responsable
//   sceneFinalChiResponsable: {
//     id: "sceneFinalChiResponsable",
//     text: "Tu maaestria en la disciplina te lleva a moverte directamente hacia el lugar de la cirugía.",
//     options: [
//       {
//         id: 1,
//         text: "DETENGAN LA CIRUGÍA!.",
//         requirement: ["chi-responsable"],
//         maxVotes: 1,
//           nextSceneId: {
//           success: "sceneFinalChiResponsable2",
//           failure: "sceneFailGenerico",
//         },}
//     ]
//  },

//   // Rama especial: Final Chi-Responsable2
//   sceneFinalChiResponsable2: {
//     id: "sceneFinalChiResponsable2",
//     text: "Has demostrado ser el Doctor más responsable del Mundo!.",
//     options: [],
//     isEnding: true,
//   },

//   // Escena de fallo genérico
//   sceneFailGenerico: {
//     id: "sceneFailGenerico",
//     text: "Tu interrupción provocó que el cirujano realizara un daño irreparable, la niña muere.",
//     options: [],
//     isEnding: true,
//   },
// }

const scenesArray: Scene[] = db.scenes;


export const storyData = Object.fromEntries(
  scenesArray.map((scene) => [scene.id, scene])
) as { [key: string]: Scene };

