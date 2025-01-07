import { Scene } from "./roomsStore"; // Importa la interfaz `Scene`



export const storyData: Record<string, Scene> = {
  scene2: {
    id: "scene2",
    text: "Te encuentras en el hangar de la estación espacial. La nave luce desgastada, con parches en el fuselaje. C.H.I. analiza tus movimientos:\n" +
      "\"Por favor, procedan con la personalización mínima de sus herramientas. Y antes de que pregunten: no, no hay presupuesto para mejorar esto.\"\n\n" +
      "Opciones de preparación:",
    options: [
      { id: 1, text: "Seleccionar herramientas de exploración básicas", nextSceneId: "scene4" },
      { id: 2, text: "Ignorar las preparaciones y subir a la nave", nextSceneId: "scene5" },
    ],
  },
  scene3: {
    id: "scene3",
    text: "C.H.I. responde con un tono frío y sarcástico:\n" +
      "\"La señal proviene de Lezal. Es un fenómeno electromagnético único, con un 87% de probabilidades de ser de origen humanoide. Sin embargo, el 13% restante grita 'problemas'. Pero sigamos adelante. ¿Qué podría salir mal?\"",
    options: [
      { id: 1, text: "Avanzar hacia el hangar para preparar el despegue", nextSceneId: "scene2" },
      { id: 2, text: "Pedir a C.H.I. que maneje todo automáticamente", nextSceneId: "scene5" },
    ],
  },
  scene4: {
    id: "scene4",
    text: "Seleccionas herramientas básicas: un escáner manual, un dispositivo de análisis de energía y una linterna de baja intensidad. C.H.I. comenta:\n" +
      "\"Excelente elección. Aunque, sinceramente, hasta un palo de madera podría ser más útil en este contexto. Ahora suban a bordo.\"",
    options: [
      { id: 1, text: "Subir a la nave", nextSceneId: "scene5" },
    ],
  },
  scene5: {
    id: "scene5",
    text: "La nave, 'Eris XIV', se sacude ligeramente al encenderse. C.H.I. inicia los protocolos de despegue:\n" +
      "\"La definición operativa de 'segura' es cuestionable en esta nave. Estamos funcionales al 73%, lo cual es... optimista. Tomen sus asientos y abrochen los cinturones.\"\n\n" +
      "Procedimientos durante el despegue:",
    options: [
      { id: 1, text: "Revisar el asiento por seguridad", nextSceneId: "scene6" },
      { id: 2, text: "Ignorar las instrucciones y confiar en la IA", nextSceneId: "scene7" },
    ],
  },
  scene6: {
    id: "scene6",
    text: "Revisas el asiento y encuentras un resorte suelto. C.H.I. comenta:\n" +
      "\"Felicidades. Has superado al equipo de mantenimiento de la Federación. Ahora abróchate el cinturón.\"",
    options: [
      { id: 1, text: "Abróchate el cinturón", nextSceneId: "scene8" },
    ],
  },
  scene7: {
    id: "scene7",
    text: "Decides ignorar las instrucciones. C.H.I., con un tono exasperado, ajusta automáticamente tu cinturón:\n" +
      "\"Rebeldía. Innato de la humanidad. Espero que sobrevivas lo suficiente para justificar esta actitud.\"",
    options: [
      { id: 1, text: "Continuar con el protocolo de despegue", nextSceneId: "scene8" },
    ],
  },
  scene8: {
    id: "scene8",
    text: "La nave despega con éxito. Desde los altoparlantes, C.H.I. comenta:\n" +
      "\"Despegue completado. La Federación debería replantearse el presupuesto. Esto es peor que un simulador de Stardew Valley. Buen viaje.\"",
    options: [
      { id: 1, text: "Pedir información sobre la señal", nextSceneId: "scene9" },
      { id: 2, text: "Monitorear las señales cercanas en el espacio", nextSceneId: "scene10" },
    ],
  },
  scene9: {
    id: "scene9",
    text: "Preguntas a C.H.I. sobre la señal.\nC.H.I.: \"Es un fenómeno electromagnético de origen humanoide. Aunque debo admitir que hay un 13% que grita: 'trampa'. Espero que sus habilidades sean suficientes para manejar lo que venga.\"",
    options: [
      { id: 1, text: "Prepararse para el aterrizaje en Lezal", nextSceneId: "scene11" },
    ],
  },
  scene10: {
    id: "scene10",
    text: "Activas el radar de proximidad. C.H.I. comenta:\n" +
      "\"Radar activo. Si algo nos choca, al menos tendrás tiempo para gritar.\"",
    options: [
      { id: 1, text: "Prepararse para el aterrizaje en Lezal", nextSceneId: "scene11" },
    ],
  },
  scene11: {
    id: "scene11",
    text: "Llegan al planeta Lezal. La nave tiembla mientras entra en la atmósfera. C.H.I. advierte:\n" +
      "\"Condiciones inestables. Aterrizaré automáticamente para preservar mi integridad emocional. Prepárense para cualquier eventualidad.\"",
    options: [
      { id: 1, text: "Explorar el entorno cercano", nextSceneId: "scene12" },
      { id: 2, text: "Realizar un escaneo inicial del terreno", nextSceneId: "scene13" },
    ],
  },
  scene12: {
    id: "scene12",
    text: "Exploras el entorno cercano. Encuentras estructuras alienígenas antiguas. C.H.I. comenta:\n" +
      "\"Interesante. Parece que alguien jugó con fuerzas que no comprendía. Qué típico.\"",
    options: [
      { id: 1, text: "Investigar las estructuras", nextSceneId: "scene14" },
    ],
  },
  scene13: {
    id: "scene13",
    text: "Realizas un escaneo inicial. C.H.I. detecta actividad biológica cercana:\n" +
      "\"Detecto señales de vida. Recomiendo precaución, aunque sé que no seguirán mi consejo.\"",
    options: [
      { id: 1, text: "Investigar las señales de vida", nextSceneId: "scene14" },
    ],
  },
  scene14: {
    id: "scene14",
    text: "Te encuentras con una criatura bioluminiscente. C.H.I. comenta:\n" +
      "\"Qué fascinante. Intentemos no alterarla, aunque sé que probablemente lo harán.\"",
    options: [
      { id: 1, text: "Intentar comunicación básica", nextSceneId: "endingA" },
      { id: 2, text: "Ignorar a la criatura y avanzar", nextSceneId: "endingB" },
    ],
  },
  endingA: {
    id: "endingA",
    text: "Logras comunicarte con la criatura, que te guía hacia una estructura segura. C.H.I. comenta:\n" +
      "\"Milagroso. Tal vez no sean tan incompetentes después de todo. Buen trabajo.\"",
    options: [],
    isEnding: true,
  },
  endingB: {
    id: "endingB",
    text: "Ignoras a la criatura, lo que provoca su agresión. La tripulación sufre bajas y debes retirarte. C.H.I. comenta:\n" +
      "\"Decisiones cuestionables. Pero, sinceramente, esperaba menos de ustedes.\"",
    options: [],
    isEnding: true,
  },
};
