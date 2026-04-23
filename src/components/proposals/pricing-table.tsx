'use client'

import { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { cn, formatCurrencyDetailed } from '@/lib/utils'
import type { PricingItem } from '@/types'

interface PricingTableProps {
  items: PricingItem[]
  onChange: (items: PricingItem[]) => void
}

export function PricingTable({ items, onChange }: PricingTableProps) {
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState(0)
  const [taxRate, setTaxRate] = useState(0)

  function addRow() {
    const newItem: PricingItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    onChange([...items, newItem])
  }

  function removeRow(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function updateItem(id: string, field: keyof PricingItem, value: string | number) {
    const updated = items.map((item) => {
      if (item.id !== id) return item
      const patched = { ...item, [field]: value }
      patched.total = patched.quantity * patched.unitPrice
      return patched
    })
    onChange(updated)
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount =
    discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (taxRate / 100)
  const grandTotal = afterDiscount + taxAmount

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[45%]">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[18%]">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[18%]">
                Total
              </th>
              <th className="px-4 py-3 w-[7%]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  'transition-colors',
                  index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                )}
              >
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 text-right focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 text-right focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
                  />
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                  {formatCurrencyDetailed(item.quantity * item.unitPrice)}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(item.id)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove row"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  No items yet. Add a row to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Row */}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:border-[#00CFF8] hover:text-[#00CFF8] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Row
      </button>

      {/* Summary Footer */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 max-w-sm ml-auto">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrencyDetailed(subtotal)}</span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Discount</span>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8] bg-white"
            >
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
            <input
              type="number"
              min={0}
              step={0.01}
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-md border border-gray-200 px-2 py-1 text-xs text-right text-gray-900 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
            />
          </div>
          <span className="font-medium text-red-600">
            {discountAmount > 0 ? `-${formatCurrencyDetailed(discountAmount)}` : formatCurrencyDetailed(0)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tax</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-md border border-gray-200 px-2 py-1 text-xs text-right text-gray-900 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
            />
            <span className="text-gray-400 text-xs">%</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatCurrencyDetailed(taxAmount)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#003964]">Grand Total</span>
            <span className="text-lg font-bold text-[#003964]">
              {formatCurrencyDetailed(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
