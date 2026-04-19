import { FC } from 'preact/compat'
import { useEffect, useRef, useState } from 'preact/hooks'
import clsx from 'clsx'

export interface AdminMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
  highlight?: boolean
}

interface AdminMenuProps {
  items: AdminMenuItem[]
}

export const AdminMenu: FC<AdminMenuProps> = ({ items }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)

    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  if (items.length === 0) {
    return null
  }

  return (
    <div class='shoutbox-admin-menu' ref={rootRef}>
      <button
        type='button'
        class={clsx('shoutbox-message-reply', 'shoutbox-admin-menu-toggle', open && 'shoutbox-admin-menu-toggle-open')}
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        [...]
      </button>
      {open && (
        <div class='shoutbox-admin-menu-popover' role='menu'>
          {items.map(item => (
            <button
              key={item.label}
              type='button'
              role='menuitem'
              class={clsx('shoutbox-admin-menu-item', item.danger && 'shoutbox-admin-menu-item-danger', item.highlight && 'shoutbox-admin-menu-item-highlight')}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
