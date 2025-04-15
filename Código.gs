// Código.gs

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  const output = template.evaluate()
    .setTitle('RegistroExpoWEB')
    .setFaviconUrl(CONFIG.APP.IMAGES.FAVICON)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return output;
}

function getLocalidadesData() {
  try {
    const response = UrlFetchApp.fetch(CONFIG.API.LOCALIDADES.CSV_URL);
    const csvText = response.getContentText();
    return Utils.parseCSV(csvText);
  } catch (error) {
    Utils.logError("getLocalidadesData", error);
    return [];
  }
}

function sendDataToForm(formData) {
  try {
    // Validar datos antes de enviar
    const validation = Utils.validateFormData(formData);
    if (!validation.isValid) {
      return { 
        success: false, 
        message: "Validación fallida", 
        errors: validation.errors 
      };
    }

    const payload = {
      "entry.1656615011": formData.apellido,
      "entry.1575414634": formData.nombre,
      "entry.719416093": formData.localidad,
      "entry.706927167": formData.provincia,
      "entry.545349691": formData.telefono,
      "entry.518556737": formData.mail,
      "entry.620044556": formData.concatenatedCheckboxes,
      "entry.1203722377": formData.comentarios,
      "entry.1848186805": formData.montoEstimado,
      "entry.759729973": formData.presupuesto,
      "entry.276961824": formData.operadorApp,
      "entry.1185082508": formData.comercialAsignado,
      "entry.716935390": formData.evento,
      "entry.1677960690": formData.weedSeeker ? "TRUE" : "",
      "entry.1491059195": formData.solucionSiembra ? "TRUE" : "",
      "entry.2007292571": formData.solucionPulverizacion ? "TRUE" : "",
      "entry.326858464": formData.postVenta ? "TRUE" : "",
      "entry.725115806": formData.dronesDJI ? "TRUE" : "",
      "entry.964478392": formData.guiaAutoguia ? "TRUE" : "",
      "entry.1908485191": formData.tapsSenales ? "TRUE" : "",
      "entry.1736207191": formData.accionQR ? "TRUE" : "",
      "entry.1582004362": formData.empresaOperador
    };

    const options = {
      method: "POST",
      payload: payload
    };

    const response = UrlFetchApp.fetch(CONFIG.API.GOOGLE_FORMS.URL, options);
    return Utils.handleApiResponse(response, "Google Forms");
  } catch (error) {
    return Utils.logError("sendDataToForm", error);
  }
}

function sendDataToBitrix(formData, verticales) {
  try {
    const payload = `fields[NAME]=${encodeURIComponent(formData.nombre)}&` +
                    `fields[LAST_NAME]=${encodeURIComponent(formData.apellido)}&` +
                    `fields[ASSIGNED_BY_ID]=${encodeURIComponent(CONFIG.COMERCIALES[formData.comercialAsignado] || "1")}&` +
                    `fields[EMAIL][0][VALUE]=${encodeURIComponent(formData.mail)}&` +
                    `fields[EMAIL][0][VALUE_TYPE]=WORK&` +
                    `fields[PHONE][0][VALUE]=${encodeURIComponent(formData.telefono)}&` +
                    `fields[PHONE][0][VALUE_TYPE]=WORK&` +
                    `fields[ADDRESS_CITY]=${encodeURIComponent(formData.localidad)}&` +
                    `fields[ADDRESS_PROVINCE]=${encodeURIComponent(formData.provincia)}&` +
                    `fields[COMMENTS]=${encodeURIComponent(formData.comentarios)}&` +
                    `fields[TITLE]=${encodeURIComponent(`${formData.nombre} ${formData.apellido} - ${verticales}`)}&` +
                    `fields[UF_CRM_1652704252762]=${encodeURIComponent(`${formData.operadorApp} - ${formData.empresaOperador}`)}&` +
                    `fields[SOURCE_DESCRIPTION]=${encodeURIComponent(formData.evento)}&` +
                    `fields[SOURCE_ID]=TRADE_SHOW&` +
                    `fields[OPENED]=Y&` +
                    `fields[STATUS_ID]=IN_PROCESS`;

    const response = UrlFetchApp.fetch(CONFIG.API.BITRIX.URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      payload: payload,
      muteHttpExceptions: true
    });

    return Utils.handleApiResponse(response, "Bitrix");
  } catch (error) {
    return Utils.logError("sendDataToBitrix", error);
  }
}

function sendDataToOdoo(formData) {
  try {
    // Validar datos antes de enviar
    const validation = Utils.validateFormData(formData);
    if (!validation.isValid) {
      return { 
        success: false, 
        message: "Validación fallida para Odoo", 
        errors: validation.errors 
      };
    }

    // Enviar datos a Odoo usando el módulo especializado
    const result = Odoo.createLead(formData);
    
    // Manejar resultado
    if (result && result.success) {
      Logger.log(`Lead creado en Odoo exitosamente. ID: ${result.leadId}`);
      return {
        success: true,
        leadId: result.leadId,
        message: "Lead creado correctamente en Odoo"
      };
    } else {
      const errorMsg = result && result.message ? result.message : "Error desconocido al crear lead en Odoo";
      Logger.log(`Error al crear lead en Odoo: ${errorMsg}`);
      return {
        success: false,
        message: errorMsg,
        error: result.error
      };
    }
  } catch (error) {
    return Utils.logError("sendDataToOdoo", error);
  }
}

