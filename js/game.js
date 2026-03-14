/**
 * GAME.JS
 * Controlador principal del juego - orquesta todos los sistemas
 */

const Game = (() => {
    // Estado del juego
    const gameState = {
        lives: 20,
        gold: 100,
        gameRunning: false,
        gameOver: false,
        won: false,
        selectedTower: null,
        selectedTowerObj: null, // Nueva: objeto torre seleccionada
        currentWaveEnemies: 0,
        totalEnemiesSpawned: 0,
        enemiesDefeated: 0,
        score: 0
    };

    // Referencias a elementos del DOM
    let domElements = {
        gameRender: null,
        levelDisplay: null,
        lifeDisplay: null,
        goldDisplay: null,
        waveDisplay: null,
        scoreDisplay: null, // Nuevo
        message: null,
        gameArea: null,
        startBtn: null,
        pauseBtn: null,
        resetBtn: null,
        towerBtns: {},
        upgradePanel: null,
        upgradeButtons: {},
        achievementsBtn: null,
        achievementsModal: null,
        closeAchievementsBtn: null,
        achievementsContainer: null,
        achievementsStats: null
    };

    // Control de spawning de enemigos
    let spawnState = {
        waveActive: false,
        enemiesToSpawn: 0,
        spawnTimer: 0,
        spawnInterval: 0.5, // segundos entre enemigos
        waveTotalHealth: 0, // Total health de todos los minions en esta oleada
        spawnedMinions: 0, // Número de minions que hemos spawneado
        originalEnemyCount: 0 // Número original de enemigos a spawnear
    };

    let gameLoop = null;
    let lastFrameTime = 0;

    /**
     * Inicializar el juego
     */
    const init = () => {
        // Obtener referencias del DOM
        domElements.gameRender = document.getElementById('gameRender');
        domElements.levelDisplay = document.getElementById('levelDisplay');
        domElements.lifeDisplay = document.getElementById('lifeDisplay');
        domElements.goldDisplay = document.getElementById('goldDisplay');
        domElements.waveDisplay = document.getElementById('waveDisplay');
        domElements.scoreDisplay = document.getElementById('scoreDisplay');
        domElements.message = document.getElementById('message');
        domElements.gameArea = document.getElementById('gameArea');
        domElements.startBtn = document.getElementById('startBtn');
        domElements.pauseBtn = document.getElementById('pauseBtn');
        domElements.resetBtn = document.getElementById('resetBtn');
        domElements.upgradePanel = document.getElementById('upgradePanel');
        domElements.achievementsBtn = document.getElementById('achievementsBtn');
        domElements.achievementsModal = document.getElementById('achievementsModal');
        domElements.closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
        domElements.achievementsContainer = document.getElementById('achievementsContainer');
        domElements.achievementsStats = document.getElementById('achievementsStats');

        // Obtener botones de torres
        const towerBtns = document.querySelectorAll('.tower-btn');
        towerBtns.forEach(btn => {
            domElements.towerBtns[btn.dataset.tower] = btn;
        });

        // Configurar eventos
        setupEventListeners();

        // Inicializar sistemas
        AudioManager.init();
        GameEngine.init();

        // Render inicial
        updateUI();
        render();

        console.log('Juego inicializado correctamente');
    };

    /**
     * Configurar listeners de eventos
     */
    const setupEventListeners = () => {
        // Botones de control
        domElements.startBtn.addEventListener('click', startGame);
        domElements.pauseBtn.addEventListener('click', togglePause);
        domElements.resetBtn.addEventListener('click', resetGame);

        // Botones de torres
        Object.entries(domElements.towerBtns).forEach(([towerType, btn]) => {
            btn.addEventListener('click', () => selectTower(towerType));
        });

        // Botón para cerrar panel de upgrade
        const closeUpgradeBtn = document.getElementById('closeUpgradeBtn');
        if (closeUpgradeBtn) {
            closeUpgradeBtn.addEventListener('click', () => {
                domElements.upgradePanel.style.display = 'none';
                gameState.selectedTowerObj = null;
            });
        }

        // Botones de logros
        if (domElements.achievementsBtn) {
            domElements.achievementsBtn.addEventListener('click', openAchievements);
        }
        if (domElements.closeAchievementsBtn) {
            domElements.closeAchievementsBtn.addEventListener('click', closeAchievements);
        }
        if (domElements.achievementsModal) {
            domElements.achievementsModal.addEventListener('click', (e) => {
                if (e.target === domElements.achievementsModal) {
                    closeAchievements();
                }
            });
        }

        // Click en el área de juego para colocar torres o mejorar existentes
        domElements.gameArea.addEventListener('click', (e) => {
            handleGameAreaClick(e);
        });

        // Teclas para seleccionar torres
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') selectTower('basic');
            if (e.key === '2') selectTower('fast');
            if (e.key === '3') selectTower('power');
            if (e.key === '4') selectTower('ice');
            if (e.key === ' ') togglePause();
        });
    };

    /**
     * Iniciar el juego
     */
    const startGame = () => {
        if (gameState.gameRunning) return;

        gameState.gameRunning = true;
        gameState.gameOver = false;
        gameState.won = false;

        // Resetear estado de enemigos y torres
        EnemySystem.clearEnemies();
        TowerSystem.clearTowers();
        GameEngine.clearDynamics();
        LevelSystem.reset();

        // Generar nuevo mapa procedural
        LevelSystem.generatePath();

        // Resetear monedas y vidas
        gameState.lives = 20;
        gameState.gold = 100;
        gameState.enemiesDefeated = 0;
        gameState.totalEnemiesSpawned = 0;
        gameState.score = 0;

        // Iniciar primera onda
        startWave();

        // Iniciar game loop
        startGameLoop();

        // Actualizar UI
        domElements.startBtn.disabled = true;
        domElements.pauseBtn.disabled = false;
        updateUI();

        console.log('Juego iniciado');
    };

    /**
     * Iniciar onda de enemigos con countdown
     */
    const startWave = () => {
        const levelInfo = LevelSystem.getLevelInfo();
        const isBossWave = levelInfo.wave % 5 === 0; // Oleadas 5, 10, 15, etc.
        
        // Countdown: 5 segundos para prepararse
        const countdownSeconds = 5;
        let secondsLeft = countdownSeconds;
        
        const waveLabel = isBossWave ? `🔥 OLEADA BOSS ${levelInfo.wave}` : `Oleada ${levelInfo.wave}`;
        showMessage(`${waveLabel} comienza en ${secondsLeft}...`);
        
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            
            if (secondsLeft > 0) {
                showMessage(`${waveLabel} comienza en ${secondsLeft}...`);
            } else {
                clearInterval(countdownInterval);
                
                // Iniciar la onda realmente
                spawnState.waveActive = true;
                // En oleadas boss: 1 boss + N elites (N = nivel). En oleadas normales: todos los minions
                spawnState.enemiesToSpawn = isBossWave ? (1 + levelInfo.level) : levelInfo.enemyCount;
                spawnState.originalEnemyCount = levelInfo.enemyCount; // Guardar para detectar barracones después
                spawnState.spawnTimer = 0;
                spawnState.waveTotalHealth = 0;
                spawnState.spawnedMinions = 0;
                gameState.currentWaveEnemies = 0;
                gameState.totalEnemiesSpawned = 0;
                
                // Si es oleada boss, pre-calcular el total de health que tendrían los minions
                if (isBossWave) {
                    // Calcular health de cada tipo de minion
                    const normalHealth = 1 * levelInfo.enemyHealth;
                    const fastHealth = 0.5 * levelInfo.enemyHealth;
                    const heavyHealth = 2 * levelInfo.enemyHealth;
                    
                    // Estimar la composición de enemigos basada en la probabilidad
                    const numEnemies = levelInfo.enemyCount;
                    const normalCount = Math.floor(numEnemies * 0.7); // 70% normal
                    const fastCount = Math.floor(numEnemies * 0.2); // 20% fast
                    const heavyCount = numEnemies - normalCount - fastCount; // Resto heavy
                    
                    let bossHealth = (normalCount * normalHealth) + 
                                     (fastCount * fastHealth) + 
                                     (heavyCount * heavyHealth);
                    
                    // Multiplicar por el nivel una sola vez
                    bossHealth *= levelInfo.level;
                    
                    spawnState.waveTotalHealth = bossHealth;
                }
                
                showMessage(`¡${waveLabel} comienza!`);
                console.log(`Onda iniciada: Nivel ${levelInfo.level}, Onda ${levelInfo.wave}, ${isBossWave ? 'BOSS' : levelInfo.enemyCount + ' enemigos'}`);
            }
        }, 1000);
    };

    /**
     * Spawnear enemigos
     */
    const updateSpawning = (deltaTime) => {
        if (!spawnState.waveActive) return;

        const levelInfo = LevelSystem.getLevelInfo();
        const isBossWave = levelInfo.wave % 5 === 0;

        spawnState.spawnTimer += deltaTime;

        // Verificar si debemos agregar elite extra por barracones
        const barracksCount = TowerSystem.getTowers().filter(t => t.type === 'barracks').length;
        const shouldAddExtraElite = !isBossWave && 
                                    barracksCount > spawnState.originalEnemyCount && 
                                    spawnState.spawnedMinions === spawnState.originalEnemyCount &&
                                    spawnState.enemiesToSpawn > 0;

        while (spawnState.spawnTimer >= spawnState.spawnInterval && spawnState.enemiesToSpawn > 0) {
            spawnState.spawnTimer -= spawnState.spawnInterval;

            // Si es oleada boss, spawner boss y luego elite
            if (isBossWave && spawnState.spawnedMinions === 0) {
                // Spawnear el boss
                const bossHealth = spawnState.waveTotalHealth;
                const boss = EnemySystem.createEnemy('boss', bossHealth);
                
                // Aplicar modificadores del nivel al boss
                boss.speed *= levelInfo.enemySpeed;
                
                EnemySystem.addEnemy(boss);
                gameState.currentWaveEnemies++;
                gameState.totalEnemiesSpawned++;
                spawnState.spawnedMinions++;
                spawnState.enemiesToSpawn--;
            } else if (isBossWave && spawnState.spawnedMinions > 0 && spawnState.spawnedMinions <= levelInfo.level) {
                // Spawnear elites que acompañan al boss (cantidad = nivel)
                const elite = EnemySystem.createEnemy('elite');
                
                // Aplicar modificadores del nivel al elite
                elite.speed *= levelInfo.enemySpeed;
                elite.health *= levelInfo.enemyHealth;
                elite.maxHealth = elite.health;
                
                EnemySystem.addEnemy(elite);
                gameState.currentWaveEnemies++;
                gameState.totalEnemiesSpawned++;
                spawnState.spawnedMinions++;
                spawnState.enemiesToSpawn--;
            } else if (!isBossWave) {
                // Oleada normal: spawner minions
                // Si hay más barracones que enemigos, spawner elite adicional
                let enemyType = 'normal';
                
                if (shouldAddExtraElite && spawnState.spawnedMinions === spawnState.originalEnemyCount) {
                    // Spawnear elite adicional
                    enemyType = 'elite';
                } else {
                    // Variar tipo de enemigo según nivel y barracones
                    const level = LevelSystem.getLevel();
                    const barracksCount = TowerSystem.getTowers().filter(t => t.type === 'barracks').length;

                    // Probabilidad de elite aumenta con barracones
                    if (barracksCount > 0 && Math.random() < (0.1 * barracksCount)) {
                        enemyType = 'elite';
                    } else if (level > 10 && Math.random() < 0.3) {
                        enemyType = 'fast';
                    } else if (level > 20 && Math.random() < 0.2) {
                        enemyType = 'heavy';
                    }
                }

                const enemy = EnemySystem.createEnemy(enemyType);
                
                // Aplicar modificadores del nivel
                enemy.speed *= levelInfo.enemySpeed;
                enemy.health *= levelInfo.enemyHealth;
                enemy.maxHealth = enemy.health;

                EnemySystem.addEnemy(enemy);
                gameState.currentWaveEnemies++;
                gameState.totalEnemiesSpawned++;
                spawnState.spawnedMinions++;
                spawnState.enemiesToSpawn--;
            }
        }
    };

    /**
     * Game loop principal
     */
    const startGameLoop = () => {
        let lastTime = performance.now();
        let previousEnemyCount = 0;

        const loop = (currentTime) => {
            const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Máximo 100ms
            lastTime = currentTime;

            if (gameState.gameRunning && !GameEngine.getState().paused) {
                // Actualizar spawning de enemigos
                updateSpawning(deltaTime);

                // Actualizar motor
                GameEngine.update(deltaTime);

                // Ejecutar lógica de torres
                GameEngine.executeTowerLogic();

                // Verificar colisiones y daño
                checkEnemiesReachedEnd();

                // Detectar enemigos destruidos y sumar score
                const currentEnemyCount = EnemySystem.getAliveEnemies().length;
                if (previousEnemyCount > currentEnemyCount) {
                    const enemiesKilled = previousEnemyCount - currentEnemyCount;
                    // 50 puntos por enemigo normal, más puntos por especiales
                    addScore(enemiesKilled * 50);
                }
                previousEnemyCount = currentEnemyCount;

                // Verificar si la onda terminó
                if (shouldEndWave()) {
                    endWave();
                    // Sumar bonus de nivel al completar onda
                    addScore(500);
                }

                // Verificar condición de game over
                if (gameState.lives <= 0) {
                    endGame(false);
                }
            }

            // Renderizar
            render();
            updateUI();

            if (gameState.gameRunning) {
                gameLoop = requestAnimationFrame(loop);
            }
        };

        gameLoop = requestAnimationFrame(loop);
    };

    /**
     * Verificar enemigos que alcanzaron el final
     */
    const checkEnemiesReachedEnd = () => {
        const enemies = EnemySystem.getEnemies();
        const goal = LevelSystem.getGoalPoint();
        
        enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            // Calcular distancia a la meta
            const distToGoal = Math.sqrt(
                Math.pow(enemy.x - goal.x, 2) + Math.pow(enemy.y - goal.y, 2)
            );
            
            // Si llega a la meta (dentro de 50 píxeles)
            if (distToGoal < 50) {
                enemy.alive = false;
                gameState.lives -= 1;
                showMessage(`¡Enemigo alcanzó la meta! Vidas: ${gameState.lives}`);
                
                // Si pierdes todas las vidas
                if (gameState.lives <= 0) {
                    endGame(false);
                }
            }
        });

        // Limpiar enemigos que alcanzaron el final
        EnemySystem.clearDeadEnemies();
    };

    /**
     * Verificar si la onda debe terminar
     */
    const shouldEndWave = () => {
        if (!spawnState.waveActive) return false;
        if (spawnState.enemiesToSpawn > 0) return false; // Aún hay enemigos para spawnear
        if (EnemySystem.getAliveEnemies().length > 0) return false; // Aún hay enemigos vivos
        return true;
    };

    /**
     * Terminar onda y avanzar a la siguiente
     */
    const endWave = () => {
        spawnState.waveActive = false;
        const levelInfo = LevelSystem.getLevelInfo();
        gameState.enemiesDefeated = levelInfo.enemyCount;

        // Otorgar oro por completar onda
        const waveBonus = levelInfo.wave * 50;
        gameState.gold += waveBonus;

        showMessage(`¡Onda completada! +${waveBonus} oro`);

        // Siguiente onda
        setTimeout(() => {
            LevelSystem.nextWave();
            startWave();
        }, 2000);
    };

    /**
     * Abrir modal de logros
     */
    const openAchievements = () => {
        if (!gameState.gameRunning) return;
        
        // Pausar juego
        if (!GameEngine.getState().paused) {
            GameEngine.togglePause();
            domElements.pauseBtn.textContent = 'Reanudar';
        }
        
        // Mostrar modal
        domElements.achievementsModal.style.display = 'flex';
        updateAchievementsDisplay();
    };

    /**
     * Cerrar modal de logros
     */
    const closeAchievements = () => {
        domElements.achievementsModal.style.display = 'none';
        
        // Reanudar juego si está pausado
        if (GameEngine.getState().paused) {
            GameEngine.togglePause();
            domElements.pauseBtn.textContent = 'Pausar';
        }
    };

    /**
     * Actualizar display de logros
     */
    const updateAchievementsDisplay = () => {
        const achievements = AchievementSystem.getAchievements();
        const progress = AchievementSystem.getProgress();
        
        domElements.achievementsContainer.innerHTML = '';

        Object.values(achievements).forEach((achievement) => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            
            let levelsHTML = '';
            let totalCompleted = 0;
            
            achievement.levels.forEach((level) => {
                let currentProgress = 0;
                
                // Obtener progreso actual
                if (achievement.type === 'enemy_kills') {
                    currentProgress = progress.totalEnemies;
                } else if (achievement.type === 'enemy_type') {
                    currentProgress = progress.enemyKillsByType[achievement.enemyType] || 0;
                } else if (achievement.type === 'tower_type') {
                    currentProgress = progress.towersByType[achievement.towerType] || 0;
                }
                
                const percentage = Math.min(100, (currentProgress / level.threshold) * 100);
                const isCompleted = level.completed;
                
                if (isCompleted) totalCompleted++;
                
                levelsHTML += `
                    <div class="achievement-level ${isCompleted ? 'completed' : ''}">
                        <div>
                            <span class="achievement-level-name">${level.reward}</span>
                            <span class="achievement-counter">${currentProgress}/${level.threshold}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            });
            
            card.innerHTML = `
                <div class="achievement-header">
                    <span class="achievement-emoji">${achievement.emoji}</span>
                    <span class="achievement-title">${achievement.name}</span>
                </div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-levels">
                    ${levelsHTML}
                </div>
            `;
            
            domElements.achievementsContainer.appendChild(card);
        });
        
        // Actualizar estadísticas
        const totalLevels = Object.values(achievements).reduce((sum, ach) => sum + ach.levels.length, 0);
        const completedLevels = Object.values(achievements).reduce((sum, ach) => 
            sum + ach.levels.filter(l => l.completed).length, 0
        );
        
        domElements.achievementsStats.innerHTML = `
            ${completedLevels} / ${totalLevels} logros completados | 
            Enemigos: ${progress.totalEnemies} | 
            Torres: ${Object.values(progress.towersByType).reduce((a, b) => a + b, 0)}
        `;
    };

    /**
     * Seleccionar tipo de torre
     */
    const selectTower = (towerType) => {
        const towerData = TowerSystem.getTowerType(towerType);
        if (!towerData) return;

        // Si ya estaba seleccionada, deseleccionar
        if (gameState.selectedTower === towerType) {
            gameState.selectedTower = null;
            Object.values(domElements.towerBtns).forEach(btn => btn.classList.remove('selected'));
            showMessage('Selección cancelada');
            return;
        }

        // Verificar si tienes oro suficiente
        if (gameState.gold < towerData.cost) {
            showMessage(`¡No tienes suficiente oro! (Necesitas ${towerData.cost})`);
            return;
        }

        // Seleccionar torre
        gameState.selectedTower = towerType;

        // Actualizar botones
        Object.entries(domElements.towerBtns).forEach(([type, btn]) => {
            btn.classList.toggle('selected', type === towerType);
        });

        showMessage(`Torre ${towerData.name} seleccionada. Click para colocar.`);
    };

    /**
     * Agregar oro por matar enemigo
     */
    const addGoldForKill = (enemy) => {
        gameState.gold += enemy.reward;
        showMessage(`+${enemy.reward} O (${enemy.symbol})`);
        // Registrar en logros
        AchievementSystem.recordEnemyKill(enemy.type);
    };

    /**
     * Manejar click en área de juego
     */
    const handleGameAreaClick = (e) => {
        const rect = domElements.gameArea.getBoundingClientRect();
        const canvas = document.getElementById('gameCanvas');
        
        if (!canvas) return;

        // Calcular posición en canvas
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Buscar torre en esta posición (rango visual + 10 pixels)
        const clickedTower = TowerSystem.getTowers().find(t => {
            const dist = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
            return dist <= 24; // 14 (radio) + 10 (margen de clickeo)
        });

        if (clickedTower) {
            // Click en torre existente - mostrar menú de upgrade
            selectTowerForUpgrade(clickedTower);
            return;
        }

        // Click en área vacía - deseleccionar todo
        if (gameState.selectedTowerObj) {
            gameState.selectedTowerObj = null;
            domElements.upgradePanel.style.display = 'none';
        }

        // Si hay torre seleccionada para colocar, intentar colocar (solo si el juego está corriendo)
        if (!gameState.gameRunning) return;
        if (gameState.selectedTower === null) return;

        if (placeTower(gameState.selectedTower, x, y)) {
            // Deseleccionar torre
            gameState.selectedTower = null;
            Object.values(domElements.towerBtns).forEach(btn => btn.classList.remove('selected'));
            showMessage('Torre colocada');
        }
    };

    /**
     * Seleccionar torre para upgrade
     */
    const selectTowerForUpgrade = (tower) => {
        gameState.selectedTowerObj = tower;
        gameState.selectedTower = null;
        
        // Actualizar UI de upgrade
        const towerType = TowerSystem.getTowerType(tower.type);
        document.getElementById('upgradeTowerType').textContent = `${towerType.emoji} ${towerType.name}`;
        
        // Generar botones de upgrade
        const upgradeButtons = document.getElementById('upgradeButtons');
        upgradeButtons.innerHTML = '';
        
        // Las construcciones no se pueden mejorar
        if (towerType.isConstruction) {
            const msg = document.createElement('div');
            msg.style.color = '#888888';
            msg.style.fontSize = '12px';
            msg.textContent = 'Construcción (no upgradeable)';
            upgradeButtons.appendChild(msg);
            
            // Botón: Demoler
            const demolishBtn = document.createElement('button');
            demolishBtn.className = 'upgrade-btn';
            const refund = TowerSystem.demolishTower(tower);
            demolishBtn.textContent = `🗑️ Demoler (+${refund} O)`;
            demolishBtn.style.borderColor = '#ff4444';
            demolishBtn.style.color = '#ff4444';
            
            demolishBtn.addEventListener('click', () => {
                TowerSystem.removeTower(tower.id);
                gameState.gold += refund;
                showMessage(`Torre demolida. Oro recuperado: +${refund}`);
                // Registrar demolición en logros
                AchievementSystem.recordTowerDemolished(tower.type);
                domElements.upgradePanel.style.display = 'none';
                gameState.selectedTowerObj = null;
            });
            
            upgradeButtons.appendChild(demolishBtn);
            return;
        }
        
        // Para torres normales
        document.getElementById('upgradeTowerLevel').textContent = `Daño: ${TowerSystem.getTowerDamage(tower).toFixed(1)}`;
        
        // Botón: Mejorar daño (+0.5 daño por 25 oro)
        const damageBtn = document.createElement('button');
        damageBtn.className = 'upgrade-btn';
        const damageCost = 25;
        damageBtn.textContent = `📊 Mejorar Daño (+0.5) - ${damageCost} O`;
        
        if (gameState.gold < damageCost) {
            damageBtn.disabled = true;
        }
        
        damageBtn.addEventListener('click', () => {
            if (gameState.gold >= damageCost) {
                TowerSystem.upgradeDamage(tower, damageCost);
                gameState.gold -= damageCost;
                showMessage(`Daño mejorado a ${TowerSystem.getTowerDamage(tower).toFixed(1)}!`);
                selectTowerForUpgrade(tower); // Actualizar panel
            }
        });
        
        upgradeButtons.appendChild(damageBtn);
        
        // Botones: Cambiar tipo de torre (SOLO si aún no ha sido mejorada)
        if (!tower.upgraded) {
            const availableUpgrades = TowerSystem.getAvailableUpgrades(tower.type);
            availableUpgrades.forEach(upgradeType => {
                const btn = document.createElement('button');
                btn.className = 'upgrade-btn';
                btn.textContent = `${upgradeType.emoji} ${upgradeType.name} (${upgradeType.cost} O)`;
                
                const costDifference = upgradeType.cost - towerType.cost;
                const canAfford = gameState.gold >= costDifference;
                
                if (!canAfford) {
                    btn.disabled = true;
                }
                
                btn.addEventListener('click', () => {
                    upgradeTower(tower, upgradeType.id, costDifference);
                });
                
                upgradeButtons.appendChild(btn);
            });
        } else {
            // Torre ya fue mejorada - mostrar mensaje
            const lockedMsg = document.createElement('div');
            lockedMsg.style.color = '#ffff00';
            lockedMsg.style.fontSize = '12px';
            lockedMsg.textContent = '✓ Tipo bloqueado (ya mejorada)';
            upgradeButtons.appendChild(lockedMsg);
        }
        
        // Botón: Demoler torre (recuperar 50%)
        const demolishBtn = document.createElement('button');
        demolishBtn.className = 'upgrade-btn';
        const refund = TowerSystem.demolishTower(tower);
        demolishBtn.textContent = `🗑️ Demoler (+${refund} O)`;
        demolishBtn.style.borderColor = '#ff4444';
        demolishBtn.style.color = '#ff4444';
        
        demolishBtn.addEventListener('click', () => {
            TowerSystem.removeTower(tower.id);
            gameState.gold += refund;
            showMessage(`Torre demolida. Recuperado ${refund} oro.`);
            // Registrar demolición en logros
            AchievementSystem.recordTowerDemolished(tower.type);
            domElements.upgradePanel.style.display = 'none';
            gameState.selectedTowerObj = null;
        });
        
        upgradeButtons.appendChild(demolishBtn);
        
        // Mostrar panel
        domElements.upgradePanel.style.display = 'block';
        Object.values(domElements.towerBtns).forEach(btn => btn.classList.remove('selected'));
    };

    /**
     * Mejorar torre
     */
    const upgradeTower = (tower, newTypeId, goldCost) => {
        if (gameState.gold < goldCost) {
            showMessage('¡No tienes suficiente oro!');
            return;
        }

        TowerSystem.upgradeTower(tower, newTypeId);
        gameState.gold -= goldCost;
        
        showMessage(`Torre mejorada a ${TowerSystem.getTowerType(newTypeId).name}!`);
        
        // Cerrar panel
        domElements.upgradePanel.style.display = 'none';
        gameState.selectedTowerObj = null;
    };

    /**
     * Colocar torre
     */
    const placeTower = (towerType, x, y) => {
        const towerData = TowerSystem.getTowerType(towerType);
        const config = GameEngine.getConfig();
        
        // Validar posición
        if (x < 0 || x >= config.canvasWidth || y < 0 || y >= config.canvasHeight) {
            showMessage('Posición fuera del mapa');
            return false;
        }

        // Verificar colisión con otras torres
        const existingTower = TowerSystem.getTowers().find(t => {
            const dist = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
            return dist < 40;
        });
        if (existingTower) {
            showMessage('Ya hay una torre muy cerca');
            return false;
        }

        // Verificar oro
        if (gameState.gold < towerData.cost) {
            showMessage('¡No tienes suficiente oro!');
            return false;
        }

        // Crear y agregar torre
        const tower = TowerSystem.createTower(towerType, x, y);
        TowerSystem.addTower(tower);

        // Restar oro
        gameState.gold -= towerData.cost;
        
        // Registrar en logros
        AchievementSystem.recordTowerBuilt(towerType);

        return true;
    };

    /**
     * Pausar/reanudar juego
     */
    const togglePause = () => {
        if (!gameState.gameRunning) return;

        const isPaused = GameEngine.togglePause();
        domElements.pauseBtn.textContent = isPaused ? 'Reanudar' : 'Pausar';
        showMessage(isPaused ? 'JUEGO PAUSADO' : 'Juego reanudado');
    };

    /**
     * Resetear juego
     */
    const resetGame = () => {
        gameState.gameRunning = false;
        gameState.gameOver = true;

        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }

        // Limpiar sistemas
        EnemySystem.clearEnemies();
        TowerSystem.clearTowers();
        GameEngine.clearDynamics();
        AchievementSystem.reset();

        // Resetear estado
        gameState.selectedTower = null;
        spawnState.waveActive = false;

        // Actualizar UI
        domElements.startBtn.disabled = false;
        domElements.pauseBtn.disabled = true;
        domElements.pauseBtn.textContent = 'Pausar';

        Object.values(domElements.towerBtns).forEach(btn => btn.classList.remove('selected'));

        showMessage('Juego reiniciado');
        render();
        updateUI();
    };

    /**
     * Terminar juego
     */
    const endGame = (won) => {
        gameState.gameRunning = false;
        gameState.gameOver = true;
        gameState.won = won;

        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }

        if (won) {
            AudioManager.playVictory();
            showMessage(`¡VICTORIA! PUNTUACIÓN: ${gameState.score}`);
        } else {
            AudioManager.playGameOver();
            showMessage(`¡GAME OVER! PUNTUACIÓN: ${gameState.score}`);
        }

        domElements.startBtn.disabled = false;
        domElements.pauseBtn.disabled = true;
    };

    /**
     * Sumar puntos al score
     */
    const addScore = (points) => {
        gameState.score += points;
        if (domElements.scoreDisplay) {
            domElements.scoreDisplay.textContent = gameState.score;
        }
    };

    /**
     * Mostrar mensaje
     */
    const showMessage = (message) => {
        domElements.message.textContent = message;
    };

    /**
     * Actualizar interfaz
     */
    const updateUI = () => {
        const level = LevelSystem.getLevel();
        const wave = LevelSystem.getWave();

        domElements.levelDisplay.textContent = level;
        domElements.lifeDisplay.textContent = gameState.lives;
        domElements.goldDisplay.textContent = gameState.gold;
        domElements.waveDisplay.textContent = `${wave}/5`;
        domElements.scoreDisplay.textContent = gameState.score;

        // Actualizar estado de botones de torres
        Object.entries(domElements.towerBtns).forEach(([towerType, btn]) => {
            const towerData = TowerSystem.getTowerType(towerType);
            btn.disabled = gameState.gold < towerData.cost || !gameState.gameRunning;
        });
    };

    /**
     * Renderizar el juego
     */
    const render = () => {
        const gameObjects = {
            towers: TowerSystem.getTowers(),
            enemies: EnemySystem.getEnemies(),
            projectiles: GameEngine.getProjectiles(),
            explosions: GameEngine.getExplosions(),
            selectedTowerId: gameState.selectedTowerObj ? gameState.selectedTowerObj.id : null
        };

        GameEngine.render(gameObjects);
    };

    return {
        init,
        addGoldForKill
    };
})();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Game.init();
    });
} else {
    Game.init();
}
