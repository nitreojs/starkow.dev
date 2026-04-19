import { FC } from 'preact/compat'

interface BlockBlastGameOverProps {
  score: number
  onRetry: () => void
}

export const BlockBlastGameOver: FC<BlockBlastGameOverProps> = ({ score, onRetry }) => (
  <div class='bb-game-over' role='dialog' aria-label='game over'>
    <p class='text-large'>game over.</p>
    <p>final score: <b>{score}</b></p>
    <button class='cool-button' onClick={onRetry}>play again</button>
  </div>
)
