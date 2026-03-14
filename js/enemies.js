/**
 * ENEMIES.JS
 * Sistema de enemigos y movimiento en el camino
 */

const EnemySystem = (() => {
    // Tipos de enemigos
    const ENEMY_TYPES = {
        normal: {
            id: 'normal',
            symbol: 'E',
            emoji: '👾',
            health: 1,
            speed: 2.0,
            reward: 10,
            armor: 0,
            spriteUrl: null
        },
        fast: {
            id: 'fast',
            symbol: 'e',
            emoji: '💨',
            health: 0.5,
            speed: 4.0,
            reward: 10,
            armor: 0,
            spriteUrl: null
        },
        heavy: {
            id: 'heavy',
            symbol: 'H',
            emoji: '🦾',
            health: 2,
            speed: 1.0,
            reward: 10,
            armor: 1,
            spriteUrl: null
        },
        elite: {
            id: 'elite',
            symbol: 'X',
            emoji: '👹',
            health: 2,
            speed: 2.0,
            reward: 25,
            armor: 0,
            spriteUrl: null,
            isElite: true
        },
        boss: {
            id: 'boss',
            symbol: 'B',
            emoji: '👿',
            health: 0, // Se asigna dinámicamente
            speed: 1.5,
            reward: 50,
            armor: 0,
            spriteUrl: null,
            isBoss: true,
            isElite: true
        }
    };

    // Camino predefinido por el que avanzan los enemigos
    const PATH = [
        { x: 0, y: 5 },
        { x: 3, y: 5 },
        { x: 6, y: 5 },
        { x: 9, y: 5 },
        { x: 12, y: 3 },
        { x: 15, y: 3 },
        { x: 18, y: 5 },
        { x: 21, y: 7 },
        { x: 24, y: 10 }
    ];

    let enemies = [];
    let enemyIdCounter = 0;

    /**
     * Obtener tipo de enemigo
     */
    const getEnemyType = (typeId) => {
        return ENEMY_TYPES[typeId] || ENEMY_TYPES.normal;
    };

    /**
     * Obtener camino
     */
    const getPath = () => {
        return PATH;
    };

    /**
     * Crear nuevo enemigo
     */
    const createEnemy = (typeId = 'normal', customHealth = null) => {
        const type = getEnemyType(typeId);
        const spawnPoint = LevelSystem.getSpawnPoint();

        const health = customHealth !== null ? customHealth : type.health;

        const enemy = {
            id: enemyIdCounter++,
            type: typeId,
            x: spawnPoint.x,
            y: spawnPoint.y,
            pathProgress: 0, // índice de punto en camino (puede ser decimal)
            health: health,
            maxHealth: health,
            speed: type.speed,
            alive: true,
            reward: type.reward,
            slowEffect: 1.0, // multiplicador de velocidad (1.0 = sin efecto)
            symbol: type.symbol,
            radius: 8, // Radio visual del enemigo
            damageFlashTime: 0 // Tiempo de flash rojo cuando recibe daño
        };

        return enemy;
    };

    /**
     * Agregar enemigo
     */
    const addEnemy = (enemy) => {
        if (enemy) {
            enemies.push(enemy);
        }
    };

    /**
     * Obtener todos los enemigos
     */
    const getEnemies = () => {
        return enemies;
    };

    /**
     * Obtener enemigos vivos
     */
    const getAliveEnemies = () => {
        return enemies.filter(e => e.alive);
    };

    /**
     * Obtener enemigos muertos
     */
    const getDeadEnemies = () => {
        return enemies.filter(e => !e.alive);
    };

    /**
     * Obtener enemigo por ID
     */
    const getEnemyById = (id) => {
        return enemies.find(e => e.id === id);
    };

    /**
     * Calcular posición actual basada en progreso
     */
    const updateEnemyPosition = (enemy) => {
        const path = LevelSystem.getPath();
        
        if (!enemy.alive || enemy.pathProgress >= path.length - 1) {
            return;
        }

        // Calcular velocidad efectiva (con efecto de ralentización)
        const effectiveSpeed = enemy.speed * enemy.slowEffect;
        const moveDistance = effectiveSpeed * 0.016; // 60fps ~= 16ms

        // Avanzar progreso (multiplicado por 0.3 para velocidad más rápida)
        enemy.pathProgress += moveDistance * 0.3;

        // Si alcanza el final del camino
        if (enemy.pathProgress >= path.length - 1) {
            enemy.pathProgress = path.length - 1;
            enemy.alive = false;
            return 'reached_end';
        }

        // Interpolar posición entre dos puntos del camino
        const currentIndex = Math.floor(enemy.pathProgress);
        const nextIndex = Math.min(currentIndex + 1, path.length - 1);
        const lerp = enemy.pathProgress - currentIndex;

        const current = path[currentIndex];
        const next = path[nextIndex];

        enemy.x = current.x + (next.x - current.x) * lerp;
        enemy.y = current.y + (next.y - current.y) * lerp;
    };

    /**
     * Dañar enemigo
     */
    const damageEnemy = (enemy, damage) => {
        if (!enemy.alive) return false;

        const type = ENEMY_TYPES[enemy.type];
        const actualDamage = Math.max(0.1, damage - (type.armor * 0.2));
        enemy.health -= actualDamage;
        enemy.damageFlashTime = 0.15; // Flash rojo por 150ms

        if (enemy.health <= 0) {
            enemy.alive = false;
            return true; // Enemigo destruido
        }
        return false;
    };

    /**
     * Aplicar efecto de ralentización
     */
    const applySlowEffect = (enemy, slowFactor = 0.5, duration = 3) => {
        enemy.slowEffect = slowFactor;
        // Restaurar velocidad después de duración
        setTimeout(() => {
            enemy.slowEffect = 1.0;
        }, duration * 1000);
    };

    /**
     * Resetear efecto de ralentización
     */
    const resetSlowEffect = (enemy) => {
        enemy.slowEffect = 1.0;
    };

    /**
     * Remover enemigo
     */
    const removeEnemy = (id) => {
        enemies = enemies.filter(e => e.id !== id);
    };

    /**
     * Limpiar todos los enemigos
     */
    const clearEnemies = () => {
        enemies = [];
        enemyIdCounter = 0;
    };

    /**
     * Limpiar enemigos muertos
     */
    const clearDeadEnemies = () => {
        enemies = enemies.filter(e => e.alive);
    };

    /**
     * Actualizar damageFlashTime de todos los enemigos
     */
    const updateEnemyFlash = () => {
        try {
            const deltaTime = (gameState && gameState.deltaTime) ? gameState.deltaTime : 0.016;
            enemies.forEach(enemy => {
                if (enemy && typeof enemy.damageFlashTime === 'number' && enemy.damageFlashTime > 0) {
                    enemy.damageFlashTime = Math.max(0, enemy.damageFlashTime - deltaTime);
                }
            });
        } catch (e) {
            console.error('Error updating enemy flash:', e);
        }
    };

    /**
     * Actualizar todos los enemigos
     */
    const updateAllEnemies = () => {
        // Actualizar flash de daño
        updateEnemyFlash();
        
        const results = {
            reachedEnd: 0,
            aliveCount: 0
        };

        enemies.forEach(enemy => {
            if (enemy.alive) {
                const result = updateEnemyPosition(enemy);
                if (result === 'reached_end') {
                    results.reachedEnd++;
                }
                results.aliveCount++;
            }
        });

        return results;
    };

    /**
     * Obtener información de enemigo
     */
    const getEnemyInfo = (enemy) => {
        const path = LevelSystem.getPath();
        const type = ENEMY_TYPES[enemy.type];
        return {
            id: enemy.id,
            type: enemy.type,
            position: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
            health: enemy.health.toFixed(1),
            maxHealth: enemy.maxHealth,
            speed: (enemy.speed * enemy.slowEffect).toFixed(2),
            alive: enemy.alive,
            reward: enemy.reward,
            progress: (enemy.pathProgress / path.length * 100).toFixed(1)
        };
    };

    /**
     * Obtener distancia entre enemigo y punto
     */
    const getDistance = (enemy, x, y) => {
        return Math.sqrt(
            Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2)
        );
    };

    return {
        getEnemyType,
        getPath,
        createEnemy,
        addEnemy,
        getEnemies,
        getAliveEnemies,
        getDeadEnemies,
        getEnemyById,
        updateEnemyPosition,
        damageEnemy,
        applySlowEffect,
        resetSlowEffect,
        removeEnemy,
        clearEnemies,
        clearDeadEnemies,
        updateAllEnemies,
        getEnemyInfo,
        getDistance
    };
})();
