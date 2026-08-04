import { Search } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

export interface SearchableOption {
  value: string
  label: string
  description?: string
}

interface Props {
  label: string
  value: string
  options: SearchableOption[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  disabled,
}: Props) {
  const listId = useId()
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )
  const [query, setQuery] = useState(selected?.label ?? '')

  useEffect(() => {
    setQuery(selected?.label ?? '')
  }, [selected?.label])

  return (
    <label className="searchable-select">
      <span>{label}</span>
      <div className="searchable-select__control">
        <Search size={16} />
        <input
          list={listId}
          value={query}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            const match = options.find(
              (option) => option.label.toLocaleLowerCase() === next.trim().toLocaleLowerCase(),
            )
            onChange(match?.value ?? '')
          }}
          onBlur={() => {
            if (!value) setQuery('')
          }}
        />
      </div>
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.label}>
            {option.description}
          </option>
        ))}
      </datalist>
    </label>
  )
}
