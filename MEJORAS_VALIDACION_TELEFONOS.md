# MEJORAS SISTEMA VALIDACIÓN TELÉFONOS POR PAÍS

## Resumen
Se implementó un sistema de validación de números de teléfono específico por país para Argentina, Paraguay y Uruguay, simplificando la entrada de datos y mejorando la experiencia del usuario.

## Funcionalidades Implementadas

### 1. **Validación Específica por País**

#### Frontend (index.html)
- **Función `validatePhoneByCountry(telefono, pais)`**: Valida números según reglas específicas:
  - **Argentina**: Exactamente 10 dígitos (sin prefijo +549)
  - **Paraguay**: Mínimo 9 dígitos (sin prefijo +595)  
  - **Uruguay**: Mínimo 8 dígitos (sin prefijo +598)
  - **Otros países**: Entre 8 y 15 dígitos (validación genérica)

#### Backend (Código.gs)
- **Función `formatPhoneByCountry(phone, country)`**: Formatea números agregando prefijos correctos:
  - Argentina: +549
  - Paraguay: +595
  - Uruguay: +598

### 2. **Detección Automática de País**
- El país se detecta automáticamente cuando el usuario selecciona una localidad
- Se utiliza el archivo CSV de localidades que incluye campo `Pais`
- La detección ocurre en la función de sugerencias de localidades

### 3. **Validación en Tiempo Real**
- **Función `validatePhoneRealTime()`**: Valida mientras el usuario escribe
- **Feedback visual inmediato**:
  - Borde verde y fondo claro para números válidos
  - Borde rojo y fondo claro para números inválidos
  - Tooltips con mensajes explicativos

### 4. **Placeholder Dinámico**
- **Función `updatePhonePlaceholder()`**: Actualiza el placeholder según el país detectado
- **Ejemplos específicos por país**:
  - Argentina: "Ej: 1123456789 (exactamente 10 dígitos, sin +549)"
  - Paraguay: "Ej: 987654321 (mínimo 9 dígitos, sin +595)"
  - Uruguay: "Ej: 98765432 (mínimo 8 dígitos, sin +598)"

### 5. **Integración con WhatsApp**
- Actualizada función `sendWazzupMessage()` para recibir parámetro `leadPais`
- Utiliza `formatPhoneByCountry()` para formatear números correctamente
- Compatible con todos los prefijos internacionales

## Cambios Técnicos

### Frontend (index.html)
```javascript
// Nueva validación en handleSubmit
const phoneValidation = validatePhoneByCountry(formData.telefono, formData.pais);
if (!phoneValidation.valid) {
  showAlert(phoneValidation.message, "warning");
  return;
}

// Event listener para validación en tiempo real
telefonoInput.addEventListener("input", (e) => {
  validatePhoneRealTime();
});

// Actualización automática de placeholder al seleccionar localidad
updatePhonePlaceholder();
```

### Backend (Código.gs)
```javascript
// Nueva función de formateo
function formatPhoneByCountry(phone, country) {
  const cleanPhone = phone.replace(/\D/g, '');
  const normalizedCountry = country ? country.trim().toLowerCase() : 'argentina';
  
  const countryPrefixes = {
    'argentina': '549',
    'paraguay': '595', 
    'uruguay': '598'
  };
  
  const prefix = countryPrefixes[normalizedCountry] || '549';
  return cleanPhone.startsWith(prefix) ? cleanPhone : `${prefix}${cleanPhone}`;
}

// Actualización de sendWazzupMessage
function sendWazzupMessage(...params, leadPais) {
  const formattedPhone = formatPhoneByCountry(phone, leadPais);
  const formattedAssigneePhone = formatPhoneByCountry(assigneePhone, leadPais);
  // ...resto de la función
}
```

### CSS
```css
.phone-valid {
  border-color: #28a745 !important;
  background-color: #f8fff9 !important;
}

.phone-invalid {
  border-color: #dc3545 !important;
  background-color: #fff8f8 !important;
}
```

## Reglas de Validación

| País | Longitud | Prefijo | Ejemplo Entrada | Resultado WhatsApp |
|------|----------|---------|-----------------|-------------------|
| Argentina | Exactamente 10 | +549 | 1123456789 | +5491123456789 |
| Paraguay | Mínimo 9 | +595 | 987654321 | +595987654321 |
| Uruguay | Mínimo 8 | +598 | 98765432 | +59898765432 |
| Otros | 8-15 dígitos | +549 (default) | 1123456789 | +5491123456789 |

## Mensajes de Error Específicos

- **Argentina**: "Teléfono para Argentina debe tener exactamente 10 dígitos (sin +549). Ingresaste X dígitos."
- **Paraguay**: "Teléfono para Paraguay debe tener mínimo 9 dígitos (sin +595). Ingresaste X dígitos."
- **Uruguay**: "Teléfono para Uruguay debe tener mínimo 8 dígitos (sin +598). Ingresaste X dígitos."
- **Prefijo detectado**: "Para [País], ingresa el número sin el prefijo +XXX."

## Función de Test

Se agregó `testPhoneValidationByCountry()` para validar:
- Formateo correcto por país
- Manejo de números con prefijos existentes
- Comportamiento por defecto para países desconocidos

## Beneficios

1. **UX Mejorada**: Feedback inmediato y claro sobre formato correcto
2. **Reducción de Errores**: Validación específica por país elimina ambigüedades
3. **Automatización**: Detección automática de país reduce pasos manuales
4. **Flexibilidad**: Soporte para múltiples países con diferentes reglas
5. **Compatibilidad**: Mantiene compatibilidad con sistemas existentes (WhatsApp, Bitrix24, Odoo)

## Archivos Modificados

- `index.html`: Validación frontend, UI/UX, event listeners
- `Código.gs`: Formateo backend, integración WhatsApp, función de test

## Próximos Pasos

- Considerar agregar más países según necesidades del negocio
- Implementar validación de formato específico (ej: códigos de área)
- Agregar soporte para números internacionales completos
- Considerar integración con APIs de validación de números

## Fecha de Implementación
27 de Mayo, 2025

## Desarrollador
Sistema implementado como parte de las mejoras de validación de formularios RegistroExpoWEB.
