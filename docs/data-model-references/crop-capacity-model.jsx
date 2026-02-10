import { useState, useMemo } from "react";

const CROP_PRESETS = {
  cannabis_indoor: {
    label: "Cannabis Indoor",
    environment: "indoor",
    icon: "🌿",
    defaults: {
      zones: 1,
      structuresPerZone: 4,
      levelsPerStructure: 2,
      containersPerLevel: 5,
      positionsPerContainer: 16,
      containerType: "bandeja",
      structureType: "rack_movil",
      containerDimensions: "4' × 8' (1.2 × 2.4m)",
      spacingNotes: "SOG: 16-25 pl/m² | Estándar: 9-16 pl/m² | ScrOG: 1-4 pl/m²",
    },
  },
  cannabis_outdoor: {
    label: "Cannabis Outdoor",
    environment: "outdoor",
    icon: "☀️",
    defaults: {
      zones: 1,
      structuresPerZone: 10,
      levelsPerStructure: 1,
      containersPerLevel: 1,
      positionsPerContainer: 50,
      containerType: "cama_elevada",
      structureType: "cama",
      containerDimensions: "30m × 1.5m",
      spacingNotes: "Auto: 0.3m entre plantas | Foto: 1.2-1.8m entre plantas",
    },
  },
  arandanos_suelo: {
    label: "Arándanos Campo",
    environment: "outdoor",
    icon: "🫐",
    defaults: {
      zones: 1,
      structuresPerZone: 20,
      levelsPerStructure: 1,
      containersPerLevel: 1,
      positionsPerContainer: 33,
      containerType: "hilera_suelo",
      structureType: "hilera",
      containerDimensions: "100m × 1m (entre hileras 3m)",
      spacingNotes: "Estándar: 3.0×1.0m = 3,333/ha | Alta densidad: 2.5×0.6m = 6,667/ha",
    },
  },
  arandanos_maceta: {
    label: "Arándanos Sustrato",
    environment: "indoor",
    icon: "🫐",
    defaults: {
      zones: 1,
      structuresPerZone: 20,
      levelsPerStructure: 1,
      containersPerLevel: 1,
      positionsPerContainer: 55,
      containerType: "maceta_sustrato",
      structureType: "hilera_tunel",
      containerDimensions: "100m lineal (macetas 45L a 0.6m)",
      spacingNotes: "Contenedor: 3.0×0.6m = 5,556/ha | Dinámico: inicio 10K → 5K/ha",
    },
  },
  frutales_manzano: {
    label: "Manzanos",
    environment: "outdoor",
    icon: "🍎",
    defaults: {
      zones: 1,
      structuresPerZone: 10,
      levelsPerStructure: 1,
      containersPerLevel: 1,
      positionsPerContainer: 100,
      containerType: "posicion_suelo",
      structureType: "hilera_espaldera",
      containerDimensions: "100m hilera (árboles a 1m, hileras 3.5m)",
      spacingNotes: "Tradicional: 250/ha | Tall Spindle: 2,500-3,570/ha | Super: 5,500/ha",
    },
  },
  citricos: {
    label: "Cítricos",
    environment: "outdoor",
    icon: "🍊",
    defaults: {
      zones: 1,
      structuresPerZone: 10,
      levelsPerStructure: 1,
      containersPerLevel: 1,
      positionsPerContainer: 28,
      containerType: "posicion_suelo",
      structureType: "hilera",
      containerDimensions: "100m hilera (árboles a 3.5m, hileras 6m)",
      spacingNotes: "Tradicional: 200-400/ha | Intensivo: 600-865/ha | SHD: 1,600-2,200/ha",
    },
  },
  lechuga_vertical: {
    label: "Lechuga VF",
    environment: "indoor",
    icon: "🥬",
    defaults: {
      zones: 1,
      structuresPerZone: 6,
      levelsPerStructure: 8,
      containersPerLevel: 4,
      positionsPerContainer: 30,
      containerType: "canal_nft",
      structureType: "rack_vertical",
      containerDimensions: "2.4m × 0.6m canal NFT",
      spacingNotes: "25-40 pl/m²/nivel × 8 niveles = 200-320 posiciones/m² piso",
    },
  },
  fresa_vertical: {
    label: "Fresas Indoor",
    environment: "indoor",
    icon: "🍓",
    defaults: {
      zones: 1,
      structuresPerZone: 4,
      levelsPerStructure: 6,
      containersPerLevel: 3,
      positionsPerContainer: 19,
      containerType: "canaleta",
      structureType: "rack_vertical",
      containerDimensions: "3m canaleta (6-8 pl/m lineal)",
      spacingNotes: "Tabletop: 6-12 pl/m² | Vertical 6 niveles: 90 pl/m² piso",
    },
  },
};

