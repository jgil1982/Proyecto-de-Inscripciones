import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { childService } from '@/services/childService'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatters'
import { useAuthStore } from '@/store/authStore'
import { CreateChildModal } from './CreateChildModal'
import type { Child } from '@/types'

export function ChildrenPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { user, isSuperAdmin } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['children', search, page, user?.churchId],
    queryFn: () => isSuperAdmin()
      ? childService.getAll({ search, page, pageSize: 20 })
      : childService.getByChurch(user!.churchId!, { search, page, pageSize: 20 }),
    enabled: isSuperAdmin() || !!user?.churchId,
  })

  const deleteMutation = useMutation({
    mutationFn: childService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children'] }),
  })

  const genderIcon = (gender: string) => gender === 'Female' ? '♀' : gender === 'Male' ? '♂' : '⚧'

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Niños Registrados</h1>
          <p className="text-sm text-slate-500">{data?.totalCount ?? 0} niños en total</p>
        </div>
        {!isSuperAdmin() && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Registrar Niño
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isError && (
          <div className="px-4 py-6 text-center text-red-500 text-sm">
            Error al cargar los datos: {(error as { message?: string })?.message ?? 'Error desconocido'}
          </div>
        )}
        {isLoading ? <PageLoader /> : !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    <th className="px-4 py-3">Niño</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Documento</th>
                    <th className="px-4 py-3">Edad</th>
                    <th className="px-4 py-3 hidden md:table-cell">Género</th>
                    {isSuperAdmin() && <th className="px-4 py-3 hidden lg:table-cell">Iglesia</th>}
                    <th className="px-4 py-3 hidden md:table-cell">Intervenciones</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Registro</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.items?.map((child: Child) => (
                    <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-semibold shrink-0">
                            {child.fullName.split(' ').slice(0, 2).map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{child.fullName}</p>
                            <p className="text-xs text-slate-400">{child.guardianName ?? 'Sin acudiente'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-600">
                        <span className="text-xs text-slate-400">{child.documentType}</span> {child.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{child.age} años</td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                        {genderIcon(child.gender)} {child.genderLabel}
                      </td>
                      {isSuperAdmin() && <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">{child.churchName}</td>}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${child.activeInterventions > 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                          {child.activeInterventions}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={child.isActive ? 'Active' : 'Suspended'} label={child.isActive ? 'Activo' : 'Inactivo'} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">{formatDate(child.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!isSuperAdmin() && (
                            <button
                              onClick={() => deleteMutation.mutate(child.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data?.items?.length && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        No se encontraron niños registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Mostrando {((page - 1) * 20) + 1}–{Math.min(page * 20, data.totalCount)} de {data.totalCount}
                </p>
                <div className="flex gap-1">
                  <button disabled={!data.hasPreviousPage} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-2 text-xs disabled:opacity-40">
                    Anterior
                  </button>
                  <button disabled={!data.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-2 text-xs disabled:opacity-40">
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateChildModal open={createOpen} onClose={() => setCreateOpen(false)} churchId={user?.churchId} />
    </div>
  )
}
