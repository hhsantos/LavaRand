<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LavaRand - Secure Entropy Generator

Un generador de entropía criptográfica inspirado en el sistema de Cloudflare que utiliza lámparas de lava para generar claves seguras. Este proyecto demuestra cómo fuentes de entropía visual impredecibles pueden procesarse mediante SHA-256 para crear claves criptográficas robustas.

## 🎯 ¿Qué es LavaRand?

LavaRand es una aplicación educativa e interactiva que genera claves criptográficas utilizando dos fuentes de entropía:
- **Simulación de Lava**: Animación de "blobs" caóticos que imitan lámparas de lava
- **Cámara Web**: Captura de ruido visual del mundo real

Los píxeles capturados en cada momento se procesan con SHA-256 para producir claves de 256 bits verdaderamente impredecibles.

## ✨ Características

- 🎨 **Dos Modos de Entropía**: Alterna entre simulación de lava y captura de webcam
- 🔐 **Tres Formatos de Salida**:
  - **HEX**: Clave de 256 bits en formato hexadecimal
  - **UUID v4**: Identificador único universal
  - **INT**: Números enteros aleatorios (0-1,000,000)
- 📊 **Log en Tiempo Real**: Registro de las últimas 10 generaciones
- 📚 **Contenido Educativo**: Explicaciones sobre criptografía, entropía y CSPRNGs
- 🎭 **UI Pulida**: Diseño oscuro con gradientes vibrantes y animaciones fluidas
- 📱 **Responsive**: Adaptado para desktop y móvil

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend**: React 19.2.0 + TypeScript 5.8
- **Build Tool**: Vite 6.2.0
- **Estilos**: Tailwind CSS (CDN)
- **Criptografía**: Web Crypto API (SHA-256)
- **Canvas**: HTML5 Canvas API para renderizado y captura

### Estructura de Componentes

```
src/
├── App.tsx                    # Componente principal, orquestador
├── components/
│   ├── LavaCanvas.tsx        # Simulación de lámparas de lava animadas
│   ├── WebcamCanvas.tsx      # Captura de video de cámara web
│   └── InfoSection.tsx       # Acordeón educativo sobre criptografía
├── utils/
│   └── crypto.ts             # Funciones de hashing y generación
└── types.ts                  # Definiciones de tipos TypeScript
```

### Flujo de Generación de Claves

1. **Captura de Entropía**: Se capturan píxeles del canvas/video usando `getImageData()`
2. **Añadir Nonce**: Se concatena timestamp para garantizar unicidad temporal
3. **Hashing**: Se calcula SHA-256 con Web Crypto API
4. **Formateo**: Se transforma el hash según el tipo solicitado (HEX/UUID/INT)
5. **Registro**: Se guarda en el log con preview de la semilla

## 🔐 Detalles Criptográficos

### Generación de Hash (`utils/crypto.ts`)

```typescript
// SHA-256 de píxeles + timestamp como nonce
generateHashFromPixels(pixelData: Uint8ClampedArray): Promise<string>

// Formatea hash como UUID v4 estándar
generateUUID(seedHash: string): string

// Genera enteros del hash (primeros 32 bits)
generateRandomInt(seedHash: string, min: number, max: number): number
```

### Fuentes de Entropía

#### LavaCanvas
- 20 blobs animados con movimiento caótico
- Colores vibrantes con mezcla tipo "screen" (glassmorphism)
- Actualización a 60fps vía `requestAnimationFrame`
- Física simple: velocidades aleatorias, rebotes en bordes

#### WebcamCanvas
- Captura de frames de video en tiempo real
- Manejo robusto de permisos (NotAllowedError, NotFoundError, NotReadableError)
- Video espejado para mejor UX
- Canvas oculto para procesamiento

### Seguridad

- ✅ **SHA-256**: Algoritmo estándar de la industria
- ✅ **Timestamp Nonce**: Evita colisiones temporales
- ✅ **Web Crypto API**: Implementación nativa del navegador
- ✅ **No Almacenamiento**: Las imágenes nunca se guardan
- ⚠️ **Nota Educativa**: Este proyecto es demostrativo. Para aplicaciones en producción, usar CSPRNGs del sistema operativo

