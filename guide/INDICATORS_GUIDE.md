# 🎯 Guía del Sistema de Indicadores Responsivos

## 📋 Descripción

Este sistema garantiza que los marcadores/indicadores en las imágenes guía **siempre permanezcan alineados** con las características de la imagen, sin importar el tamaño del navegador.

## 🔧 Cómo Funciona

### 1. **Posicionamiento Relativo con Porcentajes**

Los indicadores usan posicionamiento absoluto basado en **porcentajes** en lugar de píxeles fijos:

```html
<!-- ❌ MAL: Píxeles fijos (se desalinea al redimensionar) -->
<div class="indicator" style="top: 450px; left: 200px;">1</div>

<!-- ✅ BIEN: Porcentajes (escala proporcionalmente) -->
<div class="indicator" style="top: 86%; left: 18%;">1</div>
```

### 2. **Sistema JavaScript Mejorado**

El código JavaScript:

- ✅ Almacena las posiciones en **coordenadas normalizadas** (0-1)
- ✅ Recalcula al redimensionar la ventana (con debounce)
- ✅ Se reinicializa al cambiar de paso
- ✅ Espera a que las imágenes carguen completamente

## 📐 Cómo Posicionar Indicadores Correctamente

### Paso 1: Medir la Posición en la Imagen Original

1. Abre la imagen en un editor (Photoshop, GIMP, Figma, etc.)
2. Identifica el punto exacto donde quieres el indicador
3. Anota las coordenadas en píxeles
4. **Calcula el porcentaje:**

```
Porcentaje X = (Posición X / Ancho Total) × 100
Porcentaje Y = (Posición Y / Alto Total) × 100
```

**Ejemplo:**

- Imagen: 1920×1080px
- Botón "Start Tracking" está en: X=350px, Y=930px
- **Cálculo:**
  - X% = (350 / 1920) × 100 = **18.2%**
  - Y% = (930 / 1080) × 100 = **86.1%**

### Paso 2: Aplicar en el HTML

```html
<div class="indicator indicator-number" style="top: 86%; left: 18%;">1</div>
```

## 🎨 Tipos de Indicadores Disponibles

### 1. **Número de Secuencia**

```html
<div class="indicator indicator-number" style="top: 86%; left: 18%;">1</div>
```

### 2. **Tooltip/Ayuda**

```html
<div class="indicator indicator-tooltip" style="top: 82%; left: 10%;">
  Haz clic en "Start Tracking" para ir a episodios
</div>
```

### 3. **Etiqueta con Fondo**

```html
<div
  class="indicator indicator-label"
  style="top: 88%; left: 60%; transform: translateX(-50%);"
>
  📊 Estadísticas en Tiempo Real
</div>
```

### 4. **Círculo Pulsante**

```html
<div class="indicator indicator-circle" style="top: 50%; left: 30%;"></div>
```

### 5. **Flecha Direccional**

```html
<div class="indicator indicator-arrow" style="top: 40%; left: 70%;">↓</div>
```

### 6. **Caja de Área**

```html
<div
  class="indicator indicator-box"
  style="top: 20%; left: 15%; width: 200px; height: 100px;"
></div>
```

## 🧮 Herramientas para Calcular Posiciones

### Opción 1: Usar Navegador DevTools

```javascript
// Pega esto en la consola del navegador
const img = document.querySelector(".screenshot");
const rect = img.getBoundingClientRect();

img.addEventListener("click", (e) => {
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  console.log(`top: ${y.toFixed(1)}%; left: ${x.toFixed(1)}%`);
});
```

### Opción 2: Usar Figma/Photoshop

1. Abre la imagen
2. Activa reglas (Ctrl+R)
3. Usa el Inspector para ver coordenadas
4. Calcula manualmente los porcentajes

### Opción 3: Herramienta Online

Crea un HTML temporal:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 20px;
        background: #333;
      }
      .container {
        position: relative;
        display: inline-block;
      }
      img {
        display: block;
        max-width: 100%;
        border: 2px solid #fff;
      }
      .coords {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #000;
        color: #0f0;
        padding: 10px;
        font-family: monospace;
      }
    </style>
  </head>
  <body>
    <div class="coords" id="coords">Mueve el mouse sobre la imagen</div>
    <div class="container">
      <img src="screenshots/01-home-page.png" id="img" />
    </div>
    <script>
      const img = document.getElementById("img");
      const coords = document.getElementById("coords");

      img.addEventListener("mousemove", (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        coords.innerHTML = `
        Posición:<br>
        top: ${y.toFixed(1)}%<br>
        left: ${x.toFixed(1)}%<br>
        <br>
        HTML:<br>
        style="top: ${y.toFixed(1)}%; left: ${x.toFixed(1)}%"
      `;
      });

      img.addEventListener("click", (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const text = `style="top: ${y.toFixed(1)}%; left: ${x.toFixed(1)}%"`;
        navigator.clipboard.writeText(text);
        alert("¡Copiado al portapapeles!\n" + text);
      });
    </script>
  </body>
