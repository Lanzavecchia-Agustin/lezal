import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

type SceneKey = "scene1" | "scene2" | "scene3" | "endingA" | "endingB";

interface SceneOption {
  id: number;
  text: string;
  nextSceneId: SceneKey;
}

interface Scene {
  id: string;
  text: string;
  options: SceneOption[];
  isEnding?: boolean;
}

type StoryData = Record<SceneKey, Scene>;

interface RoomState {
  currentScene: Scene;
  votes: Record<number, number>;
  userVoted: Set<string>; // socket.id que ya votaron
  users: Record<string, string>; // socket.id -> userName
}

const storyData: StoryData = {
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

const rooms: Record<string, RoomState> = {};

function resetVotesForScene(scene: Scene): Record<number, number> {
  const votes: Record<number, number> = {};
  scene.options.forEach((opt) => {
    votes[opt.id] = 0;
  });
  return votes;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Permitir solo el dominio del frontend
      methods: ["GET", "POST"], // Métodos permitidos
      credentials: true, // Permitir cookies (si es necesario para autenticación)
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Evento para que el usuario se una o cree una sala
    socket.on("joinRoom", ({ roomId, userName }: { roomId: string; userName: string }) => {
      if (!userName) {
        socket.emit("error", "El nombre de usuario es obligatorio.");
        return;
      }

      if (!rooms[roomId]) {
        // Crear una nueva sala si no existe
        rooms[roomId] = {
          currentScene: storyData.scene1,
          votes: resetVotesForScene(storyData.scene1),
          userVoted: new Set(),
          users: {},
        };
      }

      const room = rooms[roomId];
      room.users[socket.id] = userName; // Guardar el nombre del usuario
      socket.join(roomId);

      console.log(`Usuario "${userName}" se unió a la sala "${roomId}".`);

      // Enviar la escena actual y los usuarios en la sala
      io.to(roomId).emit("sceneUpdate", {
        scene: room.currentScene,
        votes: room.votes,
        users: Object.values(room.users),
      });
    });

    // Cuando un cliente vota
    socket.on("vote", ({ roomId, optionId }: { roomId: string; optionId: number }) => {
      const room = rooms[roomId];
      if (!room) return;

      if (room.currentScene.isEnding) {
        console.log("La historia ha terminado. No se aceptan votos.");
        return;
      }

      if (room.userVoted.has(socket.id)) {
        console.log(`Usuario ${socket.id} ya votó en esta escena.`);
        return;
      }

      const foundOption = room.currentScene.options.find((opt) => opt.id === optionId);
      if (!foundOption) {
        console.log("Opción inválida.");
        return;
      }

      room.votes[optionId] = (room.votes[optionId] ?? 0) + 1;
      room.userVoted.add(socket.id);

      io.to(roomId).emit("voteUpdate", room.votes);
    });

    // Cuando el anfitrión cierra la votación
    socket.on("closeVoting", (roomId: string) => {
      const room = rooms[roomId];
      if (!room || room.currentScene.isEnding) return;

      let winnerOptionId: number | null = null;
      let maxVotes = -1;

      for (const [optionIdStr, voteCount] of Object.entries(room.votes)) {
        const optionId = parseInt(optionIdStr, 10);
        if (voteCount > maxVotes) {
          maxVotes = voteCount;
          winnerOptionId = optionId;
        }
      }

      if (winnerOptionId === null) {
        console.log("No hubo votos. No se avanza de escena.");
        return;
      }

      const winnerOption = room.currentScene.options.find((opt) => opt.id === winnerOptionId);
      if (!winnerOption) return;

      room.currentScene = storyData[winnerOption.nextSceneId];
      if (!room.currentScene.isEnding) {
        room.votes = resetVotesForScene(room.currentScene);
        room.userVoted = new Set();
      }

      io.to(roomId).emit("sceneUpdate", {
        scene: room.currentScene,
        votes: room.votes,
        users: Object.values(room.users),
      });
    });

    // Evento para desconectar al usuario
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const roomId of Object.keys(rooms)) {
        const room = rooms[roomId];
        if (room.users[socket.id]) {
          delete room.users[socket.id];
          io.to(roomId).emit("sceneUpdate", {
            scene: room.currentScene,
            votes: room.votes,
            users: Object.values(room.users),
          });
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
