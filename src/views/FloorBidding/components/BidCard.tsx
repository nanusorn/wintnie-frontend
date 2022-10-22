import {useEffect, useState} from 'react'
import styled from 'styled-components'
import {
    Card,
    CardHeader,
    CardBody,
    Flex,
    Heading,
    Text,
    Button,
    Box,
    CardFooter,
    alertVariants,
    BalanceInput,
    ExpandableLabel, BoxProps,
} from '@pancakeswap/uikit'
import {useTranslation} from '@pancakeswap/localization'
import {BigNumber} from '@ethersproject/bignumber'
import {Zero} from '@ethersproject/constants'
import {parseUnits} from '@ethersproject/units'
import useCatchTxError from "../../../hooks/useCatchTxError";
import {useGetTestOwner} from "../hooks/useGetTestOwner";
import {getFloorBiddingAddress, getWalletAddress} from "../../../utils/addressHelpers";
import floorBiddingAbi from "../../../config/abi/floorBidding.json";
import walletAbi from "../../../config/abi/wallet.json";
import {ToastContainer} from "../../../components/Toast";
import {sample} from "lodash";
import {useBiddingStatus} from "../hooks/useBiddingStatus";
import {useBidHistory} from "../hooks/useBidHistory";
import {useMoralis, useMoralisQuery} from "react-moralis";
import Moralis from "moralis-v1";

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;

  ${({theme}) => theme.mediaQueries.md} {
    grid-column-gap: 32px;
    grid-template-columns: auto 1fr;
  }
`

const StyledCard = styled(Card)`
  width: 100%;

  ${({theme}) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({theme}) => theme.mediaQueries.md} {
    width: 500px;
  }
`

const PreviousWrapper = styled.div`
  background: ${({theme}) => theme.colors.background};
  padding: 24px;
