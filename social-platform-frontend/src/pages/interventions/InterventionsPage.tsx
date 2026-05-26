import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Users, Calendar, MapPin } from 'lucide-react'
import { interventionService } from '@/services/interventionService'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatters'
import { useAuthStore } from '@/store/authStore'
import { CreateInterventionModal } from './CreateInterventionModal'
import { EnrollChildModal } from './EnrollChildModal'
import type { Intervention } from '@/types'

export function InterventionsPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [enrollIntervention, setEnrollIntervention] = useState<Intervention | null>(null)
  const { isSuperAdmin } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['interventions', search],
    queryFn: () => interventionService.getAll({ search, pageSize: 50 }),
  })

  const deleteMutation = useMutation({
    mutationFn: interventionService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interventions'] }),
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Intervenciones Sociales</h1>
          <p className="text-sm text-slate-500">{data?.totalCount ?? 0} intervenciones</p>
        </div>
        {isSuperAdmin() && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Nueva Intervención
          </button>
        )}
      </div>

      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar intervenciones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.items?.map((intervention: Intervention) => (
            <div key={intervention.id} className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 leading-tight">{intervention.name}</p>
                  {intervention.category && (
                    <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {intervention.category}
                    </span>
                  )}
                </div>
                <Badge status={intervention.status} />
              </div>

              {intervention.description && (
                <p className="text-sm text-slate-500 line-clamp-2">{intervention.description}</p>
              )}

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{formatDate(intervention.startDate)}{intervention.endDate ? ` → ${formatDate(intervention.endDate)}` : ''}</span>
                </div>
                {intervention.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{intervention.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-slate-400" />
                  <span>
                    {intervention.enrolledCount} inscritos
                    {intervention.maxParticipants ? ` / ${intervention.maxParticipants} max` : ''}
                  </span>
                </div>
                <div className="text-slate-400">
                  Edad: {intervention.minAge}–{intervention.maxAge} años
                </div>
              </div>

              {intervention.maxParticipants && (
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((intervention.enrolledCount / intervention.maxParticipants) * 100, 100)}%` }}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {!isSuperAdmin() && intervention.status === 'Active' && (
                  <button
                    onClick={() => setEnrollIntervention(intervention)}
                    className="btn-primary flex-1 justify-center text-xs py-1.5"
                  >
                    <Users size={14} /> Inscribir Niño
                  </button>
                )}
                {isSuperAdmin() && (
                  <button
                    onClick={() => { if (confirm('¿Eliminar esta intervención?')) deleteMutation.mutate(intervention.id) }}
                    className="btn-secondary text-xs py-1.5 ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {!data?.items?.length && (
            <div className="col-span-full card p-12 text-center text-slate-400">
              No hay intervenciones disponibles
            </div>
          )}
        </div>
      )}

      <CreateInterventionModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {enrollIntervention && (
        <EnrollChildModal
          open={!!enrollIntervention}
          onClose={() => setEnrollIntervention(null)}
          intervention={enrollIntervention}
        />
      )}
    </div>
  )
}
