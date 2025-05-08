// Código.gs

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  const output = template.evaluate()
    .setTitle('RegistroExpoWEB')
    .setFaviconUrl('https://i.ibb.co/3mNwdJWt/SP.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return output;
}

function getLocalidadesData() {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTGUaoj9BAFuYQW4_3VRSn8sgxZuWPPfadnpE4RefsvvTkNDSpej6aeF2TdNdiK0SkcMcWsO30WrnVz/pub?output=csv";

  try {
    const response = UrlFetchApp.fetch(csvUrl);
    const csvText = response.getContentText();
    const data = parseCSV(csvText);
    return data;
  } catch (error) {
    Logger.log("Error al cargar el CSV: " + error.message);
    return [];
  }
}

function parseCSV(csvText) {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",").map((header) => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index].trim();
      });
      result.push(row);
    }
  }

  return result;
}

function sendDataToForm(formData) {
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeMgPwBKlaUpWUuAa2lJP8g5srO2cg3IEWs4YXZd4xdmgkjlw/formResponse";

  try {
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

    UrlFetchApp.fetch(formUrl, options);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function sendDataToBitrix(formData, verticales) {
  const bitrixURL = "https://dye.bitrix24.com/rest/1017/8dkpeiwb7jwszi8q/crm.lead.add.json";

  try {
    const payload = `fields[NAME]=${encodeURIComponent(formData.nombre)}&` +
                    `fields[LAST_NAME]=${encodeURIComponent(formData.apellido)}&` +
                    `fields[ASSIGNED_BY_ID]=${encodeURIComponent(getBitrixID(formData.comercialAsignado))}&` +
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

    const response = UrlFetchApp.fetch(bitrixURL, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      payload: payload
    });

    const responseData = JSON.parse(response.getContentText());
    if (responseData.result) {
      return { success: true, message: "Datos enviados correctamente a Bitrix." };
    } else {
      return { success: false, message: responseData.error_description || "Error desconocido" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getBitrixID(comercialName) {
  const comerciales = {
    "Adilson Simch": "532",
    "Adrián Cardinali": "464",
    "Andrés Hernández": "1141",
    "Carlos Bermúdez": "486",
    "César Vigna": "8",
    "Facundo Pagani": "308",
    "Germán González": "6",
    "Ignacio Espinoza": "54",
    "Juan Manuel Silva": "1019",
    "Juan Martín Venencia": "28",
    "Luis Adrover": "1",
    "Martín Aused": "1017",
    "Matías Aliaga": "12",
    "Matías Corradi": "1379",
    "Matías García": "1413",
    "Matías Koller": "1385",
    "Paulo Castillo": "492",
    "Ramiro Fernández": "16",
    "Renzo Bonavia": "1269",
    "Roberto Catala": "20",
    "Fernanda Frade": "6855",
    "Juan Martín Oliver": "1469",
    "Jeronimo Sfascia": "1471",
    "Adriana Berardinelli": "1343",
    "Pablo Puy": "1343",
    "Cecilia Gómez": "1343",
    "Miguel Ricchiardi": "568",
    "Jorge Salguero": "568",
    "Juan Del Cerro": "1387",
    "Claudio Báez": "484",
    "Marcelo Rosenthal": "1393",
    "Maximiliano Arduini": "1373",
    "Jorge Álvarez": "1021",
    "Pedro Alcorta": "474",
    "Gonzalo Ortiz": "1383",
    "Manuel Pacheco": "1405",
    "Sebastian Schroh": "1467",
    "Nicolás Scaramuzza": "6867",
    "Ricardo Vicentín": "6863",
    "Joaquín Fernández": "58",
    "Ailín Borracci": "1755",
    "Camila Gorosito": "6869",
    "Pablo Casas": "6871"
  };

  return comerciales[comercialName] || "1";
}

function sendWazzupMessage(phone, name, assignee, assigneePhone, leadLastName, leadLocalidad, leadProvincia, verticales, leadComentarios, appUSR, appUSREmpresa) {
  const WAZZUP_API_URL = "https://api.wazzup24.com/v3/message";
  const API_KEY = "5f5261984014423db79fb7c890789d91";
  const CHANNEL_ID = "9f635cf7-1ee8-4fab-be65-d91ca6eadc70";

  // Formatear números de teléfono (eliminar caracteres no numéricos y agregar prefijo)
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanAssigneePhone = assigneePhone.replace(/\D/g, '');
  
  // Agregar prefijo +549 si no está presente
  const formattedPhone = cleanPhone.startsWith('549') ? cleanPhone : `549${cleanPhone}`;
  const formattedAssigneePhone = cleanAssigneePhone.startsWith('549') ? cleanAssigneePhone : `549${cleanAssigneePhone}`;

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

  // Mapeo de verticales a imágenes
  const verticalImages = {
    'weedSeeker': "https://i.ibb.co/svRLJc0/Weed-Seeker.jpg",
    'solucionSiembra': "https://i.ibb.co/dDVbr35/Siembra.jpg",
    'guiaAutoguia': "https://i.ibb.co/dGZVBZd/Autoguia.jpg",
    'tapsSenales': "https://i.ibb.co/XSTN821/TAPs.jpg",
    'solucionPulverizacion': "https://i.ibb.co/BcnMsfX/Pulverizacion.jpg",
    'dronesDJI': "https://i.ibb.co/0mPx08M/DJI.jpg"
  };

  function sendRequest(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(WAZZUP_API_URL, options);
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();

      Logger.log("Código de respuesta HTTP: " + responseCode);
      Logger.log("Cuerpo de la respuesta: " + responseBody);
      Logger.log("Número formateado: " + formattedPhone); // Log para debugging

      if (responseCode === 201) {
        return { success: true, message: "Mensaje enviado correctamente." };
      } else {
        return { success: false, message: `Error: ${responseBody}` };
      }
    } catch (error) {
      Logger.log("Error en la solicitud: " + error.message);
      return { success: false, message: error.message || "Error al enviar el mensaje." };
    }
  }

  // Enviar mensaje inicial al cliente
  const textPayload = {
    channelId: CHANNEL_ID,
    chatId: `+${formattedPhone}@c.us`,
    chatType: "whatsapp",
    type: "text",
    text: messageText
  };

  const textResponse = sendRequest(textPayload);
  if (!textResponse.success) {
    return textResponse;
  }

  // Enviar imágenes según las verticales seleccionadas
  const selectedVerticales = verticales.split(',').map(v => v.trim().toLowerCase());
  const imagePromises = [];

  for (const [vertical, imageUrl] of Object.entries(verticalImages)) {
    if (selectedVerticales.some(v => v.includes(vertical.toLowerCase()))) {
      const imagePayload = {
        channelId: CHANNEL_ID,
        chatId: `+${formattedPhone}@c.us`,
        chatType: "whatsapp",
        type: "image",
        contentUri: imageUrl
      };
      imagePromises.push(sendRequest(imagePayload));
    }
  }

  // Enviar mensaje al comercial
  const textPayloadAssignee = {
    channelId: CHANNEL_ID,
    chatId: `+${formattedAssigneePhone}@c.us`,
    chatType: "whatsapp",
    type: "text",
    text: messageTextAssignee
  };

  const assigneeResponse = sendRequest(textPayloadAssignee);
  if (!assigneeResponse.success) {
    Logger.log("Error al enviar mensaje al comercial:", assigneeResponse.message);
  }

  // Verificar si hubo errores en el envío de imágenes
  const imageErrors = imagePromises.filter(response => !response.success);
  if (imageErrors.length > 0) {
    Logger.log("Errores al enviar imágenes:", imageErrors);
    return { success: false, message: "Error al enviar algunas imágenes" };
  }

  return { success: true, message: "Mensajes enviados correctamente" };
}

function checkServerStatus() {
  try {
    return {
      status: "online",
      timestamp: new Date().toISOString(),
      version: "V2R032.180325",
      maxBatchSize: 5,
      retryLimit: 3,
      syncInterval: 30000,
      isOnline: true
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
      isOnline: false
    };
  }
}

// --------------- INTEGRACIÓN CON ODOO ---------------

// Función auxiliar para crear payload XML-RPC
function createXmlRpcPayload(method, params) {
  let payload = '<?xml version="1.0"?>';
  payload += '<methodCall>';
  payload += '<methodName>' + method + '</methodName>';
  payload += '<params>';
  
  // Añadir cada parámetro
  params.forEach(param => {
    payload += '<param>';
    payload += '<value>';
    payload += convertJsValueToXmlRpc(param);
    payload += '</value>';
    payload += '</param>';
  });
  
  payload += '</params>';
  payload += '</methodCall>';
  
  return payload;
}

// Convertir un valor JS a XML-RPC
function convertJsValueToXmlRpc(value) {
  if (value === null || value === undefined) {
    return '<nil/>';
  }
  
  const type = typeof value;
  
  if (type === 'string') {
    return '<string>' + escapeXml(value) + '</string>';
  }
  else if (type === 'number') {
    if (Number.isInteger(value)) {
      return '<int>' + value + '</int>';
    } else {
      return '<double>' + value + '</double>';
    }
  }
  else if (type === 'boolean') {
    return '<boolean>' + (value ? '1' : '0') + '</boolean>';
  }
  else if (Array.isArray(value)) {
    let xml = '<array><data>';
    value.forEach(item => {
      xml += '<value>' + convertJsValueToXmlRpc(item) + '</value>';
    });
    xml += '</data></array>';
    return xml;
  }
  else if (type === 'object') {
    let xml = '<struct>';
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        xml += '<member>';
        xml += '<name>' + escapeXml(key) + '</name>'; // Usar <name> para cumplir con el estándar XML-RPC
        xml += '<value>' + convertJsValueToXmlRpc(value[key]) + '</value>';
        xml += '</member>';
      }
    }
    xml += '</struct>';
    return xml;
  }
  
  // Por defecto, convertir a string
  return '<string>' + escapeXml(String(value)) + '</string>';
}

// Escapar caracteres XML
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Parsear respuesta XML-RPC
function parseXmlRpcResponse(xmlString) {
  Logger.log("Parseando respuesta XML-RPC");
  
  try {
    const xmlDoc = XmlService.parse(xmlString);
    const root = xmlDoc.getRootElement();
    
    // Verificar si hay un error (fault)
    const fault = root.getChild('fault');
    if (fault) {
      const struct = fault.getChild('value').getChild('struct');
      const members = struct.getChildren('member');
      
      let faultCode, faultString;
      members.forEach(member => {
        const name = member.getChildText('name');
        if (name === 'faultCode') {
          faultCode = parseInt(member.getChild('value').getChildText('int'));
        } else if (name === 'faultString') {
          faultString = member.getChild('value').getChildText('string');
        }
      });
      
      Logger.log("Error XML-RPC: " + faultString);
      throw new Error(faultString || 'XML-RPC Fault');
    }
    
    // Procesar la respuesta normal
    const params = root.getChild('params');
    if (!params) {
      Logger.log("No se encontraron parámetros en la respuesta XML-RPC");
      return null;
    }
    
    const param = params.getChild('param');
    if (!param) {
      Logger.log("No se encontró parámetro en la respuesta XML-RPC");
      return null;
    }
    
    const value = param.getChild('value');
    if (!value) {
      Logger.log("No se encontró valor en la respuesta XML-RPC");
      return null;
    }
    
    return parseXmlRpcValue(value);
  } catch (error) {
    Logger.log("Error al parsear XML-RPC: " + error.toString());
    throw error;
  }
}

// Parsear valor XML-RPC recursivamente
function parseXmlRpcValue(valueElement) {
  // Buscar el primer hijo que no sea texto (el tipo de datos)
  const children = valueElement.getChildren();
  
  // Si no hay hijos, el valor es una cadena directa
  if (children.length === 0) {
    return valueElement.getText() || "";
  }
  
  // Obtener el primer elemento hijo (tipo de dato)
  const typeElement = children[0];
  const typeName = typeElement.getName();
  
  switch (typeName) {
    case 'int':
    case 'i4':
      return parseInt(typeElement.getText());
    
    case 'boolean':
      return typeElement.getText() === '1';
    
    case 'string':
      return typeElement.getText() || "";
    
    case 'double':
      return parseFloat(typeElement.getText());
    
    case 'dateTime.iso8601':
      return new Date(typeElement.getText());
    
    case 'base64':
      return Utilities.base64Decode(typeElement.getText());
    
    case 'nil':
      return null;
    
    case 'array':
      const data = typeElement.getChild('data');
      if (!data) return [];
      
      const arrayValues = data.getChildren('value');
      return arrayValues.map(arrayValue => parseXmlRpcValue(arrayValue));
    
    case 'struct':
      const result = {};
      const members = typeElement.getChildren('member');
      
      members.forEach(member => {
        const name = member.getChildText('name');
        const memberValue = member.getChild('value');
        result[name] = parseXmlRpcValue(memberValue);
      });
      
      return result;
    
    default:
      Logger.log("Tipo XML-RPC desconocido: " + typeName);
      return typeElement.getText();
  }
}

// Función para login XML-RPC
function xmlrpcLogin(url, db, username, password) {
  Logger.log("Iniciando login XML-RPC en Odoo");
  
  try {
    const loginUrl = url + '/xmlrpc/2/common';
    Logger.log("URL de login: " + loginUrl);
    
    const payload = createXmlRpcPayload('authenticate', [db, username, password, {}]);
    
    const options = {
      'method': 'post',
      'contentType': 'text/xml',
      'payload': payload,
      'muteHttpExceptions': true
    };
    
    Logger.log("Enviando solicitud de autenticación");
    const response = UrlFetchApp.fetch(loginUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log("Respuesta recibida con código: " + responseCode);
    
    if (responseCode !== 200) {
      Logger.log("Error de autenticación: " + responseText);
      throw new Error('Error de autenticación: ' + responseText);
    }
    
    Logger.log("Analizando respuesta XML-RPC");
    const uid = parseXmlRpcResponse(responseText);
    
    if (!uid) {
      Logger.log("Autenticación fallida: UID no recibido");
      throw new Error('Autenticación fallida. Verifique sus credenciales.');
    }
    
    Logger.log("Autenticación exitosa con UID: " + uid);
    return uid;
  } catch (error) {
    Logger.log("Error en xmlrpcLogin: " + error.toString());
    throw error;
  }
}

// Función para ejecutar métodos XML-RPC
function xmlrpcExecute(url, db, uid, password, model, method, args) {
  Logger.log("Ejecutando método XML-RPC: " + method + " en modelo: " + model);
  
  try {
    const executeUrl = url + '/xmlrpc/2/object';
    
    const payload = createXmlRpcPayload('execute_kw', [db, uid, password, model, method, args]);
    
    const options = {
      'method': 'post',
      'contentType': 'text/xml',
      'payload': payload,
      'muteHttpExceptions': true
    };
    
    Logger.log("Enviando solicitud de ejecución");
    const response = UrlFetchApp.fetch(executeUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log("Respuesta recibida con código: " + responseCode);
    
    if (responseCode !== 200) {
      Logger.log("Error en la ejecución: " + responseText);
      throw new Error('Error en la ejecución: ' + responseText);
    }
    
    Logger.log("Analizando respuesta XML-RPC");
    const result = parseXmlRpcResponse(responseText);
    Logger.log("Ejecución exitosa");
    
    return result;
  } catch (error) {
    Logger.log("Error en xmlrpcExecute: " + error.toString());
    throw error;
  }
}

// Función auxiliar para mapear IDs de Bitrix a IDs de Odoo
function mapBitrixToOdooUserId(bitrixId) {
  // Este mapeo debe ajustarse según los usuarios reales en ambos sistemas
  const mapping = {
    "1": 10,  // Luis Adrover
    "8": 11,  // César Vigna
    "486": 12, // Carlos Bermúdez
    "54": 13,  // Ignacio Espinoza
    "28": 15,  // Juan Martín Venencia
    "16": 16,  // Ramiro Fernández
    "20": 17,  // Roberto Catala
    "1385": 21, // Matías Koller
    "1755": 22, // Ailín Borracci
    "1379": 23, // Matías Corradi
    "6": 24,    // Germán González
    "12": 25,   // Matías Aliaga
    "6869": 26, // Camila Gorosito
    "6855": 27, // Fernanda Frade
    "58": 29,   // Joaquín Fernández
    "6863": 30, // Ricardo Vicentín
    "6867": 32, // Nicolás Scaramuzza
    "464": 38,  // Adrián Cardinali
    "532": 40,  // Adilson Simch
    "6871": 45, // Pablo Casas
    "1019": 46, // Juan Manuel Silva
    "1269": 48, // Renzo Bonavia
    "1017": 51, // Martín Aused
    "308": 53   // Facundo Pagani
  };
  
  return mapping[bitrixId] || 51; // Por defecto a Martín Aused si no hay mapeo
}

// Función para crear un nuevo lead en Odoo
function createOdooLead(formData) {
  try {
    Logger.log("Iniciando creación de lead en Odoo");
    
    // Configuración de Odoo
    const odooUrl = "https://dye.quilsoft.com";
    const db = "dye_prod";
    const login = "maused@dyesa.com";
    const password = "967ce27624f6e6bfdf1b674efcbc2fda5603796e";
    
    // Autenticación en Odoo
    const uid = xmlrpcLogin(odooUrl, db, login, password);
    Logger.log("Autenticación exitosa en Odoo con UID: " + uid);
    
    // Preparar datos para el lead
    const nombreCompleto = formData.nombre + " " + formData.apellido;
    
    // Construir descripción detallada con mejor formato para las notas internas
    let descripcion = `INFORMACIÓN DEL PROSPECTO\n`;
    descripcion += `=============================================\n\n`;
    
    descripcion += `DATOS PERSONALES:\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `Nombre completo: ${nombreCompleto}\n`;
    descripcion += `Teléfono: ${formData.telefono || 'No proporcionado'}\n`;
    descripcion += `Email: ${formData.mail || 'No proporcionado'}\n\n`;
    
    descripcion += `UBICACIÓN:\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `Localidad: ${formData.localidad || 'No proporcionada'}\n`;
    descripcion += `Provincia: ${formData.provincia || 'No proporcionada'}\n\n`;
    
    descripcion += `INTERESES (VERTICALES):\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `${formData.concatenatedCheckboxes || 'No especificados'}\n\n`;
    
    descripcion += `DETALLES ADICIONALES:\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `Comentarios: ${formData.comentarios || 'Sin comentarios'}\n`;
    descripcion += `Monto Estimado: ${formData.montoEstimado || 'No especificado'}\n\n`;
    
    descripcion += `INFORMACIÓN DEL EVENTO:\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `Evento: ${formData.evento || 'No especificado'}\n\n`;
    
    descripcion += `INFORMACIÓN DE REGISTRO:\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `Registrado por: ${formData.operadorApp || 'No especificado'}\n`;
    descripcion += `Empresa del registrador: ${formData.empresaOperador || 'No especificada'}\n`;
    descripcion += `Comercial asignado: ${formData.comercialAsignado || 'No asignado'}\n`;
    descripcion += `Teléfono del comercial: ${formData.telefonoComercial || 'No especificado'}\n`;
    descripcion += `Email del comercial: ${formData.mailComercial || 'No especificado'}\n\n`;
    
    descripcion += `INFORMACIÓN ADICIONAL:\n`;
    descripcion += `---------------------------------------------\n`;
    descripcion += `Origen: Aplicación de recolección de datos\n`;
    // Incluir todos los campos disponibles del formulario para asegurar que no perdemos información
    Object.keys(formData).forEach(key => {
      // Excluir campos que ya hemos incluido en secciones específicas
      if (!['nombre', 'apellido', 'telefono', 'mail', 'localidad', 'provincia', 
           'comentarios', 'montoEstimado', 'evento', 'operadorApp', 'empresaOperador',
           'comercialAsignado', 'telefonoComercial', 'mailComercial', 'concatenatedCheckboxes'].includes(key)) {
        descripcion += `${key}: ${formData[key] || 'No especificado'}\n`;
      }
    });
    
    // Construir los datos para Odoo con los ajustes solicitados
    const odooLeadData = {
      // Título del lead igual al de Bitrix: Nombre Apellido - Verticales
      'name': `${nombreCompleto} - ${formData.concatenatedCheckboxes}`,
      'contact_name': nombreCompleto,
      'email_from': formData.mail || '',
      'phone': formData.telefono || '',
      'description': descripcion,
      'type': 'lead', // Tipo lead (no oportunidad)
      'function': formData.operadorApp, // Cargo/función
      
      // Dirección
      'street': formData.localidad || '',
      'city': formData.localidad || '',
      'country_id': 10, // ID 10 corresponde a Argentina en Odoo
      
      // Campos de marketing
      'campaign_id': '', // ID de la campaña (debe obtenerse o crearse)
      'source_id': '', // ID del origen (debe obtenerse o crearse)
      'medium_id': '', // ID del medio (debe obtenerse o crearse)
      
      // Valores personalizados en campos de texto
      'referred': formData.evento || '' // Campo adicional para el evento
      // Eliminado 'x_origen' porque no existe en esta instalación de Odoo
    };

    // Buscar el ID de la provincia
    if (formData.provincia) {
      const provinceId = getProvinceId(odooUrl, db, uid, password, formData.provincia);
      if (provinceId) {
        odooLeadData['state_id'] = provinceId;
        Logger.log("ID de provincia encontrado y asignado: " + provinceId);
      } else {
        Logger.log("No se encontró ID para la provincia: " + formData.provincia);
      }
    }

    // Si tenemos bitrixId del comercial, podemos intentar mapear al ID de Odoo
    if (formData.bitrixId) {
      odooLeadData['user_id'] = mapBitrixToOdooUserId(formData.bitrixId);
    }
    
    // Crear el lead en Odoo
    const leadId = xmlrpcExecute(
      odooUrl, 
      db, 
      uid, 
      password, 
      'crm.lead', 
      'create', 
      [odooLeadData]
    );
    
    // Si se crea exitosamente, intentamos configurar la campaña
    if (leadId) {
      try {
        // Buscar o crear la campaña basada en el evento
        const campaignId = getCampaignId(odooUrl, db, uid, password, formData.evento);
        if (campaignId) {
          // Actualizar el lead con la campaña encontrada/creada
          xmlrpcExecute(
            odooUrl,
            db,
            uid,
            password,
            'crm.lead',
            'write',
            [[leadId], { 'campaign_id': campaignId }]
          );
          Logger.log("Lead actualizado con campaña ID: " + campaignId);
        }
        
        // Buscar o crear el origen
        const sourceId = getSourceId(odooUrl, db, uid, password, "Aplicación de recolección de datos");
        if (sourceId) {
          // Actualizar el lead con el origen encontrado/creada
          xmlrpcExecute(
            odooUrl,
            db,
            uid,
            password,
            'crm.lead',
            'write',
            [[leadId], { 'source_id': sourceId }]
          );
          Logger.log("Lead actualizado con origen ID: " + sourceId);
        }
      } catch (updateError) {
        Logger.log("Error al actualizar campaña/origen: " + updateError.toString());
        // Continuamos aunque falle esta parte
      }
    }
    
    Logger.log("Lead creado exitosamente en Odoo con ID: " + leadId);
    return { success: true, lead_id: leadId };
    
  } catch (error) {
    Logger.log("Error al crear lead en Odoo: " + error.toString());
    return { success: false, error: error.message || error.toString() };
  }
}

// Función para obtener o crear una campaña en Odoo
function getCampaignId(url, db, uid, password, campaignName) {
  if (!campaignName) return null;
  
  try {
    const existingCampaigns = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'utm.campaign',
      'search_read',
      [[['name', '=', campaignName]], ['id', 'name'], 0, 1]
    );
    
    if (existingCampaigns && existingCampaigns.length > 0) {
      Logger.log("Campaña encontrada con ID: " + existingCampaigns[0].id);
      return existingCampaigns[0].id;
    }
    
    const newCampaignId = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'utm.campaign',
      'create',
      [{ 'name': campaignName }]
    );
    
    Logger.log("Nueva campaña creada con ID: " + newCampaignId);
    return newCampaignId;
  } catch (error) {
    Logger.log("Error al obtener/crear campaña: " + error.toString());
    return null;
  }
}

// Función para obtener o crear un origen en Odoo
function getSourceId(url, db, uid, password, sourceName) {
  if (!sourceName) return null;
  
  try {
    const existingSources = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'utm.source',
      'search_read',
      [[['name', '=', sourceName]], ['id', 'name'], 0, 1]
    );
    
    if (existingSources && existingSources.length > 0) {
      Logger.log("Origen encontrado con ID: " + existingSources[0].id);
      return existingSources[0].id;
    }
    
    const newSourceId = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'utm.source',
      'create',
      [{ 'name': sourceName }]
    );
    
    Logger.log("Nuevo origen creado con ID: " + newSourceId);
    return newSourceId;
  } catch (error) {
    Logger.log("Error al obtener/crear origen: " + error.toString());
    return null;
  }
}

