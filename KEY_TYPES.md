# 🔑 Tipos de Claves en LavaRand

Explicación detallada de los 3 tipos de claves criptográficas que genera LavaRand.

---

## **1. 256-bit Key (Hex Format)**

**¿Qué es?**
Es una clave criptográfica de **256 bits** (32 bytes) representada en **hexadecimal**. Como cada byte necesita 2 caracteres hex para representarse, la clave tiene **64 caracteres**.

**Ejemplo:**
```
a3f5b9c2e8d14f67a2c9e4b7d6f8a1c5e3d7f9b2a4c6e8d1f3a5b7c9e2d4f6a8
```

**¿Cómo se genera?**

1. **Captura de píxeles**: Se toman todos los píxeles del canvas (de la lava o webcam)
2. **Añade timestamp**: Se agrega el momento exacto (timestamp) para que aunque la imagen sea similar, el resultado sea diferente
3. **SHA-256**: Se aplica este algoritmo de hash criptográfico
4. **Conversión a hex**: El resultado binario se convierte a hexadecimal

**¿Para qué sirve?**
- Cifrado AES-256 (el estándar más seguro usado por gobiernos)
- Claves de autenticación (HMAC)
- Tokens de seguridad
- Seeds para generar más números aleatorios

**¿Por qué 256 bits?**
Porque 2^256 = 1.15 × 10^77 combinaciones posibles. Para poner en perspectiva: hay más claves posibles que átomos en el universo observable.

---

## **2. UUID v4 (Universally Unique Identifier)**

**¿Qué es?**
Es un identificador único de **128 bits** con un formato estándar específico. Tiene guiones y sigue la especificación RFC 4122.

**Formato:**
```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
         ↑    ↑    ↑
         |    |    └─ Variante (8,9,a,b)
         |    └────── Versión 4
         └─────────── Aleatorio
```

**Ejemplo:**
```
a3f5b9c2-e8d1-4f67-a2c9-e4b7d6f8a1c5
```

**¿Cómo se genera?**
1. Toma el hash de 256 bits que ya generamos
2. Lo divide en segmentos según el formato UUID
3. Inserta el `4` (que dice "soy versión 4, generado aleatoriamente")
4. Ajusta un dígito especial para cumplir el estándar RFC 4122

**¿Para qué sirve?**
- **IDs de base de datos**: Puedes crear IDs únicos sin consultar la BD
- **Sistemas distribuidos**: Múltiples servidores pueden generar IDs sin coordinarse
- **Tracking**: Identificar eventos, sesiones, usuarios
- **Nombres de archivos**: Garantiza que nunca se repita un nombre

**¿Por qué es único?**
La probabilidad de generar 2 UUIDs iguales es de **1 en 5.3 × 10^36**. Si generaras 1 billón de UUIDs por segundo, tardarías 100 billones de años en tener un 50% de probabilidad de colisión.

---

## **3. Integer (0 - 1,000,000)**

**¿Qué es?**
Un número entero aleatorio en un rango específico. En este caso, entre 0 y 1 millón.

**Ejemplo:**
```
742358
```

**¿Cómo se genera?**
1. Toma los primeros 8 caracteres del hash (32 bits)
   - Ejemplo: `a3f5b9c2` = 2,751,463,874 en decimal
2. Lo divide entre el máximo posible (4,294,967,295)
   - Resultado: 0.6405... (un número entre 0 y 1)
3. Lo multiplica por el rango (1,000,001) y redondea hacia abajo
   - Resultado: 640,500

**¿Para qué sirve?**
- **Sorteos y rifas**: Elegir un ganador aleatorio
- **Selección de elementos**: Elegir un item de una lista
- **Simulaciones**: Generar datos de prueba
- **IDs numéricos**: Cuando necesitas un número en vez de texto
- **Gaming**: Dados, mazos de cartas, spawn de enemigos

**¿Es realmente aleatorio?**
Sí, la distribución es **uniforme**: cada número del 0 al 1,000,000 tiene exactamente la misma probabilidad de salir. No hay sesgo hacia números más altos o bajos.

---

## 🔐 **La Magia de la Entropía**

**¿De dónde viene la "aleatoriedad"?**

### **Modo Lava:**
- 8 círculos moviéndose caóticamente
- Colores RGB cambiando
- Colisiones entre blobs
- Física impredecible
- 60 actualizaciones por segundo

### **Modo Webcam:**
- Ruido electrónico del sensor de la cámara
- Iluminación ambiental cambiante
- Micro-movimientos imperceptibles
- Artefactos de compresión de video

Cada vez que capturas, obtienes **millones de píxeles** con valores RGB únicos + el timestamp exacto. Esto entra en SHA-256, que actúa como una "licuadora criptográfica" produciendo un resultado completamente diferente aunque cambies un solo píxel.

---

## ⚠️ **¿Por qué SHA-256 es especial?**

- **Efecto avalancha**: Cambiar 1 bit de entrada cambia ~50% de la salida
- **Unidireccional**: Es imposible calcular los píxeles originales desde el hash
- **Resistente a colisiones**: Casi imposible encontrar 2 entradas con el mismo hash
- **Estándar industrial**: Usado por Bitcoin, SSL/TLS, firmas digitales

---

## 📊 **Resumen Comparativo**

| Aspecto | Hex Key | UUID v4 | Integer |
|---------|---------|---------|---------|
| **Tamaño** | 256 bits (64 chars) | 128 bits (36 chars) | 32 bits (max 7 dígitos) |
| **Formato** | Hexadecimal puro | RFC 4122 con guiones | Decimal |
| **Uso principal** | Criptografía | Identificadores únicos | Números aleatorios |
| **Colisiones** | ~10^77 | ~10^36 | ~10^6 |
| **Legibilidad** | Baja | Media | Alta |
| **Compatibilidad** | Universal | Estándar en BDs | Universal |

---

## 🎯 **Resumen en una frase:**

- **Hex Key**: La clave "bruta" máxima seguridad
- **UUID**: La clave "bonita" para identificadores únicos
- **Integer**: La clave "práctica" para números en rangos

---

**Última actualización:** Noviembre 2025  
**Proyecto:** [LavaRand - Secure Entropy Generator](https://github.com/hhsantos/LavaRand)
