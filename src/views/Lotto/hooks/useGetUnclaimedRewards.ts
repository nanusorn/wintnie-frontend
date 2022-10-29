import { useState, useEffect } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useGetLotteriesGraphData, useGetUserLotteriesGraphData, useLotto } from 'state/Lotto/hooks'
import fetchUnclaimedUserRewards from 'state/Lotto/fetchUnclaimedUserRewards'
import { FetchStatus } from 'config/constants/types'

const useGetUnclaimedRewards = () => {
  const { account } = useWeb3React()
  const { isTransitioning, currentLottoId } = useLotto()
  const userLottoData = useGetUserLotteriesGraphData()
  const lotteriesData = useGetLotteriesGraphData()
  const [unclaimedRewards, setUnclaimedRewards] = useState([])
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.Idle)

  useEffect(() => {
    // Reset on account change and round transition
    setFetchStatus(FetchStatus.Idle)
  }, [account, isTransitioning])

  const fetchAllRewards = async () => {
    setFetchStatus(FetchStatus.Fetching)
    const unclaimedRewardsResponse = await fetchUnclaimedUserRewards(
      account,
      userLottoData,
      lotteriesData,
      currentLottoId,
    )
    setUnclaimedRewards(unclaimedRewardsResponse)
    setFetchStatus(FetchStatus.Fetched)
  }

  return { fetchAllRewards, unclaimedRewards, fetchStatus }
}

export default useGetUnclaimedRewards
