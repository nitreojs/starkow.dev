import type { ComponentProps, FC } from 'preact/compat'

import './style.css'

interface CoolButtonProps {
  onClick?: VoidFunction
  style?: ComponentProps<'button'>['style']
  disabled?: boolean
  icon?: FC
  text?: string
}

export const CoolButton: FC<CoolButtonProps> = ({ text, icon, onClick, disabled = false, ...props }) => {
  const Icon = icon // fancy $$$

  return (
    <button class="cool-button" onClick={onClick} disabled={disabled} {...props}>
      {Icon && <Icon />}
      {text && <span>{text}</span>}
    </button>
  )
}
