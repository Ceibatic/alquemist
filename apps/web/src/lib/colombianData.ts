/**
 * Colombian Geographic Data
 * Departments and major municipalities for registration
 */

export interface Department {
  name: string
  code: string
  municipalities: string[]
}

export const COLOMBIAN_DEPARTMENTS: Department[] = [
  {
    name: 'Antioquia',
    code: '05',
    municipalities: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Sabaneta', 'La Estrella', 'Caldas']
  },
  {
    name: 'Atlántico',
    code: '08',
    municipalities: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Galapa', 'Baranoa', 'Palmar de Varela']
  },
  {
    name: 'Bolívar',
    code: '13',
    municipalities: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar', 'San Pablo', 'Mompós', 'Simití']
  },
  {
    name: 'Boyacá',
    code: '15',
    municipalities: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Villa de Leyva', 'Paipa', 'Samacá', 'Moniquirá']
  },
  {
    name: 'Caldas',
    code: '17',
    municipalities: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 'Anserma', 'Salamina', 'Neira']
  },
  {
    name: 'Caquetá',
    code: '18',
    municipalities: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello', 'Belén de los Andaquíes', 'Albania']
  },
  {
    name: 'Cauca',
    code: '19',
    municipalities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Corinto', 'Guapi', 'Miranda']
  },
  {
    name: 'Cesar',
    code: '20',
    municipalities: ['Valledupar', 'Aguachica', 'Codazzi', 'La Paz', 'Curumaní', 'Bosconia', 'San Diego', 'Chimichagua']
  },
  {
    name: 'Córdoba',
    code: '23',
    municipalities: ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Planeta Rica', 'Montelíbano', 'Tierralta', 'San Bernardo del Viento']
  },
  {
    name: 'Cundinamarca',
    code: '25',
    municipalities: ['Bogotá D.C.', 'Soacha', 'Facatativá', 'Chía', 'Zipaquirá', 'Fusagasugá', 'Girardot', 'Madrid', 'Funza', 'Mosquera', 'Cajicá', 'Cota']
  },
  {
    name: 'Huila',
    code: '41',
    municipalities: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'Algeciras', 'San Agustín', 'Gigante']
  },
  {
    name: 'La Guajira',
    code: '44',
    municipalities: ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar', 'Fonseca', 'Villanueva', 'Albania']
  },
  {
    name: 'Magdalena',
    code: '47',
    municipalities: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato', 'Zona Bananera', 'Aracataca', 'Pivijay']
  },
  {
    name: 'Meta',
    code: '50',
    municipalities: ['Villavicencio', 'Acacías', 'Granada', 'San Martín', 'Puerto López', 'Cumaral', 'Restrepo', 'La Macarena']
  },
  {
    name: 'Nariño',
    code: '52',
    municipalities: ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'Barbacoas', 'La Unión', 'Samaniego', 'Sandoná']
  },
  {
    name: 'Norte de Santander',
    code: '54',
    municipalities: ['Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'Pamplona', 'El Zulia', 'Tibú', 'Sardinata']
  },
  {
    name: 'Putumayo',
    code: '86',
    municipalities: ['Mocoa', 'Puerto Asís', 'Valle del Guamuez', 'Orito', 'Puerto Guzmán', 'Villagarzón', 'Puerto Caicedo']
  },
  {
    name: 'Quindío',
    code: '63',
    municipalities: ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro', 'Quimbaya', 'Circasia', 'Filandia', 'Salento']
  },
  {
    name: 'Risaralda',
    code: '66',
    municipalities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Belén de Umbría']
  },
  {
    name: 'Santander',
    code: '68',
    municipalities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Málaga', 'Socorro']
  },
  {
    name: 'Tolima',
    code: '73',
    municipalities: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Chaparral', 'Líbano', 'Purificación', 'Mariquita']
  },
  {
    name: 'Valle del Cauca',
    code: '76',
    municipalities: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Jamundí', 'Buga', 'Yumbo', 'Candelaria', 'Roldanillo']
  }
]

export const getDepartmentByName = (name: string): Department | undefined => {
  return COLOMBIAN_DEPARTMENTS.find(dept => dept.name === name)
}

export const getMunicipalitiesByDepartment = (departmentName: string): string[] => {
  const department = getDepartmentByName(departmentName)
  return department?.municipalities || []
}
