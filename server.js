// server.js
const express = require('express');
const path = require('path');
const app = express();

// Obtiene el nombre de la carpeta de tu proyecto Angular dentro de 'dist'
// Generalmente es el nombre de tu proyecto, en tu caso 'frontend'
const projectName = 'frontend'; 

// Ruta de tu carpeta 'browser' dentro de 'dist'
const browserDistFolder = path.join(__dirname, 'dist', projectName, 'browser');

// Sirve los archivos estáticos de la carpeta 'browser'
app.use(express.static(browserDistFolder));

// Para manejar las rutas de Angular (deep links)
// Esto es crucial para que cuando el usuario recargue una página interna (ej. /contact)
// o acceda directamente a ella, el servidor devuelva siempre el index.html
// y Angular Router se encargue de la navegación.
app.get('*', (req, res) => {
  res.sendFile(path.join(browserDistFolder, 'index.html'));
});

// Railway inyectará la variable PORT. Si no está definida, usará 8080.
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Angular app serving static files from ${browserDistFolder}`);
  console.log(`Node Express server listening on port ${port}`);
});