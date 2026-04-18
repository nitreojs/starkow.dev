import { FC } from 'preact/compat'

import * as Icons from '@starkow.dev/icons'

import { DonationChip } from './DonationChip'

import './style.css'

interface CopyDonation {
  kind: 'copy'
  name: string
  Icon?: FC
  address: string
  highlight?: string
  note?: string
}

interface LinkDonation {
  kind: 'link'
  name: string
  Icon?: FC
  url: string
  label: string
  note?: string
}

interface PlainDonation {
  kind: 'plain'
  name: string
  Icon?: FC
  label: string
  note?: string
}

type Donation = CopyDonation | LinkDonation | PlainDonation

const cryptoDonations: Donation[] = [
  {
    kind: 'copy',
    name: 'ton',
    Icon: Icons.IconTon,
    address: 'sunset.ton',
    highlight: 'sunset.ton'
  },
  {
    kind: 'copy',
    name: 'btc',
    Icon: Icons.IconBitcoin,
    address: '1536gangX3yxMBYQ8Zt2sZpv6q1pCK8Aww',
    highlight: '1536gang'
  },
  {
    kind: 'copy',
    name: 'eth',
    Icon: Icons.IconEthereum,
    address: '0x888888880049bFA7EbE72907082d9D418B50c5e5',
    highlight: '0x88888888'
  },
  {
    kind: 'copy',
    name: 'trx',
    Icon: Icons.IconTron,
    address: 'TELEGRAMV1XT9wFHb67CGxifUgG9acq8uz',
    highlight: 'TELEGRAMV1'
  },
  {
    kind: 'link',
    name: 'cryptobot',
    Icon: Icons.IconTelegram,
    label: 'open',
    url: 'https://t.me/send?start=IVgGsjcVPhee'
  }
]

const fiatDonations: Donation[] = [
  {
    kind: 'link',
    name: 'tinkoff',
    label: 'open',
    url: 'https://www.tinkoff.ru/cf/3xVwMIwPRZp'
  },
  {
    kind: 'plain',
    name: 'card2card',
    label: 'dm me',
    note: "reach me on telegram — i'll send details"
  },
  {
    kind: 'plain',
    name: 'bank transfer',
    label: 'dm me',
    note: "reach me on telegram — i'll send details"
  }
]

const renderChip = (d: Donation) => {
  if (d.kind === 'copy') {
    return <DonationChip key={d.name} kind='copy' name={d.name} Icon={d.Icon} address={d.address} highlight={d.highlight} note={d.note} />
  }

  if (d.kind === 'link') {
    return <DonationChip key={d.name} kind='link' name={d.name} Icon={d.Icon} url={d.url} label={d.label} note={d.note} />
  }

  return <DonationChip key={d.name} kind='plain' name={d.name} Icon={d.Icon} label={d.label} note={d.note} />
}

export const DonationsSection: FC = () => (
  <section id='donations'>
    <h2>donations</h2>
    <p>
      <span class='text-half-visible text-small'>
        i won't judge you if you skipped this section entirely
      </span>
    </p>
    <p>
      if you <span class='text-half-visible'>for some reason</span> want to support me, {' '}
      i accept anything that is listed below. <b>huge thanks in advance!</b>
    </p>

    <p class='info-line'>
      <span class='info-label'>crypto:</span> {' '}
      {cryptoDonations.flatMap((d, i) => i === 0
        ? [renderChip(d)]
        : [<span key={`sep-${d.name}`} class='skill-sep'>•</span>, renderChip(d)]
      )}
    </p>

    <p class='text-half-visible text-small'>
      when donating crypto please use stablecoins/native coin (e.g. tron for trx)
    </p>

    <p class='info-line'>
      <span class='info-label'>fiat:</span> {' '}
      {fiatDonations.flatMap((d, i) => i === 0
        ? [renderChip(d)]
        : [<span key={`sep-${d.name}`} class='skill-sep'>•</span>, renderChip(d)]
      )}
    </p>
  </section>
)