`

const getValueAsEthersBn = (value: string) => {
    const valueAsFloat = parseFloat(value)
    return Number.isNaN(valueAsFloat) ? Zero : parseUnits(value)
}

const getButtonProps = (value: BigNumber, bnbBalance: BigNumber, minBetAmountBalance: BigNumber) => {
    const hasSufficientBalance = () => {
        if (value.gt(0)) {
            return value.lte(bnbBalance)
        }
        return bnbBalance.gt(0)
    }

    if (!hasSufficientBalance()) {
        return {key: 'Insufficient %symbol% balance', disabled: true}
    }

    if (value.eq(0)) {
        return {key: 'Enter an amount', disabled: true}
    }

    return {key: 'Confirm', disabled: value.lt(minBetAmountBalance)}
}

interface BidCardProp {
    gameType: string
}

const BidCard = ({gameType}) => {
    const chainId = 97;
    const {t} = useTranslation();
    const { refreshHistory, bidHistory } = useBidHistory();
    const { gameStatus } = useBiddingStatus(gameType);
    const [toasts, setToasts] = useState([]);
    const [bidStatus, setBidStatus] = useState('-');
    const [, setGameType] = useState('');
    const [sessionStarted, setSessionStarted] = useState(false)
    const [sessionID, setSessionID] = useState('');
    const [bucketBalance, setBucketBalance] = useState('0');
    const [sessionEndAt, setSessionEndAt] = useState('');
    const [bidValue, setBidValue] = useState('');
    const [isWinner, setIsWinner] = useState(false);
    const valueAsBn = getValueAsEthersBn(bidValue);
    const {key, disabled} = getButtonProps(valueAsBn, Zero, BigNumber.from(0));
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmittingBid, setIsSubmittingBid] = useState(false);
    // const showFieldWarning = isAuthenticated && valueAsBn.gt(0) && errorMessage !== null;
    const {loading: isTxPending} = useCatchTxError()
    const {isContractOwner} = useGetTestOwner();
    const { isAuthenticated } = useMoralis()

    const handleInputChange = (input: string) => {
        setBidValue(input)
    }

    const handleBidding = async () => {
        setIsSubmittingBid(true);
        await Moralis.enableWeb3()
        const options = {
            contractAddress: getFloorBiddingAddress(chainId),
            functionName: "bet",
            abi: floorBiddingAbi,
            chain: "bsc testnet",
            params: {
                gameType: 0,
                number: +bidValue,
            }
        };
        try {
            let result = await Moralis.executeFunction(options)
            let receipt = await result.wait()
            receipt.events.forEach((element) => {
                if (element.event != undefined) {
                    if (element.event == "AnnounceWinner") {
                        setBidStatus("WINNER");
                        activateToast("WINNER");
                        setIsWinner(true);
                    } else if (element.event == "AnnounceWinnerChange") {
                        setBidStatus("Winner changed");
                        activateToast("Winner changed");
                        setIsWinner(false);
                    }
                }
            });
            setIsSubmittingBid(false);
        } catch(error) {
            setIsSubmittingBid(false);
        }
    }

    const activateToast = (description = "") => {
        const now = Date.now();
        const randomToast = {
            id: `id-${now}`,
            title: `Title: ${now}`,
            description,
            type: alertVariants[sample(Object.keys(alertVariants))],
        };
        setToasts((prevToasts) => [randomToast, ...prevToasts]);
    }

    const handleTransferWallet = async () => {
        await Moralis.enableWeb3()
        const options = {
            contractAddress: getWalletAddress(chainId),
            functionName: "deposit",
            abi: walletAbi,
            chain: "bsc testnet",
            msgValue: Moralis.Units.ETH("0.1"),
            params: {
            }
        };
        await Moralis.executeFunction(options);
    }

    const handleBalanceWallet = async () => {
        await Moralis.enableWeb3()
        const options = {
            contractAddress: getWalletAddress(chainId),
            functionName: "accountBalance",
            abi: walletAbi,
            chain: "bsc testnet",
            params: {
            }
        };
        const balance = await Moralis.executeFunction(options)
        console.log(+balance.toString()/1000000000000000000)
    }

    const handleRemove = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((prevToast) => prevToast.id !== id));
    }

    useEffect(() => {
        if (gameStatus != null) {
            setGameType(gameStatus.gameType.toString());
            setBucketBalance(Moralis.Units.FromWei(gameStatus.prize.toString(), 18));
            let endingTimeStamp = gameStatus.startedAt.toNumber() + gameStatus.duration;
            setSessionID(endingTimeStamp === 86400 ? '-' : gameStatus.gameId.toString());
            setSessionStarted(endingTimeStamp !== 86400)
            setSessionEndAt(formatDateTime(endingTimeStamp));
        }
    }, [gameStatus])

    const formatDateTime = (timestamp: number) => {
        if (timestamp === 86400) {
            return t("Session not start yet")
        }
        const d = new Date(timestamp * 1000);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() ;
    }

    const { fetch } = useMoralisQuery(
        "FloorBiddingAnnounceBet",
        (query) => query.equalTo(
            "bettor",
            "0x6207be8a813e9ecdff6f388b99a8108edf8b9cee"
        ).equalTo("gameType", "0").equalTo("gameId", "3"),
        [],
        { autoFetch: false }
    )

    const getGameTitle = (gameType: string) => {
        switch (gameType) {
            case '0':
                return 'Game type 0, 0.0094 BNB per bit'
        }
    }

    const handleRefresh = () => {
        // refreshHistory();
        const basicQuery = async () => {
            const results = await fetch();
            alert("Successfully retrieved " + results.length );
            for (let i = 0; i < results.length; i++) {
                const object = results[i];
                console.log(object.id + " - " + object.get("createdAt"));
            }
        };
        basicQuery();
    }

    return (
        <StyledCard>
            <CardHeader p="16px 24px">
                <Flex justifyContent="space-between">
                    <Heading mr="12px">{t('Floor Bidding')}</Heading>
                    <Text>{getGameTitle(gameType)}</Text>
                </Flex>
            </CardHeader>
            <CardBody>
                <Grid>

                    <Flex justifyContent={['left', null, null, 'flex-start']}>
                        <Text textAlign="left" color="textSubtle">
                            {t('Session ID')}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" mb="18px">
                        <Heading color="secondary">{sessionID}</Heading>
                    </Flex>

                    <Flex justifyContent={['left', null, null, 'flex-start']}>
                        <Text textAlign="left" color="textSubtle">
                            {t('Session End At')}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" mb="18px">
                        <Heading color="secondary">{sessionEndAt}</Heading>
                    </Flex>

                    <Flex justifyContent={['left', null, null, 'flex-start']}>
                        <Text textAlign="left" color="textSubtle">
                            {t('Prize Bucket (BNB)')}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" mb="18px">
                        <Heading color="secondary">{bucketBalance}</Heading>
                    </Flex>

                    <Flex justifyContent={['left', null, null, 'flex-start']}>
                        <Text textAlign="left" color="textsubtitle">
                            {t('Status')}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" mb="18px">
                        <Heading color={isWinner ? "green" : "blue"}>{t(bidStatus)}</Heading>
                    </Flex>

                    <Flex alignItems="center" justifyContent="space-between" mb="8px">
                        <Text textAlign="left" color="textsubtitle">
                            {t('Bet your unique lowest')}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" mb="18px">
                        <BalanceInput
                            value={bidValue}
                            placeholder={'0'}
                            onUserInput={handleInputChange}
                            // isWarning={showFieldWarning}
                            // inputProps={{disabled: !isAuthenticated || isTxPending}}
                            // className={!isAuthenticated || isTxPending ? '' : 'swiper-no-swiping'}
                        />
                    </Flex>
                </Grid>
                <Box mb="8px">
                    <Button
                        width="100%"
                        disabled={isContractOwner || !isAuthenticated}
                        // className={!isAuthenticated ? '' : 'swiper-no-swiping'}
                        onClick={handleBidding}
                        // isLoading={isTxPending}
                        isLoading={isSubmittingBid}
                        // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
                    >
                        {t('Submit Your Bid')}
                    </Button>
                </Box>
                <Box mb="8px">
                    <Button
                        width="100%"
                        disabled={isContractOwner || !isAuthenticated}
                        // className={!isAuthenticated ? '' : 'swiper-no-swiping'}
                        onClick={handleTransferWallet}
                        // isLoading={isTxPending}
                        isLoading={isSubmittingBid}
                        // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
                    >
                        {t('transfer wallet')}
                    </Button>
                </Box>
                <Box mb="8px">
                    <Button
                        width="100%"
                        disabled={isContractOwner || !isAuthenticated}
                        // className={!isAuthenticated ? '' : 'swiper-no-swiping'}
                        onClick={handleBalanceWallet}
                        // isLoading={isTxPending}
                        isLoading={isSubmittingBid}
                        // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
                    >
                        {t('balance wallet')}
                    </Button>
                </Box>
                <Box mb="8px">
                    <Button
                        width="100%"
                        disabled={isContractOwner || !isAuthenticated}
                        // className={!isAuthenticated ? '' : 'swiper-no-swiping'}
                        onClick={handleRefresh}
                        // isLoading={isTxPending}
                        isLoading={isSubmittingBid}
                        // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
                    >
                        {t('refresh')}
                    </Button>

                </Box>
            </CardBody>
            <CardFooter p="0">
                {isExpanded && <PreviousWrapper>Hello World!!!<br/>World of WarCraft</PreviousWrapper>}
                <Flex p="8px 24px" alignItems="center" justifyContent="center">
                    <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? t('Hide') : t('Your current round details')}
                    </ExpandableLabel>
                </Flex>
            </CardFooter>
            <ToastContainer toasts={toasts} onRemove={handleRemove} />
        </StyledCard>
    )
}

export default BidCard
