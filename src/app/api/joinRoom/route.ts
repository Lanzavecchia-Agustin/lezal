// app/api/join/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms from "../../../../roomsStore";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function GET(req: Request) {
  console.log("GET /api/join called");
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");

  if (!roomId || !userName) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: [],
      scene: {
        id: "scene1",
        text: "Año 2247. La humanidad se enfrenta a su última frontera: las estrellas. Tras décadas de exploración, una señal extraña ha surgido de Lezal, un planeta olvidado en el borde del espacio conocido. Se organiza un grupo de reconocimiento... pero los recursos son escasos, y las probabilidades de éxito, cuestionables.\n\n" +
          "C.H.I. aparece en los altoparlantes de la Federación:\n" +
          "\"He analizado los parámetros de esta misión y, con todo respeto, debo declarar que las probabilidades de éxito de esta tripulación son cercanas a cero. Pero aquí estamos. Prepárense para ser 'medianamente útiles'.\"",
        options: [
          { id: 1, text: "Avanzar hacia el hangar para preparar el despegue", nextSceneId: "scene2" },
          { id: 2, text: "Preguntar a C.H.I. más detalles sobre la misión", nextSceneId: "scene3" },
        ],
      },
      votes: {}, 
      userVoted: new Set<string>(), 
    };
  }

  if (!rooms[roomId].users.includes(userName)) {
    rooms[roomId].users.push(userName);
  }

  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    users: rooms[roomId].users,
    scene: rooms[roomId].scene,
    votes: rooms[roomId].votes,
  });

  return NextResponse.json({ message: "Room joined", room: rooms[roomId] });
}
