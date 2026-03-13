# CONFIGURACIÓN Y DESARROLLO

Esta guía te ayudará a entender y modificar el código del juego.

## Estructura de Archivos y Responsabilidades

```
js/
├── game.js          - Controlador principal (punto de entrada)
├── engine.js        - Motor del juego y física
├── towers.js        - Sistema de torres
├── enemies.js       - Sistema de enemigos  
├── levels.js        - Sistema de niveles
└── audio.js         - Sistema de sonidos
```

## Cómo Funciona el Juego

### Flujo Principal (game.js)

1. **Inicialización** → `Game.init()`
   - Obtiene referencias del DOM
   - Configura event listeners
   - Inicializa sistemas de audio y engine

2. **Inicio del Juego** → `startGame()`
   - Resetea estado
   - Limpia enemigos y torres
   - Inicia primera onda

3. **Game Loop** → `startGameLoop()`
   - Se ejecuta ~60 veces por segundo
   - Actualiza spawning de enemigos
   - Ejecuta lógica de motor
   - Ejecuta lógica de torres
   - Verifica fin de onda
   - Renderiza gráficos

### Game Loop Detallado

```javascript
requestAnimationFrame(loop) → {
  1. updateSpawning(deltaTime)     // Spawna enemigos
  2. GameEngine.update(deltaTime)   // Actualiza física
  3. GameEngine.executeTowerLogic() // Hace disparar torres
  4. checkEnemiesReachedEnd()       // Chequea enemigos escapados
  5. shouldEndWave()                // Chequea fin de onda
  6. render()                       // Dibuja todo
  7. updateUI()                     // Actualiza interfaz
}
```

## Modificar Parámetros del Juego

### Vidas y Oro Iniciales (game.js)

```javascript
// En startGame()
gameState.lives = 20;    // Cambiar vidas iniciales
gameState.gold = 200;    // Cambiar oro inicial
```

### Velocidad de Juego (engine.js)

```javascript
const CONFIG = {
    fps: 60,              // 60 FPS (cambiar si es lento)
    frameTime: 1000 / 60  // Tiempo por frame
};
```

### Tamaño del Mapa (engine.js)

```javascript
const CONFIG = {
    gridWidth: 30,        // Ancho del mapa en caracteres
    gridHeight: 15,       // Alto del mapa en caracteres
};
```

### Velocidad de Spawning (game.js)

```javascript
// En startGameLoop()
spawnState.spawnInterval = 0.5;  // Segundos entre enemigos (0.5 = 2 por segundo)
```

## Agregar una Nueva Torre

Edita `towers.js`:

```javascript
const TOWER_TYPES = {
    // ... torres existentes ...
    
    // NUEVA TORRE
    laser: {
        id: 'laser',
        name: 'Torre Láser',
        symbol: '[L]',
        cost: 200,
        damage: 5,
        fireRate: 0.3,  // Disparos por segundo
        range: 8,       // Radio de ataque
        color: '#ff0066'
    }
};
```

Luego agrega el botón en `index.html`:

```html
<button id="towerLaserBtn" class="tower-btn" data-tower="laser">
    [5] Láser (200 O)<br>
    <small>Daño: 5 | Vel: Lenta</small>
</button>
```

Y la tecla en `game.js`:

```javascript
if (e.key === '5') selectTower('laser');
```

## Agregar un Nuevo Tipo de Enemigo

Edita `enemies.js`:

```javascript
const ENEMY_TYPES = {
    // ... enemigos existentes ...
    
    // NUEVO ENEMIGO
    boss: {
        id: 'boss',
        symbol: 'B',      // Símbolo ASCII
        health: 10,       // Mucha vida
        speed: 0.3,       // Lento
        reward: 100,      // Buena recompensa
        armor: 2          // Reduce daño
    }
};
```

Y en `game.js` agrega lógica para spawnear:

```javascript
// En updateSpawning()
let enemyType = 'normal';
const level = LevelSystem.getLevel();

if (level > 10 && Math.random() < 0.3) enemyType = 'fast';
if (level > 20 && Math.random() < 0.2) enemyType = 'heavy';
if (level > 50 && Math.random() < 0.1) enemyType = 'boss'; // Agregar
```

## Modificar Dificultad de Niveles

Edita `levels.js`:

```javascript
// Modificar número de enemigos
const getEnemyCount = () => {
    const baseEnemies = 5;
    const levelMultiplier = (currentLevel - 1) * 5;
    const waveBonus = currentWave * 2;
    // Aumentar estos números = más enemigos
    return Math.min(baseEnemies + levelMultiplier + waveBonus, 100);
};

// Modificar velocidad de enemigos
const getEnemySpeed = () => {
    const baseSpeed = 1.0;
    const levelBonus = (currentLevel - 1) * 0.1;  // Cambiar 0.1
    return Math.min(baseSpeed + levelBonus, 3.0);
};

// Modificar vida de enemigos
const getEnemyHealth = () => {
    const baseHealth = 1;
    const levelBonus = Math.floor((currentLevel - 1) / 5);  // Cambiar 5
    const waveBonus = currentWave * 0.5;
    return baseHealth + levelBonus + waveBonus;
};
```

## Cambiar Colores del Tema

