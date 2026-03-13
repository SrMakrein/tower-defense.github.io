# DESPLIEGUE EN GITHUB PAGES

Este proyecto está completamente listo para desplegar en GitHub Pages. Sigue estos pasos:

## Opción 1: Usar GitHub Web Interface (Más Fácil)

1. **Crear un repositorio nuevo en GitHub:**
   - Ve a https://github.com/new
   - Nombre del repositorio: `tower-defense-ascii`
   - Descripción: "Un juego Tower Defense con gráficos ASCII animados"
   - Selecciona "Public"
   - Haz clic en "Create repository"

2. **Subir los archivos:**
   - En la página del repositorio, haz clic en "Add file" → "Upload files"
   - Arrastra todos los archivos y carpetas desde tu carpeta local
   - O usa el botón "Choose your files" para seleccionarlos
   - Escribe un mensaje de commit: "Initial commit: Tower Defense ASCII Game"
   - Haz clic en "Commit changes"

3. **Activar GitHub Pages:**
   - Ve a la pestaña "Settings" del repositorio
   - En el menú izquierdo, busca "Pages"
   - En "Source", selecciona la rama "main"
   - La carpeta debe ser "/" (root)
   - Haz clic en "Save"
   - Espera un minuto a que se despliegue

4. **¡Listo!**
   - Tu juego estará disponible en: `https://TU_USUARIO.github.io/tower-defense-ascii/`

## Opción 2: Usar Git CLI (Para Desarrolladores)

### En Windows (PowerShell):

```powershell
# Navegar a la carpeta del proyecto
cd "e:\Proyecto Tower Defense\tower-defense-ascii"

# Inicializar repositorio Git
git init
git add .
git commit -m "Initial commit: Tower Defense ASCII Game"

# Cambiar rama a main
git branch -M main

# Agregar repositorio remoto
git remote add origin https://github.com/TU_USUARIO/tower-defense-ascii.git

# Hacer push al repositorio
git push -u origin main
```

### En macOS/Linux:

```bash
cd "e:/Proyecto Tower Defense/tower-defense-ascii"
git init
git add .
git commit -m "Initial commit: Tower Defense ASCII Game"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tower-defense-ascii.git
git push -u origin main
```

Luego sigue los pasos 3-4 de la Opción 1.

## Opción 3: Usar GitHub Desktop (Interfaz Gráfica)

1. **Descargar GitHub Desktop:**
   - Descargalo desde https://desktop.github.com/

2. **Crear un repositorio local:**
   - Abre GitHub Desktop
   - Haz clic en "File" → "New Repository"
   - Name: `tower-defense-ascii`
   - Local Path: Selecciona la carpeta del proyecto
   - Git ignore: None
   - Haz clic en "Create Repository"

3. **Hacer commit inicial:**
   - Todos los archivos aparecerán como "Changes"
   - En la parte inferior, escribe el mensaje: "Initial commit: Tower Defense ASCII Game"
   - Haz clic en "Commit to main"

4. **Publicar en GitHub:**
   - Haz clic en "Publish repository"
   - Desactiva "Keep this code private"
   - Haz clic en "Publish Repository"

5. **Activar Pages:**
   - Ve a https://github.com/TU_USUARIO/tower-defense-ascii
   - Settings → Pages
   - Source: main / root
   - Save

## Opciones Alternativas de Hosting

Si prefieres no usar GitHub Pages, también puedes desplegar en:

### Netlify (Recomendado)
1. Ve a https://app.netlify.com/
2. Haz login con GitHub
3. Selecciona "New site from Git"
4. Autoriza a Netlify
5. Selecciona el repositorio `tower-defense-ascii`
6. Deploy settings automáticos
7. Haz clic en "Deploy site"
8. ¡Tu juego estará en https://tower-defense-ascii.netlify.app/ (aproximadamente)

### Vercel
1. Ve a https://vercel.com/
2. Haz login con GitHub
3. Click en "New Project"
4. Selecciona `tower-defense-ascii`
5. Haz clic en "Deploy"
6. Tu juego estará en https://tower-defense-ascii.vercel.app

### Cloudflare Pages
1. Ve a https://pages.cloudflare.com/
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio
4. Build command: (dejar vacío)
5. Build output directory: (dejar vacío)
6. Deploy

## Verificar que Todo Funciona

Después de desplegar:

1. **Accede a tu URL del juego**
2. **Verifica que:**
   - El juego carga correctamente
   - Puedes hacer clic en "Iniciar Juego"
   - Los gráficos ASCII se renderizan
   - El sonido funciona (haz clic para activar el contexto de audio)
   - Puedes colocar torres
   - Los enemigos se mueven

## Troubleshooting

### El juego no carga
- Espera 5 minutos después de hacer push
- Recarga la página (Ctrl+F5 o Cmd+Shift+R)
- Verifica que todos los archivos se subieron correctamente
- Abre la consola (F12) para ver si hay errores

### Carga pero está en blanco
- Abre la consola del navegador (F12)
- Busca errores de 404 sobre archivos CSS o JS
- Verifica que la carpeta de proyecto está correctamente estructurada
- Asegúrate de que el archivo index.html está en la raíz

### Sin sonido
- El sonido requiere interacción del usuario
- Haz clic en el juego antes de esperar sonidos
- Algunos navegadores requieren consentimiento para Web Audio API

### GitHub Pages no aparece
- Asegúrate de que el repositorio es público
- Ve a Settings → Pages y verifica que está habilitado
- Espera 2-5 minutos después de hacer cambios
- El deployment debe mostrar un URL de éxito

## Actualizar el Juego

Para hacer cambios y actualizar:

```bash
# Hacer cambios en los archivos locales
# Luego:

git add .
git commit -m "Descripción de cambios"
git push
```

Los cambios se reflejarán en el sitio desplegado en 1-2 minutos.

## Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. Ve a Settings → Pages
2. En "Custom domain" ingresa tu dominio (ej: towerdefense.com)
3. Sigue las instrucciones para configurar los registros DNS
4. Github verificará automáticamente

## Estadísticas de Despliegue

Después de activar Pages, puedes ver:
- Settings → Pages → "Visit site" - accede a tu juego desplegado
- Insights → Traffic - analiza visitas
- Insights → Deployments - historial de despliegues

---

**¡Tu juego Tower Defense ASCII está listo para que el mundo lo juegue! 🎮**