const HIERARCHY_COLORS = {
  facility: { bg: "#1a1a2e", text: "#e8e8e8", border: "#5c5c8a" },
  zone: { bg: "#16213e", text: "#a8d8ea", border: "#4a90d9" },
  structure: { bg: "#0f3d0f", text: "#b8e6b8", border: "#4caf50" },
  level: { bg: "#5d4037", text: "#ffe0b2", border: "#ff9800" },
  container: { bg: "#4a148c", text: "#e1bee7", border: "#ab47bc" },
  position: { bg: "#880e4f", text: "#f8bbd0", border: "#e91e63" },
};

const ENVIRONMENT_CONFIG = {
  indoor: {
    structureTypes: [
      { value: "rack_movil", label: "Rack Móvil Vertical" },
      { value: "rack_fijo", label: "Rack Fijo" },
      { value: "mesa_rolling", label: "Mesa/Rolling Bench" },
      { value: "rack_vertical", label: "Rack Vertical Farm" },
      { value: "hilera_tunel", label: "Hilera en Túnel/Invernadero" },
    ],
    containerTypes: [
      { value: "bandeja", label: "Bandeja (Tray)" },
      { value: "canal_nft", label: "Canal NFT" },
      { value: "canaleta", label: "Canaleta/Gutter" },
      { value: "maceta_sustrato", label: "Maceta en Sustrato" },
      { value: "panel_aeroponia", label: "Panel Aeroponía" },
    ],
  },
  outdoor: {
    structureTypes: [
      { value: "hilera", label: "Hilera/Fila" },
      { value: "cama", label: "Cama/Bed" },
      { value: "hilera_espaldera", label: "Hilera con Espaldera" },
      { value: "bloque", label: "Bloque/Parcela" },
    ],
    containerTypes: [
      { value: "posicion_suelo", label: "Posición en Suelo" },
      { value: "cama_elevada", label: "Cama Elevada/Raised Bed" },
      { value: "hilera_suelo", label: "Hilera en Suelo" },
      { value: "maceta_exterior", label: "Maceta Exterior" },
    ],
  },
};

