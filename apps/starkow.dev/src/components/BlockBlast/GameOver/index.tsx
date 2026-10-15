import { FC } from 'preact/compat'

interface BlockBlastGameOverProps {
  score: number
  note?: string
  onRetry: () => void
}

export const BlockBlastGameOver: FC<BlockBlastGameOverProps> = ({ score, note, onRetry }) => (
  <div class='bb-game-over' role='dialog' aria-label='game over'>
    <p class='text-large'>game over.</p>
    <p>final score: <b>{score}</b></p>
    {note !== undefined && <p class='bb-game-over-note text-half-visible'>{note}</p>}
    <button class='cool-button' onClick={onRetry}>play again</button>
  </div>
)