</html>
```

## ⚙️ Configuración Avanzada

### Centrar Indicador con Transform

Para centrar un indicador sobre un punto exacto:

```html
<div
  class="indicator indicator-label"
  style="top: 88%; left: 60%; transform: translateX(-50%);"
>
  Centrado horizontalmente
</div>
```

### Posicionar desde la Derecha/Abajo

```html
<!-- Desde la derecha -->
<div class="indicator" style="top: 88%; right: 5%;">Desde derecha</div>

<!-- Desde abajo -->
<div class="indicator" style="bottom: 10%; left: 50%;">Desde abajo</div>
```

## 🐛 Solución de Problemas

### Problema: Los indicadores no aparecen

**Causa:** La imagen no ha cargado completamente.

**Solución:** El sistema ya maneja esto automáticamente, pero asegúrate de que las rutas de las imágenes sean correctas.

### Problema: Los indicadores se desplazan un poco al redimensionar

**Causa:** Los navegadores redondean subpíxeles de forma diferente.

**Solución:** Usa valores de porcentaje con 1 decimal para mejor precisión:

```html
<!-- Mejor precisión -->
style="top: 86.5%; left: 18.3%"
```

### Problema: Los tooltips se salen de la pantalla

**Solución:** Ajusta la posición manualmente o añade lógica para detectar bordes:

```html
<!-- Si está muy a la izquierda, muévelo a la derecha -->
<div
  class="indicator indicator-tooltip"
  style="top: 82%; left: 5%; transform: translateX(0);"
>
  Texto aquí
</div>
```

## 📱 Responsividad

El sistema es **completamente responsivo** por defecto:

- ✅ Funciona en desktop (1920px+)
- ✅ Funciona en tablets (768px-1920px)
- ✅ Funciona en móviles (320px-768px)
- ✅ Se adapta a zoom del navegador
- ✅ Se adapta a pantallas de alta densidad (Retina)

## 🎯 Mejores Prácticas

1. **Usa porcentajes con 1 decimal** para precisión óptima
2. **Evita posicionar indicadores en los bordes extremos** (< 5% o > 95%)
3. **Agrupa indicadores relacionados** visualmente
4. **Mantén consistencia** en el tipo de indicador para el mismo propósito
5. **Prueba en múltiples tamaños** de navegador antes de publicar

## 📊 Ejemplo Completo

```html
<div class="screenshot-wrapper">
  <div class="screenshot-container">
    <img
      src="screenshots/01-home-page.png"
      alt="Página de Inicio"
      class="screenshot"
    />

    <!-- Indicador 1: Botón principal -->
    <div class="indicator indicator-number" style="top: 86%; left: 18%;">1</div>
    <div class="indicator indicator-tooltip" style="top: 82%; left: 10%;">
      Haz clic en "Start Tracking" para ir a episodios
    </div>

    <!-- Indicador 2: Botón secundario -->
    <div class="indicator indicator-number" style="top: 86%; left: 48%;">2</div>
    <div class="indicator indicator-tooltip" style="top: 82%; left: 40%;">
      "Meet the Cast" te lleva a todos los personajes
    </div>

    <!-- Indicador 3: Estadísticas -->
    <div
      class="indicator indicator-number"
      style="top: 92%; left: 60%; transform: translateX(-50%);"
    >
      3
    </div>
    <div
      class="indicator indicator-label"
      style="top: 88%; left: 60%; transform: translateX(-50%);"
    >
      📊 Estadísticas en Tiempo Real
    </div>

    <!-- Indicador 4: Área de personajes -->
    <div class="indicator indicator-number" style="top: 92%; right: 10%;">
      4
    </div>
    <div class="indicator indicator-label" style="top: 88%; right: 5%;">
      👥 Familia Simpson - Haz clic en cualquier personaje
    </div>
  </div>
</div>
```

## 🔮 Futuras Mejoras

Posibles mejoras al sistema:

1. **Modo de edición visual:** Arrastrar y soltar indicadores directamente
2. **Exportación/importación:** Guardar configuraciones de indicadores en JSON
3. **Detección automática:** IA para detectar elementos interactivos en screenshots
4. **Animaciones personalizables:** Más opciones de animación para indicadores

---

**Creado para Springfield Life** • [Ver guía completa](./index.html)
