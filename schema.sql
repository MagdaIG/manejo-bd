-- Crear la base de datos (ejecutar manualmente si no existe)
-- CREATE DATABASE manejo_bd;

-- Conectarse a la base de datos y ejecutar:
-- \c manejo_bd

-- Crear la tabla items
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo (precios en CLP)
INSERT INTO items (nombre, descripcion, precio, disponible) VALUES
('Laptop Dell', 'Laptop Dell Inspiron 15 con 8GB RAM y 256GB SSD', 899900, true),
('Mouse Logitech', 'Mouse inalámbrico Logitech MX Master 3', 99900, true),
('Teclado Mecánico', 'Teclado mecánico RGB con switches azules', 149900, false),
('Monitor Samsung', 'Monitor LED 27 pulgadas 4K UHD', 349900, true),
('Auriculares Sony', 'Auriculares inalámbricos con cancelación de ruido', 199900, true)
ON CONFLICT DO NOTHING;

