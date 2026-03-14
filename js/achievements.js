/**
 * ACHIEVEMENTS.JS
 * Sistema de logros y objetivos del juego
 */

const AchievementSystem = (() => {
    // Definición de logros
    const ACHIEVEMENTS = {
        // Logros de enemigos totales destruidos
        totalEnemies: {
            id: 'totalEnemies',
            name: 'Cazador de Enemigos',
            emoji: '🔫',
            description: 'Derrota enemigos',
            type: 'enemy_kills',
            levels: [
                { level: 1, threshold: 50, reward: 'Bronce', completed: false },
                { level: 2, threshold: 150, reward: 'Plata', completed: false },
                { level: 3, threshold: 300, reward: 'Oro', completed: false },
                { level: 4, threshold: 500, reward: 'Platino', completed: false }
            ]
        },

        // Logros de enemigos comunes
        normalEnemies: {
            id: 'normalEnemies',
            name: 'Cazador de Piezas',
            emoji: '👾',
            description: 'Derrota enemigos comunes',
            type: 'enemy_type',
            enemyType: 'normal',
            levels: [
                { level: 1, threshold: 30, reward: 'Bronce', completed: false },
                { level: 2, threshold: 80, reward: 'Plata', completed: false },
                { level: 3, threshold: 150, reward: 'Oro', completed: false },
                { level: 4, threshold: 250, reward: 'Platino', completed: false }
            ]
        },

        // Logros de enemigos rápidos
        fastEnemies: {
            id: 'fastEnemies',
            name: 'Cazador de Velocidad',
            emoji: '💨',
            description: 'Derrota enemigos rápidos',
            type: 'enemy_type',
            enemyType: 'fast',
            levels: [
                { level: 1, threshold: 10, reward: 'Bronce', completed: false },
                { level: 2, threshold: 30, reward: 'Plata', completed: false },
                { level: 3, threshold: 60, reward: 'Oro', completed: false },
                { level: 4, threshold: 100, reward: 'Platino', completed: false }
            ]
        },

        // Logros de enemigos pesados
        heavyEnemies: {
            id: 'heavyEnemies',
            name: 'Cazador Resistencia',
            emoji: '🦾',
            description: 'Derrota enemigos pesados',
            type: 'enemy_type',
            enemyType: 'heavy',
            levels: [
                { level: 1, threshold: 8, reward: 'Bronce', completed: false },
                { level: 2, threshold: 20, reward: 'Plata', completed: false },
                { level: 3, threshold: 40, reward: 'Oro', completed: false },
                { level: 4, threshold: 70, reward: 'Platino', completed: false }
            ]
        },

        // Logros de enemigos elites
        eliteEnemies: {
            id: 'eliteEnemies',
            name: 'Cazador de Élites',
            emoji: '👹',
            description: 'Derrota enemigos élite',
            type: 'enemy_type',
            enemyType: 'elite',
            levels: [
                { level: 1, threshold: 5, reward: 'Bronce', completed: false },
                { level: 2, threshold: 15, reward: 'Plata', completed: false },
                { level: 3, threshold: 30, reward: 'Oro', completed: false },
                { level: 4, threshold: 50, reward: 'Platino', completed: false }
            ]
        },

        // Logros de torres básicas
        basicTowers: {
            id: 'basicTowers',
            name: 'Constructor Básico',
            emoji: '🔵',
            description: 'Construye torres básicas',
            type: 'tower_type',
            towerType: 'basic',
            levels: [
                { level: 1, threshold: 5, reward: 'Bronce', completed: false },
                { level: 2, threshold: 15, reward: 'Plata', completed: false },
                { level: 3, threshold: 30, reward: 'Oro', completed: false },
                { level: 4, threshold: 50, reward: 'Platino', completed: false }
            ]
        },

        // Logros de torres rápidas
        fastTowers: {
            id: 'fastTowers',
            name: 'Constructor Rápido',
            emoji: '🟡',
            description: 'Construye torres rápidas',
            type: 'tower_type',
            towerType: 'fast',
            levels: [
                { level: 1, threshold: 5, reward: 'Bronce', completed: false },
                { level: 2, threshold: 15, reward: 'Plata', completed: false },
                { level: 3, threshold: 25, reward: 'Oro', completed: false },
                { level: 4, threshold: 40, reward: 'Platino', completed: false }
            ]
        },

        // Logros de torres de poder
        powerTowers: {
            id: 'powerTowers',
            name: 'Constructor Potente',
            emoji: '🔴',
            description: 'Construye torres potentes',
            type: 'tower_type',
            towerType: 'power',
            levels: [
                { level: 1, threshold: 3, reward: 'Bronce', completed: false },
                { level: 2, threshold: 8, reward: 'Plata', completed: false },
                { level: 3, threshold: 15, reward: 'Oro', completed: false },
                { level: 4, threshold: 25, reward: 'Platino', completed: false }
            ]
        },

        // Logros de torres de hielo
        iceTowers: {
            id: 'iceTowers',
            name: 'Constructor Congelante',
            emoji: '🔷',
            description: 'Construye torres de hielo',
            type: 'tower_type',
            towerType: 'ice',
            levels: [
                { level: 1, threshold: 3, reward: 'Bronce', completed: false },
                { level: 2, threshold: 8, reward: 'Plata', completed: false },
                { level: 3, threshold: 15, reward: 'Oro', completed: false },
                { level: 4, threshold: 25, reward: 'Platino', completed: false }
            ]
        },

        // Logros de barracones
        barracks: {
            id: 'barracks',
            name: 'Constructor de Barracones',
            emoji: '🏗️',
            description: 'Construye barracones',
            type: 'tower_type',
            towerType: 'barracks',
            levels: [
                { level: 1, threshold: 2, reward: 'Bronce', completed: false },
                { level: 2, threshold: 5, reward: 'Plata', completed: false },
                { level: 3, threshold: 10, reward: 'Oro', completed: false },
                { level: 4, threshold: 15, reward: 'Platino', completed: false }
            ]
        }
    };

    // Estado de progreso
    let progress = {
        totalEnemies: 0,
        enemyKillsByType: {
            normal: 0,
            fast: 0,
            heavy: 0,
            elite: 0,
            boss: 0
        },
        towersByType: {
            basic: 0,
            fast: 0,
            power: 0,
            ice: 0,
            barracks: 0
        }
    };

    /**
     * Obtener logros
     */
    const getAchievements = () => {
        return { ...ACHIEVEMENTS };
    };

    /**
     * Obtener progreso actual
     */
    const getProgress = () => {
        return JSON.parse(JSON.stringify(progress));
    };

    /**
     * Registrar enemigo destruido
     */
    const recordEnemyKill = (enemyType) => {
        progress.totalEnemies++;
        if (progress.enemyKillsByType[enemyType] !== undefined) {
            progress.enemyKillsByType[enemyType]++;
        }
        checkAchievements();
    };

    /**
     * Registrar torre construida
     */
    const recordTowerBuilt = (towerType) => {
        if (progress.towersByType[towerType] !== undefined) {
            progress.towersByType[towerType]++;
        }
        checkAchievements();
    };

    /**
     * Registrar torre destruida
     */
    const recordTowerDemolished = (towerType) => {
        if (progress.towersByType[towerType] !== undefined && progress.towersByType[towerType] > 0) {
            progress.towersByType[towerType]--;
        }
    };

    /**
     * Verificar logros completados
     */
    const checkAchievements = () => {
        // Verificar logros de enemigos totales
        if (ACHIEVEMENTS.totalEnemies) {
            ACHIEVEMENTS.totalEnemies.levels.forEach((level) => {
                if (!level.completed && progress.totalEnemies >= level.threshold) {
                    level.completed = true;
                }
            });
        }

        // Verificar logros por tipo de enemigo
        ['normal', 'fast', 'heavy', 'elite'].forEach((type) => {
            const achievementId = type === 'normal' ? 'normalEnemies' : 
                                type === 'fast' ? 'fastEnemies' :
                                type === 'heavy' ? 'heavyEnemies' : 'eliteEnemies';
            
            if (ACHIEVEMENTS[achievementId]) {
                ACHIEVEMENTS[achievementId].levels.forEach((level) => {
                    if (!level.completed && progress.enemyKillsByType[type] >= level.threshold) {
                        level.completed = true;
                    }
                });
            }
        });

        // Verificar logros por tipo de torre
        const towerAchievementMap = {
            basic: 'basicTowers',
            fast: 'fastTowers',
            power: 'powerTowers',
            ice: 'iceTowers',
            barracks: 'barracks'
        };

        Object.keys(towerAchievementMap).forEach((towerType) => {
            const achievementId = towerAchievementMap[towerType];
            if (ACHIEVEMENTS[achievementId]) {
                ACHIEVEMENTS[achievementId].levels.forEach((level) => {
                    if (!level.completed && progress.towersByType[towerType] >= level.threshold) {
                        level.completed = true;
                    }
                });
            }
        });
    };

    /**
     * Resetear logros
     */
    const reset = () => {
        progress = {
            totalEnemies: 0,
            enemyKillsByType: {
                normal: 0,
                fast: 0,
                heavy: 0,
                elite: 0,
                boss: 0
            },
            towersByType: {
                basic: 0,
                fast: 0,
                power: 0,
                ice: 0,
                barracks: 0
            }
        };

        // Resetear logros completados
        Object.keys(ACHIEVEMENTS).forEach((key) => {
            ACHIEVEMENTS[key].levels.forEach((level) => {
                level.completed = false;
            });
        });
    };

    return {
        getAchievements,
        getProgress,
        recordEnemyKill,
        recordTowerBuilt,
        recordTowerDemolished,
        checkAchievements,
        reset
    };
})();
