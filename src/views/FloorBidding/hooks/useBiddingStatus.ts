import { useCallback, useEffect, useRef, useState } from 'react'
import {BigNumber, ethers} from 'ethers'
import {getFloorBiddingAddress} from "../../../utils/addressHelpers";
import floorBiddingAbi from "../../../config/abi/FloorBidding.json";
import {GameStructOutput} from "../../../config/abi/types/FloorBidding";


export const useBiddingStatus = (gameType: string) => {
  const [activateTimer, setActivateTimer] = useState(true)
  const [refreshStatus, setRefreshStatus] = useState(true);
  const [gameStatus, setGameStatus] = useState<GameStructOutput | null>({
    gameType: 0,
    gameId: 0,
    duration: 0,
    price: BigNumber.from('0'),
    startedAt: BigNumber.from('0'),
    prize: BigNumber.from('0'),
    status: 0,
  });
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  const startTimer = useCallback(() => {
    timer.current = setInterval(() => {
      setRefreshStatus(true);
    }, 5000)
  }, [timer])

  const fetchGameStatus = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const [accounts, chainId] = await Promise.all([
      provider.send('eth_requestAccounts', []),
      provider.send('eth_chainId', []),
    ]);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(getFloorBiddingAddress(Number(chainId)), floorBiddingAbi, signer);
    try {
      const result = await contract.functions.getGame(Number(gameType))
      if (result) {
        // @ts-ignore
        setGameStatus({
          gameType: result[0].gameType,
          gameId: result[0].gameId,
          duration: result[0].duration,
          price: BigNumber.from(result[0].price.toString()),
          startedAt: BigNumber.from(result[0].startedAt.toString()),
          prize: BigNumber.from(result[0].prize),
          status: result[0].status,
          length: 7,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (refreshStatus) {
      setRefreshStatus(false)
      fetchGameStatus()
    }
    if (activateTimer) {
      startTimer();
      setActivateTimer(false);
    }
  }, [refreshStatus, activateTimer])


  return { gameStatus }
}
