/**
 * Select Component
 * Searchable dropdown using @headlessui/react Listbox
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  id: string
  label?: string
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  error,
  disabled = false,
  searchable = true
}) => {
  const [query, setQuery] = useState('')

  const selectedOption = useMemo(
    () => options.find(opt => opt.value === value),
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    if (!searchable || !query) return options

    return options.filter(option =>
      option.label.toLowerCase().includes(query.toLowerCase())
    )
  }, [options, query, searchable])

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div className="relative">
            <ListboxButton
              id={id}
              className={`w-full rounded-md border ${
                error ? 'border-destructive' : 'border-input'
              } bg-background px-3 py-2 text-left text-sm text-foreground focus:outline-none focus:ring-2 ${
                error ? 'focus:ring-destructive' : 'focus:ring-ring'
              } focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedOption?.label || placeholder}
              </span>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </ListboxButton>

            {open && (
              <ListboxOptions
                className="absolute z-10 mt-1 w-full rounded-md border border-input bg-popover shadow-lg max-h-60 overflow-auto focus:outline-none"
              >
                {searchable && (
                  <div className="sticky top-0 bg-popover p-2 border-b border-input">
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={searchPlaceholder}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                <div className="py-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No se encontraron resultados
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <ListboxOption
                        key={option.value}
                        value={option.value}
                        className={({ focus, selected }) =>
                          `cursor-pointer select-none px-3 py-2 text-sm ${
                            focus ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
                          } ${selected ? 'font-semibold' : 'font-normal'}`
                        }
                      >
                        {({ selected }) => (
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {selected && <Check className="h-4 w-4" />}
                          </div>
                        )}
                      </ListboxOption>
                    ))
                  )}
                </div>
              </ListboxOptions>
            )}
          </div>
        )}
      </Listbox>

      {error && (
        <p className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
