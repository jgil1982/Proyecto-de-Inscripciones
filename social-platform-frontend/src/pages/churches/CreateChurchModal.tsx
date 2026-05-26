import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { churchService } from '@/services/churchService'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  legalName: z.string().min(2, 'Nombre legal requerido'),
  taxId: z.string().optional(),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Departamento requerido'),
  country: z.string().default('Colombia'),
  phone: z.string().min(7, 'Teléfono requerido'),
  email: z.string().email('Correo inválido'),
  website: z.string().optional(),
  pastorName: z.string().optional(),
  description: z.string().optional(),
  adminFirstName: z.string().min(2, 'Nombre del admin requerido'),
  adminLastName: z.string().min(2, 'Apellido del admin requerido'),
  adminEmail: z.string().email('Correo del admin inválido'),
  adminPassword: z.string().min(8, 'Mínimo 8 caracteres').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    'Debe incluir mayúscula, minúscula, número y símbolo'
  ),
})

type FormData = z.infer<typeof schema>

interface Props { open: boolean; onClose: () => void }

export function CreateChurchModal({ open, onClose }: Props) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Colombia' }
  })

  const mutation = useMutation({
    mutationFn: churchService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['churches'] })
      reset()
      onClose()
    },
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  return (
    <Modal open={open} onClose={onClose} title="Registrar Nueva Iglesia" className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos de la Iglesia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre de la Iglesia *" {...register('name')} error={errors.name?.message} />
            <Input label="Razón Social / Nombre Legal *" {...register('legalName')} error={errors.legalName?.message} />
            <Input label="NIT / RUT" {...register('taxId')} error={errors.taxId?.message} />
            <Input label="Pastor / Director" {...register('pastorName')} error={errors.pastorName?.message} />
            <Input label="Teléfono *" {...register('phone')} error={errors.phone?.message} />
            <Input label="Correo electrónico *" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Dirección *" {...register('address')} error={errors.address?.message} />
            <Input label="Ciudad *" {...register('city')} error={errors.city?.message} />
            <Input label="Departamento/Estado *" {...register('state')} error={errors.state?.message} />
            <Input label="Sitio Web" {...register('website')} error={errors.website?.message} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Administrador de la Iglesia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre *" {...register('adminFirstName')} error={errors.adminFirstName?.message} />
            <Input label="Apellido *" {...register('adminLastName')} error={errors.adminLastName?.message} />
            <Input label="Correo del Administrador *" type="email" {...register('adminEmail')} error={errors.adminEmail?.message} />
            <Input label="Contraseña *" type="password" {...register('adminPassword')} error={errors.adminPassword?.message} />
          </div>
        </div>

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {(mutation.error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error al registrar la iglesia.'}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Spinner className="text-white" /> : null}
            {mutation.isPending ? 'Registrando...' : 'Registrar Iglesia'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
