import type { Content } from '../../components'

const MESSAGES: Content[][] = [
  ['dilly-dallying'],
  ['chilling rn'],
  ['... maybe the ', { type: 'code', children: ['API'] }, ' is broken? idk'],
  ['lunch break or something'],
  ['either ', { type: 'bold', children: ['deep focus'] }, ' or disassociating'],
  ['touching grass ', { type: 'muted', children: ['(reportedly)'] }],
  ['staring at a wall'],
  ['writing code nobody asked for'],
  ['lalala'],
  [':D']
]

export const getOfflineMessage = (): Content[] => {
  const index = Math.floor(Math.random() * MESSAGES.length)

  return MESSAGES[index]
}
