import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, CheckCircle, XCircle, Pause, Trash2 } from 'lucide-react'
import { churchService } from '@/services/churchService'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/utils/formatters'
import { CreateChurchModal } from './CreateChurchModal'
import type { Church } from '@/types'

export function ChurchesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [rejectReason, setRejectReason] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['churches', search, statusFilter],
    queryFn: () => churchService.getAll({ search, status: statusFilter || undefined, pageSize: 50 }),
  })

  const approveMutation = useMutation({
    mutationFn: churchService.approve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['churches'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => churchService.reject(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['churches'] }); setRejectModal({ open: false, id: '' }) },
  })

  const suspendMutation = useMutation({
    mutationFn: churchService.suspend,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['churches'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: churchService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['churches'] }),
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Iglesias</h1>
          <p className="text-sm text-slate-500">{data?.totalCount ?? 0} iglesias registradas</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus size={16} /> Nueva Iglesia
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre, ciudad o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="0">Pendientes</option>
          <option value="1">Activas</option>
          <option value="2">Suspendidas</option>
          <option value="3">Rechazadas</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Iglesia</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3 hidden md:table-cell">Contacto</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Niños</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Registro</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.items?.map((church: Church) => (
                  <tr key={church.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{church.name}</p>
                      <p className="text-xs text-slate-400">{church.pastorName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{church.city}, {church.state}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-slate-600">{church.email}</p>
                      <p className="text-xs text-slate-400">{church.phone}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{church.childrenCount}</td>
                    <td className="px-4 py-3">
                      <Badge status={church.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">{formatDate(church.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {church.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(church.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, id: church.id })}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rechazar"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {church.status === 'Active' && (
                          <button
                            onClick={() => suspendMutation.mutate(church.id)}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Suspender"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm('¿Eliminar esta iglesia?')) deleteMutation.mutate(church.id) }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.items?.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron iglesias
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateChurchModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: '' })} title="Rechazar Iglesia">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Indique el motivo del rechazo para notificar a la iglesia:</p>
          <Input
            label="Motivo de rechazo"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Ej: Documentación incompleta..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setRejectModal({ open: false, id: '' })}>
              Cancelar
            </button>
            <button
              className="btn-danger"
              onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })}
              disabled={!rejectReason.trim()}
            >
              Rechazar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
