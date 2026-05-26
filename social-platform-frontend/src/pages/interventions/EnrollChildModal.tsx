import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Spinner, PageLoader } from '@/components/ui/Spinner'
import { interventionService } from '@/services/interventionService'
import { childService } from '@/services/childService'
import { useAuthStore } from '@/store/authStore'
import type { Child, Intervention } from '@/types'

interface Props { open: boolean; onClose: () => void; intervention: Intervention }

export function EnrollChildModal({ open, onClose, intervention }: Props) {
  const [selectedChildId, setSelectedChildId] = useState('')
  const [notes, setNotes] = useState('')
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: children, isLoading } = useQuery({
    queryKey: ['children-enroll', user?.churchId],
    queryFn: () => childService.getByChurch(user!.churchId!, { pageSize: 100, isActive: true }),
    enabled: !!user?.churchId,
  })

  const mutation = useMutation({
    mutationFn: () => interventionService.enroll({
      childId: selectedChildId,
      interventionId: intervention.id,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interventions'] })
      qc.invalidateQueries({ queryKey: ['children'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={`Inscribir Niño en: ${intervention.name}`}>
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-600">
          <p>Edades: <strong>{intervention.minAge}–{intervention.maxAge} años</strong></p>
          {intervention.maxParticipants && (
            <p>Cupo disponible: <strong>{intervention.maxParticipants - intervention.enrolledCount}</strong></p>
          )}
        </div>

        {isLoading ? <PageLoader /> : (
          <div>
            <label className="label">Seleccionar Niño *</label>
            <select
              className="input"
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
            >
              <option value="">-- Seleccione un niño --</option>
              {children?.items.map((child: Child) => (
                <option key={child.id} value={child.id}>
                  {child.fullName} ({child.age} años) — {child.documentNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Notas (opcional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Observaciones sobre la inscripción..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {(mutation.error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error al inscribir el niño.'}
          </div>
        )}

        {mutation.isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
            Niño inscrito exitosamente.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            disabled={!selectedChildId || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Spinner className="text-white" />}
            {mutation.isPending ? 'Inscribiendo...' : 'Inscribir'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
