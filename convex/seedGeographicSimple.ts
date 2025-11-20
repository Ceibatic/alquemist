/**
 * Simple Geographic Data Seeder for Colombia
 * Seeds all 33 departments + municipalities from major departments
 */

import { mutation } from "./_generated/server";

export const clearData = mutation({
  args: {},
  handler: async (ctx) => {
    const allRecords = await ctx.db
      .query("geographic_locations")
      .withIndex("by_country", (q) => q.eq("country_code", "CO"))
      .collect();

    for (const record of allRecords) {
      await ctx.db.delete(record._id);
    }

    return {
      message: "Cleared",
      count: allRecords.length,
    };
  },
});

export const seedAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // ALL 33 DEPARTMENTS OF COLOMBIA
    const depts = [
      ["05", "Antioquia", 6.2518, -75.5636],
      ["08", "Atlántico", 10.9639, -74.7964],
      ["11", "Bogotá D.C.", 4.7110, -74.0721],
      ["13", "Bolívar", 10.3910, -75.4794],
      ["15", "Boyacá", 5.4545, -73.3625],
      ["17", "Caldas", 5.0689, -75.5174],
      ["18", "Caquetá", 1.6145, -75.6062],
      ["19", "Cauca", 2.4448, -76.6147],
      ["20", "Cesar", 9.3373, -73.6536],
      ["23", "Córdoba", 8.7479, -75.8814],
      ["25", "Cundinamarca", 5.0214, -74.0575],
      ["27", "Chocó", 5.6978, -76.6611],
      ["41", "Huila", 2.5359, -75.5277],
      ["44", "La Guajira", 11.5447, -72.9072],
      ["47", "Magdalena", 10.4113, -74.4054],
      ["50", "Meta", 3.3272, -73.2847],
      ["52", "Nariño", 1.2136, -77.2811],
      ["54", "Norte de Santander", 7.9465, -72.8988],
      ["63", "Quindío", 4.4611, -75.6674],
      ["66", "Risaralda", 5.3200, -75.9927],
      ["68", "Santander", 7.1254, -73.1198],
      ["70", "Sucre", 9.1547, -75.3472],
      ["73", "Tolima", 4.4389, -75.2322],
      ["76", "Valle del Cauca", 3.4516, -76.5320],
      ["81", "Arauca", 7.0902, -70.7617],
      ["85", "Casanare", 5.7589, -71.5724],
      ["86", "Putumayo", 0.4945, -75.5236],
      ["88", "San Andrés y Providencia", 12.5847, -81.7006],
      ["91", "Amazonas", -1.4442, -71.6388],
      ["94", "Guainía", 2.5833, -68.5167],
      ["95", "Guaviare", 2.0833, -72.6389],
      ["97", "Vaupés", 0.8554, -70.8138],
      ["99", "Vichada", 4.4231, -69.2894],
    ];

    let deptCount = 0;
    for (const [code, name, lat, lon] of depts) {
      await ctx.db.insert("geographic_locations", {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: code as string,
        division_1_name: name as string,
        latitude: lat as number,
        longitude: lon as number,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      });
      deptCount++;
    }

    // MUNICIPALITIES - Sample from major departments
    const munis = [
      // Antioquia (30 principales)
      ["05001", "05", "Antioquia", "Medellín", 6.2476, -75.5658],
      ["05088", "05", "Antioquia", "Bello", 6.3377, -75.5603],
      ["05360", "05", "Antioquia", "Itagüí", 6.1849, -75.5994],
      ["05217", "05", "Antioquia", "Envigado", 6.1667, -75.5833],
      ["05631", "05", "Antioquia", "Sabaneta", 6.1512, -75.6169],
      ["05380", "05", "Antioquia", "La Estrella", 6.1583, -75.6417],
      ["05125", "05", "Antioquia", "Copacabana", 6.3486, -75.5078],
      ["05237", "05", "Antioquia", "Girardota", 6.3758, -75.4469],
      ["05079", "05", "Antioquia", "Barbosa", 6.4389, -75.3308],
      ["05129", "05", "Antioquia", "Caldas", 6.0917, -75.6333],
      ["05615", "05", "Antioquia", "Rionegro", 6.1436, -75.3758],
      ["05308", "05", "Antioquia", "Guarne", 6.2744, -75.4414],
      ["05440", "05", "Antioquia", "Marinilla", 6.1722, -75.3358],
      ["05148", "05", "Antioquia", "La Ceja", 6.0292, -75.4272],
      ["05101", "05", "Antioquia", "El Carmen de Viboral", 6.0806, -75.3361],
      ["05647", "05", "Antioquia", "San Vicente", 6.2889, -75.3303],
      ["05697", "05", "Antioquia", "Sonsón", 5.7083, -75.3111],
      ["05318", "05", "Antioquia", "Guatapé", 6.2297, -75.1728],
      ["05541", "05", "Antioquia", "El Peñol", 6.2167, -75.2333],
      ["05607", "05", "Antioquia", "Retiro", 6.0617, -75.5028],
      ["05038", "05", "Antioquia", "Andes", 5.6581, -75.8789],
      ["05234", "05", "Antioquia", "Fredonia", 5.9244, -75.6692],
      ["05837", "05", "Antioquia", "Turbo", 8.0928, -76.7269],
      ["05034", "05", "Antioquia", "Apartadó", 7.8833, -76.6333],
      ["05147", "05", "Antioquia", "Carepa", 7.7586, -76.6508],
      ["05190", "05", "Antioquia", "Chigorodó", 7.6667, -76.6833],
      ["05490", "05", "Antioquia", "Necoclí", 8.4167, -76.7833],
      ["05895", "05", "Antioquia", "Yarumal", 6.9650, -75.4178],
      ["05142", "05", "Antioquia", "Caucasia", 7.9867, -75.1939],
      ["05579", "05", "Antioquia", "El Bagre", 7.5975, -74.8083],

      // Bogotá
      ["11001", "11", "Bogotá D.C.", "Bogotá D.C.", 4.7110, -74.0721],

      // Cundinamarca (20 principales)
      ["25175", "25", "Cundinamarca", "Chía", 4.8619, -74.0517],
      ["25899", "25", "Cundinamarca", "Zipaquirá", 5.0219, -74.0039],
      ["25486", "25", "Cundinamarca", "Mosquera", 4.7061, -74.2325],
      ["25214", "25", "Cundinamarca", "Cajicá", 4.9186, -74.0289],
      ["25269", "25", "Cundinamarca", "Facatativá", 4.8139, -74.3547],
      ["25295", "25", "Cundinamarca", "Funza", 4.7161, -74.2111],
      ["25596", "25", "Cundinamarca", "Madrid", 4.7306, -74.2633],
      ["25758", "25", "Cundinamarca", "Soacha", 4.5794, -74.2169],
      ["25843", "25", "Cundinamarca", "Tocancipá", 4.9653, -73.9114],
      ["25245", "25", "Cundinamarca", "Cota", 4.8089, -74.1036],
      ["25754", "25", "Cundinamarca", "Sibaté", 4.4894, -74.2589],
      ["25807", "25", "Cundinamarca", "Tabio", 4.9211, -74.0956],
      ["25817", "25", "Cundinamarca", "Tenjo", 4.8711, -74.1464],
      ["25785", "25", "Cundinamarca", "Sopó", 4.9094, -73.9428],
      ["25290", "25", "Cundinamarca", "Fusagasugá", 4.3379, -74.3636],
      ["25260", "25", "Cundinamarca", "Girardot", 4.3011, -74.8031],
      ["25645", "25", "Cundinamarca", "Silvania", 4.4019, -74.3867],
      ["25394", "25", "Cundinamarca", "La Calera", 4.7219, -73.9681],
      ["25126", "25", "Cundinamarca", "Choachí", 4.5286, -73.9225],
      ["25335", "25", "Cundinamarca", "Guasca", 4.8656, -73.8744],

      // Valle del Cauca (10)
      ["76001", "76", "Valle del Cauca", "Cali", 3.4516, -76.5320],
      ["76111", "76", "Valle del Cauca", "Buenaventura", 3.8801, -77.0310],
      ["76520", "76", "Valle del Cauca", "Palmira", 3.5394, -76.3036],
      ["76834", "76", "Valle del Cauca", "Tuluá", 4.0850, -76.1950],
      ["76147", "76", "Valle del Cauca", "Cartago", 4.7467, -75.9117],
      ["76113", "76", "Valle del Cauca", "Buga", 3.9006, -76.2978],
      ["76892", "76", "Valle del Cauca", "Yumbo", 3.5833, -76.5000],
      ["76275", "76", "Valle del Cauca", "Florida", 3.3236, -76.2361],
      ["76400", "76", "Valle del Cauca", "Jamundí", 3.2636, -76.5369],
      ["76606", "76", "Valle del Cauca", "Roldanillo", 4.4133, -76.1519],

      // Atlántico (8)
      ["08001", "08", "Atlántico", "Barranquilla", 10.9685, -74.7813],
      ["08758", "08", "Atlántico", "Soledad", 10.9183, -74.7686],
      ["08433", "08", "Atlántico", "Malambo", 10.8594, -74.7739],
      ["08141", "08", "Atlántico", "Sabanalarga", 10.6339, -74.9211],
      ["08078", "08", "Atlántico", "Baranoa", 10.7942, -74.9164],
      ["08606", "08", "Atlántico", "Puerto Colombia", 10.9875, -74.9547],
      ["08296", "08", "Atlántico", "Galapa", 10.8972, -74.8811],
      ["08520", "08", "Atlántico", "Palmar de Varela", 10.7403, -74.7539],

      // Bolívar (6)
      ["13001", "13", "Bolívar", "Cartagena de Indias", 10.3910, -75.4794],
      ["13430", "13", "Bolívar", "Magangué", 9.2414, -74.7547],
      ["13244", "13", "Bolívar", "El Carmen de Bolívar", 9.7172, -75.1211],
      ["13490", "13", "Bolívar", "Mompox", 9.2378, -74.4278],
      ["13654", "13", "Bolívar", "Turbaco", 10.3386, -75.4247],
      ["13052", "13", "Bolívar", "Arjona", 10.2569, -75.3447],

      // Santander (8)
      ["68001", "68", "Santander", "Bucaramanga", 7.1254, -73.1198],
      ["68276", "68", "Santander", "Floridablanca", 7.0639, -73.0864],
      ["68547", "68", "Santander", "Piedecuesta", 6.9833, -73.0500],
      ["68689", "68", "Santander", "Girón", 7.0661, -73.1694],
      ["68081", "68", "Santander", "Barrancabermeja", 7.0653, -73.8547],
      ["68679", "68", "Santander", "San Gil", 6.5575, -73.1333],
      ["68755", "68", "Santander", "Socorro", 6.4697, -73.2597],
      ["68190", "68", "Santander", "Cúcuta", 7.8939, -72.5078],

      // Caldas (6)
      ["17001", "17", "Caldas", "Manizales", 5.0689, -75.5174],
      ["17380", "17", "Caldas", "La Dorada", 5.4508, -74.6658],
      ["17174", "17", "Caldas", "Chinchiná", 4.9825, -75.6056],
      ["17513", "17", "Caldas", "Palestina", 5.0556, -75.6464],
      ["17653", "17", "Caldas", "Riosucio", 5.4214, -75.7028],
      ["17877", "17", "Caldas", "Viterbo", 5.0694, -75.8722],

      // Quindío (8)
      ["63001", "63", "Quindío", "Armenia", 4.5339, -75.6811],
      ["63111", "63", "Quindío", "Calarcá", 4.5289, -75.6419],
      ["63190", "63", "Quindío", "Circasia", 4.6172, -75.6350],
      ["63272", "63", "Quindío", "Filandia", 4.6739, -75.6578],
      ["63401", "63", "Quindío", "La Tebaida", 4.4506, -75.7872],
      ["63470", "63", "Quindío", "Montenegro", 4.5619, -75.7511],
      ["63548", "63", "Quindío", "Quimbaya", 4.6203, -75.7639],
      ["63690", "63", "Quindío", "Salento", 4.6378, -75.5703],

      // Risaralda (4)
      ["66001", "66", "Risaralda", "Pereira", 4.8133, -75.6961],
      ["66170", "66", "Risaralda", "Dosquebradas", 4.8392, -75.6728],
      ["66682", "66", "Risaralda", "Santa Rosa de Cabal", 4.8689, -75.6206],
      ["66383", "66", "Risaralda", "La Virginia", 4.9011, -75.8839],

      // Tolima (6)
      ["73001", "73", "Tolima", "Ibagué", 4.4389, -75.2322],
      ["73268", "73", "Tolima", "Espinal", 4.1489, -74.8836],
      ["73461", "73", "Tolima", "Melgar", 4.2042, -74.6403],
      ["73043", "73", "Tolima", "Chaparral", 3.7239, -75.4856],
      ["73411", "73", "Tolima", "Líbano", 4.9197, -75.0636],
      ["73449", "73", "Tolima", "Mariquita", 5.1978, -74.8881],
    ];

    let muniCount = 0;
    for (const [code, deptCode, deptName, name, lat, lon] of munis) {
      await ctx.db.insert("geographic_locations", {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: deptCode as string,
        division_1_name: deptName as string,
        division_2_code: code as string,
        division_2_name: name as string,
        parent_division_1_code: deptCode as string,
        latitude: lat as number,
        longitude: lon as number,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      });
      muniCount++;
    }

    return {
      message: "Seeded successfully",
      departments: deptCount,
      municipalities: muniCount,
      total: deptCount + muniCount,
    };
  },
});
