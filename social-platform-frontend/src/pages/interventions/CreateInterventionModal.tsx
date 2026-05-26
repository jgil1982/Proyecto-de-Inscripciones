import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { interventionService } from '@/services/interventionService'

const schema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  category: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().optional(),
  maxParticipants: z.coerce.number().positive().optional(),
  minAge: z.coerce.number().min(0).max(17),
  maxAge: z.coerce.number().min(1).max(18),
  location: z.string().optional(),
  objectives: z.string().optional(),
  requirements: z.string().optional(),
  isPublic: z.coerce.boolean(),
})

type FormData = z.infer<typeof schema>
interface Props { open: boolean; onClose: () => void }

export function CreateInterventionModal({ open, onClose }: Props) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { minAge: 0, maxAge: 18, isPublic: true }
  })

  const mutation = useMutation({
    mutationFn: interventionService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interventions'] }); reset(); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title="Nueva Intervención Social" className="max-w-2xl">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Nombre de la Intervención *" {...register('name')} error={errors.name?.message} className="sm:col-span-2" />
          <Input label="Categoría" {...register('category')} placeholder="Ej: Educación, Salud, Arte..." />
          <Input label="Ubicación" {...register('location')} />
          <Input label="Fecha de Inicio *" type="date" {...register('startDate')} error={errors.startDate?.message} />
          <Input label="Fecha de Fin" type="date" {...register('endDate')} />
          <Input label="Edad Mínima *" type="number" {...register('minAge')} error={errors.minAge?.message} />
          <Input label="Edad Máxima *" type="number" {...register('maxAge')} error={errors.maxAge?.message} />
          <Input label="Cupo Máximo" type="number" {...register('maxParticipants')} placeholder="Sin límite" />
          <Select label="Visibilidad" {...register('isPublic')}>
            <option value="true">Pública</option>
            <option value="false">Privada</option>
          </Select>
        </div>
        <Textarea label="Descripción" {...register('description')} />
        <Textarea label="Objetivos" {...register('objectives')} />
        <Textarea label="Requisitos" {...register('requirements')} />

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            Error al crear la intervención.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending && <Spinner className="text-white" />}
            {mutation.isPending ? 'Creando...' : 'Crear Intervención'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
