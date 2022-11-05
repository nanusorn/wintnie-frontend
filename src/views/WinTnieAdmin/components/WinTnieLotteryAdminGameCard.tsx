import {useEffect, useState} from 'react'
import {Box, Button, CardHeader, Flex, Heading, Text} from '@pancakeswap/uikit'
import {useTranslation} from '@pancakeswap/localization'
import {BigNumber, ethers} from 'ethers'
import {getFloorBiddingAddress} from '../../../utils/addressHelpers'
import winTnieLotteryAbi from '../../../config/abi/WinTnieLottery.json'
import {useBiddingStatus} from "../../FloorBidding/hooks/useBiddingStatus"

const WinTnieLotteryAdminGameCard = () => {
  const {t} = useTranslation();
  // const {isContractOwner} = useGetTestOwner();
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isEndingGame, setIsEndingGame] = useState(false);
  const {gameStatus} = useBiddingStatus('0');

  const gameAdminAction = async (isStartSession: boolean) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const [accounts, chainId] = await Promise.all([
      provider.send('eth_requestAccounts', []),
      provider.send('eth_chainId', []),
    ]);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(getFloorBiddingAddress(Number(chainId)), winTnieLotteryAbi, signer);
    try {
      if (isStartSession) {
        await contract.st
        // result = await contract.startLottery(
        //   endTime,
        //   _priceTicketInCake,
        //   _discountDivisor,
        //   _rewardsBreakdown,
        //   _treasuryFee,
        //   { from: operator }
        // )
      } else {
        await contract.functions.endGame(0)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleStartSession = () => {
    gameAdminAction(true)
  }

  const handleEndSession = () => {
    gameAdminAction(false)
  }

  return (
    <Flex alignItems="center" justifyContent="space-between" mb="16px" mt="16px" paddingX="10px">
      <CardHeader p="16px 24px">
        <Flex justifyContent="space-between">
          <Heading mr="12px">{t('WinTnie Lottery')}</Heading>
          <Text>...</Text>
        </Flex>
      </CardHeader>
      <Box mb="8px">
        <Flex alignItems="center" justifyContent="space-between" mb="16px" mt="16px" paddingX="10px">
          <Button
            width="49%"
            // disabled={!isContractOwner || isStartingGame}
            onClick={handleStartSession}
          >
            {t('Start Session')}
          </Button>
          <Button
            width="49%"
            // disabled={!isContractOwner || isEndingGame}
            onClick={handleEndSession}
          >
            {t('End Session')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

export default WinTnieLotteryAdminGameCard;