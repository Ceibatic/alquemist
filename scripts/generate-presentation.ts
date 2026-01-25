import pptxgen from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";

// ============================================
// ALQUEMIST DESIGN SYSTEM
// ============================================
const COLORS = {
  primary: "1B5E20", // Verde
  accent: "FFC107", // Amarillo
  text: "0F172A", // Texto oscuro
  textLight: "FFFFFF", // Texto claro
  background: "FFFFFF", // Fondo
  muted: "64748B", // Gris
  lightGreen: "E8F5E9", // Verde claro para fondos
};

const FONTS = {
  title: "Arial",
  body: "Arial",
};

// ============================================
// CREATE PRESENTATION
// ============================================
const pptx = new pptxgen();

// Metadata
pptx.author = "Ceibatic";
pptx.title = "Alquemist - Cannabis Regulado";
pptx.subject = "Propuesta de Valor";
pptx.company = "Ceibatic";

// Layout 16:9
pptx.layout = "LAYOUT_16x9";

// Define master slides
pptx.defineSlideMaster({
  title: "TITLE_SLIDE",
  background: { color: COLORS.primary },
});

pptx.defineSlideMaster({
  title: "CONTENT_SLIDE",
  background: { color: COLORS.background },
});

// ============================================
// SLIDE 1: PORTADA
// ============================================
const slide1 = pptx.addSlide({ masterName: "TITLE_SLIDE" });

