/**
 * AUDIO.JS
 * Sistema de sonidos usando Web Audio API
 * Genera sonidos procedurales para eventos del juego
 */

const AudioManager = (() => {
    // Contexto de audio del navegador
    let audioContext;
    let masterVolume = 0.3; // Volumen maestro

    // Inicializar contexto de audio
    const init = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API no disponible:', e);
        }
    };

    /**
     * Reproducir sonido de disparo de torre
     */
    const playShoot = () => {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Sonido agudo y corto
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    };

    /**
     * Reproducir sonido de impacto en enemigo
     */
    const playHit = () => {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Sonido grave y corto
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

        gain.gain.setValueAtTime(masterVolume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
    };

    /**
     * Reproducir sonido de explosión
     */
    const playExplosion = () => {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const duration = 0.3;

        // Crear oscilador para la onda
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const noise = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        // Llenar buffer con ruido blanco
        for (let i = 0; i < audioContext.sampleRate * duration; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        noise.buffer = noiseBuffer;
        noise.connect(gain);
        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Frecuencia de explosión
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + duration);

        // Volumen de explosión
        gain.gain.setValueAtTime(masterVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
        noise.start(now);
        noise.stop(now + duration);
    };

    /**
     * Reproducir sonido de enemigo destruido
     */
    const playEnemyDestroyed = () => {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Sonido en ascending pitch
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

        gain.gain.setValueAtTime(masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    };

    /**
     * Reproducir sonido de game over
     */
    const playGameOver = () => {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Sonido grave y decayente
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);

        gain.gain.setValueAtTime(masterVolume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
    };

    /**
     * Reproducir sonido de victoria
     */
    const playVictory = () => {
        if (!audioContext) return;

        const now = audioContext.currentTime;

        // Tres notas ascendentes
        const frequencies = [400, 500, 600];
        const duration = 0.15;

        frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            const startTime = now + (i * duration);

            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(masterVolume * 0.6, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    };

    /**
     * Establecer volumen maestro (0 a 1)
     */
    const setVolume = (volume) => {
        masterVolume = Math.max(0, Math.min(1, volume));
    };

    /**
     * Obtener volumen maestro actual
     */
    const getVolume = () => {
        return masterVolume;
    };

    return {
        init,
        playShoot,
        playHit,
        playExplosion,
        playEnemyDestroyed,
        playGameOver,
        playVictory,
        setVolume,
        getVolume
    };
})();

// Inicializar audio manager cuando el documento cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AudioManager.init();
    });
} else {
    AudioManager.init();
}
