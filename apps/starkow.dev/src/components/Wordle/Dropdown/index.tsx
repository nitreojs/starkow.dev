import { FC, useEffect, useRef, useState } from 'preact/compat'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  ariaLabel?: string
}

export const Dropdown: FC<DropdownProps> = ({ value, options, onChange, disabled = false, ariaLabel }) => {
  const [open, setOpen] = useState<boolean>(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onPointer = (e: PointerEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = options.find(o => o.value === value)

  const classes = [
    'wdl-dropdown',
    open ? 'is-open' : '',
    disabled ? 'is-disabled' : ''
  ].filter(Boolean).join(' ')

  return (
    <div class={classes} ref={rootRef}>
      <button
        type='button'
        class='wdl-dropdown-trigger'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v) }}
      >
        <span class='wdl-dropdown-label'>{current?.label ?? ''}</span>
        <svg class='wdl-dropdown-arrow' viewBox='0 0 10 6' width='10' height='6' aria-hidden='true'>
          <path d='M0 0l5 6 5-6z' fill='currentColor' />
        </svg>
      </button>

      {open && (
        <div class='wdl-dropdown-menu' role='listbox'>
          {options.map(o => {
            const selected = o.value === value
            const optClasses = ['wdl-dropdown-option', selected ? 'is-selected' : ''].filter(Boolean).join(' ')

            return (
              <button
                key={o.value}
                type='button'
                role='option'
                aria-selected={selected}
                class={optClasses}
                onClick={() => { onChange(o.value); setOpen(false) }}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
