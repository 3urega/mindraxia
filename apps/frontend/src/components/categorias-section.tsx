import { Card, CardHeader, CardTitle } from "@/components/ui/card"

// Componente temporal hasta que axios esté instalado
const CategoriasSection = () => {
  // Por ahora usar datos estáticos, luego cambiar por datos reales
  const categorias = [
    { nombre: "Física", descripcion: "Artículos sobre física teórica y experimental" },
    { nombre: "Matemáticas", descripcion: "Contenido sobre matemáticas puras y aplicadas" },
    { nombre: "Ingeniería", descripcion: "Artículos sobre ingeniería en todas sus ramas" },
    { nombre: "Ciencias de la Computación", descripcion: "Algoritmos, IA y ciencias de la computación" }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Explora por Categorías</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categorias.map((categoria) => (
          <Card key={categoria.nombre} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">{categoria.nombre}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CategoriasSection 