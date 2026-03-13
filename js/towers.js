/**
 * TOWERS.JS
 * Sistema de torres y disparo
 */

const TowerSystem = (() => {
    // Tipos de torres disponibles
    const TOWER_TYPES = {
        basic: {
            id: 'basic',
            name: 'Torre Básica',
            symbol: '[T]',
            emoji: '🟢',
            cost: 50,
            damage: 1.5,
            fireRate: 1.0, // disparos por segundo
            range: 150,
            color: '#00ff00', // Verde
            projectileColor: '#00ff00',
            spriteUrl: null // Para futuros sprites
        },
        fast: {
            id: 'fast',
            name: 'Torre Rápida',
            symbol: '[F]',
            emoji: '⚡',
            cost: 75,
            damage: 1.2,
            fireRate: 2.0, // disparos por segundo
            range: 120,
            color: '#ffff00', // Amarillo
            projectileColor: '#ffff00',
            spriteUrl: null
        },
        power: {
            id: 'power',
            name: 'Torre Potente',
            symbol: '[P]',
            emoji: '💣',
            cost: 150,
            damage: 4,
            fireRate: 0.5, // disparos por segundo
            range: 180,
            color: '#ff0000', // Rojo
            projectileColor: '#ff0000',
            spriteUrl: null
        },
        ice: {
            id: 'ice',
            name: 'Torre de Hielo',
            symbol: '[I]',
            emoji: '❄️',
            cost: 100,
            damage: 1,
            fireRate: 1.5, // disparos por segundo
            range: 150,
            color: '#0099ff', // Azul
            projectileColor: '#0099ff',
            slowEffect: 0.5, // reduce velocidad a 50%
            spriteUrl: null
        }
    };

    // Tipos de construcciones
    const CONSTRUCTION_TYPES = {
        barracks: {
            id: 'barracks',
            name: 'Barracón',
            symbol: '[B]',
            emoji: '🏰',
            cost: 300,
            color: '#cc6633', // Marrón
            isConstruction: true,
            spriteUrl: null
        }
    };

    // Array de torres colocadas
    let towers = [];
    let towerIdCounter = 0;

    /**
     * Obtener tipo de torre o construcción
     */
    const getTowerType = (typeId) => {
        return TOWER_TYPES[typeId] || CONSTRUCTION_TYPES[typeId] || null;
    };

    /**
     * Obtener todos los tipos de torres
     */
    const getAllTowerTypes = () => {
        return Object.values(TOWER_TYPES);
    };

    /**
     * Obtener todos los tipos de construcciones
     */
    const getAllConstructionTypes = () => {
        return Object.values(CONSTRUCTION_TYPES);
    };

    /**
     * Crear nueva torre
     */
    const createTower = (typeId, x, y) => {
        const type = getTowerType(typeId);
        if (!type) return null;

        const tower = {
            id: towerIdCounter++,
            type: typeId,
            x: x,
            y: y,
            health: 3,
            maxHealth: 3,
            lastFireTime: 0,
            targets: [],
            symbol: type.symbol,
            upgradeLevel: 0,
            upgraded: false,
            damage: type.damage,
            damageLevels: 0,
            targetEnemy: null
        };

        return tower;
    };

    /**
     * Agregar torre al juego
     */
    const addTower = (tower) => {
        if (tower) {
            towers.push(tower);
            return tower;
        }
        return null;
    };

    /**
     * Obtener todas las torres
     */
    const getTowers = () => {
        return towers;
    };

    /**
     * Obtener torre por ID
     */
    const getTowerById = (id) => {
        return towers.find(t => t.id === id);
    };

    /**
     * Obtener torres en un radio
     */
    const getTowersNear = (x, y, radius) => {
        return towers.filter(tower => {
            const distance = Math.sqrt(
                Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2)
            );
            return distance <= radius;
        });
    };

    /**
     * Eliminar torre por ID
     */
    const removeTower = (id) => {
        towers = towers.filter(t => t.id !== id);
    };

    /**
     * Limpiar todas las torres
     */
    const clearTowers = () => {
        towers = [];
        towerIdCounter = 0;
    };

    /**
     * Calcular si una torre puede disparar
     */
    const canFire = (tower, currentTime) => {
        const type = getTowerType(tower.type);
        const timeSinceLastFire = currentTime - tower.lastFireTime;
        const fireInterval = 1 / type.fireRate; // segundos entre disparos
        return timeSinceLastFire >= fireInterval;
    };

    /**
     * Registrar disparo de torre
     */
    const recordFire = (tower, currentTime) => {
        tower.lastFireTime = currentTime;
    };

    /**
     * Calcular distancia entre dos puntos
     */
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
        );
    };

    /**
     * Obtener enemigos en rango de una torre
     */
    const getEnemiesInRange = (tower, enemies) => {
        const type = getTowerType(tower.type);
        return enemies.filter(enemy => {
            const distance = getDistance(
                tower.x, tower.y,
                enemy.x, enemy.y
            );
            return distance <= type.range && enemy.alive;
        });
    };

    /**
     * Obtener enemigo más cercano en rango
     */
    const getClosestEnemy = (tower, enemies) => {
        const inRange = getEnemiesInRange(tower, enemies);
        if (inRange.length === 0) return null;

        return inRange.reduce((closest, current) => {
            const distCurrent = getDistance(tower.x, tower.y, current.x, current.y);
            const distClosest = getDistance(tower.x, tower.y, closest.x, closest.y);
            return distCurrent < distClosest ? current : closest;
        });
    };

    /**
     * Dañar torre (si tiene armadura)
     */
    const damageTower = (tower, damage) => {
        tower.health -= damage;
        return tower.health <= 0;
    };

    /**
     * Obtener información de torre
     */
    const getTowerInfo = (tower) => {
        const type = getTowerType(tower.type);
        return {
            id: tower.id,
            type: type.id,
            name: type.name,
            position: { x: tower.x, y: tower.y },
            cost: type.cost,
            damage: type.damage,
            fireRate: type.fireRate,
            range: type.range,
            health: tower.health,
            maxHealth: tower.maxHealth,
            hasSlowEffect: !!type.slowEffect,
            slowEffect: type.slowEffect || 0
        };
    };

    /**
     * Demoler torre (recuperar 50% del coste)
     */
    const demolishTower = (tower) => {
        const towerType = getTowerType(tower.type);
        const refund = Math.floor(towerType.cost * 0.5);
        return refund;
    };

    /**
     * Mejorar daño de torre
     */
    const upgradeDamage = (tower, goldCost = 25) => {
        tower.damage = (tower.damage || getTowerType(tower.type).damage) + 0.5;
        tower.damageLevels = (tower.damageLevels || 0) + 1;
        return true;
    };

    /**
     * Obtener daño actual de torre
     */
    const getTowerDamage = (tower) => {
        const baseType = getTowerType(tower.type);
        return tower.damage || baseType.damage;
    };
    const upgradeTower = (tower, newTypeId) => {
        const newType = getTowerType(newTypeId);
        if (!newType) return false;
        
        tower.type = newTypeId;
        tower.upgradeLevel += 1;
        tower.upgraded = true;
        return true;
    };

    /**
     * Obtener tipos de upgrade disponibles (excluir tipo actual)
     */
    const getAvailableUpgrades = (currentTypeId) => {
        return Object.values(TOWER_TYPES).filter(t => t.id !== currentTypeId);
    };

    return {
        getTowerType,
        getAllTowerTypes,
        getAllConstructionTypes,
        createTower,
        addTower,
        getTowers,
        getTowerById,
        getTowersNear,
        removeTower,
        clearTowers,
        canFire,
        recordFire,
        getDistance,
        getEnemiesInRange,
        getClosestEnemy,
        damageTower,
        getTowerInfo,
        upgradeTower,
        getAvailableUpgrades,
        demolishTower,
        upgradeDamage,
        getTowerDamage
    };
})();
