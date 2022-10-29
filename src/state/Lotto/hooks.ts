import { useEffect, useMemo } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useSelector, batch } from 'react-redux'
import { useAppDispatch } from 'state'
import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import { State } from '../types'
import { fetchCurrentLottoId, fetchCurrentLotto, fetchUserTicketsAndLotteries, fetchPublicLotteries } from '.'
import { makeLottoGraphDataByIdSelector, LottoSelector } from './selectors'

// Lotto
export const useGetCurrentLottoId = () => {
  return useSelector((state: State) => state.Lotto.currentLottoId)
}

export const useGetUserLotteriesGraphData = () => {
  return useSelector((state: State) => state.Lotto.userLottoData)
}

export const useGetLotteriesGraphData = () => {
  return useSelector((state: State) => state.Lotto.lotteriesData)
}

export const useGetLottoGraphDataById = (LottoId: string) => {
  const LottoGraphDataByIdSelector = useMemo(() => makeLottoGraphDataByIdSelector(LottoId), [LottoId])
  return useSelector(LottoGraphDataByIdSelector)
}

export const useFetchLotto = (fetchPublicDataOnly = false) => {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const currentLottoId = useGetCurrentLottoId()

  useEffect(() => {
    // get current Lotto ID & max ticket buy
    dispatch(fetchCurrentLottoId())
  }, [dispatch])

  useFastRefreshEffect(() => {
    if (currentLottoId) {
      batch(() => {
        // Get historical Lotto data from nodes +  last 100 subgraph entries
        dispatch(fetchPublicLotteries({ currentLottoId }))
        // get public data for current Lotto
        dispatch(fetchCurrentLotto({ currentLottoId }))
      })
    }
  }, [dispatch, currentLottoId])

  useEffect(() => {
    // get user tickets for current Lotto, and user Lotto subgraph data
    if (account && currentLottoId && !fetchPublicDataOnly) {
      dispatch(fetchUserTicketsAndLotteries({ account, currentLottoId }))
    }
  }, [dispatch, currentLottoId, account, fetchPublicDataOnly])
}

export const useLotto = () => {
  return useSelector(LottoSelector)
}
