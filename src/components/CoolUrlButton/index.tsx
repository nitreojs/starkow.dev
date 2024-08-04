import type { FC } from 'preact/compat'

interface CoolUrlButtonProps {
  icon: FC
  url: string
  label?: string
  text?: string
}

export const CoolUrlButton: FC<CoolUrlButtonProps> = ({ text, url, icon, label }) => {
  const Icon = icon // fancy $$$

  return (
    <a class="cool-button" href={url} aria-label={label}>
      <Icon />
      {text && <span>{text}</span>}
    </a>
  )
}
