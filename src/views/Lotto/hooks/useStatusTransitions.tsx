import { useWeb3React } from '@pancakeswap/wagmi'
import { LottoStatus } from 'config/constants/types'
import { usePreviousValue } from '@pancakeswap/hooks'
import { useEffect } from 'react'
import { useAppDispatch } from 'state'
import { useLotto } from 'state/Lotto/hooks'
import { fetchPublicLotteries, fetchCurrentLottoId, fetchUserLotteries } from 'state/Lotto'

const useStatusTransitions = () => {
  const {
    currentLottoId,
    isTransitioning,
    currentRound: { status },
  } = useLotto()

  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const previousStatus = usePreviousValue(status)

  useEffect(() => {
    // Only run if there is a status state change
    if (previousStatus !== status && currentLottoId) {
      // Current Lotto transitions from CLOSE > CLAIMABLE
      if (previousStatus === LottoStatus.CLOSE && status === LottoStatus.CLAIMABLE) {
        dispatch(fetchPublicLotteries({ currentLottoId }))
        if (account) {
          dispatch(fetchUserLotteries({ account, currentLottoId }))
        }
      }
      // Previous Lotto to new Lotto. From CLAIMABLE (previous round) > OPEN (new round)
      if (previousStatus === LottoStatus.CLAIMABLE && status === LottoStatus.OPEN) {
        dispatch(fetchPublicLotteries({ currentLottoId }))
        if (account) {
          dispatch(fetchUserLotteries({ account, currentLottoId }))
        }
      }
    }
  }, [currentLottoId, status, previousStatus, account, dispatch])

  useEffect(() => {
    // Current Lotto is CLAIMABLE and the Lotto is transitioning to a NEW round - fetch current Lotto ID every 10s.
    // The isTransitioning condition will no longer be true when fetchCurrentLottoId returns the next Lotto ID
    if (previousStatus === LottoStatus.CLAIMABLE && status === LottoStatus.CLAIMABLE && isTransitioning) {
      dispatch(fetchCurrentLottoId())
      dispatch(fetchPublicLotteries({ currentLottoId }))
      const interval = setInterval(async () => {
        dispatch(fetchCurrentLottoId())
        dispatch(fetchPublicLotteries({ currentLottoId }))
      }, 10000)
      return () => clearInterval(interval)
    }
    return () => null
  }, [status, previousStatus, isTransitioning, currentLottoId, dispatch])
}

export default useStatusTransitions
