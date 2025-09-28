const axios = require('axios');

// Configuración de la API de Strapi
const STRAPI_URL = 'http://localhost:1337/api';

// Datos de ejemplo para las categorías
const categorias = [
  {
    nombre: 'Física',
    descripcion: 'Artículos sobre física teórica y experimental, mecánica cuántica, relatividad y más.',
    slug: 'fisica'
  },
  {
    nombre: 'Matemáticas',
    descripcion: 'Contenido sobre matemáticas puras y aplicadas, álgebra, análisis, topología y geometría.',
    slug: 'matematicas'
  },
  {
    nombre: 'Ingeniería',
    descripcion: 'Artículos sobre ingeniería en todas sus ramas, desde mecánica hasta sistemas complejos.',
    slug: 'ingenieria'
  },
  {
    nombre: 'Ciencias de la Computación',
    descripcion: 'Algoritmos, estructuras de datos, inteligencia artificial y ciencias de la computación.',
    slug: 'ciencias-computacion'
  }
];

// Datos de ejemplo para autores
const autores = [
  {
    nombre: 'Dr. María González',
    biografia: 'Doctora en Física Teórica por la Universidad de Barcelona. Especialista en mecánica cuántica y sus interpretaciones. Ha publicado más de 50 artículos en revistas internacionales.',
    email: 'maria.gonzalez@mindraxia.com',
    twitter: '@mariagonzalezphd',
    linkedin: 'maria-gonzalez-fisica'
  },
  {
    nombre: 'Prof. Carlos Rodríguez',
    biografia: 'Profesor de Matemáticas en el MIT. Experto en topología algebraica y sus aplicaciones en física de la materia condensada. Autor de varios libros de texto.',
    email: 'carlos.rodriguez@mindraxia.com',
    twitter: '@carlosmath',
    linkedin: 'carlos-rodriguez-math'
  },
  {
    nombre: 'Dra. Ana Martín',
    biografia: 'Ingeniera en Sistemas e investigadora en IA. Especialista en teoría de la información y machine learning. Fundadora de varios startups tecnológicos.',
    email: 'ana.martin@mindraxia.com',
    twitter: '@anamartinai',
    linkedin: 'ana-martin-ia'
  }
];

async function crearCategorias() {
  console.log('🏷️  Creando categorías...');
  
  for (const categoria of categorias) {
    try {
      const response = await axios.post(`${STRAPI_URL}/categorias`, {
        data: categoria
      });
      console.log(`✅ Categoría creada: ${categoria.nombre}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️  Categoría ya existe: ${categoria.nombre}`);
      } else {
        console.error(`❌ Error creando categoría ${categoria.nombre}:`, error.message);
      }
    }
  }
}

async function crearAutores() {
  console.log('👥 Creando autores...');
  
  for (const autor of autores) {
    try {
      const response = await axios.post(`${STRAPI_URL}/autores`, {
        data: autor
      });
      console.log(`✅ Autor creado: ${autor.nombre}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️  Autor ya existe: ${autor.nombre}`);
      } else {
        console.error(`❌ Error creando autor ${autor.nombre}:`, error.message);
      }
    }
  }
}

