const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // carpeta para tu HTML y JS

let jugadores = {};  // { socketId: {nombre, cartasSeleccionadas: []} }

io.on("connection", (socket) => {
  console.log("Nuevo jugador conectado:", socket.id);

  // Registrar jugador
  socket.on("registrarJugador", (nombre) => {
    jugadores[socket.id] = { nombre, cartasSeleccionadas: [] };
    io.emit("listaJugadores", jugadores);
  });

  // Cuando selecciona/deselecciona una carta
  socket.on("cartaSeleccionada", (carta) => {
    if (!jugadores[socket.id]) return;
    const seleccionadas = jugadores[socket.id].cartasSeleccionadas;
    const index = seleccionadas.findIndex(c => c.valor === carta.valor && c.palo === carta.palo);

    if (index === -1) {
      seleccionadas.push(carta);
    } else {
      seleccionadas.splice(index, 1);
    }

    // Actualizar a todos
    io.emit("estadoJuego", jugadores);
  });

  // Desconexión
  socket.on("disconnect", () => {
    delete jugadores[socket.id];
    io.emit("listaJugadores", jugadores);
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
