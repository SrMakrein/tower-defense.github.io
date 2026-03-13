/**
 * LEVELS.JS
 * Sistema de niveles infinitos con dificultad progresiva y generación procedural de mapas
 */

const LevelSystem = (() => {
    // Configuración del nivel actual
    let currentLevel = 1;
    let currentWave = 1;
    let waveInProgress = false;
    let currentPath = null;
    let spawnPoint = null;
    let goalPoint = null;

    /**
     * Generar camino procedural
     */
    const generatePath = () => {
        const path = [];
        const width = 1200;
        const height = 600;
        
        // Punto inicial FIJO: superior izquierda
        spawnPoint = { x: 50, y: 150 };
        path.push(spawnPoint);
        
        // Generar puntos intermedios con mucha más randomidad y curvas
        let x = 100;
        let y = spawnPoint.y;
        const numSegments = 8 + Math.floor(Math.random() * 5); // Más segmentos: 8-12
        
        for (let i = 0; i < numSegments; i++) {
            x += 80 + Math.random() * 80; // Segmentos más cortos
            y += (Math.random() - 0.5) * 200; // Mayor variación vertical
            // Restricción más estricta: mantener dentro del área (100 píxeles de margen)
            y = Math.max(100, Math.min(height - 100, y));
            
            // Asegurar que x no exceda el ancho
            if (x > width - 150) {
                x = width - 150;
            }
            
            // Suavizar con puntos intermedios (crear curvas)
            const prevPoint = path[path.length - 1];
            const midX = (prevPoint.x + x) / 2;
            const midY = (prevPoint.y + y) / 2;
            path.push({ x: midX, y: midY });
            path.push({ x: x, y: y });
        }
        
        // Punto final FIJO: inferior derecha
        goalPoint = { x: width - 50, y: 450 };
        path.push(goalPoint);
        
        currentPath = path;
        return { path, spawnPoint, goalPoint };
    };

    /**
     * Obtener camino actual
     */
    const getPath = () => {
        return currentPath || generatePath().path;
    };

    /**
     * Obtener punto de spawn
     */
    const getSpawnPoint = () => {
        if (!currentPath) generatePath();
        return spawnPoint;
    };

    /**
     * Obtener punto de meta
     */
    const getGoalPoint = () => {
        if (!currentPath) generatePath();
        return goalPoint;
    };

    /**
     * Obtener configuración del nivel actual
     */
    const getLevel = () => {
        return currentLevel;
    };

    /**
     * Obtener onda actual
     */
    const getWave = () => {
        return currentWave;
    };

    /**
     * Obtener si hay onda en progreso
     */
    const isWaveInProgress = () => {
        return waveInProgress;
    };

    /**
     * Establecer si hay onda en progreso
     */
    const setWaveInProgress = (inProgress) => {
        waveInProgress = inProgress;
    };

    /**
     * Incrementar onda
     */
    const nextWave = () => {
        currentWave++;
        if (currentWave > 5) {
            currentWave = 1;
            currentLevel++;
        }
        return {
            level: currentLevel,
            wave: currentWave
        };
    };

    /**
     * Resetear niveles
     */
    const reset = () => {
        currentLevel = 1;
        currentWave = 1;
        waveInProgress = false;
    };

    /**
     * Calcular número de enemigos para la onda actual
     */
    const getEnemyCount = () => {
        // 5 enemigos normales + 1 elite por oleada, acumulativo entre niveles
        // Onda 1: 5 enemigos
        // Onda 2: 10 enemigos (5 + 5)
        // Onda 3: 15 enemigos (5 + 5 + 5)
        // Onda 4: 20 enemigos (5 + 5 + 5 + 5)
        // Onda 5: 25 enemigos (5 + 5 + 5 + 5 + 5) - será reemplazado por boss
        // Luego nivel sube y reinicia pero es acumulativo
        const waveNumber = (currentLevel - 1) * 5 + currentWave; // Número total de oleadas jugadas
        return waveNumber * 6; // 5 normales + 1 elite = 6 por oleada
    };

    /**
     * Calcular velocidad base de enemigos
     */
    const getEnemySpeed = () => {
        // Base: 1.0 (velocidad normal)
        // Incremento: +0.1 por nivel (máximo 3.0)
        const baseSpeed = 1.0;
        const levelBonus = (currentLevel - 1) * 0.1;
        return Math.min(baseSpeed + levelBonus, 3.0);
    };

    /**
     * Calcular vida base de enemigos
     */
    const getEnemyHealth = () => {
        // Base: 1 vida
        // Incremento: +1 vida cada 5 niveles
        // Variación: +0.5 por onda
        const baseHealth = 1;
        const levelBonus = Math.floor((currentLevel - 1) / 5);
        const waveBonus = currentWave * 0.5;
        return baseHealth + levelBonus + waveBonus;
    };

    /**
     * Calcular reward por enemigo destruido
     */
    const getEnemyReward = () => {
        // Base: 10 oro
        // Incremento: +2 oro por nivel
        const baseReward = 10;
        const levelBonus = (currentLevel - 1) * 2;
        return baseReward + levelBonus;
    };

    /**
     * Obtener información del nivel formateada
     */
    const getLevelInfo = () => {
        return {
            level: currentLevel,
            wave: currentWave,
            totalWaves: 5,
            enemyCount: getEnemyCount(),
            enemySpeed: getEnemySpeed(),
            enemyHealth: getEnemyHealth(),
            reward: getEnemyReward(),
            difficulty: calculateDifficulty()
        };
    };

    /**
     * Calcular dificultad textual
     */
    const calculateDifficulty = () => {
        if (currentLevel <= 5) {
            return 'FÁCIL';
        } else if (currentLevel <= 15) {
            return 'NORMAL';
        } else if (currentLevel <= 30) {
            return 'DIFÍCIL';
        } else if (currentLevel <= 50) {
            return 'MUY DIFÍCIL';
        } else {
            return 'EXTREMO';
        }
    };

    /**
     * Obtener puntuación del nivel
     */
    const getLevelScore = (enemiesDefeated) => {
        // Puntos base por enemigo
        const basePoints = enemiesDefeated * 10;
        // Multiplicador por nivel
        const levelMultiplier = 1 + (currentLevel * 0.1);
        // Bonus por onda
        const waveBonus = currentWave * 50;
        return Math.floor(basePoints * levelMultiplier + waveBonus);
    };

    return {
        getLevel,
        getWave,
        isWaveInProgress,
        setWaveInProgress,
        nextWave,
        reset,
        getEnemyCount,
        getEnemySpeed,
        getEnemyHealth,
        getEnemyReward,
        getLevelInfo,
        calculateDifficulty,
        getLevelScore,
        generatePath,
        getPath,
        getSpawnPoint,
        getGoalPoint
    };
})();