function HierarchyCard({ label, labelEn, count, color, children, depth = 0 }) {
  return (
    <div style={{ border: `2px solid ${color.border}`, borderRadius: 10, marginTop: depth > 0 ? 8 : 0, marginLeft: depth > 0 ? 12 : 0, overflow: "hidden" }}>
      <div style={{ background: color.bg, color: color.text, padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
        <div>
          <span style={{ fontWeight: 700 }}>{label}</span>
          <span style={{ opacity: 0.6, marginLeft: 6, fontSize: 11 }}>({labelEn})</span>
        </div>
        {count !== undefined && (
          <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>×{count}</span>
        )}
      </div>
      {children && <div style={{ padding: "4px 6px 8px" }}>{children}</div>}
    </div>
  );
}

export default function CropCapacityModel() {
  const [selectedCrop, setSelectedCrop] = useState("cannabis_indoor");
  const [tab, setTab] = useState("model");

  const preset = CROP_PRESETS[selectedCrop];
  const [config, setConfig] = useState(preset.defaults);

  const handleCropChange = (crop) => {
    setSelectedCrop(crop);
    setConfig(CROP_PRESETS[crop].defaults);
  };

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const totalCapacity = useMemo(() => {
    const { zones, structuresPerZone, levelsPerStructure, containersPerLevel, positionsPerContainer } = config;
    const perContainer = positionsPerContainer;
    const perLevel = perContainer * containersPerLevel;
    const perStructure = perLevel * levelsPerStructure;
    const perZone = perStructure * structuresPerZone;
    const total = perZone * zones;
    return { perContainer, perLevel, perStructure, perZone, total };
  }, [config]);

  const envConfig = ENVIRONMENT_CONFIG[preset.environment];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: 16, background: "#fff", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#1a1a2e", letterSpacing: "-0.5px" }}>🏭 Modelo Universal de Capacidad por Área</h1>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Framework jerárquico estándar para medir capacidad de cualquier facility agrícola</p>
      </div>

      {/* Crop selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14, justifyContent: "center" }}>
        {Object.entries(CROP_PRESETS).map(([key, crop]) => (
          <button key={key} onClick={() => handleCropChange(key)} style={{ padding: "4px 10px", borderRadius: 8, border: selectedCrop === key ? "2px solid #4a90d9" : "1px solid #ddd", background: selectedCrop === key ? "#e8f0fe" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: selectedCrop === key ? 700 : 400, color: selectedCrop === key ? "#1a1a2e" : "#666", transition: "all 0.2s" }}>
            {crop.icon} {crop.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
        {[
          { id: "model", label: "📐 Modelo Jerárquico" },
          { id: "config", label: "⚙️ Configurador" },
          { id: "schema", label: "🗃️ Data Model" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", border: "none", borderBottom: tab === t.id ? "2px solid #4a90d9" : "2px solid transparent", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? "#1a1a2e" : "#999", marginBottom: -2, transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Hierarchy Model */}
      {tab === "model" && (
        <div>
          <div style={{ background: preset.environment === "indoor" ? "#1a1a2e" : "#0f3d0f", color: "#fff", padding: "8px 12px", borderRadius: "8px 8px 0 0", fontSize: 11, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <span>{preset.icon} {preset.label} — {preset.environment === "indoor" ? "🏢 Indoor" : "🌾 Outdoor"}</span>
            <span style={{ opacity: 0.65, fontSize: 10 }}>{config.spacingNotes}</span>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 12, background: "#fafafa" }}>
            <HierarchyCard label="Facility" labelEn="Instalación" color={HIERARCHY_COLORS.facility} depth={0}>
              <HierarchyCard label="Zona" labelEn="Zone / Room / Lote" count={config.zones} color={HIERARCHY_COLORS.zone} depth={1}>
                <HierarchyCard label="Estructura" labelEn={envConfig.structureTypes.find((s) => s.value === config.structureType)?.label || "Structure"} count={config.structuresPerZone} color={HIERARCHY_COLORS.structure} depth={2}>
                  <HierarchyCard label="Nivel" labelEn="Tier / Level" count={config.levelsPerStructure} color={HIERARCHY_COLORS.level} depth={3}>
                    <HierarchyCard label="Contenedor" labelEn={envConfig.containerTypes.find((c) => c.value === config.containerType)?.label || "Container"} count={config.containersPerLevel} color={HIERARCHY_COLORS.container} depth={4}>
                      <HierarchyCard label="Posición de Planta" labelEn="Plant Position" count={config.positionsPerContainer} color={HIERARCHY_COLORS.position} depth={5} />
                    </HierarchyCard>
                  </HierarchyCard>
                </HierarchyCard>
              </HierarchyCard>
            </HierarchyCard>
          </div>

          {/* Capacity calc */}
          <div style={{ marginTop: 14, background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius: 10, padding: 16, color: "#fff" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.5, marginBottom: 10 }}>Cálculo de Capacidad</div>
            <div style={{ fontSize: 12, lineHeight: 2.4, fontFamily: "monospace" }}>
              {[
                { label: "Por contenedor", color: "#ab47bc", val: `${totalCapacity.perContainer} plantas` },
                { label: "Por nivel", color: "#ff9800", val: `${totalCapacity.perContainer} × ${config.containersPerLevel} = ${totalCapacity.perLevel}` },
                { label: "Por estructura", color: "#4caf50", val: `${totalCapacity.perLevel} × ${config.levelsPerStructure} = ${totalCapacity.perStructure}` },
                { label: "Por zona", color: "#4a90d9", val: `${totalCapacity.perStructure} × ${config.structuresPerZone} = ${totalCapacity.perZone}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: row.color }}>{row.label}:</span>
                  <span style={{ fontWeight: 700 }}>{row.val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 8, marginTop: 6 }}>
                <span style={{ color: "#e91e63", fontWeight: 700 }}>TOTAL FACILITY:</span>
                <span style={{ fontWeight: 900, fontSize: 18 }}>{totalCapacity.total.toLocaleString()} plantas</span>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: 10, background: "rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 11, borderLeft: "3px solid #4a90d9" }}>
              <strong>Fórmula universal:</strong><br/>
              Capacidad = Zonas × Estructuras × Niveles × Contenedores × Posiciones<br/>
              <span style={{ opacity: 0.6 }}>{config.zones} × {config.structuresPerZone} × {config.levelsPerStructure} × {config.containersPerLevel} × {config.positionsPerContainer} = {totalCapacity.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Conceptual note */}
          <div style={{ marginTop: 12, padding: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 11, color: "#78350f", lineHeight: 1.6 }}>
            <strong>💡 Regla de oro del modelo:</strong> El <strong>Nivel (Tier)</strong> siempre existe — incluso en outdoor en suelo (level=1, height=0). Esto mantiene la fórmula multiplicativa universal sin excepciones condicionales. Growing Area = Footprint × Σ(niveles).
          </div>
        </div>
      )}

      {/* TAB: Configurator */}
      {tab === "config" && (
        <div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { key: "zones", label: "Zonas", desc: "Rooms, naves, lotes, invernaderos", color: HIERARCHY_COLORS.zone.border, min: 1, max: 50 },
              { key: "structuresPerZone", label: "Estructuras / Zona", desc: "Racks, hileras, camas, espalderas", color: HIERARCHY_COLORS.structure.border, min: 1, max: 200 },
              { key: "levelsPerStructure", label: "Niveles / Estructura", desc: "Pisos/tiers (1 para outdoor suelo)", color: HIERARCHY_COLORS.level.border, min: 1, max: 12 },
              { key: "containersPerLevel", label: "Contenedores / Nivel", desc: "Bandejas, canales, canaletas, segmentos", color: HIERARCHY_COLORS.container.border, min: 1, max: 50 },
              { key: "positionsPerContainer", label: "Posiciones / Contenedor", desc: "Spots individuales de planta", color: HIERARCHY_COLORS.position.border, min: 1, max: 500 },
            ].map((field) => (
              <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderLeft: `4px solid ${field.color}`, borderRadius: 8, background: "#f9f9f9", border: `1px solid #eee` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{field.label}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{field.desc}</div>
                </div>
                <input type="number" min={field.min} max={field.max} value={config[field.key]} onChange={(e) => updateConfig(field.key, Math.max(field.min, parseInt(e.target.value) || field.min))} style={{ width: 70, padding: "6px 8px", border: `2px solid ${field.color}`, borderRadius: 6, fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none", background: "#fff" }} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 10, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>Capacidad Total</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#15803d", lineHeight: 1.2 }}>{totalCapacity.total.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "#166534" }}>plantas</div>
            <div style={{ fontSize: 10, color: "#166534", opacity: 0.6, marginTop: 4 }}>
              {config.zones} zona(s) × {config.structuresPerZone} estructuras × {config.levelsPerStructure} nivel(es) × {config.containersPerLevel} contenedores × {config.positionsPerContainer} posiciones
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: 10, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#9a3412", fontWeight: 600, marginBottom: 4 }}>Tipo Estructura</div>
              <select value={config.structureType} onChange={(e) => updateConfig("structureType", e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #fed7aa", fontSize: 12 }}>
                {envConfig.structureTypes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ padding: 10, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#6b21a8", fontWeight: 600, marginBottom: 4 }}>Tipo Contenedor</div>
              <select value={config.containerType} onChange={(e) => updateConfig("containerType", e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #e9d5ff", fontSize: 12 }}>
                {envConfig.containerTypes.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Data Model */}
      {tab === "schema" && (
        <div style={{ fontSize: 12 }}>
          <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", marginBottom: 6 }}>📋 Esquema Relacional</div>
            <p style={{ color: "#475569", lineHeight: 1.6, margin: 0, fontSize: 12 }}>
              6 entidades jerárquicas que modelan cualquier facility agrícola. La clave: <strong>Level (Tier) siempre existe</strong> aunque sea 1 (outdoor en suelo), manteniendo la fórmula universal sin bifurcaciones.
            </p>
          </div>

          {[
            { name: "Facility", color: HIERARCHY_COLORS.facility, fields: [
              "id — UUID (PK)",
              "name — VARCHAR",
              "type — ENUM ['indoor_warehouse', 'greenhouse', 'tunnel', 'open_field', 'vertical_farm']",
              "total_footprint_m2 — DECIMAL",
              "total_growing_area_m2 — DECIMAL (calculado = footprint × niveles)",
              "total_plant_capacity — INT (calculado cascada)",
              "address — TEXT",
            ]},
            { name: "Zone", color: HIERARCHY_COLORS.zone, fields: [
              "id — UUID (PK)",
              "facility_id — FK → Facility",
              "name — VARCHAR ('Sala Veg', 'Nave 1', 'Lote Norte')",
              "purpose — ENUM ['propagation', 'vegetation', 'flowering', 'production']",
              "environment — ENUM ['indoor_controlled', 'greenhouse', 'tunnel', 'open_field']",
              "area_m2 — DECIMAL",
              "height_m — DECIMAL",
            ]},
            { name: "Structure", color: HIERARCHY_COLORS.structure, fields: [
              "id — UUID (PK)",
              "zone_id — FK → Zone",
              "type — ENUM ['mobile_rack', 'fixed_rack', 'rolling_bench', 'row', 'bed', 'trellis_row']",
              "name — VARCHAR ('Rack A1', 'Hilera 15')",
              "length_m — DECIMAL",
              "width_m — DECIMAL",
              "is_mobile — BOOLEAN",
              "num_levels — INT",
            ]},
            { name: "Level", color: HIERARCHY_COLORS.level, fields: [
              "id — UUID (PK)",
              "structure_id — FK → Structure",
              "level_number — INT (1 para suelo, 1-N para multi-piso)",
              "height_from_ground_m — DECIMAL",
              "clearance_m — DECIMAL (espacio libre sobre canopy)",
              "lighting_type — ENUM ['LED', 'HPS', 'natural', 'supplemental']",
              "irrigation_type — ENUM ['drip', 'NFT', 'DWC', 'aeroponic', 'sprinkler']",
            ]},
            { name: "Container", color: HIERARCHY_COLORS.container, fields: [
              "id — UUID (PK)",
              "level_id — FK → Level",
              "type — ENUM ['tray', 'nft_channel', 'gutter', 'substrate_pot', 'raised_bed', 'ground_row']",
              "dimensions — VARCHAR ('4x8 ft', '3m gutter')",
              "length_m — DECIMAL",
              "width_m — DECIMAL",
              "substrate — ENUM ['coco', 'rockwool', 'peat', 'soil', 'none']",
              "max_positions — INT",
            ]},
            { name: "PlantPosition", color: HIERARCHY_COLORS.position, fields: [
              "id — UUID (PK)",
              "container_id — FK → Container",
              "position_index — INT",
              "pot_size_L — DECIMAL (nullable)",
              "spacing_cm — DECIMAL (distancia al vecino)",
              "status — ENUM ['empty', 'planted', 'harvested', 'maintenance']",
              "plant_id — FK → Plant (nullable)",
            ]},
          ].map((entity) => (
            <div key={entity.name} style={{ border: `2px solid ${entity.color.border}`, borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ background: entity.color.bg, color: entity.color.text, padding: "6px 12px", fontWeight: 800, fontSize: 13 }}>{entity.name}</div>
              <div style={{ padding: "6px 12px", background: "#fff" }}>
                {entity.fields.map((f, i) => {
                  const [name, ...rest] = f.split("—");
                  return (
                    <div key={i} style={{ padding: "3px 0", fontSize: 11, fontFamily: "monospace", borderBottom: i < entity.fields.length - 1 ? "1px solid #f5f5f5" : "none", display: "flex", gap: 8 }}>
                      <span style={{ color: "#1a1a2e", fontWeight: 600, minWidth: 120 }}>{name.trim()}</span>
                      <span style={{ color: "#6366f1" }}>{rest.join("—").trim()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: 12, marginTop: 12, fontSize: 11, lineHeight: 1.7 }}>
            <strong style={{ color: "#065f46" }}>🔗 Relaciones y cálculos cascada:</strong>
            <div style={{ color: "#065f46", marginTop: 4 }}>
              Facility → has_many Zones → has_many Structures → has_many Levels → has_many Containers → has_many PlantPositions
            </div>
            <div style={{ color: "#065f46", marginTop: 6 }}>
              <strong>Capacidad total</strong> = SUM de PlantPositions activas en toda la cadena<br/>
              <strong>Growing Area</strong> = SUM(Structure.length × Structure.width × Structure.num_levels) por Zone<br/>
              <strong>Footprint</strong> = SUM(Structure.length × Structure.width) sin multiplicar niveles
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
