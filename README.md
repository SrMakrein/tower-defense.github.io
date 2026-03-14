# Tower Defense 🎮

Un **juego Tower Defense completo** desarrollado en **HTML5, CSS3 y JavaScript vanilla**. Totalmente compatible con **GitHub Pages** - no requiere servidor backend.

## 🌟 Características

- ✅ **Sistema Tower Defense clásico** - coloca torres para defender tu base
- ✅ **Niveles infinitos** - dificultad progresiva sin límite
- ✅ **5 ondas por nivel** - generación procedural de enemigos
- ✅ **4 tipos de torres** - cada una con mecánicas únicas
- ✅ **Sistema de sonido** - Web Audio API para efectos dinámicos
- ✅ **Sin dependencias externas** - JavaScript vanilla puro
- ✅ **GitHub Pages ready** - despliega directamente en GitHub

## 🎮 Cómo Jugar

### Objetivo
Detén los enemigos que avanzan por el camino antes de que lleguen al final. Defiende tu base colocando torres estratégicamente.

### Mecánicas

**Vida y Oro**
- Comienzas con **20 vidas** y **200 oro**
- Pierdes 1 vida por cada enemigo que escapa
- Ganas oro al destruir enemigos
- Puedes gastar oro para colocar torres

**Torres Disponibles**

| Torre | Costo | Daño | Velocidad | Especial |
|-------|-------|------|-----------|----------|
| **Básica [T]** | 50 | 1 | Normal | Equilibrada |
| **Rápida [F]** | 75 | 1 | Rápida | Muchos disparos |
| **Potente [P]** | 150 | 3 | Lenta | Alto daño |
| **Hielo [I]** | 100 | 0.5 | Normal | Ralentiza enemigos |

**Enemigos**
- `E` - Enemigo normal (1 vida, velocidad 1x, 10 oro) - enemigos base de cada oleada
- `e` - Enemigo rápido (0.5 vida, velocidad 1.5x, 10 oro) - +2 adicionales por oleada
- `H` - Enemigo pesado (8 vida, velocidad 0.5x, 5 oro) - +2 adicionales por oleada
- `X` - Enemigo élite (2 vida, velocidad 1x, 25 oro) - aparece con barracones
- `B` - Boss (salud variable, 50 oro) - aparece cada 5 ondas

> **Nota**: Cada oleada contiene enemigos base más 2 rápidos y 2 pesados adicionales garantizados

### Controles

**Mouse/Touchpad**
- Click en una torre para seleccionarla
- Click en el mapa para colocar la torre

**Teclado**
- `1` - Seleccionar Torre Básica
- `2` - Seleccionar Torre Rápida
- `3` - Seleccionar Torre Potente
- `4` - Seleccionar Torre Hielo
- `ESPACIO` - Pausar/Reanudar

**Botones**
- **Iniciar Juego** - Comenzar nueva partida
- **Pausar** - Pausa/reanuda el juego
- **Reiniciar** - Vuelve al menú inicial

## 📊 Sistema de Niveles

Cada nivel incrementa la dificultad progresivamente:

```
Nivel 1:  5 enemigos, velocidad 1.0x, 1.0 vida
Nivel 5:  25 enemigos, velocidad 1.4x, 1.5 vida
Nivel 10: 45 enemigos, velocidad 1.9x, 2.0 vida (aparecen rápidos)
Nivel 20: 95 enemigos, velocidad 2.9x, 3.0 vida (aparecen pesados)
```

**Cada onda:**
- Número de enemigos = `5 + (Nivel-1)*5 + Onda*2`
- Velocidad = `1.0 + (Nivel-1)*0.1` (máx 3.0x)
- Vida = `1.0 + floor((Nivel-1)/5) + Onda*0.5`

## 🏗️ Arquitectura del Proyecto

```
tower-defense-ascii/
├── index.html           # Página principal
├── README.md           # Este archivo
│
├── css/
│   └── style.css       # Estilos y tema retro
│
└── js/
    ├── game.js         # Controlador principal
    ├── engine.js       # Motor del juego y física
    ├── towers.js       # Sistema de torres
    ├── enemies.js      # Sistema de enemigos
    ├── levels.js       # Sistema de niveles
    └── audio.js        # Sistema de sonido
```

### Módulos

**game.js**
- Orquesta todos los sistemas
- Maneja entrada del usuario
- Controla el flujo del juego
- Gestiona UI

**engine.js**
- Game loop principal
- Física de proyectiles
- Explosiones y partículas
- Renderizado ASCII

**towers.js**
- Definición de tipos de torres
- Sistema de colocación
- Lógica de disparo
- Cálculo de rangos

**enemies.js**
- Definición de tipos de enemigos
- Movimiento en el camino
- Sistema de daño
- Efectos especiales

**levels.js**
- Generación de dificultad
- Escalado de enemigos
- Sistema de recompensas
- Puntuación