Edita `css/style.css`:

```css
/* Colores principales */
:root {
    --color-primary: #00ff00;    /* Verde neon actual */
    --color-secondary: #ffff00;  /* Amarillo */
    --color-danger: #ff0000;     /* Rojo */
    --color-info: #0066ff;       /* Azul */
    --color-bg: #0f0f1e;         /* Fondo oscuro */
    --color-border: #1a1a2e;     /* Bordes */
}

/* Cambiar todos los colores a la vez */
body {
    color: #00ff00;  /* Cambiar a otro color */
}
```

## Sistema de Sonido - Crear Nuevos Efectos

Edita `audio.js`:

```javascript
// Agregar nuevo método
const playCustomSound = () => {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    // Configurar frecuencia (en Hz)
    osc.frequency.setValueAtTime(440, now);      // La4
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);

    // Configurar volumen
    gain.gain.setValueAtTime(masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
};
```

Luego llamarlo desde game.js donde sea necesario.

## Renderizado ASCII - Cambiar Símbolos

Los símbolos se definen en:
- `towers.js` → `TOWER_TYPES[...].symbol`
- `enemies.js` → `ENEMY_TYPES[...].symbol`

Puedes cambiarlos a cualquier carácter ASCII:

```javascript
// Ejemplos de símbolos
'[T]'   // Torre básica (actual)
'[+]'   // Torre alternativa
'●'     // Círculo lleno
'○'     // Círculo vacío
'◆'     // Diamante
'▓'     // Bloque lleno
'E'     // Enemigo simple
'👹'    // Emoji (si quieres)
```

## Agregar Efectos Especiales

Ejemplo: Torres que curan otras torres

```javascript
// En towers.js
healingTower: {
    id: 'healing',
    name: 'Torre de Sanación',
    symbol: '[+]',
    cost: 120,
    damage: 0,
    fireRate: 1,
    range: 6,
    healEffect: 0.5  // Sana torres cercanas
}
```

Luego en `engine.js`, agrega lógica en `executeTowerLogic()`:

```javascript
// Después de disparar
if (tower.type === 'healing') {
    const nearbyTowers = TowerSystem.getTowersNear(tower.x, tower.y, 6);
    nearbyTowers.forEach(nearby => {
        if (nearby.health < nearby.maxHealth) {
            nearby.health = Math.min(nearby.maxHealth, nearby.health + 0.5);
        }
    });
}
```

## Debugging

### Ver Estados del Juego

Abre la consola (F12) y ejecuta:

```javascript
// Ver estado del juego
console.log(GameEngine.getState());
console.log(LevelSystem.getLevelInfo());
console.log(TowerSystem.getTowers());
console.log(EnemySystem.getEnemies());

// Agregar enemigos manualmente
EnemySystem.addEnemy(EnemySystem.createEnemy('boss'));

// Agregar dinero
game.gold += 1000;
```

### Breakpoints

1. Abre DevTools (F12)
2. Ve a pestaña "Sources"
3. Abre el archivo JS
4. Haz clic en el número de línea para agregar breakpoint
5. El juego pausará cuando llegue a esa línea

### Console Logging

Agrega logs en el código:

```javascript
console.log('Onda iniciada');
console.log('Enemigos spawneados:', enemy.id);
console.log('Torre disparó a:', target.id);
```

## Optimizaciones

Si el juego va lento:

1. **Reducir resolución**
   ```javascript
   gridWidth: 20,  // Era 30
   gridHeight: 10, // Era 15
   ```

2. **Reducir FPS**
   ```javascript
   fps: 30,  // En lugar de 60
   ```

3. **Limitar enemigos**
   ```javascript
   return Math.min(baseEnemies + levelMultiplier + waveBonus, 50); // Era 100
   ```

4. **Desactivar efectos de sonido**
   ```javascript
   AudioManager.setVolume(0);
   ```

## Testing

### Test Manual del Juego

1. Inicia juego
2. Coloca algunas torres
3. Verifica que disparan
4. Verifica que matan enemigos
5. Verifica que ganas oro
6. Verifica que puedes colocar más torres
7. Completa una onda
8. Verifica que aumenta la dificultad

### Test en Navegadores

Prueba en:
- Chrome/Edge (mejor soporte)
- Firefox
- Safari
- Mobile browsers (si es posible)

## Estructura de Datos Principal

### Objeto Torre
```javascript
{
    id: number,
    type: 'basic'|'fast'|'power'|'ice',
    x: number,
    y: number,
    health: number,
    maxHealth: number,
    lastFireTime: number,
    targets: array,
    symbol: string
}
```

### Objeto Enemigo
```javascript
{
    id: number,
    type: 'normal'|'fast'|'heavy',
    x: number,
    y: number,
    pathProgress: number,
    health: number,
    maxHealth: number,
    speed: number,
    alive: boolean,
    reward: number,
    slowEffect: number,
    symbol: string
}
```

### Objeto Proyectil
```javascript
{
    id: number,
    fromTower: number,
    targetEnemy: number,
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    speed: number,
    damage: number,
    alive: boolean,
    symbol: string,
    towerType: string
}
```

---

**¡Diviértete modificando el juego! 🎮**
