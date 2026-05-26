import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { childService } from '@/services/childService'

const schema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  documentType: z.string().min(1),
  documentNumber: z.string().min(4, 'Documento requerido'),
  birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
  gender: z.coerce.number().min(0).max(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelationship: z.string().optional(),
  medicalNotes: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>
interface Props { open: boolean; onClose: () => void; churchId?: string }

export function CreateChildModal({ open, onClose, churchId }: Props) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { documentType: 'CC', gender: 0 }
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => childService.create({ ...data, churchId: churchId! }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['children'] }); reset(); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title="Registrar Niño" className="max-w-2xl">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos Personales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre *" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Apellido *" {...register('lastName')} error={errors.lastName?.message} />
            <Select label="Tipo de Documento *" {...register('documentType')}>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="RC">Registro Civil</option>
              <option value="NUI">Número Único de Identificación</option>
            </Select>
            <Input label="Número de Documento *" {...register('documentNumber')} error={errors.documentNumber?.message} />
            <Input label="Fecha de Nacimiento *" type="date" {...register('birthDate')} error={errors.birthDate?.message} />
            <Select label="Género *" {...register('gender')}>
              <option value={0}>Masculino</option>
              <option value={1}>Femenino</option>
              <option value={2}>Otro</option>
            </Select>
            <Input label="Dirección" {...register('address')} className="sm:col-span-2" />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Acudiente / Tutor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre del Acudiente" {...register('guardianName')} />
            <Input label="Teléfono del Acudiente" {...register('guardianPhone')} />
            <Input label="Parentesco" {...register('guardianRelationship')} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Información Adicional</h3>
          <div className="space-y-3">
            <Textarea label="Notas Médicas" {...register('medicalNotes')} placeholder="Alergias, condiciones especiales..." />
            <Textarea label="Observaciones" {...register('notes')} />
          </div>
        </div>

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {(mutation.error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error al registrar el niño.'}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending && <Spinner className="text-white" />}
            {mutation.isPending ? 'Guardando...' : 'Registrar Niño'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
