import {
  IconEye,
  IconEyeOff,
  IconLock,
  authFieldIconClass,
} from './AuthIcons'
import { authInputFieldClass } from './AuthPageShell'

const toggleBtnClass =
  'absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-black/45 transition hover:bg-black/[0.06] hover:text-black/70 focus:outline-none focus:ring-2 focus:ring-brand-orange/30'

type AuthPasswordInputProps = {
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  onTogglePassword: () => void
  autoComplete: string
  id?: string
  minLength?: number
  required?: boolean
}

/** Password row with lock (left) and show/hide toggle (right). */
export function AuthPasswordInput({
  value,
  onChange,
  showPassword,
  onTogglePassword,
  autoComplete,
  id,
  minLength,
  required = true,
}: AuthPasswordInputProps) {
  const hidden = !showPassword
  return (
    <div className="relative mt-1.5">
      <IconLock className={authFieldIconClass} />
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={`${authInputFieldClass} pl-10 pr-11`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={toggleBtnClass}
        onClick={onTogglePassword}
        aria-label={hidden ? 'Show password' : 'Hide password'}
        aria-pressed={showPassword}
      >
        {hidden ? (
          <IconEye className="h-5 w-5" />
        ) : (
          <IconEyeOff className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
