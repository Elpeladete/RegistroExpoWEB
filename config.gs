const CONFIG = {
  API: {
    WAZZUP: {
      URL: "https://api.wazzup24.com/v3/message",
      KEY: "5f5261984014423db79fb7c890789d91",
      CHANNEL_ID: "9f635cf7-1ee8-4fab-be65-d91ca6eadc70"
    },
    BITRIX: {
      URL: "https://dye.bitrix24.com/rest/1017/8dkpeiwb7jwszi8q/crm.lead.add.json"
    },
    GOOGLE_FORMS: {
      URL: "https://docs.google.com/forms/d/e/1FAIpQLSeMgPwBKlaUpWUuAa2lJP8g5srO2cg3IEWs4YXZd4xdmgkjlw/formResponse"
    },
    LOCALIDADES: {
      CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTGUaoj9BAFuYQW4_3VRSn8sgxZuWPPfadnpE4RefsvvTkNDSpej6aeF2TdNdiK0SkcMcWsO30WrnVz/pub?output=csv"
    },
    ODOO: {
      URL: "https://dye.quilsoft.com",
      USERNAME: "maused@dyesa.com",
      PASSWORD: "AusedM",
      DATABASE: "dyesa_test",
      MODEL: "crm.lead",
      STAGE: "Nuevo",
      TYPE: "lead",
      PRIORITY: "0"
    }
  },
  APP: {
    VERSION: "V2R032.180325",
    MAX_BATCH_SIZE: 5,
    RETRY_LIMIT: 3,
    SYNC_INTERVAL: 30000,
    IMAGES: {
      FAVICON: "https://i.ibb.co/3mNwdJWt/SP.png",
      LOGO: "https://i.ibb.co/mCzJTHyn/Service-Plus-Icon.png",
      VERTICALS: {
        WEED_SEEKER: "https://i.ibb.co/svRLJc0/Weed-Seeker.jpg",
        SIEMBRA: "https://i.ibb.co/dDVbr35/Siembra.jpg",
        AUTOGUIA: "https://i.ibb.co/dGZVBZd/Autoguia.jpg",
        TAPS: "https://i.ibb.co/XSTN821/TAPs.jpg",
        PULVERIZACION: "https://i.ibb.co/BcnMsfX/Pulverizacion.jpg",
        DJI: "https://i.ibb.co/0mPx08M/DJI.jpg"
      }
    }
  },
  COMERCIALES: {
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
  },
  ESPECIALISTAS: {
    VERTICALES: {
      WEEDSEEKER: {
        nombre: "Pablo Casas",
        telefono: "5493472508703"
      },
      SIEMBRA: {
        nombre: "Juan Manuel Silva",
        telefono: "5493472545342"
      },
      TAPS_ACCION_QR: {
        nombre: "Ailín Borracci",
        telefono: "5491127072016"
      },
      DRONES_DJI: {
        nombre: "Matías Koller",
        telefono: "5491126603601"
      }
    }
  }
};