async function crearArticulos() {
  console.log('📝 Creando artículos de ejemplo...');
  
  // Primero obtenemos las categorías y autores creados
  try {
    const [categoriasResponse, autoresResponse] = await Promise.all([
      axios.get(`${STRAPI_URL}/categorias`),
      axios.get(`${STRAPI_URL}/autores`)
    ]);
    
    const categoriasData = categoriasResponse.data.data;
    const autoresData = autoresResponse.data.data;
    
    const articulos = [
      {
        titulo: 'Mecánica Cuántica: Interpretaciones y Paradojas',
        resumen: 'Un análisis profundo de las diferentes interpretaciones de la mecánica cuántica y sus implicaciones filosóficas.',
        contenido: `
# Mecánica Cuántica: Interpretaciones y Paradojas

La mecánica cuántica es una de las teorías más exitosas y a la vez más desconcertantes de la física moderna. Desde su formulación en las primeras décadas del siglo XX, ha generado debates filosóficos que continúan hasta hoy.

## Las Interpretaciones Principales

### Interpretación de Copenhague
La interpretación más tradicional, propuesta por Niels Bohr y Werner Heisenberg, establece que...

### Interpretación de Muchos Mundos
Hugh Everett III propuso en 1957 una interpretación radical que sugiere...

### Interpretación de Variables Ocultas
David Bohm desarrolló una interpretación determinista que...

## Conclusiones

La mecánica cuántica nos enseña que la realidad es mucho más extraña de lo que nuestro sentido común sugiere.
        `,
        slug: 'mecanica-cuantica-interpretaciones-paradojas',
        fechaPublicacion: '2024-01-15T10:00:00.000Z',
        tiempoLectura: 12,
        etiquetas: ['mecánica cuántica', 'física teórica', 'filosofía de la ciencia'],
        autor: autoresData.find(a => a.attributes.nombre === 'Dr. María González')?.id,
        categoria: categoriasData.find(c => c.attributes.nombre === 'Física')?.id
      },
      {
        titulo: 'Topología Algebraica en la Física Moderna',
        resumen: 'Cómo los conceptos de topología algebraica han revolucionado nuestra comprensión de la materia condensada.',
        contenido: `
# Topología Algebraica en la Física Moderna

La topología algebraica ha emergido como una herramienta fundamental en la física de la materia condensada, proporcionando nuevas perspectivas sobre fenómenos cuánticos.

## Fundamentos Matemáticos

### Espacios Topológicos
Un espacio topológico es una estructura matemática que permite definir conceptos como...

### Homología y Cohomología
Estos invariantes topológicos nos permiten clasificar espacios según...

## Aplicaciones en Física

### Aislantes Topológicos
Los aislantes topológicos representan una nueva fase de la materia donde...

### Superconductores Topológicos
Estos materiales exóticos podrían ser la clave para la computación cuántica...

## Perspectivas Futuras

La intersección entre topología y física continúa generando nuevos descubrimientos.
        `,
        slug: 'topologia-algebraica-fisica-moderna',
        fechaPublicacion: '2024-01-10T14:30:00.000Z',
        tiempoLectura: 15,
        etiquetas: ['topología', 'física de la materia condensada', 'matemáticas aplicadas'],
        autor: autoresData.find(a => a.attributes.nombre === 'Prof. Carlos Rodríguez')?.id,
        categoria: categoriasData.find(c => c.attributes.nombre === 'Matemáticas')?.id
      },
      {
        titulo: 'Inteligencia Artificial y Teoría de la Información',
        resumen: 'Explorando las bases matemáticas de la IA moderna desde la perspectiva de la teoría de la información.',
        contenido: `
# Inteligencia Artificial y Teoría de la Información

La teoría de la información, desarrollada por Claude Shannon, proporciona el marco matemático fundamental para entender cómo las máquinas pueden aprender y procesar información.

## Fundamentos de la Teoría de la Información

### Entropía de Shannon
La entropía mide la incertidumbre o el contenido de información de una fuente...

### Información Mutua
Este concepto cuantifica la dependencia entre variables aleatorias...

## Aplicaciones en Machine Learning

### Criterios de División en Árboles de Decisión
La ganancia de información utiliza la entropía para...

### Redes Neuronales y Compresión
Las redes neuronales pueden verse como sistemas de compresión de información...

## Fronteras Actuales

### Información Cuántica
La extensión de la teoría de la información al reino cuántico abre nuevas posibilidades...

### IA Explicable
Usar principios de teoría de la información para hacer más interpretables los modelos de IA.
        `,
        slug: 'inteligencia-artificial-teoria-informacion',
        fechaPublicacion: '2024-01-05T09:15:00.000Z',
        tiempoLectura: 10,
        etiquetas: ['IA', 'teoría de la información', 'machine learning'],
        autor: autoresData.find(a => a.attributes.nombre === 'Dra. Ana Martín')?.id,
        categoria: categoriasData.find(c => c.attributes.nombre === 'Ciencias de la Computación')?.id
      }
    ];
    
    for (const articulo of articulos) {
      try {
        const response = await axios.post(`${STRAPI_URL}/articulos`, {
          data: articulo
        });
        console.log(`✅ Artículo creado: ${articulo.titulo}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`⚠️  Artículo ya existe: ${articulo.titulo}`);
        } else {
          console.error(`❌ Error creando artículo ${articulo.titulo}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo datos para crear artículos:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando población de datos en Mindraxia...\n');
  
  try {
    await crearCategorias();
    console.log('');
    
    await crearAutores();
    console.log('');
    
    await crearArticulos();
    console.log('');
    
    console.log('✅ ¡Datos de ejemplo creados exitosamente!');
    console.log('🌐 Puedes ver el contenido en: http://localhost:1337/admin');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.log('\n⚠️  Asegúrate de que Strapi esté corriendo en http://localhost:1337');
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { crearCategorias, crearAutores, crearArticulos }; 