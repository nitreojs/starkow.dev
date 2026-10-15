import type { FC } from 'preact/compat'

import type { ScoreEvent } from '@starkow.dev/hooks'

interface BlockBlastScorePopupProps {
  event: ScoreEvent
}

export const BlockBlastScorePopup: FC<BlockBlastScorePopupProps> = ({ event }) => (
  <div class='bb-score-popup' aria-hidden='true'>
    <span class='bb-score-popup-points'>+{event.points}</span>
    {event.lines >= 2 && <span class='bb-score-popup-label'>{event.lines} lines</span>}
    {event.combo >= 2 && <span class='bb-score-popup-label'>combo ×{event.combo}</span>}
    {event.boardCleared && <span class='bb-score-popup-label bb-score-popup-board-clear'>board clear!</span>}
  </div>
)
