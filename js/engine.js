/**
 * ENGINE.JS
 * Motor del juego - Game Loop y renderizado con Canvas
 */

const GameEngine = (() => {
    // Configuración del motor
    const CONFIG = {
        canvasWidth: 1200,
        canvasHeight: 600,
        fps: 60,
        frameTime: 1000 / 60 // milisegundos por frame
    };

    // Canvas y contexto
    let canvas = null;
    let ctx = null;

    // Estado del motor
    let gameState = {
        running: false,
        paused: false,
        frameCount: 0,
        deltaTime: 0,
        currentTime: 0,
        gameTime: 0
    };

    // Arrays de objetos dinámicos
    let projectiles = [];
    let explosions = [];
    let particles = [];
    let projectileIdCounter = 0;

    /**
     * Inicializar motor
     */
    const init = () => {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas no encontrado');
            return;
        }

        ctx = canvas.getContext('2d');
        
        // Establecer tamaño del canvas
        canvas.width = CONFIG.canvasWidth;
        canvas.height = CONFIG.canvasHeight;

        gameState.running = true;
        gameState.paused = false;
        gameState.frameCount = 0;
        gameState.currentTime = 0;
        gameState.gameTime = 0;
    };

    /**
     * Obtener canvas context
     */
    const getContext = () => {
        return ctx;
    };

    /**
     * Obtener estado del juego
     */
    const getState = () => {
        return { ...gameState };
    };

    /**
     * Pausar/reanudar juego
     */
    const togglePause = () => {
        gameState.paused = !gameState.paused;
        return gameState.paused;
    };

    /**
     * Detener motor
     */
    const stop = () => {
        gameState.running = false;
    };

    /**
     * Obtener configuración
     */
    const getConfig = () => {
        return { ...CONFIG };
    };

    /**
     * Crear proyectil
     */
    const createProjectile = (fromTower, toEnemy) => {
        const towerType = TowerSystem.getTowerType(fromTower.type);
        const cannonLength = 16;
        
        // Calcular ángulo del cañón
        let angle;
        if (fromTower.targetEnemy) {
            const dx = fromTower.targetEnemy.x - fromTower.x;
            const dy = fromTower.targetEnemy.y - fromTower.y;
            angle = Math.atan2(dy, dx);
        } else {
            angle = (gameState.gameTime * 3) % (Math.PI * 2);
        }
        
        // Posición de la punta del cañón
        const cannonTipX = fromTower.x + Math.cos(angle) * cannonLength;
        const cannonTipY = fromTower.y + Math.sin(angle) * cannonLength;
        
        const projectile = {
            id: projectileIdCounter++,
            fromTower: fromTower.id,
            targetEnemy: toEnemy.id,
            x: cannonTipX,
            y: cannonTipY,
            targetX: toEnemy.x,
            targetY: toEnemy.y,
            speed: 5, // unidades por frame
            damage: TowerSystem.getTowerDamage(fromTower), // Usar daño mejorado
            alive: true,
            symbol: '*',
            towerType: fromTower.type,
            projectileColor: towerType.projectileColor
        };
        projectiles.push(projectile);
        return projectile;
    };

    /**
     * Actualizar proyectiles
     */
    const updateProjectiles = () => {
        projectiles = projectiles.filter(p => {
            if (!p.alive) return false;

            // Obtener enemigo objetivo
            const target = EnemySystem.getEnemyById(p.targetEnemy);
            if (!target || !target.alive) {
                p.alive = false;
                return false;
            }

            // Actualizar posición objetivo (el enemigo se mueve)
            p.targetX = target.x;
            p.targetY = target.y;

            // Calcular dirección y distancia
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 0.5) {
                // Impacto con enemigo
                p.alive = false;
                
                // Crear explosión
                createExplosion(p.x, p.y, p.towerType);
                
                // Dañar enemigo
                const destroyed = EnemySystem.damageEnemy(target, p.damage);
                AudioManager.playHit();
                
                if (destroyed) {
                    AudioManager.playEnemyDestroyed();
                    // Agregar oro por matar enemigo
                    Game.addGoldForKill(target);
                    return false;
                }

                // Si es torre de hielo, aplicar efecto
                if (p.towerType === 'ice') {
                    EnemySystem.applySlowEffect(target, 0.5, 2);
                }

                return false;
            }

            // Mover proyectil hacia objetivo
            const dirX = dx / distance;
            const dirY = dy / distance;
            p.x += dirX * p.speed;
            p.y += dirY * p.speed;

            return true;
        });
    };

    /**
     * Crear explosión
     */
    const createExplosion = (x, y, towerType) => {
        const explosion = {
            x: x,
            y: y,
            age: 0,
            maxAge: 12, // frames - aumentado para más visibilidad
            size: towerType === 'power' ? 3 : 2,
            towerType: towerType,
            symbol: 'X'
        };
        explosions.push(explosion);
        AudioManager.playExplosion();
    };

    /**
     * Actualizar explosiones
     */
    const updateExplosions = () => {
        explosions = explosions.filter(exp => {
            exp.age++;
            return exp.age < exp.maxAge;
        });
    };

    /**
     * Obtener proyectiles
     */
    const getProjectiles = () => {
        return projectiles;
    };

    /**
     * Obtener explosiones
     */
    const getExplosions = () => {
        return explosions;
    };

    /**
     * Limpiar proyectiles y explosiones
     */
    const clearDynamics = () => {
        projectiles = [];
        explosions = [];
        particles = [];
        projectileIdCounter = 0;
    };

    /**
     * Ejecutar un frame del juego
     */
    const update = (deltaTime) => {
        if (!gameState.running || gameState.paused) return;

        gameState.frameCount++;
        gameState.deltaTime = deltaTime;
        gameState.currentTime += deltaTime;
        gameState.gameTime += deltaTime;

        // Actualizar enemigos
        EnemySystem.updateAllEnemies();

        // Actualizar proyectiles
        updateProjectiles();

        // Actualizar explosiones
        updateExplosions();
    };

    /**
     * Sistema de lógica de torres disparando
     */
    const executeTowerLogic = () => {
        if (gameState.paused) return;

        const towers = TowerSystem.getTowers();
        const enemies = EnemySystem.getAliveEnemies();

        towers.forEach(tower => {
            // Buscar enemigo en rango (siempre para actualizar apuntamiento)
            const target = TowerSystem.getClosestEnemy(tower, enemies);
            
            // Actualizar el objetivo actual de la torre (para que el cañón apunte correctamente)
            if (target && target.alive) {
                tower.targetEnemy = target;
            } else {
                tower.targetEnemy = null;
            }
            
            // Disparar si la torre está lista
            if (TowerSystem.canFire(tower, gameState.gameTime) && target) {
                // Crear proyectil
                createProjectile(tower, target);
                AudioManager.playShoot();
                TowerSystem.recordFire(tower, gameState.gameTime);
            }
        });
    };

    /**
     * Renderizar el grid ASCII
     */
    const render = (gameObjects) => {
        if (!ctx) return;

        // Limpiar y dibujar fondo
        drawBackground();
        
        // Dibujar camino
        drawPath();
        
        // Dibujar spawn y meta
        drawSpawn();
        drawGoal();
        
        // Dibujar objetos del juego
        const selectedId = gameObjects.selectedTowerId;
        drawTowers(gameObjects.towers, selectedId, gameState.gameTime);
        drawProjectiles(gameObjects.projectiles);
        drawEnemies(gameObjects.enemies);
        // Dibujar explosiones al final para que aparezcan encima
        drawExplosions(gameObjects.explosions);
    };

    /**
     * Dibujar fondo
     */
    const drawBackground = () => {
        // Fondo degradado
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight);
        gradient.addColorStop(0, '#0a0a14');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    };

    /**
     * Dibujar camino
     */
    const drawPath = () => {
        const path = LevelSystem.getPath();
        
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Dibujar línea del camino
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    };

    /**
     * Dibujar punto de spawn
     */
    const drawSpawn = () => {
        const spawn = LevelSystem.getSpawnPoint();
        
        // Círculo de spawn
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(spawn.x, spawn.y, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    /**
     * Dibujar meta
     */
    const drawGoal = () => {
        const goal = LevelSystem.getGoalPoint();
        
        // Bandera/meta
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde rojo pulsante
        const pulse = Math.sin(gameState.gameTime * 5) * 0.5 + 0.8;
        ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Símbolo de meta
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('META', goal.x, goal.y);
    };

    /**
     * Dibujar torres (círculo con emoji + cañón orbital)
     */
    const drawTowers = (towers, selectedTowerId = null, gameTime = 0) => {
        // Primero dibujar rangos de torre seleccionada (capa inferior)
        towers.forEach(tower => {
            if (tower.id === selectedTowerId) {
                const towerType = TowerSystem.getTowerType(tower.type);
                
                // Rango de ataque (círculo translúcido)
                ctx.fillStyle = `rgba(100, 255, 100, 0.1)`;
                ctx.beginPath();
                ctx.arc(tower.x, tower.y, towerType.range, 0, Math.PI * 2);
                ctx.fill();
                
                // Borde de rango
                const colorMap = {
                    '#00ff00': '0, 255, 0',
                    '#ffff00': '255, 255, 0',
                    '#ff0000': '255, 0, 0',
                    '#0099ff': '0, 153, 255'
                };
                const colorStr = colorMap[towerType.color] || '0, 255, 0';
                ctx.strokeStyle = `rgba(${colorStr}, 0.4)`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
        
        // Luego dibujar torres y construcciones
        towers.forEach(tower => {
            const towerType = TowerSystem.getTowerType(tower.type);
            const radius = towerType.isConstruction ? 16 : 14;
            
            // Las construcciones no tienen cañón
            if (!towerType.isConstruction) {
                const cannonLength = 16;
                const cannonWidth = 6;
                
                // Calcular ángulo: orbitar continuamente SOLO si NO hay objetivo
                let angle;
                if (tower.targetEnemy && tower.targetEnemy.alive) {
                    const dx = tower.targetEnemy.x - tower.x;
                    const dy = tower.targetEnemy.y - tower.y;
                    angle = Math.atan2(dy, dx);
                } else {
                    angle = (gameTime * 3) % (Math.PI * 2);
                }
                
                // Dibujar cañón
                ctx.save();
                ctx.translate(tower.x, tower.y);
                ctx.rotate(angle);
                
                ctx.fillStyle = towerType.color;
                ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
                
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
                
                ctx.fillStyle = towerType.color;
                ctx.beginPath();
                ctx.arc(cannonLength, 0, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
            
            // Dibujar círculo de torre/construcción
            ctx.fillStyle = towerType.color;
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = tower.id === selectedTowerId ? '#ffffff' : 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = tower.id === selectedTowerId ? 3 : 2;
            ctx.stroke();
            
            // Emoji
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#0a0a14';
            ctx.fillText(towerType.emoji, tower.x, tower.y);
            
            // Indicadores (solo para torres, no construcciones)
            if (!towerType.isConstruction) {
                if (tower.damageLevels > 0) {
                    ctx.fillStyle = '#ffff00';
                    ctx.font = 'bold 9px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`D+${tower.damageLevels}`, tower.x, tower.y - radius - 10);
                }
                
                if (tower.upgraded) {
                    ctx.fillStyle = '#ff00ff';
                    ctx.font = 'bold 9px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`T+${tower.upgradeLevel}`, tower.x, tower.y + radius + 12);
                }
            }
        });
    };

    /**
     * Dibujar enemigos
     */
    const drawEnemies = (enemies) => {
        enemies.forEach(enemy => {
            try {
                if (!enemy || !enemy.alive) return;
                
                const enemyType = EnemySystem.getEnemyType(enemy.type);
                
                // Tamaño diferente para elite y boss
                let radiusMultiplier = 1;
                if (enemy.type === 'boss') {
                    radiusMultiplier = 3; // Boss es 3x del tamaño normal
                } else if (enemy.type === 'elite') {
                    radiusMultiplier = 1.5;
                }
                const displayRadius = enemy.radius * radiusMultiplier;
                
                // Barra de vida
                const barWidth = 20;
                const barHeight = 4;
                const healthPercent = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));
                
                // Fondo de barra
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(enemy.x - barWidth/2, enemy.y - displayRadius - 12, barWidth, barHeight);
                
                // Barra de vida
                ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
                ctx.fillRect(enemy.x - barWidth/2, enemy.y - displayRadius - 12, barWidth * healthPercent, barHeight);
                
                // Borde de barra
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 1;
                ctx.strokeRect(enemy.x - barWidth/2, enemy.y - displayRadius - 12, barWidth, barHeight);
                
                // Círculo de fondo - colores diferentes según tipo
                let color = '#d8b3ff'; // violeta claro por defecto
                let borderColor = '#9966ff'; // violeta oscuro
                
                if (enemy.type === 'boss') {
                    color = '#ff4444'; // rojo para boss
                    borderColor = '#ff00ff'; // Borde pink/fuchsia para boss
                } else if (enemy.type === 'elite') {
                    color = '#ff4444'; // rojo para elite
                    borderColor = '#ff0000'; // rojo puro borde
                } else if (enemy.damageFlashTime && enemy.damageFlashTime > 0) {
                    color = '#ff6666'; // rojo claro
                    borderColor = '#ff0000'; // rojo
                }
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, displayRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Borde (más grueso para boss)
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = enemy.type === 'boss' ? 4 : 2;
                ctx.stroke();
                
                // Efecto de brillo para boss
                if (enemy.type === 'boss') {
                    ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(enemy.x, enemy.y, displayRadius + 4, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                // Emoji (más grande para elite y boss)
                if (enemyType && enemyType.emoji) {
                    const fontSize = enemy.type === 'boss' ? '32px' : (enemy.type === 'elite' ? '24px' : '16px');
                    ctx.font = `${fontSize} Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(enemyType.emoji, enemy.x, enemy.y);
                }
                
                // Efecto ralentización visual
                if (enemy.slowEffect && enemy.slowEffect < 1.0) {
                    ctx.strokeStyle = 'rgba(0, 153, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(enemy.x, enemy.y, displayRadius + 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } catch (e) {
                console.error('Error drawing enemy:', e);
            }
        });
    };

    /**
     * Dibujar proyectiles (líneas coloreadas)
     */
    const drawProjectiles = (projectiles) => {
        projectiles.forEach(proj => {
            // Solo dibujar círculo del proyectil (sin línea)
            ctx.fillStyle = proj.projectileColor;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Borde más oscuro
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    };

    /**
     * Dibujar explosiones
     */
    const drawExplosions = (explosions) => {
        explosions.forEach(exp => {
            try {
                if (!exp || typeof exp.age !== 'number' || typeof exp.maxAge !== 'number') return;
                
                const progress = Math.min(1, exp.age / exp.maxAge);
                const expandSize = 8 + (progress * 16);
                const opacity = Math.max(0, 1 - progress);
                
                // Color unificado para todas las explosiones - naranja/amarillo
                ctx.fillStyle = `rgba(255, 150, 0, ${opacity * 0.7})`;
                ctx.beginPath();
                ctx.arc(exp.x, exp.y, expandSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Anillo brillante simple
                ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * 0.9})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            } catch (e) {
                console.error('Error drawing explosion:', e);
            }
        });
    };

    return {
        init,
        getContext,
        getState,
        togglePause,
        stop,
        getConfig,
        createProjectile,
        updateProjectiles,
        createExplosion,
        updateExplosions,
        getProjectiles,
        getExplosions,
        clearDynamics,
        update,
        executeTowerLogic,
        render
    };
})();