function sendWazzupMessage(phone, name, assignee, assigneePhone, leadLastName, leadLocalidad, leadProvincia, verticales, leadComentarios, appUSR, appUSREmpresa) {
  try {
    const formattedPhone = Utils.formatPhoneNumber(phone);
    const formattedAssigneePhone = Utils.formatPhoneNumber(assigneePhone);

    const messageText = `Hola ${name}\nGracias por visitarnos en esta nueva exposición.\nLe adjunto información vista en nuestro stand.\n*De parte del equipo de DyE y su red, gracias y saludos!* \nSu comercial asignado es: ${assignee}.\nSu contacto es: ${assigneePhone}.`;

    const messageTextAssignee = `
    Hola ${assignee}
    Se le asignó el siguiente contacto:
    Nombre: ${name}
    Apellido: ${leadLastName}
    Teléfono: ${phone}
    Localidad: ${leadLocalidad}
    Provincia: ${leadProvincia}
    Verticales: ${verticales}
    Comentarios: ${leadComentarios}
    Registrado por: ${appUSR} - ${appUSREmpresa}.`;

    const results = [];

    // Enviar mensaje inicial al cliente
    results.push(sendWazzupRequest({
      chatId: `+${formattedPhone}@c.us`,
      type: "text",
      text: messageText
    }));

    // Enviar imágenes según verticales seleccionadas
    const selectedVerticales = verticales.split(',').map(v => v.trim().toLowerCase());
    Object.entries(CONFIG.APP.IMAGES.VERTICALS).forEach(([key, imageUrl]) => {
      const verticalName = key.toLowerCase().replace('_', '');
      if (selectedVerticales.some(v => v.includes(verticalName))) {
        results.push(sendWazzupRequest({
          chatId: `+${formattedPhone}@c.us`,
          type: "image",
          contentUri: imageUrl
        }));
      }
    });

    // Enviar mensaje al comercial
    results.push(sendWazzupRequest({
      chatId: `+${formattedAssigneePhone}@c.us`,
      type: "text",
      text: messageTextAssignee
    }));

    // NUEVA FUNCIONALIDAD: Enviar mensajes a especialistas según verticales
    const especialistasANotificar = [];
    
    // Verificar WeedSeeker
    if (selectedVerticales.some(v => v.includes('weedseeker'))) {
      especialistasANotificar.push(CONFIG.ESPECIALISTAS.VERTICALES.WEEDSEEKER);
    }
    
    // Verificar Siembra
    if (selectedVerticales.some(v => v.includes('siembra'))) {
      especialistasANotificar.push(CONFIG.ESPECIALISTAS.VERTICALES.SIEMBRA);
    }
    
    // Verificar TAPs o Acción QR
    if (selectedVerticales.some(v => v.includes('taps')) || selectedVerticales.some(v => v.includes('acción qr'))) {
      especialistasANotificar.push(CONFIG.ESPECIALISTAS.VERTICALES.TAPS_ACCION_QR);
    }
    
    // Verificar Drones DJI
    if (selectedVerticales.some(v => v.includes('drones dji'))) {
      especialistasANotificar.push(CONFIG.ESPECIALISTAS.VERTICALES.DRONES_DJI);
    }
    
    // Enviar mensajes a los especialistas identificados
    for (const especialista of especialistasANotificar) {
      const formattedEspecialistaPhone = Utils.formatPhoneNumber(especialista.telefono);
      const messageTextEspecialista = `
      Hola ${especialista.nombre}
      Le notifico de un prospecto interesado en su vertical:
      Nombre: ${name}
      Apellido: ${leadLastName}
      Teléfono: ${phone}
      Localidad: ${leadLocalidad}
      Provincia: ${leadProvincia}
      Verticales: ${verticales}
      Comentarios: ${leadComentarios}
      Registrado por: ${appUSR} - ${appUSREmpresa}
      Comercial asignado: ${assignee}`;
      
      results.push(sendWazzupRequest({
        chatId: `+${formattedEspecialistaPhone}@c.us`,
        type: "text",
        text: messageTextEspecialista
      }));
      
      Logger.log(`Notificación enviada al especialista ${especialista.nombre} para la vertical correspondiente`);
    }

    // Verificar resultados
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      Utils.logError("sendWazzupMessage", "Algunos mensajes fallaron");
      return { success: false, errors: errors };
    }

    return { success: true, message: "Todos los mensajes enviados correctamente" };
  } catch (error) {
    return Utils.logError("sendWazzupMessage", error);
  }
}

