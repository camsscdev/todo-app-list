# TodoAppList - Prueba Técnica Ionic / Angular

Aplicación que permite gestionar tareas y categorizarlas en tiempo real conectándose directamente con **Firebase Firestore** e integrando **Firebase Remote Config** para controlar características dinámicamente desde la nube.

---

## Características

### 1. Migración a Firebase (CRUD Completo en Tiempo Real)
Se reemplazó el almacenamiento local de Capacitor Preferences por una integración limpia con `@angular/fire` en [todo.service.ts](file:///src/app/services/todo.service.ts).
* **GET (Lectura)**: Escucha en tiempo real mediante `onSnapshot` de Firestore para las colecciones `tasks` y `categories`. La UI se actualiza inmediatamente cuando cambian los datos.
* **POST (Creación)**: Creación de categorías y tareas utilizando `addDoc`.
* **PUT (Actualización)**: Edición de campos (título de la tarea, categoría asociada, completado) mediante `updateDoc` y `setDoc`.
* **DELETE (Eliminación)**: Eliminación física en Firestore con `deleteDoc`. Al borrar una categoría, el servicio desasocia la categoría de forma segura de todas las tareas asociadas.

### 2. Feature Flag con Firebase Remote Config
Se implementó una feature flag dinámica llamada `enable_categories` (booleano):
* **Comportamiento**:
  * Si está **activa (true)**, la aplicación muestra la UI de filtrado, las etiquetas (badges) de categoría en la lista de tareas, el selector de categorías al agregar/editar y el botón flotante (FAB) para gestionar categorías.
  * Si está **desactivada (false)**, la UI se adapta ocultando todas las funciones de categorías, permitiendo únicamente el uso de la lista de tareas plana.
* **Detalle técnico**: Se configuró en el ciclo de vida del servicio inicializando `RemoteConfig` con un intervalo de obtención de `0ms` en desarrollo para cambios y demostraciones en tiempo real.

### 3. Soporte de Compilación Híbrida (Capacitor)
Se estableció una estructura híbrida moderna mediante **Capacitor** (sucesor recomendado de Cordova por Ionic):
* Archivo de configuración: [capacitor.config.ts](file:///capacitor.config.ts).
* Se agregaron directorios nativos: `/android` y `/ios`.

### 4. Compilación Automatizada en la Nube (iOS IPA)
Dado que el desarrollo se realiza en Windows (donde localmente no es posible compilar para iOS debido a los requerimientos de Apple/Xcode), se configuró un pipeline de Integración Continua (CI) en GitHub Actions:
* Ubicación: [.github/workflows/build-ios.yml](file:///.github/workflows/build-ios.yml).
* **Función**: Al subir cambios a las ramas principales, un servidor macOS en la nube de GitHub ejecuta la compilación de Xcode, valida que compile correctamente y exporta el archivo `.ipa` compilado listo para descargar de los artefactos.

### 5. Indicadores de Carga (Loader/Spinner) y Mensajes Toast (UX)
Se optimizó el feedback visual al usuario en todas las interacciones del CRUD:
* **Spinner de Carga Inicial**: En la primera obtención de datos desde Firestore, se muestra un `<ion-spinner>` crescent con animación fluida en el centro de la pantalla mientras `isLoading` esté activo.
* **Loader de Pantalla Completa**: Se muestra un loader semi-transparente mediante `LoadingController` al crear, actualizar o eliminar tareas y categorías, informando que la operación está en proceso.
* **Mensajes de Retroalimentación (Toast)**: Tras realizar cualquier acción en la base de datos (crear, editar, eliminar o cambiar estado de completado), se notifica al usuario con un Toast flotante mediante `ToastController` (ej: "Tarea agregada correctamente", "Categoría eliminada", "Tarea marcada como completada", etc.), utilizando colores contextuales (`success`, `medium`, `danger`).

---

## 🛠️ Requisitos e Instrucciones de Compilación y Ejecución

### 1. Clonar e Instalar Dependencias
```bash
git clone 
cd todo-app-list
npm install --legacy-peer-deps
```

### 2. Ejecutar Servidor de Desarrollo (Web)
```bash
npm start
```
La aplicación web se abrirá automáticamente en `http://localhost:4200/`.

### 3. Compilar y Ejecutar para Android (.APK)
Requisitos: Android Studio e Android SDK instalados.
1. Generar los recursos web optimizados:
   ```bash
   npm run build
   ```
2. Sincronizar el código nativo:
   ```bash
   npx cap sync android
   ```
3. Abrir el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
4. Desde Android Studio, haz clic en **Run** para emular en tu dispositivo, o ve a `Build > Build Bundle(s) / APK(s) > Build APK(s)` para generar el archivo `.apk` instalable.

### 4. Compilar para iOS (.IPA)
#### Método A: GitHub Actions (Automatizado en la nube sin Mac)
1. Sube tu código a GitHub.
2. Ve a la pestaña **Actions** en tu repositorio de GitHub.
3. Selecciona el flujo **Build iOS App (.ipa)** y haz clic en **Run workflow**.
4. Al terminar la tarea, podrás descargar el `.ipa` o los resultados de la compilación desde los artefactos.
*(Nota: Para firmar y generar un IPA ejecutable real, define los secretos `P12_BASE64`, `P12_KEY_PASSWORD`, `MOBILEPROVISION_BASE64` y `TEAM_ID` en la configuración de secretos de tu repositorio. De lo contrario, compilará para simulador como verificación técnica).*

#### Método B: Compilación Local (Requiere Mac con macOS y Xcode)
```bash
npm run build
npx cap sync ios
npx cap open ios
```
Se abrirá Xcode. Selecciona el simulador o dispositivo físico y presiona **Play/Run**. Para exportar el IPA, ve a `Product > Archive > Distribute App`.

---

## 📝 Respuestas a las Preguntas de la Evaluación

### A. ¿Cuáles fueron los principales desafíos que se enfrentaron al implementar las nuevas funcionalidades?
1. **Configuración del entorno de iOS en Windows**: La restricción física de Apple para compilar solo en macOS fue el mayor desafío. Se resolvió creando un workflow de automatización en **GitHub Actions** utilizando un runner de `macos-latest` para ejecutar compilaciones e integraciones reales de Xcode de forma remota.
2. **Migración a Firebase sin romper Signals**: Adaptar la lectura en tiempo real de Firestore a los Signals nativos de Angular para asegurar que la vista sea reactiva sin recargar páginas. Se logró integrando `onSnapshot` que emite cambios directamente en los setters de los `signal`.

### B. ¿Qué técnicas de optimización de rendimiento se aplicaron y por qué?
1. **Angular Signals**: Se usaron Signals en lugar de RxJS/BehaviorSubjects o change detection por zonas excesivo. Los Signals permiten a Angular identificar el nodo de DOM exacto que requiere actualización, evitando re-renders masivos de listas grandes de tareas.
2. **Componentes Standalone y Lazy Loading**: Al usar arquitecturas de componentes standalone, el bundle inicial es mínimo, lo que acelera el tiempo de carga e interactividad (LCP/TBT) en dispositivos móviles de gama baja.
3. **Manejo Eficiente de Desasociación**: Al eliminar una categoría, se realizó una desasociación en batch de tareas de forma proactiva, evitando de esta forma tener inconsistencias de IDs huérfanos en memoria.

### C. ¿Cómo se aseguró la calidad y mantenibilidad del código?
1. **Separación de Capas (Lógica vs Presentación)**: Los componentes visuales ([task.component.ts](file:///src/app/pages/task/task.component.ts), [list.component.ts](file:///src/app/components/list/list.component.ts)) no realizan llamadas a base de datos. Toda la lógica del backend y estado global está encapsulada en el servicio [todo.service.ts](file:///src/app/services/todo.service.ts).
2. **TypeScript Estricto**: Definición estricta de las interfaces de datos ([Task](file:///src/app/models/task.interface.ts) y [Category](file:///src/app/models/category.interface.ts)) para evitar errores en tiempo de ejecución por propiedades nulas o ausentes.
3. **Control del Feature Flag Centralizado**: La funcionalidad de Remote Config se maneja como un estado global de lectura reactiva (`enableCategories`), lo que garantiza que si el flag cambia, toda la UI se adapta al instante de forma coherente.
4. **Desacoplamiento de la Capa de Notificaciones (UiService)**: Se encapsuló la lógica del `ToastController` y `LoadingController` en un servicio común ([ui.service.ts](file:///src/app/services/ui.service.ts)), facilitando la mantenibilidad y evitando duplicar configuraciones de interfaz.

