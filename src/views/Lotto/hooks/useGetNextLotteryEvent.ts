import { LottoStatus } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'

interface LottoEvent {
  nextEventTime: number
  postCountdownText?: string
  preCountdownText?: string
}

const vrfRequestTime = 180 // 3 mins
const secondsBetweenRounds = 300 // 5 mins
const transactionResolvingBuffer = 30 // Delay countdown by 30s to ensure contract transactions have been calculated and broadcast

const useGetNextLottoEvent = (endTime: number, status: LottoStatus): LottoEvent => {
  const { t } = useTranslation()
  return useMemo(() => {
    // Current Lotto is active
    if (status === LottoStatus.OPEN) {
      return {
        nextEventTime: endTime + transactionResolvingBuffer,
        preCountdownText: null,
        postCountdownText: t('until the draw'),
      }
    }
    // Current Lotto has finished but not yet claimable
    if (status === LottoStatus.CLOSE) {
      return {
        nextEventTime: endTime + transactionResolvingBuffer + vrfRequestTime,
        preCountdownText: t('Winners announced in'),
        postCountdownText: null,
      }
    }
    // Current Lotto claimable. Next Lotto has not yet started
    if (status === LottoStatus.CLAIMABLE) {
      return {
        nextEventTime: endTime + transactionResolvingBuffer + secondsBetweenRounds,
        preCountdownText: t('Tickets on sale in'),
        postCountdownText: null,
      }
    }
    return { nextEventTime: null, preCountdownText: null, postCountdownText: null }
  }, [endTime, status, t])
}

export default useGetNextLottoEvent