function sendWazzupRequest(messageData) {
  try {
    const payload = {
      channelId: CONFIG.API.WAZZUP.CHANNEL_ID,
      chatType: "whatsapp",
      ...messageData
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.API.WAZZUP.KEY}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(CONFIG.API.WAZZUP.URL, options);
    return Utils.handleApiResponse(response, "Wazzup");
  } catch (error) {
    return Utils.logError("sendWazzupRequest", error);
  }
}

/**
 * Función de prueba para crear un lead de ejemplo en Odoo
 * @param {boolean} returnFullResponse - Si es true, devuelve la respuesta completa de Odoo en vez de solo el ID
 * @returns {Object} - Resultado de la operación
 */
function agregar_lead_test(returnFullResponse = false) {
  try {
    // Crear datos de prueba para un lead
    const testFormData = {
      nombre: "Test",
      apellido: "Odoo Integration",
      localidad: "Buenos Aires",
      provincia: "Buenos Aires",
      telefono: "1122334455",
      mail: "test@example.com",
      comentarios: "Este es un lead de prueba generado automáticamente para verificar la integración con Odoo",
      montoEstimado: "5000 USD",
      operadorApp: "Test Operator",
      empresaOperador: "Test Company",
      comercialAsignado: "Martín Aused",
      evento: "Test ExpoAgro 2025",
      concatenatedCheckboxes: "WeedSeeker, Solución Siembra, Drones DJI",
      weedSeeker: true,
      solucionSiembra: true,
      dronesDJI: true
    };

    // Enviar datos de prueba a Odoo
    Logger.log("Enviando lead de prueba a Odoo...");
    const result = sendDataToOdoo(testFormData);
    
    // Registrar resultado en el log
    if (result.success) {
      Logger.log(`Lead de prueba creado exitosamente en Odoo con ID: ${result.leadId}`);
      
      // Opcionalmente obtener y devolver datos completos del lead creado
      if (returnFullResponse) {
        try {
          const leadData = Odoo.execute(CONFIG.API.ODOO.MODEL, 'read', [[result.leadId], []]);
          return {
            success: true,
            message: "Lead de prueba creado y recuperado correctamente",
            leadId: result.leadId,
            leadData: leadData
          };
        } catch (readError) {
          return {
            success: true,
            message: "Lead de prueba creado, pero no se pudo recuperar la información completa",
            leadId: result.leadId,
            error: readError.message
          };
        }
      }

      return {
        success: true,
        message: "Lead de prueba creado correctamente en Odoo",
        leadId: result.leadId
      };
    } else {
      Logger.log(`Error al crear lead de prueba en Odoo: ${result.message}`);
      return {
        success: false,
        message: `Error al crear lead de prueba en Odoo: ${result.message}`,
        error: result.error
      };
    }
  } catch (error) {
    const errorMsg = `Error general al ejecutar la prueba: ${error.message || error}`;
    Logger.log(errorMsg);
    return {
      success: false,
      message: errorMsg,
      error: error
    };
  }
}

function checkServerStatus() {
  try {
    return {
      status: "online",
      timestamp: new Date().toISOString(),
      version: CONFIG.APP.VERSION,
      maxBatchSize: CONFIG.APP.MAX_BATCH_SIZE,
      retryLimit: CONFIG.APP.RETRY_LIMIT,
      syncInterval: CONFIG.APP.SYNC_INTERVAL,
      isOnline: true
    };
  } catch (error) {
    Utils.logError("checkServerStatus", error);
    return {
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
      isOnline: false
    };
  }
}

function processOfflineData(formDataArray) {
  const results = [];
  
  for (const formData of formDataArray) {
    try {
      // Validar datos
      const validation = Utils.validateFormData(formData);
      if (!validation.isValid) {
        results.push({
          id: formData.timestamp,
          success: false,
          errors: { validation: validation.errors }
        });
        continue;
      }

      // Procesar en los diferentes sistemas
      const formsResult = sendDataToForm(formData);
      const bitrixResult = sendDataToBitrix(formData, formData.concatenatedCheckboxes);
      const odooResult = sendDataToOdoo(formData);
      const wazzupResult = sendWazzupMessage(
        formData.telefono,
        formData.nombre,
        formData.comercialAsignado,
        formData.telefonoComercial,
        formData.apellido,
        formData.localidad,
        formData.provincia,
        formData.concatenatedCheckboxes,
        formData.comentarios,
        formData.operadorApp,
        formData.empresaOperador
      );

      results.push({
        id: formData.timestamp,
        success: formsResult.success && bitrixResult.success && odooResult.success && wazzupResult.success,
        errors: {
          forms: !formsResult.success ? formsResult.error : null,
          bitrix: !bitrixResult.success ? bitrixResult.error : null,
          odoo: !odooResult.success ? odooResult.error : null,
          wazzup: !wazzupResult.success ? wazzupResult.error : null
        }
      });
    } catch (error) {
      results.push({
        id: formData.timestamp,
        success: false,
        errors: {
          general: Utils.logError("processOfflineData", error).error
        }
      });
    }
  }
  
  return results;
}

