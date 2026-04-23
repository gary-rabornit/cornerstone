'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import { STAGE_COLORS } from '@/lib/constants'
import { formatCurrency, getStageName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DealCard } from '@/components/pipeline/deal-card'
import { NewDealModal } from '@/components/pipeline/new-deal-modal'
import { COMPANY_OPTIONS, getCompanyBranding } from '@/lib/companies'
import { CompanyLogo } from '@/components/ui/company-logo'

interface Deal {
  id: string
  company: string
  companyName: string
  contactName: string
  contactEmail: string | null
  companyWebsite: string | null
  value: number
  stage: string
  stageEnteredAt: string | Date
  ownerId: string
  owner: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
  proposals: Array<{
    id: string
    status: string
  }>
}

interface Column {
  stage: string
  deals: Deal[]
  totalValue: number
}

interface CompanyTotal {
  company: string
  totalValue: number
  dealCount: number
}

interface KanbanBoardProps {
  columns: Column[]
  companyTotals: CompanyTotal[]
}

export function KanbanBoard({ columns: initialColumns, companyTotals }: KanbanBoardProps) {
  const router = useRouter()
  const [columns, setColumns] = useState(initialColumns)
  useEffect(() => { setColumns(initialColumns) }, [initialColumns])
  const [modalOpen, setModalOpen] = useState(false)
  const [companyFilter, setCompanyFilter] = useState<string>('ALL')

  // Filter columns by company
  const filteredColumns = useMemo(() => {
    if (companyFilter === 'ALL') return columns
    return columns.map((col) => {
      const filtered = col.deals.filter((d) => d.company === companyFilter)
      return {
        ...col,
        deals: filtered,
        totalValue: filtered.reduce((sum, d) => sum + d.value, 0),
      }
    })
  }, [columns, companyFilter])

  const totalPipeline = columns
    .filter((c) => c.stage !== 'CLOSED_LOST')
    .reduce((sum, c) => sum + c.totalValue, 0)

  const filteredPipeline = filteredColumns
    .filter((c) => c.stage !== 'CLOSED_LOST')
    .reduce((sum, c) => sum + c.totalValue, 0)

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceColIndex = columns.findIndex(
      (c) => c.stage === source.droppableId
    )
    const destColIndex = columns.findIndex(
      (c) => c.stage === destination.droppableId
    )

    if (sourceColIndex === -1 || destColIndex === -1) return

    const newColumns = columns.map((col) => ({
      ...col,
      deals: [...col.deals],
    }))

    const [movedDeal] = newColumns[sourceColIndex].deals.splice(source.index, 1)
    movedDeal.stage = destination.droppableId
    newColumns[destColIndex].deals.splice(destination.index, 0, movedDeal)

    newColumns[sourceColIndex].totalValue = newColumns[sourceColIndex].deals.reduce(
      (sum, d) => sum + d.value,
      0
    )
    newColumns[destColIndex].totalValue = newColumns[destColIndex].deals.reduce(
      (sum, d) => sum + d.value,
      0
    )

    setColumns(newColumns)

    try {
      await fetch(`/api/deals/${draggableId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: destination.droppableId }),
      })
      router.refresh()
    } catch {
      setColumns(initialColumns)
    }
  }

  return (
    <>
      {/* Company summary bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-4 flex-1 overflow-x-auto">
          {companyTotals.map((ct) => {
            const co = getCompanyBranding(ct.company)
            return (
              <div
                key={ct.company}
                className="flex items-center gap-4 rounded-lg bg-white border border-gray-200 px-4 h-14 min-w-fit"
              >
                <CompanyLogo companyKey={ct.company} size="sm" />
                <span className="text-sm font-bold" style={{ color: co.primaryColor }}>
                  {formatCurrency(ct.totalValue)}
                </span>
                <span className="text-xs text-gray-400">
                  ({ct.dealCount})
                </span>
              </div>
            )
          })}
        </div>

        <Button onClick={() => setModalOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {/* Company filter tabs */}
      <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-200 mb-4 w-fit">
        <button
          onClick={() => setCompanyFilter('ALL')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            companyFilter === 'ALL'
              ? 'bg-[#003964] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>All</span>
          <span className="text-xs font-bold">{formatCurrency(totalPipeline)}</span>
        </button>
        {COMPANY_OPTIONS.map((co) => {
          const coTotal = columns
            .filter((c) => c.stage !== 'CLOSED_LOST')
            .reduce((sum, c) => sum + c.deals.filter(d => d.company === co.key).reduce((s, d) => s + d.value, 0), 0)
          return (
            <button
              key={co.key}
              onClick={() => setCompanyFilter(co.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                companyFilter !== co.key
                  ? 'text-gray-600 hover:bg-gray-100'
                  : ''
              }`}
              style={companyFilter === co.key ? {
                backgroundColor: `${co.key === 'RABORN_SOFTWARE' ? co.secondaryColor : co.accentColor}18`,
                boxShadow: `inset 0 0 0 2px ${co.key === 'RABORN_SOFTWARE' ? co.secondaryColor : co.accentColor}`,
                borderLeft: `3px solid ${co.key === 'RABORN_SOFTWARE' ? co.secondaryColor : co.accentColor}`,
              } : undefined}
            >
              <CompanyLogo companyKey={co.key} size="sm" />
              {companyFilter === co.key && (
                <span className="text-xs font-bold" style={{ color: co.primaryColor }}>
                  {formatCurrency(coTotal)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
          {filteredColumns.map((column) => (
            <div
              key={column.stage}
              className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-50 border border-gray-100"
            >
              <div
                className="flex items-center justify-between rounded-t-xl border-b border-gray-100 px-4 py-3"
                style={{ borderLeft: `4px solid ${STAGE_COLORS[column.stage] || '#94a3b8'}` }}
              >
                <div>
                  <h3 className="text-sm font-semibold text-[#1A202C]">
                    {getStageName(column.stage)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {column.deals.length} deal{column.deals.length !== 1 ? 's' : ''}{' '}
                    &middot; {formatCurrency(column.totalValue)}
                  </p>
                </div>
              </div>

              <Droppable droppableId={column.stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 p-3 min-h-[120px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-[#003964]/5' : ''
                    }`}
                  >
                    {column.deals.map((deal, index) => (
                      <Draggable
                        key={deal.id}
                        draggableId={deal.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                          >
                            <DealCard deal={deal} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <NewDealModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
