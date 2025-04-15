/**
 * Módulo para la integración con Odoo mediante XML-RPC
 * Facilita la comunicación con el sistema Odoo para crear y gestionar leads
 */

const Odoo = {
  /**
   * Realiza autenticación con el servidor Odoo y devuelve el ID de usuario y contexto
   * @returns {Object} Objeto con uid (ID de usuario) y context (contexto de sesión)
   */
  authenticate: function() {
    try {
      const url = `${CONFIG.API.ODOO.URL}/xmlrpc/2/common`;
      const payload = JSON.stringify([
        CONFIG.API.ODOO.DATABASE,
        CONFIG.API.ODOO.USERNAME, 
        CONFIG.API.ODOO.PASSWORD, 
        {}
      ]);
      
      const options = {
        method: 'POST',
        contentType: 'application/json',
        payload: payload,
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
      
      if (!result.result && result.error) {
        throw new Error(`Error de autenticación en Odoo: ${result.error.message}`);
      }
      
      const uid = result.result;
      if (!uid) {
        throw new Error('Autenticación fallida: credenciales incorrectas');
      }
      
      Logger.log(`Autenticación exitosa en Odoo. UID: ${uid}`);
      return {
        uid: uid,
        context: {}
      };
    } catch (error) {
      Utils.logError("Odoo.authenticate", error);
      throw error;
    }
  },

  /**
   * Ejecuta un método en el modelo especificado de Odoo
   * @param {String} model - Nombre del modelo
   * @param {String} method - Nombre del método a ejecutar
   * @param {Array} args - Argumentos para el método
   * @returns {Object} Resultado de la ejecución del método
   */
  execute: function(model, method, args) {
    try {
      // Autenticar primero
      const auth = this.authenticate();
      if (!auth || !auth.uid) {
        throw new Error('No se pudo autenticar con Odoo');
      }
      
      const url = `${CONFIG.API.ODOO.URL}/xmlrpc/2/object`;
      const payload = JSON.stringify([
        CONFIG.API.ODOO.DATABASE,
        auth.uid,
        CONFIG.API.ODOO.PASSWORD,
        model,
        method,
        ...args
      ]);
      
      const options = {
        method: 'POST',
        contentType: 'application/json',
        payload: payload,
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
      
      if (!result.result && result.error) {
        throw new Error(`Error ejecutando método en Odoo: ${result.error.message}`);
      }
      
      Logger.log(`Método ejecutado exitosamente en Odoo: ${model}.${method}`);
      return result.result;
    } catch (error) {
      Utils.logError(`Odoo.execute(${model}.${method})`, error);
      throw error;
    }
  },
  
  /**
   * Crea un nuevo lead en Odoo
   * @param {Object} formData - Datos del formulario a convertir en lead
   * @returns {Object} Resultado de la creación del lead
   */
  createLead: function(formData) {
    try {
      // Formatear el nombre completo
      const contactName = `${formData.nombre} ${formData.apellido}`;
      
      // Preparar datos para el lead
      const leadData = {
        name: `${contactName} - ${formData.evento}`,
        contact_name: contactName,
        email_from: formData.mail,
        phone: formData.telefono,
        description: formData.comentarios,
        type: CONFIG.API.ODOO.TYPE,  // 'lead' por defecto
        priority: CONFIG.API.ODOO.PRIORITY,  // '0' por defecto (normal)
        source_id: formData.evento,  // Origen: nombre del evento
        city: formData.localidad,
        state_id: formData.provincia,
        vertical_interests: formData.concatenatedCheckboxes,
        user_id: this.getUserIdByName(formData.comercialAsignado),  // ID del comercial asignado
        team_id: this.getSalesTeamId(),  // Equipo de ventas predeterminado
        customer_name: formData.empresaOperador,  // Nombre de la empresa del operador
        description: `
          Intereses: ${formData.concatenatedCheckboxes}
          Comentarios: ${formData.comentarios}
          Monto Estimado: ${formData.montoEstimado}
          Registrado por: ${formData.operadorApp} (${formData.empresaOperador})
          Evento: ${formData.evento}
        `.trim()
      };
      
      // Crear el lead en Odoo
      const result = this.execute(CONFIG.API.ODOO.MODEL, 'create', [[leadData]]);
      
      if (result) {
        Logger.log(`Lead creado exitosamente en Odoo. ID: ${result}`);
        return {
          success: true,
          leadId: result,
          message: "Lead creado exitosamente en Odoo"
        };
      } else {
        throw new Error("Error al crear el lead en Odoo: respuesta vacía");
      }
    } catch (error) {
      Utils.logError("Odoo.createLead", error);
      return {
        success: false,
        message: `Error al crear lead en Odoo: ${error.message}`,
        error: error
      };
    }
  },
  
  /**
   * Obtiene el ID del usuario (comercial) por su nombre
   * @param {String} nombreComercial - Nombre del comercial
   * @returns {Number} ID del usuario en Odoo
   */
  getUserIdByName: function(nombreComercial) {
    try {
      // Si no hay nombre de comercial, devolver 1 (administrador por defecto)
      if (!nombreComercial) return 1;
      
      // Buscar usuario por nombre
      const domain = [['name', '=', nombreComercial]];
      const results = this.execute('res.users', 'search_read', [domain, ['id', 'name'], 0, 1]);
      
      if (results && results.length > 0) {
        return results[0].id;
      }
      
      // Si no se encuentra, devolver el usuario administrador (1)
      return 1;
    } catch (error) {
      Utils.logError("Odoo.getUserIdByName", error);
      return 1; // Valor por defecto
    }
  },
  
  /**
   * Obtiene el ID del equipo de ventas predeterminado
   * @returns {Number} ID del equipo de ventas
   */
  getSalesTeamId: function() {
    try {
      const domain = [['name', '=', 'Ventas']];
      const results = this.execute('crm.team', 'search_read', [domain, ['id', 'name'], 0, 1]);
      
      if (results && results.length > 0) {
        return results[0].id;
      }
      
      // Si no se encuentra, devolver 1 (equipo predeterminado)
      return 1;
    } catch (error) {
      Utils.logError("Odoo.getSalesTeamId", error);
      return 1; // Valor por defecto
    }
  }
};