// Función para buscar el ID de la provincia en Odoo
function getProvinceId(url, db, uid, password, provinceName, countryId = 10) {
  if (!provinceName) return false;
  
  try {
    Logger.log("Buscando provincia: " + provinceName + " para el país ID: " + countryId);
    
    // Normalizar el nombre de la provincia para la búsqueda
    const normalizedName = provinceName.trim().toLowerCase();
    
    // Mapeo de nombres comunes de provincias argentinas a sus nombres en Odoo
    const provinceMapping = {
      'buenos aires': 'Buenos Aires',
      'caba': 'Ciudad Autónoma de Buenos Aires',
      'capital federal': 'Ciudad Autónoma de Buenos Aires',
      'ciudad autonoma de buenos aires': 'Ciudad Autónoma de Buenos Aires',
      'ciudad de buenos aires': 'Ciudad Autónoma de Buenos Aires',
      'catamarca': 'Catamarca',
      'chaco': 'Chaco',
      'chubut': 'Chubut',
      'cordoba': 'Córdoba',
      'corrientes': 'Corrientes',
      'entre rios': 'Entre Ríos',
      'formosa': 'Formosa',
      'jujuy': 'Jujuy',
      'la pampa': 'La Pampa',
      'la rioja': 'La Rioja',
      'mendoza': 'Mendoza',
      'misiones': 'Misiones',
      'neuquen': 'Neuquén',
      'rio negro': 'Río Negro',
      'salta': 'Salta',
      'san juan': 'San Juan',
      'san luis': 'San Luis',
      'santa cruz': 'Santa Cruz',
      'santa fe': 'Santa Fe',
      'santiago del estero': 'Santiago del Estero',
      'tierra del fuego': 'Tierra del Fuego',
      'tucuman': 'Tucumán'
    };
    
    // Intentar encontrar el nombre normalizado de la provincia
    const mappedProvinceName = provinceMapping[normalizedName] || provinceName;
    
    // Buscar la provincia por nombre exacto
    let provinceIds = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'res.country.state',
      'search',
      [[['name', '=', mappedProvinceName], ['country_id', '=', countryId]]]
    );
    
    // Si no se encuentra, intentar buscar con ilike (no distingue mayúsculas/minúsculas y es parcial)
    if (!provinceIds || provinceIds.length === 0) {
      provinceIds = xmlrpcExecute(
        url,
        db,
        uid,
        password,
        'res.country.state',
        'search',
        [[['name', 'ilike', mappedProvinceName], ['country_id', '=', countryId]]]
      );
    }
    
    // Si encontramos resultados, devolver el primer ID
    if (provinceIds && provinceIds.length > 0) {
      Logger.log("Provincia encontrada con ID: " + provinceIds[0]);
      return provinceIds[0];
    }
    
    Logger.log("No se encontró la provincia: " + provinceName);
    return false;
  } catch (error) {
    Logger.log("Error al buscar provincia: " + error.toString());
    return false;
  }
}