slide1.addText("ALQUEMIST", {
  x: 0.5,
  y: 2.5,
  w: "90%",
  h: 1.2,
  fontSize: 60,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

slide1.addText("Sistema de Gestion de Produccion\npara Cannabis Regulado", {
  x: 0.5,
  y: 3.7,
  w: "90%",
  h: 1,
  fontSize: 28,
  fontFace: FONTS.body,
  color: COLORS.textLight,
});

slide1.addShape("rect", {
  x: 0.5,
  y: 4.8,
  w: 2,
  h: 0.1,
  fill: { color: COLORS.accent },
});

slide1.addText("www.alquemist.co", {
  x: 0.5,
  y: 5.1,
  w: "90%",
  fontSize: 14,
  fontFace: FONTS.body,
  color: COLORS.accent,
});

// ============================================
// SLIDE 2: EL PROBLEMA
// ============================================
const slide2 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

// Header bar
slide2.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide2.addText("El Problema", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

const problems = [
  {
    icon: "!",
    title: "Falta de Trazabilidad",
    desc: "Multas de $50M - $500M COP por incumplimiento regulatorio",
  },
  {
    icon: "!",
    title: "Perdidas por Plagas",
    desc: "Deteccion tardia = $100M+ COP en cosechas perdidas",
  },
  {
    icon: "!",
    title: "Gestion Manual",
    desc: "30% del tiempo en papeleo y seguimiento",
  },
  {
    icon: "!",
    title: "Sistemas Desconectados",
    desc: "Datos inconsistentes, auditorias fallidas",
  },
];

problems.forEach((problem, idx) => {
  const y = 1.3 + idx * 1.1;

  // Icon circle
  slide2.addShape("ellipse", {
    x: 0.5,
    y: y,
    w: 0.5,
    h: 0.5,
    fill: { color: COLORS.accent },
  });

  slide2.addText(problem.icon, {
    x: 0.5,
    y: y + 0.05,
    w: 0.5,
    h: 0.4,
    fontSize: 20,
    fontFace: FONTS.title,
    color: COLORS.text,
    bold: true,
    align: "center",
  });

  slide2.addText(problem.title, {
    x: 1.2,
    y: y,
    w: 8,
    fontSize: 20,
    fontFace: FONTS.title,
    color: COLORS.text,
    bold: true,
  });

  slide2.addText(problem.desc, {
    x: 1.2,
    y: y + 0.35,
    w: 8,
    fontSize: 14,
    fontFace: FONTS.body,
    color: COLORS.muted,
  });
});

// ============================================
// SLIDE 3: LA SOLUCION
// ============================================
const slide3 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide3.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide3.addText("La Solucion: Alquemist", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

slide3.addText(
  "Plataforma SaaS que digitaliza y automatiza toda tu operacion de cannabis en un solo lugar: desde la toma de clones hasta la cosecha, con trazabilidad completa para cumplimiento regulatorio.",
  {
    x: 0.5,
    y: 1.3,
    w: 9,
    fontSize: 18,
    fontFace: FONTS.body,
    color: COLORS.text,
    lineSpacing: 28,
  }
);

const features = [
  "Trazabilidad 100% para cumplimiento ICA/FNE",
  "Deteccion de plagas con IA - 3x mas rapido",
  "Scheduling automatico de 47+ actividades",
  "Multi-instalacion - todas tus fincas en un lugar",
];

features.forEach((feature, idx) => {
  const y = 2.5 + idx * 0.6;

  slide3.addShape("rect", {
    x: 0.5,
    y: y + 0.1,
    w: 0.3,
    h: 0.3,
    fill: { color: COLORS.accent },
  });

  slide3.addText(feature, {
    x: 1,
    y: y,
    w: 8,
    fontSize: 16,
    fontFace: FONTS.body,
    color: COLORS.text,
  });
});

// ============================================
// SLIDE 4: CICLO DE PRODUCCION
// ============================================
const slide4 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide4.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide4.addText("El Ciclo de Produccion", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

const cycleSteps = [
  { title: "PLANTILLA", desc: "Configura el\n'como' producir" },
  { title: "ORDEN", desc: "Planifica el\n'que' producir" },
  { title: "LOTES", desc: "Ejecuta el\n'dia a dia'" },
  { title: "COSECHA", desc: "Registra\nresultados" },
];

cycleSteps.forEach((step, idx) => {
  const x = 0.8 + idx * 2.5;
  const y = 2;

  // Box
  slide4.addShape("roundRect", {
    x: x,
    y: y,
    w: 2,
    h: 2,
    fill: { color: idx === 0 ? COLORS.primary : COLORS.lightGreen },
    line: { color: COLORS.primary, width: 2 },
  });

  // Title
  slide4.addText(step.title, {
    x: x,
    y: y + 0.3,
    w: 2,
    fontSize: 14,
    fontFace: FONTS.title,
    color: idx === 0 ? COLORS.textLight : COLORS.primary,
    bold: true,
    align: "center",
  });

  // Desc
  slide4.addText(step.desc, {
    x: x,
    y: y + 0.9,
    w: 2,
    fontSize: 11,
    fontFace: FONTS.body,
    color: idx === 0 ? COLORS.textLight : COLORS.text,
    align: "center",
  });

  // Arrow (except last)
  if (idx < 3) {
    slide4.addText("→", {
      x: x + 1.9,
      y: y + 0.7,
      w: 0.6,
      fontSize: 24,
      fontFace: FONTS.body,
      color: COLORS.primary,
      bold: true,
    });
  }
});

slide4.addText("De la semilla a la cosecha, con trazabilidad completa", {
  x: 0.5,
  y: 4.5,
  w: "90%",
  fontSize: 16,
  fontFace: FONTS.body,
  color: COLORS.muted,
  align: "center",
  italic: true,
});

// ============================================
// SLIDE 5: PLANTILLAS
// ============================================
const slide5 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide5.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide5.addText("Plantillas de Produccion", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

slide5.addText("Define una vez, reutiliza siempre", {
  x: 0.5,
  y: 1.1,
  w: 9,
  fontSize: 16,
  fontFace: FONTS.body,
  color: COLORS.muted,
  italic: true,
});

// Table data
const templateTable = [
  [
    { text: "Elemento", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Descripcion", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Ejemplo Cannabis", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
  ],
  [{ text: "Fases" }, { text: "Etapas del ciclo" }, { text: "Propagacion → Veg → Flor → Cosecha" }],
  [{ text: "Actividades" }, { text: "Tareas programadas" }, { text: "Riego, Fertilizacion, Poda, IPM" }],
  [{ text: "Controles QC" }, { text: "Inspecciones" }, { text: "Tricomas, Plagas, pH" }],
  [{ text: "Consumo" }, { text: "Insumos por fase" }, { text: "Clonex, Fertilizante, Neem" }],
];

slide5.addTable(templateTable, {
  x: 0.5,
  y: 1.6,
  w: 9,
  fontFace: FONTS.body,
  fontSize: 12,
  color: COLORS.text,
  border: { type: "solid", color: COLORS.muted, pt: 0.5 },
  rowH: 0.5,
});

slide5.addText("Tipos de scheduling: Dia especifico | Recurrente | Cada N dias | Dependiente", {
  x: 0.5,
  y: 4.5,
  w: 9,
  fontSize: 13,
  fontFace: FONTS.body,
  color: COLORS.primary,
  bold: true,
});

// ============================================
// SLIDE 6: ORDENES Y LOTES
// ============================================
const slide6 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide6.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide6.addText("Ordenes de Produccion y Lotes", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

// Order flow
const orderStates = ["PLANNING", "APROBADA", "ACTIVA", "COMPLETADA"];
orderStates.forEach((state, idx) => {
  const x = 0.5 + idx * 2.4;
  slide6.addShape("roundRect", {
    x: x,
    y: 1.2,
    w: 2,
    h: 0.5,
    fill: { color: idx === 2 ? COLORS.primary : COLORS.lightGreen },
    line: { color: COLORS.primary },
  });
  slide6.addText(state, {
    x: x,
    y: 1.25,
    w: 2,
    fontSize: 11,
    fontFace: FONTS.title,
    color: idx === 2 ? COLORS.textLight : COLORS.primary,
    bold: true,
    align: "center",
  });
  if (idx < 3) {
    slide6.addText("→", {
      x: x + 1.9,
      y: 1.25,
      w: 0.5,
      fontSize: 16,
      color: COLORS.primary,
    });
  }
});

// Batch operations
slide6.addText("Operaciones sobre Lotes:", {
  x: 0.5,
  y: 2.1,
  w: 9,
  fontSize: 16,
  fontFace: FONTS.title,
  color: COLORS.text,
  bold: true,
});

const batchOps = [
  ["Mover", "Cambiar de area (Veg → Flor)"],
  ["Registrar perdida", "Documentar plantas eliminadas"],
  ["Dividir", "Separar en 2+ lotes"],
  ["Combinar", "Unir lotes compatibles"],
  ["Cosechar", "Registrar peso y calidad"],
];

batchOps.forEach((op, idx) => {
  const y = 2.5 + idx * 0.45;
  slide6.addText("•  " + op[0] + ": ", {
    x: 0.5,
    y: y,
    w: 2,
    fontSize: 13,
    fontFace: FONTS.body,
    color: COLORS.primary,
    bold: true,
  });
  slide6.addText(op[1], {
    x: 2.3,
    y: y,
    w: 7,
    fontSize: 13,
    fontFace: FONTS.body,
    color: COLORS.text,
  });
});

slide6.addText("Trazabilidad completa: cada operacion queda registrada con fecha, usuario y notas", {
  x: 0.5,
  y: 4.8,
  w: 9,
  fontSize: 12,
  fontFace: FONTS.body,
  color: COLORS.muted,
  italic: true,
});

// ============================================
// SLIDE 7: ACTIVIDADES Y QC CON IA
// ============================================
const slide7 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide7.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide7.addText("Actividades y Control de Calidad con IA", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

// Left column - Activities
slide7.addText("Calendario de Actividades", {
  x: 0.5,
  y: 1.1,
  w: 4.5,
  fontSize: 16,
  fontFace: FONTS.title,
  color: COLORS.text,
  bold: true,
});

slide7.addShape("rect", {
  x: 0.5,
  y: 1.5,
  w: 4.5,
  h: 2.5,
  fill: { color: COLORS.lightGreen },
  line: { color: COLORS.primary },
});

const activities = [
  "08:00  Revision ambiental",
  "09:00  Riego + Fertilizacion",
  "10:30  Toma de clones",
  "14:00  IPM Preventivo",
];

activities.forEach((act, idx) => {
  slide7.addText("[ ]  " + act, {
    x: 0.7,
    y: 1.7 + idx * 0.5,
    w: 4,
    fontSize: 12,
    fontFace: FONTS.body,
    color: COLORS.text,
  });
});

// Right column - AI
slide7.addText("Deteccion de Plagas con IA", {
  x: 5.3,
  y: 1.1,
  w: 4.5,
  fontSize: 16,
  fontFace: FONTS.title,
  color: COLORS.text,
  bold: true,
});

const aiSteps = [
  "1. Tomas foto de las plantas",
  "2. IA analiza la imagen",
  "3. Identifica: Arana roja (87%)",
  "4. Genera alerta + tratamiento",
];

aiSteps.forEach((step, idx) => {
  slide7.addText(step, {
    x: 5.3,
    y: 1.5 + idx * 0.5,
    w: 4.5,
    fontSize: 13,
    fontFace: FONTS.body,
    color: idx === 2 ? COLORS.primary : COLORS.text,
    bold: idx === 2,
  });
});

slide7.addShape("roundRect", {
  x: 5.3,
  y: 3.6,
  w: 4.5,
  h: 0.6,
  fill: { color: COLORS.accent },
});

slide7.addText("Deteccion 3x mas rapida que inspeccion manual", {
  x: 5.3,
  y: 3.7,
  w: 4.5,
  fontSize: 12,
  fontFace: FONTS.body,
  color: COLORS.text,
  bold: true,
  align: "center",
});

// ============================================
// SLIDE 8: CASO WHITE WIDOW
// ============================================
const slide8 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide8.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide8.addText("Caso de Uso: White Widow - 119 Dias", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

const phases = [
  { name: "Propagacion", days: "1-14", desc: "Clones, hormona, raices" },
  { name: "Vegetativo", days: "15-42", desc: "Trasplante, nutricion, poda" },
  { name: "Floracion", days: "43-105", desc: "12/12, defoliacion, tricomas" },
  { name: "Cosecha", days: "106-119", desc: "Corte, secado, curado" },
];

// Timeline
phases.forEach((phase, idx) => {
  const x = 0.5 + idx * 2.4;
  const width = idx === 2 ? 2.2 : idx === 1 ? 1.8 : 1.4;

  // Phase bar
  slide8.addShape("rect", {
    x: x,
    y: 1.5,
    w: width,
    h: 0.8,
    fill: { color: COLORS.primary },
  });

  slide8.addText(phase.name, {
    x: x,
    y: 1.6,
    w: width,
    fontSize: 12,
    fontFace: FONTS.title,
    color: COLORS.textLight,
    bold: true,
    align: "center",
  });

  slide8.addText(phase.days + "d", {
    x: x,
    y: 1.95,
    w: width,
    fontSize: 10,
    fontFace: FONTS.body,
    color: COLORS.accent,
    align: "center",
  });

  // Description below
  slide8.addText(phase.desc, {
    x: x,
    y: 2.5,
    w: 2.3,
    fontSize: 11,
    fontFace: FONTS.body,
    color: COLORS.text,
  });
});

// Result box
slide8.addShape("roundRect", {
  x: 0.5,
  y: 3.5,
  w: 9,
  h: 1.2,
  fill: { color: COLORS.lightGreen },
  line: { color: COLORS.primary, width: 2 },
});

slide8.addText("Resultado: 50 plantas → 22.5 kg cosecha | Calidad A | Trazabilidad 100%", {
  x: 0.5,
  y: 3.85,
  w: 9,
  fontSize: 16,
  fontFace: FONTS.body,
  color: COLORS.primary,
  bold: true,
  align: "center",
});

// ============================================
// SLIDE 9: CUMPLIMIENTO
// ============================================
const slide9 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide9.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide9.addText("Cumplimiento Regulatorio", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

slide9.addText("Trazabilidad para ICA / FNE", {
  x: 0.5,
  y: 1.1,
  w: 9,
  fontSize: 18,
  fontFace: FONTS.title,
  color: COLORS.text,
  bold: true,
});

const complianceTable = [
  [
    { text: "Requisito", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Como Alquemist lo cumple", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
  ],
  [{ text: "Origen de material" }, { text: "Registro de planta madre, proveedor" }],
  [{ text: "Historial de lote" }, { text: "Cada movimiento, actividad, perdida" }],
  [{ text: "Aplicaciones IPM" }, { text: "Producto, cantidad, fecha, responsable" }],
  [{ text: "Condiciones ambientales" }, { text: "Registros diarios con timestamp" }],
  [{ text: "Cosecha" }, { text: "Peso, calidad, fecha, destino" }],
];

slide9.addTable(complianceTable, {
  x: 0.5,
  y: 1.6,
  w: 9,
  fontFace: FONTS.body,
  fontSize: 13,
  color: COLORS.text,
  border: { type: "solid", color: COLORS.muted, pt: 0.5 },
  rowH: 0.55,
});

slide9.addText("Exportacion de datos en Excel/PDF para auditorias", {
  x: 0.5,
  y: 4.7,
  w: 9,
  fontSize: 14,
  fontFace: FONTS.body,
  color: COLORS.muted,
});

// ============================================
// SLIDE 10: PLANES Y PRECIOS
// ============================================
const slide10 = pptx.addSlide({ masterName: "CONTENT_SLIDE" });

slide10.addShape("rect", {
  x: 0,
  y: 0,
  w: "100%",
  h: 0.8,
  fill: { color: COLORS.primary },
});

slide10.addText("Planes y Precios", {
  x: 0.5,
  y: 0.15,
  w: "90%",
  h: 0.5,
  fontSize: 28,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

const pricingTable = [
  [
    { text: "Plan", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Fincas", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Usuarios", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Precio/mes", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
    { text: "Early Adopter", options: { bold: true, fill: { color: COLORS.primary }, color: COLORS.textLight } },
  ],
  [{ text: "Trial" }, { text: "1" }, { text: "3" }, { text: "GRATIS" }, { text: "30 dias" }],
  [
    { text: "Starter", options: { bold: true } },
    { text: "1" },
    { text: "10" },
    { text: "$359,000" },
    { text: "$179,500", options: { bold: true, color: COLORS.primary } },
  ],
  [
    { text: "Pro", options: { bold: true } },
    { text: "3" },
    { text: "50" },
    { text: "$990,000" },
    { text: "$495,000", options: { bold: true, color: COLORS.primary } },
  ],
  [
    { text: "Enterprise", options: { bold: true } },
    { text: "Ilimitado" },
    { text: "Ilimitado" },
    { text: "$3,999,000+" },
    { text: "$1,999,500", options: { bold: true, color: COLORS.primary } },
  ],
];

slide10.addTable(pricingTable, {
  x: 0.5,
  y: 1.2,
  w: 9,
  fontFace: FONTS.body,
  fontSize: 13,
  color: COLORS.text,
  border: { type: "solid", color: COLORS.muted, pt: 0.5 },
  rowH: 0.6,
  align: "center",
});

// Early adopter banner
slide10.addShape("roundRect", {
  x: 2,
  y: 4,
  w: 6,
  h: 0.8,
  fill: { color: COLORS.accent },
});

slide10.addText("EARLY ADOPTER: 50% OFF por 6 meses", {
  x: 2,
  y: 4.15,
  w: 6,
  fontSize: 18,
  fontFace: FONTS.title,
  color: COLORS.text,
  bold: true,
  align: "center",
});

// ============================================
// SLIDE 11: PROXIMOS PASOS
// ============================================
const slide11 = pptx.addSlide({ masterName: "TITLE_SLIDE" });

slide11.addText("Proximos Pasos", {
  x: 0.5,
  y: 1.5,
  w: "90%",
  fontSize: 40,
  fontFace: FONTS.title,
  color: COLORS.textLight,
  bold: true,
});

const nextSteps = [
  { num: "1", text: "Demo personalizada - 30 minutos con tu equipo" },
  { num: "2", text: "Prueba gratuita - 30 dias sin compromiso" },
  { num: "3", text: "Implementacion - 4 semanas de firma a produccion" },
];

nextSteps.forEach((step, idx) => {
  const y = 2.5 + idx * 0.8;

  slide11.addShape("ellipse", {
    x: 0.5,
    y: y,
    w: 0.6,
    h: 0.6,
    fill: { color: COLORS.accent },
  });

  slide11.addText(step.num, {
    x: 0.5,
    y: y + 0.1,
    w: 0.6,
    fontSize: 20,
    fontFace: FONTS.title,
    color: COLORS.text,
    bold: true,
    align: "center",
  });

  slide11.addText(step.text, {
    x: 1.3,
    y: y + 0.1,
    w: 8,
    fontSize: 18,
    fontFace: FONTS.body,
    color: COLORS.textLight,
  });
});

slide11.addShape("rect", {
  x: 0.5,
  y: 4.8,
  w: 2,
  h: 0.1,
  fill: { color: COLORS.accent },
});

slide11.addText("info@ceibatic.com  |  www.alquemist.co", {
  x: 0.5,
  y: 5,
  w: "90%",
  fontSize: 16,
  fontFace: FONTS.body,
  color: COLORS.accent,
});

// ============================================
// SAVE FILE
// ============================================
const outputDir = path.join(__dirname, "../docs/sales");
const outputPath = path.join(outputDir, "Alquemist-Cannabis-Pitch.pptx");

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log(`\n✅ Presentacion generada exitosamente!`);
  console.log(`📁 Archivo: ${outputPath}`);
  console.log(`📊 Slides: 11`);
  console.log(`🎨 Colores: Verde #1B5E20 + Amarillo #FFC107`);
});
