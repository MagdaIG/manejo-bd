import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// POST /items - Insertar nuevo registro
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponible } = req.body;

    // Validación de campos requeridos
    if (!nombre || precio === undefined) {
      return res.status(400).json({ 
        error: 'Los campos nombre y precio son requeridos' 
      });
    }

    // Validación de tipo de precio
    if (typeof precio !== 'number' || precio < 0) {
      return res.status(400).json({ 
        error: 'El precio debe ser un número positivo' 
      });
    }

    // Inserción usando parámetros
    const query = `
      INSERT INTO items (nombre, descripcion, precio, disponible)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const values = [
      nombre,
      descripcion || null,
      precio,
      disponible !== undefined ? disponible : true
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Registro insertado correctamente',
      id: result.rows[0].id,
      rowCount: result.rowCount
    });

  } catch (err) {
    console.error('Error al insertar registro:', err);
    res.status(500).json({
      error: 'Error al insertar el registro',
      code: err.code,
      message: err.message
    });
  }
});

// PUT /items/:id - Actualizar un registro existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, disponible } = req.body;

    // Validar que el ID sea un número
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return res.status(400).json({ 
        error: 'El ID debe ser un número válido' 
      });
    }

    // Validar que al menos un campo se proporcione para actualizar
    if (!nombre && descripcion === undefined && precio === undefined && disponible === undefined) {
      return res.status(400).json({ 
        error: 'Debe proporcionar al menos un campo para actualizar' 
      });
    }

    // Construir la consulta dinámicamente según los campos proporcionados
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramCount++}`);
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramCount++}`);
      values.push(descripcion);
    }
    if (precio !== undefined) {
      if (typeof precio !== 'number' || precio < 0) {
        return res.status(400).json({ 
          error: 'El precio debe ser un número positivo' 
        });
      }
      updates.push(`precio = $${paramCount++}`);
      values.push(precio);
    }
    if (disponible !== undefined) {
      updates.push(`disponible = $${paramCount++}`);
      values.push(disponible);
    }

    // Agregar el ID al final de los valores
    values.push(itemId);

    const query = `
      UPDATE items 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Registro no encontrado' 
      });
    }

    res.json({
      mensaje: 'Registro actualizado correctamente',
      rowCount: result.rowCount
    });

  } catch (err) {
    console.error('Error al actualizar registro:', err);
    res.status(500).json({
      error: 'Error al actualizar el registro',
      code: err.code,
      message: err.message
    });
  }
});

// DELETE /items/:id - Eliminar un registro
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return res.status(400).json({ 
        error: 'El ID debe ser un número válido' 
      });
    }

    const query = 'DELETE FROM items WHERE id = $1';
    const result = await pool.query(query, [itemId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Registro no encontrado' 
      });
    }

    res.json({
      mensaje: 'Registro eliminado correctamente',
      rowCount: result.rowCount
    });

  } catch (err) {
    console.error('Error al eliminar registro:', err);
    res.status(500).json({
      error: 'Error al eliminar el registro',
      code: err.code,
      message: err.message
    });
  }
});

// Ruta adicional: GET /items - Obtener todos los registros (útil para pruebas)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id');
    res.json({
      count: result.rowCount,
      items: result.rows
    });
  } catch (err) {
    console.error('Error al obtener registros:', err);
    res.status(500).json({
      error: 'Error al obtener los registros',
      code: err.code,
      message: err.message
    });
  }
});

// Ruta adicional: GET /items/:id - Obtener un registro por ID (útil para pruebas)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return res.status(400).json({ 
        error: 'El ID debe ser un número válido' 
      });
    }

    const result = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Registro no encontrado' 
      });
    }

    res.json({
      item: result.rows[0]
    });

  } catch (err) {
    console.error('Error al obtener registro:', err);
    res.status(500).json({
      error: 'Error al obtener el registro',
      code: err.code,
      message: err.message
    });
  }
});

export default router;

