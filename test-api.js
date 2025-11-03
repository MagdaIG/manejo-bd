import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let testsPassed = 0;
let testsFailed = 0;

async function test(endpoint, method = 'GET', body = null, expectedStatus = 200) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (response.status === expectedStatus) {
      console.log(`${colors.green}✅ PASS${colors.reset} ${method} ${endpoint}`);
      console.log(`   Status: ${response.status}`);
      if (data.id) console.log(`   ID retornado: ${data.id}`);
      if (data.rowCount !== undefined) console.log(`   Registros afectados: ${data.rowCount}`);
      testsPassed++;
      return data;
    } else {
      console.log(`${colors.red}❌ FAIL${colors.reset} ${method} ${endpoint}`);
      console.log(`   Esperado: ${expectedStatus}, Obtenido: ${response.status}`);
      console.log(`   Respuesta:`, JSON.stringify(data, null, 2));
      testsFailed++;
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR${colors.reset} ${method} ${endpoint}`);
    console.log(`   ${error.message}`);
    testsFailed++;
    return null;
  }
}

async function runTests() {
  console.log(`${colors.blue}🧪 Iniciando pruebas de la API...${colors.reset}\n`);

  // Esperar un momento para asegurar que el servidor está listo
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: GET /items - Obtener todos los items
  console.log(`${colors.yellow}📋 Test 1: Obtener todos los items${colors.reset}`);
  await test('/items', 'GET');

  // Test 2: POST /items - Insertar un nuevo registro
  console.log(`\n${colors.yellow}📝 Test 2: Insertar un nuevo registro${colors.reset}`);
  const nuevoItem = {
    nombre: 'Producto de Prueba',
    descripcion: 'Este es un producto de prueba',
    precio: 49900,
    disponible: true
  };
  const insertedData = await test('/items', 'POST', nuevoItem, 201);
  const nuevoId = insertedData?.id;

  if (!nuevoId) {
    console.log(`${colors.red}⚠️  No se pudo obtener el ID del registro insertado. Saltando pruebas siguientes.${colors.reset}`);
    printSummary();
    return;
  }

  // Test 3: GET /items/:id - Obtener el registro recién insertado
  console.log(`\n${colors.yellow}🔍 Test 3: Obtener registro por ID${colors.reset}`);
  await test(`/items/${nuevoId}`, 'GET');

  // Test 4: PUT /items/:id - Actualizar el registro
  console.log(`\n${colors.yellow}✏️  Test 4: Actualizar registro${colors.reset}`);
  const datosActualizados = {
    precio: 59900,
    disponible: false,
    descripcion: 'Descripción actualizada'
  };
  await test(`/items/${nuevoId}`, 'PUT', datosActualizados, 200);

  // Test 5: Verificar que la actualización funcionó
  console.log(`\n${colors.yellow}✅ Test 5: Verificar actualización${colors.reset}`);
  const verifyResponse = await fetch(`${BASE_URL}/items/${nuevoId}`);
  const verifyData = await verifyResponse.json();
  if (verifyData.item && parseFloat(verifyData.item.precio) === 59900 && verifyData.item.disponible === false) {
    console.log(`${colors.green}✅ PASS${colors.reset} La actualización fue exitosa`);
    testsPassed++;
  } else {
    console.log(`${colors.red}❌ FAIL${colors.reset} La actualización no se reflejó correctamente`);
    testsFailed++;
  }

  // Test 6: DELETE /items/:id - Eliminar el registro
  console.log(`\n${colors.yellow}🗑️  Test 6: Eliminar registro${colors.reset}`);
  await test(`/items/${nuevoId}`, 'DELETE', null, 200);

  // Test 7: Verificar que el registro fue eliminado
  console.log(`\n${colors.yellow}🔍 Test 7: Verificar eliminación${colors.reset}`);
  const deleteVerify = await fetch(`${BASE_URL}/items/${nuevoId}`);
  if (deleteVerify.status === 404) {
    console.log(`${colors.green}✅ PASS${colors.reset} El registro fue eliminado correctamente`);
    testsPassed++;
  } else {
    console.log(`${colors.red}❌ FAIL${colors.reset} El registro aún existe`);
    testsFailed++;
  }

  // Test 8: Intentar actualizar un registro inexistente
  console.log(`\n${colors.yellow}⚠️  Test 8: Actualizar registro inexistente${colors.reset}`);
  await test('/items/99999', 'PUT', { nombre: 'Test' }, 404);

  // Test 9: Intentar eliminar un registro inexistente
  console.log(`\n${colors.yellow}⚠️  Test 9: Eliminar registro inexistente${colors.reset}`);
  await test('/items/99999', 'DELETE', null, 404);

  // Test 10: Validación - Insertar sin campos requeridos
  console.log(`\n${colors.yellow}⚠️  Test 10: Validación - Faltan campos requeridos${colors.reset}`);
  await test('/items', 'POST', { descripcion: 'Sin nombre' }, 400);

  // Test 11: Validación - Precio inválido
  console.log(`\n${colors.yellow}⚠️  Test 11: Validación - Precio inválido${colors.reset}`);
  await test('/items', 'POST', { nombre: 'Test', precio: -10 }, 400);

  printSummary();
}

function printSummary() {
  console.log(`\n${colors.blue}📊 Resumen de Pruebas:${colors.reset}`);
  console.log(`${colors.green}✅ Pruebas exitosas: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Pruebas fallidas: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 ¡Todas las pruebas pasaron!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  Algunas pruebas fallaron${colors.reset}`);
  }
}

// Verificar que fetch esté disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Esta versión de Node.js no incluye fetch nativo.');
  console.error('   Por favor, actualiza a Node.js 18 o superior.');
  console.error('   O instala node-fetch: npm install node-fetch');
  process.exit(1);
}

runTests().catch(error => {
  console.error(`${colors.red}❌ Error al ejecutar las pruebas:${colors.reset}`, error);
  process.exit(1);
});

