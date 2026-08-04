import type { ReactNode } from 'react'
import EmptyState from './EmptyState'

export interface Column<T> { key: string; title: string; render: (row: T) => ReactNode }

export default function DataTable<T>({ rows, columns, keyOf }: { rows: T[]; columns: Column<T>[]; keyOf: (row: T) => string }) {
  if (!rows.length) return <EmptyState />
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.title}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={keyOf(row)}>{columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
