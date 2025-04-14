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

function processOfflineData(formDataArray) {
  const results = [];
  
  for (const formData of formDataArray) {
    try {
      const formsResult = sendDataToForm(formData);
      const bitrixResult = sendDataToBitrix(formData, formData.concatenatedCheckboxes);
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
        success: formsResult.success && bitrixResult.success && wazzupResult.success,
        errors: {
          forms: !formsResult.success ? "Error en Google Forms" : null,
          bitrix: !bitrixResult.success ? bitrixResult.message : null,
          wazzup: !wazzupResult.success ? wazzupResult.message : null
        }
      });
    } catch (error) {
      results.push({
        id: formData.timestamp,
        success: false,
        errors: {
          general: error.message || "Error desconocido al procesar el formulario"
        }
      });
    }
  }
  
  return results;
}

