# 🍩 Springfield Life - Guía Interactiva

Guía interactiva completa integrada en la aplicación Next.js para ayudar a los usuarios a descubrir todas las características de Springfield Life.

## 📂 Estructura

```
app/guide/
├── page.tsx              # Guía principal con 9 pasos interactivos
├── helper/
│   └── page.tsx         # Herramienta de posicionamiento de indicadores
app/_components/
└── HelpButton.tsx        # Botón flotante de ayuda (disponible en toda la app)
```

## 🎯 Características

### Guía Principal (`/guide`)

- ✨ 9 pasos interactivos que cubren todas las funcionalidades
- 📸 Screenshots reales de la aplicación con indicadores visuales
- 🎨 Diseño moderno con animaciones y transiciones suaves
- 📊 Barra de progreso visual
- ⌨️ Navegación por teclado y puntitos indicadores
- 📱 Totalmente responsive

### Helper Tool (`/guide/helper`)

- 🎯 Herramienta interactiva para posicionar indicadores en screenshots
- 📤 Carga de imágenes con preview
- 🖱️ Clic para añadir marcadores
- ↔️ Drag & drop para ajustar posiciones
- 📋 Generación automática de código HTML
- 📋 Copy to clipboard automático

### Botón de Ayuda Flotante

- 🔘 Disponible en todas las páginas (esquina inferior derecha)
- 💛 Diseño llamativo con gradiente amarillo Simpson
- ✨ Animación de pulso para llamar la atención
- 💬 Tooltip informativo al hacer hover
- 🔗 Enlace directo a la guía

## 🚀 Uso

### Para Usuarios

1. **Acceder a la guía:**

   - Haz clic en el botón flotante `?` en cualquier página
   - O navega directamente a `/guide`

2. **Navegar por la guía:**

   - Usa los botones "Anterior" y "Siguiente"
   - Haz clic en los puntitos para saltar a un paso específico
   - Presiona ESC para volver a la app

3. **Usar el Helper:**
   - Ve a `/guide/helper` desde el último paso de la guía
   - Carga un screenshot
   - Haz clic para añadir marcadores
   - Arrastra para ajustar posiciones
   - Copia el código HTML generado

### Para Desarrolladores

#### Añadir nuevos pasos a la guía:

```typescript
{
  number: 10,
  title: "Nueva Característica",
  description: "Descripción breve",
  screenshot: "/guide/screenshots/nueva-feature.png",
  indicators: [
    { type: "circle", top: 30, left: 50 },
    { type: "label", top: 60, left: 50, text: "Importante" }
  ],
  content: (
    <div>
      {/* Contenido del paso */}
    </div>
  ),
}
```

#### Tipos de indicadores disponibles:

- **`circle`**: Círculo amarillo brillante
- **`arrow`**: Flecha apuntando hacia abajo
- **`box`**: Caja con borde discontinuo y texto
- **`label`**: Etiqueta con fondo degradado y texto
- **`number`**: Círculo numerado

## 🎨 Diseño

- **Colores:** Tema oscuro con acentos amarillos (#FFD90F)
- **Fuente:** Geist Sans (sistema Next.js)
- **Animaciones:** Fade-in, slide, pulse, bounce
- **Responsive:** Breakpoints en 768px y 1024px

## 📦 Dependencias

- Next.js 16
- React 19
- Tailwind CSS 4
- Shadcn UI (Button component)
- Lucide React (iconos)

## 🔄 Migración desde HTML

Los archivos HTML estáticos originales han sido completamente reemplazados por componentes Next.js:

- ✅ `guide/index.html` → `app/guide/page.tsx`
- ✅ `guide/indicator-helper.html` → `app/guide/helper/page.tsx`

### Ventajas de la migración:

1. **Integración perfecta** con la aplicación Next.js
2. **Routing automático** con App Router
3. **Optimización de imágenes** con next/image
4. **TypeScript** para type safety
5. **Server Components** donde sea posible
6. **Mejor SEO** y performance
7. **Código más mantenible** y modular

## 📸 Screenshots

Los screenshots deben estar en `public/guide/screenshots/`:

- `01-home-page.png` - Página principal
- `02-characters-page.png` - Galería de personajes
- `03-character-detail.png` - Detalle de personaje
- `04-episodes-page.png` - Catálogo de episodios
- `05-episode-detail.png` - Detalle de episodio
- `06-collections-page.png` - Colecciones
- `07-diary-page.png` - Diario personal

## 🛠️ Mantenimiento

### Actualizar screenshots:

1. Toma nuevos screenshots de las páginas
2. Guárdalos en `public/guide/screenshots/`
3. Actualiza las referencias en `app/guide/page.tsx`
4. Ajusta los indicadores usando `/guide/helper` si es necesario

### Modificar estilos:

Los estilos están en Tailwind CSS inline. Para cambios globales:

- Edita `app/globals.css` para estilos base
- Usa las utilidades de Tailwind en los componentes
- Aprovecha las animaciones de `tailwind.config.ts`

## 🤝 Contribuir

Para añadir nuevo contenido a la guía:

1. Añade el screenshot en `public/guide/screenshots/`
2. Crea el nuevo paso en `app/guide/page.tsx`
3. Define los indicadores usando la helper tool
4. Escribe el contenido descriptivo
5. Actualiza este README
