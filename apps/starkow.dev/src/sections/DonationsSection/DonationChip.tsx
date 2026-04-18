import { FC, useEffect, useRef, useState } from 'preact/compat'
import clsx from 'clsx'

import * as Icons from '@starkow.dev/icons'

import { DonationQr } from './DonationQr'

interface DonationCopyProps {
  kind: 'copy'
  name: string
  Icon?: FC
  address: string
  highlight?: string
  note?: string
}

interface DonationLinkProps {
  kind: 'link'
  name: string
  Icon?: FC
  url: string
  label: string
  note?: string
}

interface DonationPlainProps {
  kind: 'plain'
  name: string
  Icon?: FC
  label: string
  note?: string
}

type DonationChipProps = DonationCopyProps | DonationLinkProps | DonationPlainProps

export const DonationChip: FC<DonationChipProps> = (props) => {
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const qrAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1800)

    return () => clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (!qrOpen) return

    const onClickOutside = (event: MouseEvent) => {
      if (qrAnchorRef.current !== null && !qrAnchorRef.current.contains(event.target as Node)) {
        setQrOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setQrOpen(false)
    }

    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [qrOpen])

  const Icon = props.Icon

  const onCopy = async () => {
    if (props.kind !== 'copy') return

    try {
      await navigator.clipboard.writeText(props.address)
      setCopied(true)
    } catch {
      // ignore clipboard failures — user will just read the address
    }
  }

  const commonLabel = (
    <>
      {Icon !== undefined && <Icon />}
      <span class='donation-chip-name'>{props.name}</span>
    </>
  )

  const tooltip = props.note ?? (props.kind === 'copy' ? props.address : undefined)

  if (props.kind === 'link') {
    return (
      <a
        class={clsx('donation-chip', 'with-note')}
        data-note={tooltip}
        href={props.url}
        target='_blank'
        rel='noopener noreferrer'
      >
        {commonLabel}
        <span class='donation-chip-value'>{props.label}</span>
        <Icons.IconExternalLink width='0.8em' height='0.8em' />
      </a>
    )
  }

  if (props.kind === 'plain') {
    return (
      <span
        class={clsx('donation-chip', 'donation-chip-plain', 'with-note')}
        data-note={tooltip}
      >
        {commonLabel}
        <span class='donation-chip-value'>{props.label}</span>
      </span>
    )
  }

  return (
    <span class='donation-chip-wrap' ref={qrAnchorRef}>
      <button
        type='button'
        class={clsx('donation-chip', 'donation-chip-copy', 'with-note', copied && 'donation-chip-copied')}
        data-note={tooltip}
        onClick={onCopy}
      >
        {commonLabel}
        {props.highlight !== undefined
          ? <span class='donation-chip-highlight'>{props.highlight}</span>
          : <span class='donation-chip-value'>{props.address}</span>}
        {copied
          ? <Icons.IconCheck width='0.8em' height='0.8em' />
          : <Icons.IconCopy width='0.8em' height='0.8em' />}
      </button>
      <button
        type='button'
        class={clsx('donation-chip-qr-toggle', qrOpen && 'donation-chip-qr-toggle-open')}
        onClick={() => setQrOpen(prev => !prev)}
        aria-label={qrOpen ? 'hide qr code' : 'show qr code'}
        aria-expanded={qrOpen}
      >
        <Icons.IconQRCode />
      </button>
      {qrOpen && (
        <div class='donation-qr-popover' role='dialog' aria-label={`${props.name} qr code`}>
          <DonationQr value={props.address} />
          <span class='donation-qr-label'>{props.name}</span>
        </div>
      )}
    </span>
  )
}
