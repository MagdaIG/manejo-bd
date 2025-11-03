# Manejo de Base de Datos PostgreSQL con Node.js

Este proyecto implementa operaciones CRUD (Create, Read, Update, Delete) en una base de datos PostgreSQL usando Node.js, Express y el paquete `pg`. El proyecto incluye rutas para insertar, actualizar y eliminar registros, con manejo adecuado de errores y uso de parámetros en las consultas.

## Requisitos Previos

- Node.js (versión 14 o superior)
- PostgreSQL instalado y corriendo
- npm o yarn

## Instalación

1. **Clonar o descargar el repositorio**

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar la base de datos:**

   - Crear una base de datos en PostgreSQL:
   ```sql
   CREATE DATABASE manejo_bd;
   ```

   - Configurar las variables de entorno:
   
   Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=manejo_bd
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   PORT=3000
   ```

4. **Crear la tabla y datos iniciales:**

   Opción 1: Ejecutar el script SQL manualmente:
   ```bash
   psql -U postgres -d manejo_bd -f schema.sql
   ```

   Opción 2: Usar el script de configuración:
   ```bash
   npm run setup-db
   ```

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

O en modo desarrollo con recarga automática:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints Disponibles

### GET /items
Obtiene todos los items de la base de datos.

**Respuesta exitosa:**
```json
{
  "count": 5,
  "items": [...]
}
```

### GET /items/:id
Obtiene un item específico por su ID.

**Ejemplo:**
```bash
curl http://localhost:3000/items/1
```

### POST /items
Inserta un nuevo registro en la base de datos.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Teclado Gamer",
    "descripcion": "Teclado mecánico RGB",
    "precio": 79900,
    "disponible": true
  }'
```

**Nota:** Los precios están en pesos chilenos (CLP).

**Respuesta exitosa:**
```json
{
  "mensaje": "Registro insertado correctamente",
  "id": 6,
  "rowCount": 1
}
```

**Campos requeridos:**
- `nombre` (texto)
- `precio` (número)

**Campos opcionales:**
- `descripcion` (texto)
- `disponible` (boolean, por defecto: true)

### PUT /items/:id
Actualiza un registro existente.

**Ejemplo:**
```bash
curl -X PUT http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 799900,
    "disponible": false
  }'
```

**Nota:** Los precios están en pesos chilenos (CLP).

**Respuesta exitosa:**
```json
{
  "mensaje": "Registro actualizado correctamente",
  "rowCount": 1
}
```

**Nota:** Puedes actualizar cualquier campo (nombre, descripcion, precio, disponible) o una combinación de ellos.

### DELETE /items/:id
Elimina un registro de la base de datos.

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/items/1
```

**Respuesta exitosa:**
```json
{
  "mensaje": "Registro eliminado correctamente",
  "rowCount": 1
}
```

## Estructura de la Base de Datos

La tabla `items` tiene la siguiente estructura:

| Campo       | Tipo          | Descripción                    |
|-------------|---------------|--------------------------------|
| id          | SERIAL        | Clave primaria (auto-incremental) |
| nombre      | TEXT          | Nombre del item (requerido)    |
| descripcion | TEXT          | Descripción del item           |
| precio      | NUMERIC(10,2) | Precio del item en CLP (requerido) |
| disponible  | BOOLEAN       | Disponibilidad (por defecto: true) |
| created_at  | TIMESTAMP     | Fecha de creación              |

**Nota:** Los precios se almacenan en pesos chilenos (CLP).

## Manejo de Errores

Todas las rutas implementan manejo de errores con try/catch. En caso de error, se retorna:

```json
{
  "error": "Mensaje descriptivo del error",
  "code": "CÓDIGO_DE_ERROR_POSTGRESQL",
  "message": "Detalle del error"
}
```

Los códigos de estado HTTP utilizados son:
- `200` - Operación exitosa
- `201` - Recurso creado exitosamente
- `400` - Error de validación
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

## Pruebas

El proyecto incluye un script de prueba (`test-api.js`) que puedes ejecutar para verificar que todas las operaciones funcionen correctamente.

Para ejecutar las pruebas, primero inicia el servidor y luego en otra terminal:

```bash
node test-api.js
```

## Estructura del Proyecto

```
manejo-bd/
├── db.js              # Configuración del pool de conexiones PostgreSQL
├── server.js          # Servidor Express principal
├── schema.sql         # Script SQL para crear la tabla
├── setup-db.js        # Script para configurar la base de datos
├── package.json       # Dependencias y scripts
├── .env.example       # Ejemplo de variables de entorno
├── .gitignore         # Archivos ignorados por git
├── routes/
│   └── items.js       # Rutas CRUD para items
└── README.md          # Este archivo
```

## Seguridad

- Todas las consultas usan parámetros (`$1, $2, etc.`) para prevenir inyección SQL
- Validación de tipos de datos en el servidor
- Manejo adecuado de errores sin exponer información sensible

## Autor

**Magdalena Inalaf**

- **GitHub:** [@MagdaIG](https://github.com/MagdaIG)
- **LinkedIn:** [magdalena-inalaf](https://www.linkedin.com/in/minalaf/)
- **Página Web:** [inalaf.ca](https://inalaf.ca/)
- **Email:** magda.inalaf@gmail.com

## Características Implementadas

- Insertar registros con retorno de ID (RETURNING id)
- Actualizar registros existentes
- Eliminar registros por ID
- Uso de parámetros en todas las consultas (`pool.query()` con parámetros)
- Retorno de `rowCount` en todas las operaciones
- Manejo de errores con try/catch
- Respuestas con códigos de error y mensajes descriptivos
- Validación de datos de entrada
- Respuestas HTTP apropiadas (201, 200, 404, 400, 500)
- Precios en pesos chilenos (CLP)

## Licencia

MIT

