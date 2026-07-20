'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos, tiendas o marcas..."
          className="w-full h-10 pl-4 pr-10 rounded-full border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
        >
          <Search size={16} className="text-white" />
        </button>
      </div>
    </form>
  )
}
