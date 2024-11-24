import 'bootstrap/dist/css/bootstrap.min.css';

const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5500;

// Middleware
app.use(express.json());
app.use(cors()); // Permitir todas las peticiones desde cualquier origen

// Si deseas restringir el origen a Live Server:
// app.use(cors({ origin: "http://127.0.0.1:5501" }));

// Archivo JSON donde se almacenan las canciones
const nomArchivo = "canciones.json";

// Generar un ID único
const generateUniqueId = () => {
  const canciones = JSON.parse(fs.readFileSync(nomArchivo, "utf-8"));
  let id;
  do {
    id = Math.floor(Math.random() * 9999);
  } while (canciones.some((cancion) => cancion.id == id));
  return id;
};

// Rutas para las canciones

// Obtener todas las canciones
app.get("/canciones", (req, res) => {
  if (!fs.existsSync(nomArchivo)) {
    fs.writeFileSync(nomArchivo, JSON.stringify([]), "utf-8");
  }
  const canciones = JSON.parse(fs.readFileSync(nomArchivo, "utf-8"));
  res.json(canciones);
});

// Agregar una nueva canción
app.post("/canciones", (req, res) => {
  const { titulo, artista, tono } = req.body;

  if (!titulo || !artista || !tono) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const canciones = JSON.parse(fs.readFileSync(nomArchivo, "utf-8"));
  const nuevaCancion = { id: generateUniqueId(), titulo, artista, tono };
  canciones.push(nuevaCancion);
  fs.writeFileSync(nomArchivo, JSON.stringify(canciones), "utf-8");
  res.status(201).json({ message: "Canción agregada", nuevaCancion });
});

// Editar una canción existente
app.put("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, artista, tono } = req.body;

  if (!titulo || !artista || !tono) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const canciones = JSON.parse(fs.readFileSync(nomArchivo, "utf-8"));
  const index = canciones.findIndex((c) => c.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  canciones[index] = { id, titulo, artista, tono };
  fs.writeFileSync(nomArchivo, JSON.stringify(canciones), "utf-8");
  res.status(200).json({ message: "Canción editada exitosamente" });
});

// Eliminar una canción
app.delete("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const canciones = JSON.parse(fs.readFileSync(nomArchivo, "utf-8"));
  const nuevasCanciones = canciones.filter((c) => c.id != id);

  if (nuevasCanciones.length === canciones.length) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  fs.writeFileSync(nomArchivo, JSON.stringify(nuevasCanciones), "utf-8");
  res.status(200).json({ message: "Canción eliminada exitosamente" });
});

// Servir archivos estáticos del frontend (opcional)
app.use(express.static("public"));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
