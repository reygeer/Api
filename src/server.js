import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir el index.html
app.use(express.static(__dirname));

// Almacén de salas
let salas = {}; 
// Estructura: { "sala1": { jugadores: { socketId: {nombre, cartasSeleccionadas: []} } } }

io.on("connection", (socket) => {
  console.log("Jugador conectado:", socket.id);

  socket.on("unirseSala", ({ nombre, sala }) => {
    if (!salas[sala]) {
      salas[sala] = { jugadores: {} };
    }

    salas[sala].jugadores[socket.id] = { nombre, cartasSeleccionadas: [] };
    socket.join(sala);

    io.to(sala).emit("listaJugadores", salas[sala].jugadores);
  });

  socket.on("cartaSeleccionada", ({ valor, palo, sala }) => {
    if (!salas[sala] || !salas[sala].jugadores[socket.id]) return;
    
    const jugador = salas[sala].jugadores[socket.id];
    const index = jugador.cartasSeleccionadas.findIndex(c => c.valor === valor && c.palo === palo);

    if (index === -1) {
      jugador.cartasSeleccionadas.push({ valor, palo });
    } else {
      jugador.cartasSeleccionadas.splice(index, 1);
    }

    io.to(sala).emit("estadoJuego", salas[sala].jugadores);
  });

  socket.on("disconnect", () => {
    for (const sala in salas) {
      if (salas[sala].jugadores[socket.id]) {
        delete salas[sala].jugadores[socket.id];
        io.to(sala).emit("listaJugadores", salas[sala].jugadores);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
