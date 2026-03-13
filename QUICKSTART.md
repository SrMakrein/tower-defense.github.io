# GUÍA DE INICIO RÁPIDO

## 🎮 Jugar Ahora Mismo

### Opción 1: Abrir directamente
1. Haz doble clic en `index.html`
2. ¡A jugar!

### Opción 2: Servidor Local (Recomendado)

**Con Python 3:**
```bash
cd tower-defense-ascii
python -m http.server 8000
```
Luego abre: http://localhost:8000

**Con Node.js:**
```bash
npx http-server
```

**Con VSCode Live Server:**
- Haz clic derecho en `index.html`
- Selecciona "Open with Live Server"

## 🎮 Controles Básicos

| Acción | Control |
|--------|---------|
| Seleccionar torre | `1` `2` `3` `4` o click en botón |
| Colocar torre | Click en el mapa |
| Pausar | `ESPACIO` o botón |
| Iniciar | Click en "Iniciar Juego" |

## 💡 Primeros Pasos

1. **Haz clic en "Iniciar Juego"**
   - Se inicia la primera onda con 5 enemigos

2. **Selecciona la Torre Básica [1]**
   - Cuesta 50 oro
   - Daño normal
   - Buena velocidad de disparo

3. **Haz clic en el mapa para colocar**
   - Coloca torres en las curvas del camino
   - Rodea el camino de torres

4. **Observa cómo disparan a los enemigos**
   - Ganaras oro por cada enemigo destruido
   - Usa el oro para colocar más torres

5. **Completa todas las 5 ondas**
   - La dificultad aumenta automáticamente
   - Intenta llegar al máximo nivel posible

## 📊 Objetivo del Juego

- **Meta**: Defender contra todas las oleadas de enemigos
- **Pierde si**: Tus vidas llegan a 0 (20 vidas iniciales)
- **Gana si**: Completas oleadas sin perder todas las vidas

## 🎯 Tips Para Ganar

✅ **Posición**: Coloca torres en las **curvas del camino**
✅ **Variedad**: Usa diferentes tipos de torres
✅ **Hielo**: Las torres de hielo ralentizan enemigos rápidos
✅ **Economía**: No gastes todo tu oro, ahorra para después
✅ **Paciencia**: Usa ESPACIO para pausar y planificar

## 🚀 Desplegar en GitHub Pages

1. Crea un repositorio en GitHub: `tower-defense-ascii`

2. Sube los archivos:
```bash
git init
git add .
git commit -m "Tower Defense ASCII Game"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tower-defense-ascii.git
git push -u origin main
```

3. Activa GitHub Pages:
   - Ve a Settings → Pages
   - Selecciona main / root
   - ¡Listo! Tu juego estará en: `https://tu-usuario.github.io/tower-defense-ascii/`

## 🎓 Aprender el Código

El proyecto está bien estructurado:

- **game.js** - Lógica principal
- **engine.js** - Motor y física
- **towers.js** - Sistema de torres
- **enemies.js** - Sistema de enemigos
- **levels.js** - Sistema de niveles
- **audio.js** - Sonidos

¡Puedes modificar cualquier archivo sin dependencias externas!

## ❓ ¿Problemas?

- **Sin sonido**: Haz clic en el juego primero (los navegadores lo requieren)
- **Juego lento**: Cierra otras pestañas
- **No se cargan**: Asegúrate de estar en la carpeta correcta

---

**¡Que disfrutes! 🎮**
