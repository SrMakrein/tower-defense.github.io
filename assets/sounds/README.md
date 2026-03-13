# Carpeta de Sonidos

Esta carpeta está reservada para archivos de audio.

**Nota:** El juego usa Web Audio API para generar sonidos proceduralmente, 
por lo que no se requieren archivos de audio reales.

Si deseas agregar sonidos personalizados, puedes:

1. Grabar o descargar archivos de audio (.wav, .mp3)
2. Guardarlos en esta carpeta
3. Modificar audio.js para cargarlos:

```javascript
// Ejemplo de cargar un archivo de audio
const shootSound = new Audio('/assets/sounds/shoot.wav');
shootSound.play();
```

Los navegadores modernos requieren interacción del usuario antes 
de reproducir audio, así que asegúrate de activarlo después de un click.
