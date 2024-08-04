import { FC } from 'preact/compat'
import clsx from 'clsx'

import type { TodoItem as TodoItemInterface } from '../../sections'
import { IconBin, IconCircle } from '../../icons'

interface TodoItemProps {
  id: string
  text: string
  done: boolean

  index: number

  onCreate: (index?: number) => void
  onDone: (todo: TodoItemInterface) => void
  onSave: (todo: TodoItemInterface) => void
  onDelete: (todo: TodoItemInterface) => void
}

export const TodoItem: FC<TodoItemProps> = ({ id, text, done, index, onDone, onSave, onDelete, onCreate }) => {
  const isFirst = index === 0

  const onBinClick =
    isFirst ? () => {} :
    () => onDelete({ id, text, done })

  return (
    <div class="todo-item-container" key={id}>
      <IconCircle
        class={clsx('todo-icon', done && 'todo-circle-filled')}
        width='1.2rem'
        height='1.2rem'
        onClick={() => onDone({ id, text, done })}
      />

      <input
        class={clsx('todo-input', done && 'todo-done')}
        type="text"
        placeholder="buy a melon"
        value={text}
        onKeyPress={e => { if (e.key === 'Enter') { onCreate(index) } }}
        onInput={e => onSave({ id, text: e.currentTarget.value, done })}
      />

      <IconBin
        class="todo-icon"
        width='1.2rem'
        height='1.2rem'
        disabled={isFirst}
        onClick={onBinClick}
      />
    </div>
  )
}
