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
    "Ignacio Dauria": "1017",
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

function sendWazzupMessage(phone, name, assignee, assigneePhone, leadLastName, leadLocalidad, leadProvincia, verticales, leadComentarios, appUSR, appUSREmpresa, leadPais) {
  const WAZZUP_API_URL = "https://api.wazzup24.com/v3/message";
  const API_KEY = "5f5261984014423db79fb7c890789d91";
  const CHANNEL_ID = "9f635cf7-1ee8-4fab-be65-d91ca6eadc70";

  // Formatear números de teléfono según el país
  const formattedPhone = formatPhoneByCountry(phone, leadPais);
  const formattedAssigneePhone = formatPhoneByCountry(assigneePhone, leadPais);

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
    'tapsSenales': "https://i.ibb.co/LD45Q6JR/folletosenales-dye.png",
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
      version: "V02R035.010625",
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
    "532": 40,  // Adilson Simch
    "464": 38,  // Adrián Cardinali
    "1141": 10,  // Andrés Hernández, asignado a Luis
    "1755": 22, // Ailín Borracci
    "6869": 26, // Camila Gorosito
    "486": 12, // Carlos Bermúdez
    "8": 11,  // César Vigna
    "31": 31,  // Delfina Aguirre
    "308": 53,   // Facundo Pagani
    "6855": 27, // Fernanda Frade
    "6": 24,    // Germán González
    "35": 35,  // Ignacio Dáuria
    "54": 13,  // Ignacio Espinoza
    "58": 29,   // Joaquín Fernández
    "4400": 44, // Jorgelina Wilhelm
    "2800": 28,   // José Cesanelli
    "1019": 46, // Juan Manuel Silva
    "28": 15,  // Juan Martín Venencia
    "1": 10,  // Luis Adrover
    "33": 33,  // Lucas Morichetti
    "1017": 51, // Martín Aused
    "12": 25,   // Matías Aliaga
    "1379": 23, // Matías Corradi
    "1385": 21, // Matías Koller
    "6867": 32, // Nicolás Scaramuzza
    "6871": 45, // Pablo Casas
    "16": 16,  // Ramiro Fernández
    "5400": 54,  // Raúl Chebaia
    "1269": 48, // Renzo Bonavia
    "6863": 30, // Ricardo Vicentín
    "20": 17  // Roberto Catala
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
    Logger.log(`Preparando datos para: ${nombreCompleto}, Email: ${formData.mail}, Teléfono: ${formData.telefono}`);
      // Construir descripción con formato HTML estructurado y estilos CSS inline
    let descripcion = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.6;">
      
      <!-- Encabezado principal -->
      <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold;">📋 INFORMACIÓN DEL PROSPECTO</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Registro de lead desde RegistroExpoWEB</p>
      </div>

      <!-- Datos Personales -->
      <div style="background-color: white; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #28a745; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          👤 <span style="margin-left: 8px;">DATOS PERSONALES</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">Nombre completo:</td>
            <td style="padding: 5px 0; color: #333;">${nombreCompleto}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Teléfono:</td>
            <td style="padding: 5px 0; color: #333;">${formData.telefono || 'No proporcionado'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 5px 0; color: #333;">${formData.mail || 'No proporcionado'}</td>
          </tr>
        </table>
      </div>

      <!-- Ubicación -->
      <div style="background-color: white; border-left: 4px solid #17a2b8; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          📍 <span style="margin-left: 8px;">UBICACIÓN</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">Localidad:</td>
            <td style="padding: 5px 0; color: #333;">${formData.localidad || 'No proporcionada'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Provincia:</td>
            <td style="padding: 5px 0; color: #333;">${formData.provincia || 'No proporcionada'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">País:</td>
            <td style="padding: 5px 0; color: #333;">${formData.pais || 'No proporcionado'}</td>
          </tr>
        </table>
      </div>

      <!-- Intereses (Verticales) -->
      <div style="background-color: white; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #e6a100; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          🎯 <span style="margin-left: 8px;">INTERESES (VERTICALES)</span>
        </h3>
        <div style="background-color: #fff8dc; padding: 10px; border-radius: 4px; border: 1px solid #ffc107;">
          <strong style="color: #e6a100;">${formData.concatenatedCheckboxes || 'No especificados'}</strong>
        </div>
      </div>

      <!-- Detalles Comerciales -->
      <div style="background-color: white; border-left: 4px solid #6f42c1; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #6f42c1; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          💰 <span style="margin-left: 8px;">DETALLES COMERCIALES</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">Comentarios:</td>
            <td style="padding: 5px 0; color: #333;">${formData.comentarios || 'Sin comentarios'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Monto Estimado:</td>
            <td style="padding: 5px 0; color: #333;">${formData.montoEstimado || 'No especificado'}</td>
          </tr>
        </table>
      </div>

      <!-- Información del Evento -->
      <div style="background-color: white; border-left: 4px solid #fd7e14; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #fd7e14; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          🎪 <span style="margin-left: 8px;">INFORMACIÓN DEL EVENTO</span>
        </h3>
        <div style="background-color: #fff4e6; padding: 10px; border-radius: 4px; border: 1px solid #fd7e14;">
          <strong style="color: #fd7e14;">${formData.evento || 'No especificado'}</strong>
        </div>
      </div>

      <!-- Información de Registro -->
      <div style="background-color: white; border-left: 4px solid #20c997; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #20c997; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          📝 <span style="margin-left: 8px;">INFORMACIÓN DE REGISTRO</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">Registrado por:</td>
            <td style="padding: 5px 0; color: #333;">${formData.operadorApp || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Empresa del registrador:</td>
            <td style="padding: 5px 0; color: #333;">${formData.empresaOperador || 'No especificada'}</td>
          </tr>
        </table>
      </div>

      <!-- Comercial Asignado -->
      <div style="background-color: white; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #dc3545; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          👨‍💼 <span style="margin-left: 8px;">COMERCIAL ASIGNADO</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">Nombre:</td>
            <td style="padding: 5px 0; color: #333;">${formData.comercialAsignado || 'No asignado'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Teléfono:</td>
            <td style="padding: 5px 0; color: #333;">${formData.telefonoComercial || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 5px 0; color: #333;">${formData.mailComercial || 'No especificado'}</td>
          </tr>
        </table>
      </div>

      <!-- Información Adicional -->
      <div style="background-color: white; border-left: 4px solid #6c757d; padding: 15px; margin-bottom: 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
          ℹ️ <span style="margin-left: 8px;">INFORMACIÓN ADICIONAL</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">Origen:</td>
            <td style="padding: 5px 0; color: #333;">Aplicación de recolección de datos</td>
          </tr>`;
    
    // Incluir todos los campos adicionales del formulario que no se hayan mostrado ya
    Object.keys(formData).forEach(key => {
      // Excluir campos que ya hemos incluido en secciones específicas
      if (!['nombre', 'apellido', 'telefono', 'mail', 'localidad', 'provincia', 'pais',
           'comentarios', 'montoEstimado', 'evento', 'operadorApp', 'empresaOperador',
           'comercialAsignado', 'telefonoComercial', 'mailComercial', 'concatenatedCheckboxes'].includes(key)) {
        descripcion += `
          <tr>
            <td style="padding: 5px 0; font-weight: bold; color: #555; width: 30%;">${key}:</td>
            <td style="padding: 5px 0; color: #333;">${formData[key] || 'No especificado'}</td>
          </tr>`;
      }
    });
    
    descripcion += `
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; padding: 10px; background-color: #e9ecef; border-radius: 5px;">
        <small style="color: #6c757d; font-size: 11px;">
          📅 Generado automáticamente por RegistroExpoWEB • ${new Date().toLocaleString('es-ES')}
        </small>
      </div>

    </div>`;
    
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
      'country_id': 10, // ID por defecto para Argentina, se actualizará dinámicamente abajo
        // Campos de marketing - solo campaign_id y source_id
      'campaign_id': '', // ID de la campaña (debe obtenerse o crearse)
      'source_id': '', // ID del origen (debe obtenerse o crearse)
      // medium_id: No completar según requerimientos
      // Valores personalizados en campos de texto
      'referred': formData.evento || '' // Campo adicional para el evento
      // Eliminado 'x_origen' porque no existe en esta instalación de Odoo
    };

    // Buscar el ID del país dinámicamente
    if (formData.pais) {
      const countryId = getCountryId(odooUrl, db, uid, password, formData.pais);
      if (countryId) {
        odooLeadData['country_id'] = countryId;
        Logger.log("ID de país encontrado y asignado: " + countryId + " para " + formData.pais);
      } else {
        Logger.log("No se encontró ID para el país: " + formData.pais + ", usando Argentina por defecto");
      }
    } else {
      Logger.log("No se proporcionó información del país, usando Argentina por defecto (ID: 10)");
    }

    // Buscar el ID de la provincia
    if (formData.provincia) {
      const provinceId = getProvinceId(odooUrl, db, uid, password, formData.provincia, odooLeadData['country_id']);
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
      try {        // Buscar o crear la campaña basada en el evento
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
          // Actualizar el lead con el origen encontrado/creado
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
    
    // Analizar el tipo de error para proporcionar información específica
    const errorMessage = error.message || error.toString();
    
    // Si el error contiene información sobre duplicados, lo tratamos como tal
    if (errorMessage.toLowerCase().includes('duplicate') || 
        errorMessage.toLowerCase().includes('duplicado') ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('ya existe')) {
      Logger.log("Error identificado como duplicado basado en respuesta del servidor");
      return { 
        success: false, 
        error: "Lead duplicado según el servidor de Odoo: " + errorMessage,
        isDuplicate: true
      };
    }
    
    // Para otros errores, devolver la información general
    return { success: false, error: errorMessage };
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
    
    Logger.log("Nuevo origen creado with ID: " + newSourceId);
    return newSourceId;
  } catch (error) {
    Logger.log("Error al obtener/crear origen: " + error.toString());
    return null;
  }
}

// Función para obtener o crear un medio en Odoo
function getMediumId(url, db, uid, password, mediumName) {
  if (!mediumName) return null;
  
  try {
    const existingMediums = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'utm.medium',
      'search_read',
      [[['name', '=', mediumName]], ['id', 'name'], 0, 1]
    );
    
    if (existingMediums && existingMediums.length > 0) {
      Logger.log("Medio encontrado con ID: " + existingMediums[0].id);
      return existingMediums[0].id;
    }
    
    const newMediumId = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'utm.medium',
      'create',
      [{ 'name': mediumName }]
    );
    
    Logger.log("Nuevo medio creado con ID: " + newMediumId);
    return newMediumId;
  } catch (error) {
    Logger.log("Error al obtener/crear medio: " + error.toString());
    return null;
  }
}

// Función para buscar el ID del país en Odoo
function getCountryId(url, db, uid, password, countryName) {
  if (!countryName) return false;
  
  try {
    Logger.log("Buscando país: " + countryName);
    
    // Normalizar el nombre del país para la búsqueda
    const normalizedName = countryName.trim().toLowerCase();
    
    // Mapeo de nombres comunes de países a sus nombres en Odoo
    const countryMapping = {
      'argentina': 'Argentina',
      'brasil': 'Brazil',
      'brazil': 'Brazil',
      'chile': 'Chile',
      'uruguay': 'Uruguay',
      'paraguay': 'Paraguay',
      'bolivia': 'Bolivia',
      'peru': 'Peru',
      'perú': 'Peru',
      'colombia': 'Colombia',
      'venezuela': 'Venezuela',
      'ecuador': 'Ecuador',
      'mexico': 'Mexico',
      'méxico': 'Mexico',
      'estados unidos': 'United States',
      'united states': 'United States',
      'usa': 'United States',
      'eeuu': 'United States',
      'españa': 'Spain',
      'spain': 'Spain',
      'francia': 'France',
      'france': 'France',
      'alemania': 'Germany',
      'germany': 'Germany',
      'italia': 'Italy',
      'italy': 'Italy',
      'reino unido': 'United Kingdom',
      'united kingdom': 'United Kingdom',
      'uk': 'United Kingdom'
    };
    
    // Intentar encontrar el nombre normalizado del país
    const mappedCountryName = countryMapping[normalizedName] || countryName;
    
    // Buscar el país por nombre exacto
    let countryIds = xmlrpcExecute(
      url,
      db,
      uid,
      password,
      'res.country',
      'search',
      [[['name', '=', mappedCountryName]]]
    );
    
    // Si no se encuentra, intentar buscar con ilike (no distingue mayúsculas/minúsculas y es parcial)
    if (!countryIds || countryIds.length === 0) {
      countryIds = xmlrpcExecute(
        url,
        db,
        uid,
        password,
        'res.country',
        'search',
        [[['name', 'ilike', mappedCountryName]]]
      );
    }
    
    // Si encontramos resultados, devolver el primer ID
    if (countryIds && countryIds.length > 0) {
      Logger.log("País encontrado con ID: " + countryIds[0]);
      return countryIds[0];
    }
    
    Logger.log("No se encontró el país: " + countryName + ", usando Argentina por defecto");
    return 10; // ID por defecto para Argentina
  } catch (error) {
    Logger.log("Error al buscar país: " + error.toString());
    return 10; // ID por defecto para Argentina en caso de error
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
  
  Logger.log(`=== INICIANDO PROCESAMIENTO DE ${formDataArray.length} FORMULARIOS ===`);
  
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
        destinations: { ...previousStatus }, // Preservar estados anteriores exitosos
        newAttempts: {} // Registro de nuevos intentos realizados en esta ejecución
      };
      
      Logger.log(`\n--- PROCESANDO FORMULARIO ${formData.timestamp} ---`);
      Logger.log(`Nombre: ${formData.nombre} ${formData.apellido}, Email: ${formData.mail}, Teléfono: ${formData.telefono}`);
      Logger.log(`Estados previos: Forms:${previousStatus.forms}, Bitrix:${previousStatus.bitrix}, Wazzup:${previousStatus.wazzup}, Odoo:${previousStatus.odoo}`);
      
      // Contar intentos necesarios
      const pendingDestinations = [];
      if (!previousStatus.forms) pendingDestinations.push('Google Forms');
      if (!previousStatus.bitrix) pendingDestinations.push('Bitrix24');
      if (!previousStatus.wazzup) pendingDestinations.push('WhatsApp');
      if (!previousStatus.odoo) pendingDestinations.push('Odoo');
      
      if (pendingDestinations.length === 0) {
        Logger.log("TODOS LOS DESTINOS YA FUERON ENVIADOS EXITOSAMENTE - SALTANDO");
        resultObj.success = true;
        results.push(resultObj);
        continue;
      }
      
      Logger.log(`Destinos pendientes: ${pendingDestinations.join(', ')}`);
      
      // ---- Google Forms ----
      if (!previousStatus.forms) {
        Logger.log("→ Intentando envío a Google Forms...");
        resultObj.newAttempts.forms = true;
        try {
          const formsResult = sendDataToForm(formData);
          resultObj.destinations.forms = formsResult.success;
          if (!formsResult.success) {
            resultObj.errors.forms = formsResult.message || "Error en Google Forms";
            Logger.log("✗ Google Forms falló: " + resultObj.errors.forms);
          } else {
            Logger.log("✓ Google Forms exitoso");
          }
        } catch (formError) {
          resultObj.destinations.forms = false;
          resultObj.errors.forms = "Error en Google Forms: " + formError.message;
          Logger.log("✗ Error al enviar a Google Forms: " + formError.toString());
        }
      } else {
        Logger.log("✓ Google Forms ya fue enviado anteriormente - saltando");
        resultObj.destinations.forms = true;
      }      
      // ---- Bitrix24 ----
      if (!previousStatus.bitrix) {
        Logger.log("→ Intentando envío a Bitrix24...");
        resultObj.newAttempts.bitrix = true;
        try {
          const bitrixResult = sendDataToBitrix(formData, formData.concatenatedCheckboxes);
          resultObj.destinations.bitrix = bitrixResult.success;
          if (!bitrixResult.success) {
            resultObj.errors.bitrix = bitrixResult.message || "Error en Bitrix";
            Logger.log("✗ Bitrix24 falló: " + resultObj.errors.bitrix);
          } else {
            Logger.log("✓ Bitrix24 exitoso");
          }
        } catch (bitrixError) {
          resultObj.destinations.bitrix = false;
          resultObj.errors.bitrix = "Error en Bitrix: " + bitrixError.message;
          Logger.log("✗ Error al enviar a Bitrix: " + bitrixError.toString());
        }
      } else {
        Logger.log("✓ Bitrix24 ya fue enviado anteriormente - saltando");
        resultObj.destinations.bitrix = true;
      }
      
      // ---- Wazzup ----
      if (!previousStatus.wazzup) {
        Logger.log("→ Intentando envío a Wazzup...");
        resultObj.newAttempts.wazzup = true;
        try {          const wazzupResult = sendWazzupMessage(
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
            formData.empresaOperador,
            formData.pais
          );
          resultObj.destinations.wazzup = wazzupResult.success;
          if (!wazzupResult.success) {
            resultObj.errors.wazzup = wazzupResult.message || "Error en Wazzup";
            Logger.log("✗ Wazzup falló: " + resultObj.errors.wazzup);
          } else {
            Logger.log("✓ Wazzup exitoso");
          }
        } catch (wazzupError) {
          resultObj.destinations.wazzup = false;
          resultObj.errors.wazzup = "Error en Wazzup: " + wazzupError.message;
          Logger.log("✗ Error al enviar a Wazzup: " + wazzupError.toString());
        }
      } else {
        Logger.log("✓ Wazzup ya fue enviado anteriormente - saltando");
        resultObj.destinations.wazzup = true;
      }
        // ---- Odoo ----
      if (!previousStatus.odoo) {
        Logger.log("→ Intentando envío a Odoo...");
        resultObj.newAttempts.odoo = true;
        try {
          const odooResult = createOdooLead(formData);
          resultObj.destinations.odoo = odooResult.success;
          if (!odooResult.success) {
            resultObj.errors.odoo = odooResult.error || "Error en Odoo";
            Logger.log("✗ Odoo falló: " + resultObj.errors.odoo);
            
            // Si es un duplicado según la respuesta del servidor, lo consideramos como exitoso para evitar reintentos infinitos
            if (odooResult.isDuplicate) {
              Logger.log("↺ Duplicado detectado por servidor - marcando como exitoso para evitar reintentos");
              resultObj.destinations.odoo = true;
              resultObj.errors.odoo = `Duplicado según servidor: ${odooResult.error}`;
            }
          } else {
            Logger.log("✓ Odoo exitoso - Lead ID: " + (odooResult.lead_id || 'N/A'));
          }
        } catch (odooError) {
          resultObj.destinations.odoo = false;
          resultObj.errors.odoo = "Error en Odoo: " + odooError.message;
          Logger.log("✗ Error al enviar a Odoo: " + odooError.toString());
        }
      } else {
        Logger.log("✓ Odoo ya fue enviado anteriormente - saltando");
        resultObj.destinations.odoo = true;
      }      
      // Determinar si el formulario fue completamente exitoso
      // Solo falla si algún destino que se intentó enviar falló
      const anyFailedDestination = !resultObj.destinations.forms || 
                                   !resultObj.destinations.bitrix || 
                                   !resultObj.destinations.wazzup || 
                                   !resultObj.destinations.odoo;
      
      resultObj.success = !anyFailedDestination;
      
      // Log del resumen del resultado
      Logger.log(`\n--- RESUMEN FORMULARIO ${formData.timestamp} ---`);
      Logger.log(`Éxito general: ${resultObj.success ? '✓' : '✗'}`);
      Logger.log(`Estados finales:`);
      Logger.log(`  • Google Forms: ${resultObj.destinations.forms ? '✓' : '✗'} ${resultObj.newAttempts.forms ? '(nuevo intento)' : '(estado previo)'}`);
      Logger.log(`  • Bitrix24: ${resultObj.destinations.bitrix ? '✓' : '✗'} ${resultObj.newAttempts.bitrix ? '(nuevo intento)' : '(estado previo)'}`);
      Logger.log(`  • WhatsApp: ${resultObj.destinations.wazzup ? '✓' : '✗'} ${resultObj.newAttempts.wazzup ? '(nuevo intento)' : '(estado previo)'}`);
      Logger.log(`  • Odoo: ${resultObj.destinations.odoo ? '✓' : '✗'} ${resultObj.newAttempts.odoo ? '(nuevo intento)' : '(estado previo)'}`);
      
      if (Object.keys(resultObj.errors).length > 0) {
        Logger.log(`Errores reportados:`);
        Object.keys(resultObj.errors).forEach(dest => {
          Logger.log(`  • ${dest}: ${resultObj.errors[dest]}`);
        });
      }
      
      // Registrar el resultado
      results.push(resultObj);
      
    } catch (generalError) {
      // Error general no capturado en ningún bloque específico
      Logger.log(`\n✗ ERROR GENERAL procesando formulario ${formData.timestamp}: ${generalError.toString()}`);
      results.push({
        id: formData.timestamp,
        success: false,
        errors: { general: generalError.message || "Error desconocido al procesar el formulario" },
        destinations: { forms: false, bitrix: false, wazzup: false, odoo: false },
        newAttempts: { forms: true, bitrix: true, wazzup: true, odoo: true }
      });
    }
  }
  
  // Resumen final
  const successCount = results.filter(r => r.success).length;
  const partialCount = results.filter(r => !r.success && (r.destinations.forms || r.destinations.bitrix || r.destinations.wazzup || r.destinations.odoo)).length;
  const failedCount = results.filter(r => !r.success && !r.destinations.forms && !r.destinations.bitrix && !r.destinations.wazzup && !r.destinations.odoo).length;
  
  Logger.log(`\n=== RESUMEN FINAL DEL PROCESAMIENTO ===`);
  Logger.log(`Total procesados: ${results.length}`);
  Logger.log(`Completamente exitosos: ${successCount}`);
  Logger.log(`Parcialmente exitosos: ${partialCount}`);
  Logger.log(`Completamente fallidos: ${failedCount}`);
  
  return results;
}

// Función de test para validar la búsqueda de campañas por evento
function testCampaignSearch() {
  try {
    Logger.log("=== INICIANDO TEST DE BÚSQUEDA DE CAMPAÑAS ===");
    
    // Configuración de Odoo
    const odooUrl = "https://dye.quilsoft.com";
    const db = "dye_prod";
    const login = "maused@dyesa.com";
    const password = "967ce27624f6e6bfdf1b674efcbc2fda5603796e";
    
    // Autenticación en Odoo
    const uid = xmlrpcLogin(odooUrl, db, login, password);
    Logger.log("Autenticación exitosa en Odoo con UID: " + uid);
    
    // Test con diferentes nombres de eventos
    const testEvents = [
      "Agroactiva 2025",
      "AgroActiva 2025", 
      "Event Test",
      "Feria de Tecnología Agrícola"
    ];
    
    testEvents.forEach(eventName => {
      Logger.log(`\n--- Testing evento: "${eventName}" ---`);
      const campaignId = getCampaignId(odooUrl, db, uid, password, eventName);
      if (campaignId) {
        Logger.log(`✓ Campaña encontrada/creada para "${eventName}" con ID: ${campaignId}`);
      } else {
        Logger.log(`✗ No se pudo crear/encontrar campaña para "${eventName}"`);
      }
    });
    
    Logger.log("\n=== TEST DE CAMPAÑAS COMPLETADO ===");
    return { success: true, message: "Test completado correctamente" };
    
  } catch (error) {
    Logger.log("Error en test de campañas: " + error.toString());
    return { success: false, error: error.message };
  }
}

// Función de test para validar el sistema de reintentos separados
function testRetrySystem() {
  Logger.log("=== INICIANDO TEST COMPLETO DE SISTEMA DE REINTENTOS ===");
  
  // Test 1: Formulario completamente nuevo (todos los destinos deben intentarse)
  Logger.log("\n--- TEST 1: FORMULARIO NUEVO ---");
  const testFormData1 = {
    timestamp: new Date().toISOString(),
    nombre: "Test",
    apellido: "Usuario",
    telefono: "1234567890",
    mail: "test@test.com",
    localidad: "Buenos Aires",
    provincia: "Buenos Aires",
    pais: "Argentina",
    evento: "Test Event",
    concatenatedCheckboxes: "Test Vertical",
    operadorApp: "Test Operator",
    empresaOperador: "Test Company",
    comercialAsignado: "Test Commercial"
  };
  
  Logger.log("Test con formulario completamente nuevo - todos los destinos deben intentarse");
  const results1 = processOfflineData([testFormData1]);
  Logger.log("Resultado del test 1:");
  Logger.log(JSON.stringify(results1[0], null, 2));
  
  // Test 2: Formulario con algunos destinos ya exitosos
  Logger.log("\n--- TEST 2: FORMULARIO CON DESTINOS PARCIALES ---");
  const testFormData2 = {
    timestamp: new Date().toISOString(),
    nombre: "Test2",
    apellido: "Usuario2",
    telefono: "0987654321",
    mail: "test2@test.com",
    localidad: "Córdoba",
    provincia: "Córdoba",
    pais: "Argentina",
    evento: "Test Event 2",
    concatenatedCheckboxes: "Test Vertical 2",
    operadorApp: "Test Operator 2",
    empresaOperador: "Test Company 2",
    comercialAsignado: "Test Commercial 2",
    destinations: {
      forms: true,   // Ya fue enviado exitosamente
      bitrix: false, // Falló anteriormente
      wazzup: false, // Falló anteriormente  
      odoo: true     // Ya fue enviado exitosamente
    }
  };
  
  Logger.log("Test con destinos parcialmente completados:");
  Logger.log("✓ Google Forms (exitoso anterior) ✗ Bitrix24 (falló anterior) ✗ WhatsApp (falló anterior) ✓ Odoo (exitoso anterior)");
  Logger.log("Solo Bitrix24 y WhatsApp deben intentarse");
  
  const results2 = processOfflineData([testFormData2]);
  Logger.log("Resultado del test 2:");
  Logger.log(JSON.stringify(results2[0], null, 2));
  
  // Test 3: Formulario ya completamente exitoso
  Logger.log("\n--- TEST 3: FORMULARIO COMPLETAMENTE EXITOSO ---");
  const testFormData3 = {
    timestamp: new Date().toISOString(),
    nombre: "Test3",
    apellido: "Usuario3",
    telefono: "1122334455",
    mail: "test3@test.com",
    localidad: "Rosario",
    provincia: "Santa Fe",
    pais: "Argentina",
    evento: "Test Event 3",
    concatenatedCheckboxes: "Test Vertical 3",
    destinations: {
      forms: true,   // Ya fue enviado exitosamente
      bitrix: true,  // Ya fue enviado exitosamente
      wazzup: true,  // Ya fue enviado exitosamente
      odoo: true     // Ya fue enviado exitosamente
    }
  };
  
  Logger.log("Test con todos los destinos ya exitosos - ningún destino debe intentarse");
  const results3 = processOfflineData([testFormData3]);
  Logger.log("Resultado del test 3:");
  Logger.log(JSON.stringify(results3[0], null, 2));
  
  Logger.log("\n=== TEST DE REINTENTOS COMPLETADO ===");
  Logger.log("Verificar que:");
  Logger.log("- Test 1: Se intentaron todos los destinos");
  Logger.log("- Test 2: Solo se intentaron Bitrix24 y WhatsApp");
  Logger.log("- Test 3: No se intentó ningún destino");
  
  return [results1, results2, results3];
}

// Función helper para debugging - mostrar estado actual de formularios offline
function debugOfflineQueue() {
  Logger.log("=== ESTADO ACTUAL DE LA COLA OFFLINE ===");
  
  try {
    // Esta función debe ser llamada desde el frontend con offlineStorage.forms
    // Aquí solo proveemos la estructura para logging del backend
    Logger.log("Para ver el estado actual de la cola offline:");
    Logger.log("1. Abrir DevTools en el navegador (F12)");
    Logger.log("2. En la consola, ejecutar: console.log('Formularios offline:', offlineStorage.forms)");
    Logger.log("3. Para ver estadísticas: console.log('Stats:', stats)");
    Logger.log("4. Para forzar sincronización: offlineStorage.syncForms()");
    
    return {
      message: "Para debugging, usar DevTools del navegador",
      instructions: [
        "F12 para abrir DevTools",
        "console.log('Formularios offline:', offlineStorage.forms)",
        "console.log('Stats:', stats)",
        "offlineStorage.syncForms() para forzar sync"
      ]
    };
  } catch (error) {
    Logger.log("Error en debugOfflineQueue: " + error.toString());
    return { error: error.message };
  }
}

// Función para limpiar logs antiguos y optimizar rendimiento
function cleanOldLogs() {
  Logger.log("=== LIMPIEZA DE LOGS ANTIGUOS ===");
  Logger.log("Los logs de Google Apps Script se limpian automáticamente después de un tiempo.");
  Logger.log("Para logs más permanentes, considerar usar Google Sheets como log.");
  return { message: "Limpieza iniciada - los logs se gestionan automáticamente" };
}

// Función de prueba para verificar el nuevo manejo de duplicados en Odoo
function testSimplifiedOdooDuplicateHandling() {
  Logger.log("=== PRUEBA DEL MANEJO SIMPLIFICADO DE DUPLICADOS EN ODOO ===");
  
  // Datos de prueba - usar datos que probablemente ya existen en Odoo
  const testFormData = {
    nombre: "Test",
    apellido: "Duplicado",
    telefono: "+5491123456789",
    mail: "test.duplicado@ejemplo.com",
    localidad: "Buenos Aires",
    provincia: "Buenos Aires",
    pais: "Argentina",
    concatenatedCheckboxes: "Test de duplicado",
    evento: "Test Event",
    operadorApp: "Test Operator",
    empresaOperador: "Test Company",
    comercialAsignado: "Test Commercial",
    timestamp: new Date().toISOString()
  };
  
  Logger.log("Enviando datos de prueba para verificar manejo de duplicados...");
  Logger.log(`Datos: ${testFormData.nombre} ${testFormData.apellido}, ${testFormData.mail}, ${testFormData.telefono}`);
  
  try {
    // Primer envío
    Logger.log("\n--- PRIMER ENVÍO ---");
    const firstResult = createOdooLead(testFormData);
    Logger.log(`Resultado primer envío: ${JSON.stringify(firstResult)}`);
    
    // Segundo envío (debería ser duplicado)
    Logger.log("\n--- SEGUNDO ENVÍO (DEBERÍA SER DUPLICADO) ---");
    const secondResult = createOdooLead(testFormData);
    Logger.log(`Resultado segundo envío: ${JSON.stringify(secondResult)}`);
    
    // Análisis de resultados
    Logger.log("\n--- ANÁLISIS DE RESULTADOS ---");
    if (firstResult.success && secondResult.success) {
      Logger.log("✓ Ambos envíos fueron exitosos - posiblemente Odoo permitió el duplicado");
    } else if (firstResult.success && !secondResult.success) {
      if (secondResult.isDuplicate) {
        Logger.log("✓ Manejo correcto: Primer envío exitoso, segundo identificado como duplicado");
      } else {
        Logger.log("⚠ Segundo envío falló pero no fue identificado como duplicado");
      }
    } else if (!firstResult.success && !secondResult.success) {
      Logger.log("✗ Ambos envíos fallaron - revisar configuración");
    }
    
    return {
      firstResult: firstResult,
      secondResult: secondResult,
      message: "Prueba completada - revisar logs para detalles"
    };
    
  } catch (error) {
    Logger.log("Error durante la prueba: " + error.toString());
    return {
      error: error.message,
      message: "Prueba falló debido a error"
    };
  }
}

// Función para formatear números de teléfono según el país
function formatPhoneByCountry(phone, country) {
  // Eliminar caracteres no numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Normalizar el nombre del país
  const normalizedCountry = country ? country.trim().toLowerCase() : 'argentina';
  
  // Prefijos por país
  const countryPrefixes = {
    'argentina': '549',
    'paraguay': '595',
    'uruguay': '598'
  };
  
  const prefix = countryPrefixes[normalizedCountry] || '549'; // Argentina por defecto
  
  // Si el número ya tiene el prefijo, devolverlo como está
  if (cleanPhone.startsWith(prefix)) {
    return cleanPhone;
  }
  
  // Agregar el prefijo correspondiente
  return `${prefix}${cleanPhone}`;
}

// Función de test para validar el sistema de validación de teléfonos por país
function testPhoneValidationByCountry() {
  Logger.log("=== INICIANDO TEST DE VALIDACIÓN DE TELÉFONOS POR PAÍS ===");
  
  // Test casos válidos
  Logger.log("\n--- TEST DE CASOS VÁLIDOS ---");
  
  // Argentina: exactamente 10 dígitos
  const argentinianPhone = "1123456789";
  const formattedArgentinian = formatPhoneByCountry(argentinianPhone, "Argentina");
  Logger.log(`Argentina - Entrada: ${argentinianPhone}, Salida: ${formattedArgentinian}, Esperado: 5491123456789`);
  
  // Paraguay: mínimo 9 dígitos
  const paraguayanPhone = "987654321";
  const formattedParaguayan = formatPhoneByCountry(paraguayanPhone, "Paraguay");
  Logger.log(`Paraguay - Entrada: ${paraguayanPhone}, Salida: ${formattedParaguayan}, Esperado: 595987654321`);
  
  // Uruguay: mínimo 8 dígitos
  const uruguayanPhone = "98765432";
  const formattedUruguayan = formatPhoneByCountry(uruguayanPhone, "Uruguay");
  Logger.log(`Uruguay - Entrada: ${uruguayanPhone}, Salida: ${formattedUruguayan}, Esperado: 59898765432`);
  
  // Test con números que ya tienen prefijo
  Logger.log("\n--- TEST CON PREFIJOS EXISTENTES ---");
  const phoneWithPrefix = "5491123456789";
  const formattedWithPrefix = formatPhoneByCountry(phoneWithPrefix, "Argentina");
  Logger.log(`Con prefijo - Entrada: ${phoneWithPrefix}, Salida: ${formattedWithPrefix}, Esperado: 5491123456789`);
  
  // Test casos por defecto
  Logger.log("\n--- TEST CASOS POR DEFECTO ---");
  const unknownCountryPhone = "1123456789";
  const formattedUnknown = formatPhoneByCountry(unknownCountryPhone, "Brasil");
  Logger.log(`País desconocido - Entrada: ${unknownCountryPhone}, Salida: ${formattedUnknown}, Esperado: 5491123456789 (Argentina por defecto)`);
  
  Logger.log("\n=== TEST DE VALIDACIÓN DE TELÉFONOS COMPLETADO ===");
  Logger.log("Verificar que:");
  Logger.log("- Argentina: se agrega prefijo 549");
  Logger.log("- Paraguay: se agrega prefijo 595");
  Logger.log("- Uruguay: se agrega prefijo 598");
  Logger.log("- Países desconocidos: usan Argentina (549) por defecto");
  Logger.log("- Números con prefijo existente: no se duplican");
}