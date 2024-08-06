import { Inputs, useEffect } from 'preact/hooks'

export const useInterval = (
  callback: () => void,
  interval: number,
  deps?: Inputs
) => {
  useEffect(() => {
    const intervalID = setInterval(callback, interval)

    return () => clearInterval(intervalID)
  }, deps || [])
}
