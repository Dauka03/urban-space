import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  prefix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        <div className={`flex items-center gap-2 h-12 px-4 rounded-xl border bg-white transition-colors
          ${error ? 'border-error' : 'border-border focus-within:border-primary'}`}
        >
          {prefix && <span className="shrink-0 text-text-secondary">{prefix}</span>}
          <input
            ref={ref}
            className={`flex-1 outline-none bg-transparent text-base text-text placeholder:text-text-tertiary ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
