import {useEffect, useState} from "react";
import {Box, Button, CardHeader, Flex, Heading, Text} from "@pancakeswap/uikit";
import {useTranslation} from "@pancakeswap/localization";
// import {useGetTestOwner} from "../../FloorBidding/hooks/useGetTestOwner";
// import {useBiddingStatus} from "../../FloorBidding/hooks/useBiddingStatus";
// import {getFloorBiddingAddress} from "../../../utils/addressHelpers";
// import floorBiddingAbi from "../../../config/abi/floorBidding.json";
// import {BigNumber} from "ethers";

const FloorBiddingGameCard = () => {
    const chainId = 97;
    const {t} = useTranslation();
    // const {isContractOwner} = useGetTestOwner();
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [isEndingGame, setIsEndingGame] = useState(false);
    // const {gameStatus} = useBiddingStatus("0");

    const handleStartGame = async () => {
        /*
        setIsStartingGame(true);
        await Moralis.enableWeb3()
        const options = {
            contractAddress: getFloorBiddingAddress(chainId),
            functionName: "startGame",
            abi: floorBiddingAbi,
            chain: "bsc testnet",
            params: {
                gameType: BigNumber.from("0"),
            }
        };
        let result = await Moralis.executeFunction(options);
        let res = result.wait(1);
        console.log(res);
        setIsStartingGame(false);
         */
    }

    const handleEndGame = async () => {
        /*
        setIsEndingGame(true);
        await Moralis.enableWeb3()
        const options = {
            contractAddress: getFloorBiddingAddress(chainId),
            functionName: "endGame",
            abi: floorBiddingAbi,
            chain: "bsc testnet",
            params: {
                gameType: BigNumber.from("0"),
            }
        };
        let result = await Moralis.executeFunction(options);
        let res = result.wait(1);
        console.log(res);
        setIsEndingGame(false);
         */
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
                        {"Start Game"}
                    </Button>
                    <Button
                        width="49%"
                        // disabled={!isContractOwner || isEndingGame}
                        onClick={handleEndGame}
                    >
                        {"End Game"}
                    </Button>
                </Flex>
            </Box>
        </Flex>
    )
}

export default FloorBiddingGameCard;