import { useEffect, useState, useRef } from 'react'
import { useAppDispatch } from 'state'
import { useLotto } from 'state/Lotto/hooks'
import { fetchCurrentLotto, setLottoIsTransitioning } from 'state/Lotto'

const useNextEventCountdown = (nextEventTime: number): number => {
  const dispatch = useAppDispatch()
  const [secondsRemaining, setSecondsRemaining] = useState(null)
  const timer = useRef(null)
  const { currentLottoId } = useLotto()

  useEffect(() => {
    dispatch(setLottoIsTransitioning({ isTransitioning: false }))
    const currentSeconds = Math.floor(Date.now() / 1000)
    const secondsRemainingCalc = nextEventTime - currentSeconds
    setSecondsRemaining(secondsRemainingCalc)

    timer.current = setInterval(() => {
      setSecondsRemaining((prevSecondsRemaining) => {
        // Clear current interval at end of countdown and fetch current Lotto to get updated state
        if (prevSecondsRemaining <= 1) {
          clearInterval(timer.current)
          dispatch(setLottoIsTransitioning({ isTransitioning: true }))
          dispatch(fetchCurrentLotto({ currentLottoId }))
        }
        return prevSecondsRemaining - 1
      })
    }, 1000)

    return () => clearInterval(timer.current)
  }, [setSecondsRemaining, nextEventTime, currentLottoId, timer, dispatch])

  return secondsRemaining
}

export default useNextEventCountdown