## 🚀 Instalación y Uso

### Requisitos Previos

- Node.js 18+ 
- Navegador moderno con soporte para Web Crypto API y Canvas

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/hhsantos/LavaRand.git
cd LavaRand

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo (puerto 3000)
npm run build    # Build de producción
npm run preview  # Preview del build optimizado
```

## 🎨 Diseño UI/UX

### Paleta de Colores

- **Base**: Negro y tonos zinc (zinc-900, zinc-800)
- **Acentos**: 
  - Naranja → Morado (modo Lava)
  - Rojo → Azul (modo Webcam)
- **Estados**: Verde, Azul, Púrpura para tipos de clave

### Efectos Visuales

- **Glassmorphism**: `backdrop-blur` con bordes sutiles
- **Animaciones CSS**:
  - `flash`: Efecto de captura (0.2s)
  - `fadeIn`: Entrada de logs (0.3s)
  - `pulse`: Indicador de grabación
- **Gradientes radiales**: Glow effect en blobs

### Interacciones

- Hover states en todos los botones
- Efecto de escala en botones de generación
- Scrollbar personalizado en logs
- Transiciones suaves en cambio de modo

## 📚 Contenido Educativo

La aplicación incluye un acordeón explicativo sobre:

1. **¿Por qué usar Lámparas de Lava?**: Sistemas físicos caóticos vs computadoras predecibles
2. **¿Qué es la Entropía?**: Medida de imprevisibilidad en criptografía
3. **CSPRNG vs PRNG**: Diferencias entre generadores seguros y normales
4. **La Semilla Criptográfica**: Importancia de semillas impredecibles

Inspirado en el sistema real de Cloudflare que fotografía 100 lámparas de lava para generar claves SSL.

## 🔍 Detalles Técnicos Destacados

### 1. Refs Imperativos
```typescript
useImperativeHandle(ref, () => ({
  getSnapshot: () => ctx.getImageData(0, 0, width, height).data
}));
```
Expone método de captura al componente padre sin violar encapsulación.

### 2. Canvas Optimization
```typescript
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```
Flag para optimizar lecturas repetidas de píxeles.

### 3. ResizeObserver
Ajusta automáticamente el canvas al cambiar el tamaño del contenedor.

### 4. Manejo de Estados de Cámara
Detecta y explica múltiples errores de permisos con mensajes claros.

## 🛠️ Configuración

### Vite (`vite.config.ts`)
- Server: `0.0.0.0:3000` (acceso desde red local)
- Alias: `@/` apunta a la raíz del proyecto
- React plugin con Fast Refresh

### TypeScript (`tsconfig.json`)
- Target: ES2022
- Module: ESNext (bundler resolution)
- JSX: react-jsx (nuevo transform)
- Decorators experimentales habilitados

## 📈 Posibles Mejoras

- [ ] Tests unitarios con Vitest
- [ ] Descarga de claves en archivo
- [ ] Más fuentes de entropía (micrófono, eventos mouse)
- [ ] Persistencia de logs en localStorage
- [ ] Medidor visual de nivel de entropía
- [ ] Soporte Base64, Base32, WIF
- [ ] PWA con Service Worker
- [ ] Dark/Light mode toggle
- [ ] Internacionalización (i18n)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🙏 Inspiración

- [Cloudflare's LavaRand](https://www.cloudflare.com/learning/ssl/lava-lamp-encryption/)
- [LavaRand in London](https://blog.cloudflare.com/randomness-101-lavarand-in-production/)
- Web Crypto API Specification

## 👨‍💻 Autor

Desarrollado con ❤️ por [hhsantos](https://github.com/hhsantos)

---

**Nota**: Este proyecto tiene fines educativos. Para aplicaciones de producción que requieran aleatoriedad criptográfica, utiliza las APIs del sistema operativo (`crypto.randomBytes` en Node.js, `/dev/urandom` en Linux, etc.).