**audio.js**
- Web Audio API
- Generación procedural de sonidos
- Control de volumen

## 🚀 Cómo Ejecutar

### Localmente

1. **Descargar/clonar el proyecto**
```bash
git clone https://github.com/tu-usuario/tower-defense-ascii.git
cd tower-defense-ascii
```

2. **Abrir directamente en el navegador**
- Opción A: Haz doble clic en `index.html`
- Opción B: Abre `index.html` en tu navegador favorito

3. **O usar un servidor local** (recomendado)
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server)
npx http-server

# Con Live Server en VSCode
# Abre el archivo y usa la extensión Live Server
```

Luego accede a `http://localhost:8000`

### Desplegar en GitHub Pages

1. **Crear un repositorio en GitHub**
   - Nombre: `tower-defense-ascii`

2. **Subir los archivos**
```bash
git init
git add .
git commit -m "Initial commit: Tower Defense ASCII Game"
git branch -M main
git remote add origin https://github.com/tu-usuario/tower-defense-ascii.git
git push -u origin main
```

3. **Activar GitHub Pages**
   - Ve a Settings → Pages
   - En "Source", selecciona "main" y carpeta "root"
   - Guarda los cambios

4. **Acceder al juego**
   - Tu juego estará disponible en: `https://tu-usuario.github.io/tower-defense-ascii/`

## 🎨 Personalización

### Cambiar Colores
Edita `css/style.css`:
```css
/* Colores principales */
body { color: #00ff00; } /* Verde neon */
/* Cambia a tus colores favoritos */
```

### Añadir Nuevas Torres
Edita `js/towers.js`:
```javascript
TOWER_TYPES = {
    // Agregar nueva torre
    laser: {
        id: 'laser',
        name: 'Torre Láser',
        symbol: '[L]',
        cost: 200,
        damage: 5,
        fireRate: 0.3,
        range: 8
    }
}
```

### Modificar Equilibrio
- Cambiar costos: `towers.js` → `TOWER_TYPES`
- Cambiar vida inicial: `game.js` → `gameState.lives = X`
- Cambiar oro inicial: `game.js` → `gameState.gold = X`
- Cambiar spawning: `game.js` → `startWave()`

## 🔊 Sistema de Sonido

El juego usa **Web Audio API** para generar sonidos proceduralmente:

- 🔫 **Disparo** - Sonido agudo y corto
- 💥 **Impacto** - Sonido grave
- 💣 **Explosión** - Ruido blanco decayente
- 💀 **Enemigo destruido** - Tonos ascendentes
- 🎵 **Victoria** - Melodía simple
- ☠️ **Game Over** - Tonos descendentes

Puedes ajustar el volumen en `AudioManager.setVolume()` en `audio.js`.

## 🐛 Solución de Problemas

**No se escucha sonido**
- Los navegadores requieren interacción del usuario antes de reproducir audio
- Haz click en "Iniciar Juego" para activar el contexto de audio

**El juego va lento**
- Reduce la resolución en `engine.js` → `CONFIG.gridWidth/gridHeight`
- Cierra otras pestañas que consuman recursos

**Las torres no aparecen**
- Verifica que el oro sea suficiente (botón muestra el costo)
- Asegúrate de que la posición no esté ocupada

**Enemigos muy fáciles/difíciles**
- Ajusta los parámetros de dificultad en `levels.js`
- Modifica los costos de torres en `towers.js`

## 📈 Estrategia de Juego

1. **Primeros niveles**: Coloca torres básicas distribuidas
2. **Nivelesa 5-10**: Incorpora torres rápidas para dar cobertura
3. **Niveles 10+**: Usa torres de hielo para ralentizar enemigos pesados
4. **Niveles 20+**: Combina torres potentes con torres de hielo

**Posicionamiento clave**: Las torres en las curvas del camino tienen mejor cobertura.

## 📝 Licencia

Este proyecto está bajo licencia MIT - libre para usar, modificar y distribuir.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Puedes:
- Reportar bugs
- Sugerir nuevas características
- Mejorar el equilibrio del juego
- Optimizar el código

## 👨‍💻 Desarrollo

**Versión**: 1.0.0  
**Última actualización**: Marzo 2026  
**Desarrollado con**: HTML5, CSS3, JavaScript vanilla

## 🎯 Roadmap Futuro

- [ ] Guardado de puntuaciones locales
- [ ] Leaderboard global
- [ ] Modo campaña con niveles específicos
- [ ] Más tipos de torres (láser, arma de fuego, etc.)
- [ ] Más tipos de enemigos (jefes, inmunes al hielo, etc.)
- [ ] Efectos visuales mejorados
- [ ] Modo multijugador cooperativo (si fuera posible)

---

**¡Que disfrutes del juego! Haz que llegue la máxima oleada posible. 🎮⚔️**
