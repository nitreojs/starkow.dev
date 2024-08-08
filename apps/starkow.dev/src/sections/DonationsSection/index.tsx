import { FC, useEffect, useState } from 'preact/compat'
import * as Icons from '@starkow.dev/icons'
import clsx from 'clsx'

interface DonationTextElementInterface {
  type: 'text'
  title: string
  address: string
  copyValue?: string
  allowCopy?: boolean
}

interface DonationUrlElementInterface {
  type: 'url'
  title: string
  url: string
  address: string
}

type DonationElement = DonationTextElementInterface | DonationUrlElementInterface

const cryptoElements: DonationElement[] = [
  {
    type: 'text',
    title: 'ton',
    address: 'winterfall.ton'
  },
  {
    type: 'text',
    title: 'btc',
    address: '1536gang..8Aww',
    copyValue: '1536gangX3yxMBYQ8Zt2sZpv6q1pCK8Aww'
  },
  {
    type: 'text',
    title: 'eth',
    address: '0x88888888..c5e5',
    copyValue: '0x888888880049bFA7EbE72907082d9D418B50c5e5'
  },
  {
    type: 'text',
    title: 'trx',
    address: 'TELEGRAMV1..q8uz',
    copyValue: 'TELEGRAMV1XT9wFHb67CGxifUgG9acq8uz'
  },
  {
    type: 'url',
    title: 'cryptobot',
    address: 'click',
    url: 'https://t.me/send?start=IVgGsjcVPhee'
  }
]

const fiatElements: DonationElement[] = [
  {
    type: 'url',
    title: 'tinkoff',
    address: 'click',
    url: 'https://www.tinkoff.ru/cf/3xVwMIwPRZp'
  },
  {
    type: 'text',
    title: 'card2card',
    address: 'dm me',
    allowCopy: false
  },
  {
    type: 'text',
    title: 'bank transfer',
    address: 'dm me',
    allowCopy: false
  }
]

interface DonationElementProps {
  title: string
  address: string
  copyValue?: string
  allowCopy?: boolean
}

const DonationElement: FC<DonationElementProps> = ({ title, address, copyValue, allowCopy = true }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const onDonationClick = () => {
    if (allowCopy) {
      copyToClipboard(copyValue ?? address)
      setCopied(true)
    }
  }

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <li>
      <b>{title}</b>: {" "}
      <span
        class={clsx("donation-address", allowCopy && "donation-copyable")}
        onClick={onDonationClick}
      >
        {address}
        {
          allowCopy && (
            copied ? <Icons.IconCheck width='0.8rem' height='0.8rem' /> :
            <Icons.IconCopy width='0.8rem' height='0.8rem' />
          )
        }
      </span>
    </li>
  )
}

interface DonationUrlElementProps {
  title: string
  url: string
  address: string
}

const DonationUrlElement: FC<DonationUrlElementProps> = ({ title, url, address }) => {
  return (
    <li>
      <b>{title}</b>: {" "}
      <a class='donation-address donation-clickable' href={url}>
        {address}
        <Icons.IconExternalLink width='1rem' height='1rem' />
      </a>
    </li>
  )
}

export const DonationsSection: FC = () => {
  return (
    <section id='donations'>
      <h2>donations</h2>
      <p>
        <span class='text-half-visible text-small'>
          i won't judge you if you skipped this section entirely
        </span>
      </p>
      <p>
        if you <span class='text-half-visible'>for some reason</span> want to support me, {" "}
        i accept anything that is listed below. <b>huge thanks in advance!</b>
      </p>

      <h3>crypto</h3>
      <ul class='donations-list'>
        {
          cryptoElements.map((e) => (
            e.type === 'text' ? <DonationElement {...e} /> :
            <DonationUrlElement {...e} />
          ))
        }
      </ul>
      <span class='text-half-visible text-small'>
        when donating crypto please use stablecoins/native coin (e.g. tron for trx)
      </span>

      <h3>fiat</h3>
      <ul class='fiat-list'>
        {
          fiatElements.map((e) => (
            e.type === 'text' ? <DonationElement {...e} /> :
            <DonationUrlElement {...e} />
          ))
        }
      </ul>
    </section>
  )
}
