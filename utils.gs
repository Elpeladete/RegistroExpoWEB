// Utilidades para manejo de datos y validaciones
const Utils = {
  formatPhoneNumber: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.startsWith('549') ? cleanPhone : `549${cleanPhone}`;
  },

  validatePhoneNumber: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },

  validateEmail: (email) => {
    if (!email) return true; // El email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateFormData: (formData) => {
    const errors = [];
    
    // Validaciones requeridas
    if (!formData.nombre?.trim()) errors.push("El nombre es requerido");
    if (!formData.apellido?.trim()) errors.push("El apellido es requerido");
    if (!formData.localidad?.trim()) errors.push("La localidad es requerida");
    if (!formData.provincia?.trim()) errors.push("La provincia es requerida");
    if (!formData.telefono?.trim()) errors.push("El teléfono es requerido");
    if (!Utils.validatePhoneNumber(formData.telefono)) errors.push("El formato del teléfono no es válido");
    if (!Utils.validateEmail(formData.mail)) errors.push("El formato del email no es válido");
    if (!formData.operadorApp?.trim()) errors.push("El operador es requerido");
    if (!formData.empresaOperador?.trim()) errors.push("La empresa del operador es requerida");
    if (!formData.comercialAsignado?.trim()) errors.push("Debe seleccionar un comercial");
    if (!formData.concatenatedCheckboxes?.trim()) errors.push("Debe seleccionar al menos una vertical");

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  parseCSV: (csvText) => {
    const lines = csvText.split("\\n");
    const headers = lines[0].split(",").map((header) => header.trim());
    return lines.slice(1).reduce((result, line) => {
      const values = line.split(",");
      if (values.length === headers.length) {
        const row = headers.reduce((obj, header, index) => {
          obj[header] = values[index].trim();
          return obj;
        }, {});
        result.push(row);
      }
      return result;
    }, []);
  },

  handleApiResponse: (response, serviceName) => {
    try {
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();
      Logger.log(`${serviceName} - Código de respuesta HTTP: ${responseCode}`);
      Logger.log(`${serviceName} - Cuerpo de la respuesta: ${responseBody}`);

      if (responseCode >= 200 && responseCode < 300) {
        return { 
          success: true, 
          data: responseBody ? JSON.parse(responseBody) : null 
        };
      } else {
        return { 
          success: false, 
          error: `Error en ${serviceName}: ${responseBody}`,
          code: responseCode
        };
      }
    } catch (error) {
      Logger.log(`Error procesando respuesta de ${serviceName}: ${error.message}`);
      return { 
        success: false, 
        error: `Error interno procesando respuesta de ${serviceName}`,
        originalError: error.message
      };
    }
  },

  logError: (context, error) => {
    const timestamp = new Date().toISOString();
    const errorMessage = error.message || error;
    Logger.log(`[ERROR][${timestamp}][${context}] ${errorMessage}`);
    return {
      timestamp,
      context,
      error: errorMessage
    };
  }
};