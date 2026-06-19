# TodoAppList - Prueba Técnica Ionic / Angular - V.1.0

Aplicación móvil híbrida para la gestión de tareas (To-Do List) con soporte de categorías. Desarrollada con **Angular 21**, **Ionic** (Standalone), Firebase Firestore y Remote Config.

---

## 📥 Enlaces de Descarga
* **Android (APK)**: [Descargar APK](https://github.com/camsscdev/todo-app-list/releases/tag/v1.0.0) (o descargar desde la sección de Releases)
* **iOS (IPA)**: [Descargar IPA](https://github.com/camsscdev/todo-app-list/actions) (generado automáticamente por GitHub Actions)

---

## 🚀 Requisitos e Instrucciones de Ejecución

* **Versión de Node recomendada**: **Node 22** o superior.

### 1. Clonar e Instalar Dependencias
```bash
git clone <url-del-repositorio>
cd todo-app-list
npm install --legacy-peer-deps
```

### 2. Ejecutar Servidor Web de Desarrollo
Puedes iniciar la aplicación en modo desarrollo utilizando cualquiera de estos comandos:
```bash
npm start
```
O también:
```bash
ionic serve
```
O para que se abra automáticamente en tu navegador por defecto:
```bash
ng serve -o
```
Por defecto, la aplicación estará disponible en `http://localhost:4200/`.

### 3. Compilar para Android (.APK)
Requisitos: Android Studio y Android SDK instalados.
```bash
npm run build
npx cap sync android
npx cap open android
```
*Abre el proyecto en Android Studio y ejecuta la app en un dispositivo o emulador, o genera el APK desde el menú de Build.*

### 4. Compilación para iOS (.IPA)
Debido a que las compilaciones de iOS exigen un sistema operativo macOS y Xcode, se ofrecen las siguientes alternativas:
* **Alternativa A (Recomendada - En la nube sin Mac)**: Se configuró un flujo automatizado en **GitHub Actions** ([build-ios.yml](file:///.github/workflows/build-ios.yml)) que compila y genera el archivo `.ipa` en un runner macOS cada vez que se suben cambios al repositorio.
* **Alternativa B (Compilación local en Mac)**:
  ```bash
  npm run build
  npx cap sync ios
  npx cap open ios
  ```
  *Abre Xcode y presiona Run.*

---

## ⚙️ Características y Cambios Realizados
1. **CRUD en Tiempo Real con Firebase**: Integrado con Firestore utilizando `@angular/fire` para lectura y escritura en vivo.
2. **Feature Flag con Remote Config**: Control dinámico mediante el flag `enable_categories` para activar o desactivar la funcionalidad de categorías en toda la interfaz.
3. **Consistencia Visual (UI/UX)**: Diseño homogeneizado entre inputs y selects, resolución de paddings internos duplicados, animaciones fluídas de carga y toasters de confirmación para todas las acciones CRUD.
4. **Despliegue Híbrido**: Estructura de compilación nativa soportada a través de Capacitor.

---

## 📝 Respuestas a las Preguntas de la Evaluación

### A. ¿Cuáles fueron los principales desafíos que se enfrentaron al implementar las nuevas funcionalidades?
* **Compilación de iOS en Windows**: Se resolvió automatizando la creación del `.ipa` mediante GitHub Actions con runners de macOS en la nube.
* **Reactividad en vivo sin recargas**: Configurada conectando `onSnapshot` de Firestore directamente con los Signals nativos de Angular para flujos en vivo ultrarápidos.

### B. ¿Qué técnicas de optimización de rendimiento se aplicaron y por qué?
* **Angular Signals**: Evita la recarga de zonas pesadas y re-renders innecesarios, actualizando solo los nodos precisos del DOM.
* **Standalone Components**: Minimizan el bundle inicial acelerando el tiempo de carga del primer renderizado.
* **Limpieza en Batch**: Desasociación proactiva y segura en lote de las tareas afectadas al eliminar una categoría.

### C. ¿Cómo se aseguró la calidad y mantenibilidad del código?
* **Separación de Capas**: Lógica de base de datos desacoplada en el servicio centralizado `TodoService`.
* **Tipado de Datos Estricto**: Definición exacta de interfaces TypeScript para `Task` y `Category`.
* **Centralización de UX**: Notificaciones flotantes y cargadores unificados a través de un `UiService`.
