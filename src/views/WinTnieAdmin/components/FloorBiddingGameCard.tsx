import {useEffect, useState} from 'react';
import {Box, Button, CardHeader, Flex, Heading, Text} from '@pancakeswap/uikit';
import {useTranslation} from '@pancakeswap/localization';
import {BigNumber, ethers} from 'ethers';
import {getFloorBiddingAddress} from '../../../utils/addressHelpers';
import floorBiddingAbi from '../../../config/abi/FloorBidding.json'
import {useBiddingStatus} from "../../FloorBidding/hooks/useBiddingStatus";

// import {useGetTestOwner} from '../../FloorBidding/hooks/useGetTestOwner';
// import {useBiddingStatus} from '../../FloorBidding/hooks/useBiddingStatus';
// import {getFloorBiddingAddress} from '../../../utils/addressHelpers';
// import floorBiddingAbi from '../../../config/abi/floorBidding.json';
// import {BigNumber} from 'ethers';

const FloorBiddingGameCard = () => {
    const {t} = useTranslation();
    // const {isContractOwner} = useGetTestOwner();
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [isEndingGame, setIsEndingGame] = useState(false);
    const {gameStatus} = useBiddingStatus('0');

    const gameAdminAction = async (isStartGame: boolean) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const [accounts, chainId] = await Promise.all([
            provider.send('eth_requestAccounts', []),
            provider.send('eth_chainId', []),
        ]);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(getFloorBiddingAddress(Number(chainId)), floorBiddingAbi, signer);
        try {
            if (isStartGame) {
                await contract.functions.startGame(0)
            } else {
                await contract.functions.endGame(0)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleStartGame = () => {
        gameAdminAction(true)
    }

    const handleEndGame = () => {
        gameAdminAction(false)
    }

    return (
        <Flex alignItems="center" justifyContent="space-between" mb="16px" mt="16px" paddingX="10px">
            <CardHeader p="16px 24px">
                <Flex justifyContent="space-between">
                    <Heading mr="12px">{t('Game Type 4')}</Heading>
                    <Text>#001 / End at Aug 11, 2022, 00:01 AM</Text>
                </Flex>
            </CardHeader>
            <Box mb="8px">
                <Flex alignItems="center" justifyContent="space-between" mb="16px" mt="16px" paddingX="10px">
                    <Button
                        width="49%"
                        // disabled={!isContractOwner || isStartingGame}
                        onClick={handleStartGame}
                    >
                        {t('Start Game')}
                    </Button>
                    <Button
                        width="49%"
                        // disabled={!isContractOwner || isEndingGame}
                        onClick={handleEndGame}
                    >
                        {t('End Game')}
                    </Button>
                </Flex>
            </Box>
        </Flex>
    )
}

export default FloorBiddingGameCard;