function processOfflineData(formDataArray) {
  const results = [];
  
  for (const formData of formDataArray) {
    try {
      // Obtener el estado de envío anterior si existe
      const previousStatus = formData.destinations || {
        forms: false,
        bitrix: false,
        wazzup: false,
        odoo: false
      };
      
      // Objeto para almacenar errores y resultados
      const resultObj = {
        id: formData.timestamp,
        success: true,
        errors: {},
        destinations: {} // Registro de a qué destinos se envió correctamente
      };
      
      // ---- Google Forms ----
      if (!previousStatus.forms) {
        try {
          const formsResult = sendDataToForm(formData);
          resultObj.destinations.forms = formsResult.success;
          if (!formsResult.success) {
            resultObj.success = false;
            resultObj.errors.forms = "Error en Google Forms";
          }
        } catch (formError) {
          resultObj.success = false;
          resultObj.destinations.forms = false;
          resultObj.errors.forms = "Error en Google Forms: " + formError.message;
          Logger.log("Error al enviar a Google Forms: " + formError.toString());
        }
      } else {
        resultObj.destinations.forms = true; // Ya fue enviado anteriormente
      }
      
      // ---- Bitrix24 ----
      if (!previousStatus.bitrix) {
        try {
          const bitrixResult = sendDataToBitrix(formData, formData.concatenatedCheckboxes);
          resultObj.destinations.bitrix = bitrixResult.success;
          if (!bitrixResult.success) {
            resultObj.success = false;
            resultObj.errors.bitrix = bitrixResult.message || "Error en Bitrix";
          }
        } catch (bitrixError) {
          resultObj.success = false;
          resultObj.destinations.bitrix = false;
          resultObj.errors.bitrix = "Error en Bitrix: " + bitrixError.message;
          Logger.log("Error al enviar a Bitrix: " + bitrixError.toString());
        }
      } else {
        resultObj.destinations.bitrix = true; // Ya fue enviado anteriormente
      }
      
      // ---- Wazzup ----
      if (!previousStatus.wazzup) {
        try {
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
          resultObj.destinations.wazzup = wazzupResult.success;
          if (!wazzupResult.success) {
            resultObj.success = false;
            resultObj.errors.wazzup = wazzupResult.message || "Error en Wazzup";
          }
        } catch (wazzupError) {
          resultObj.success = false;
          resultObj.destinations.wazzup = false;
          resultObj.errors.wazzup = "Error en Wazzup: " + wazzupError.message;
          Logger.log("Error al enviar a Wazzup: " + wazzupError.toString());
        }
      } else {
        resultObj.destinations.wazzup = true; // Ya fue enviado anteriormente
      }
      
      // ---- Odoo ----
      if (!previousStatus.odoo) {
        try {
          const odooResult = createOdooLead(formData);
          resultObj.destinations.odoo = odooResult.success;
          if (!odooResult.success) {
            resultObj.success = false;
            resultObj.errors.odoo = odooResult.error || "Error en Odoo";
          }
        } catch (odooError) {
          resultObj.success = false;
          resultObj.destinations.odoo = false;
          resultObj.errors.odoo = "Error en Odoo: " + odooError.message;
          Logger.log("Error al enviar a Odoo: " + odooError.toString());
        }
      } else {
        resultObj.destinations.odoo = true; // Ya fue enviado anteriormente
      }
      
      // Registrar el resultado
      results.push(resultObj);
      
    } catch (generalError) {
      // Error general no capturado en ningún bloque específico
      results.push({
        id: formData.timestamp,
        success: false,
        errors: { general: generalError.message || "Error desconocido al procesar el formulario" },
        destinations: { forms: false, bitrix: false, wazzup: false, odoo: false }
      });
    }
  }
  
  return results;
}