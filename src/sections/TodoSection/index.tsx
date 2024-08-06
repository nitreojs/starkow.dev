import type { FC } from 'preact/compat'
import useLocalStorageState from 'use-local-storage-state'
import { CoolButton, TodoItem } from '../../components'

export interface TodoItem {
  id: string
  text: string
  done: boolean
}

const generateId = () => crypto.randomUUID()

export const TodoSection: FC = ({}) => {
  const [todos, setTodos] = useLocalStorageState<TodoItem[]>('todos', {
    defaultValue: [{ id: generateId(), text: '', done: false }]
  })

  const createTodo = (index = -1) => {
    const newTodo = { id: generateId(), text: '', done: false }

    if (index === -1) {
      setTodos([...todos, newTodo])
    } else {
      setTodos([...todos.slice(0, index + 1), newTodo, ...todos.slice(index + 1)])
    }
  }

  const saveTodo = (todo: TodoItem) => {
    const index = todos.findIndex(t => t.id === todo.id)

    if (index === -1) {
      return alert('smth went terribly wrong')
    }

    const newTodos = [...todos]

    newTodos[index] = todo

    setTodos(newTodos)
  }

  const deleteTodo = (todo: TodoItem) => {
    const index = todos.findIndex(t => t.id === todo.id)

    if (index === -1) {
      return alert('smth went terribly wrong')
    }

    const newTodos = [...todos]

    newTodos.splice(index, 1)

    setTodos(newTodos)
  }

  const doneTodo = (todo: TodoItem) => {
    const index = todos.findIndex(t => t.id === todo.id)

    if (index === -1) {
      return alert('smth went terribly wrong')
    }

    const newTodos = [...todos]

    newTodos[index].done = !todo.done

    setTodos(newTodos)
  }

  return (
    <section id='todo'>
      <h2>todo list</h2>
      <p>
        this is just quite literally your own todo list on my website
      </p>

      {
        todos.map((e, i) => (
          <TodoItem
            onCreate={createTodo}
            onDone={doneTodo}
            onDelete={deleteTodo}
            onSave={saveTodo}
            index={i}
            {...e}
          />
        ))
      }

      <CoolButton
        text='+'
        onClick={createTodo}
        style={{ justifyContent: 'center', backgroundColor: '#212121' }}
      />

    </section>
  )
}
