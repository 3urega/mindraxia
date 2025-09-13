"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Book, Home, Tag, User } from "lucide-react"

const navigation = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    name: "Artículos",
    href: "/articulos",
    icon: Book,
  },
  {
    name: "Categorías",
    href: "/categorias",
    icon: Tag,
  },
  {
    name: "Autores",
    href: "/autores", 
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-background border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold">Mindraxia</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Divulgación científica técnica
        </p>
      </div>
    </div>
  )
} 