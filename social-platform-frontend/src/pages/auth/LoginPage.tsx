import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const result = await authService.login(data)
      setAuth(result.user, result.accessToken, result.refreshToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'Error de autenticación. Verifique sus credenciales.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-700 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)', backgroundSize: '100px 100px' }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-8 py-8 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-2xl font-black text-white">S</span>
            </div>
            <h1 className="text-xl font-bold">SPI</h1>
            <p className="text-brand-100 text-sm mt-1">Sistema de Gestión Social</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Iniciar sesión</h2>
              <p className="text-sm text-slate-500 mt-0.5">Ingrese sus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  className="input"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5">
                {isSubmitting ? <Spinner className="text-white" /> : <LogIn size={16} />}
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Credenciales de demo:</p>
              <p className="text-xs text-slate-600">Super Admin: <code className="bg-white px-1 py-0.5 rounded text-brand-600">admin@spi.ci.org</code></p>
              <p className="text-xs text-slate-600">Pass: <code className="bg-white px-1 py-0.5 rounded text-brand-600">Admin@123456!</code></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/60 mt-6">
          © 2024 SPI — Sistema de Gestión Social para Iglesias y ONG
        </p>
      </div>
    </div>
  )
}
