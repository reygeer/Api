const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sirve archivos estáticos (HTML, CSS, JS)
app.use(express.static("public"));

let jugadores = {};

io.on("connection", (socket) => {
  console.log("Jugador conectado:", socket.id);

  socket.on("registrarJugador", (nombre) => {
    jugadores[socket.id] = { nombre, cartasSeleccionadas: [] };
    io.emit("listaJugadores", jugadores);
  });

  socket.on("cartaSeleccionada", (carta) => {
    if (!jugadores[socket.id]) return;
    const seleccionadas = jugadores[socket.id].cartasSeleccionadas;
    const index = seleccionadas.findIndex(c => c.valor === carta.valor && c.palo === carta.palo);

    if (index === -1) {
      seleccionadas.push(carta);
    } else {
      seleccionadas.splice(index, 1);
    }

    io.emit("estadoJuego", jugadores);
  });

  socket.on("disconnect", () => {
    delete jugadores[socket.id];
    io.emit("listaJugadores", jugadores);
  });
});

// Render da el puerto en process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
