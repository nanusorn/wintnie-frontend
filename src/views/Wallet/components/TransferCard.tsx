import {useTranslation} from "@pancakeswap/localization";
import {BalanceInput, Box, Button, Card, CardBody, CardHeader, Flex, Heading, Text} from "@pancakeswap/uikit";
import styled from "styled-components";
import {useState} from "react";
import {ethers} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import {getWalletAddress} from "../../../utils/addressHelpers";
import walletAbi from "../../../config/abi/Wallet.json";

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

const TransferCard = () => {
  const {t} = useTranslation()
  const [transferValue, setTransferValue] = useState('')
  const [walletBalance, setWalletBalance] = useState('0')
  const [contractProcessing, setContractProcessing] = useState(false)

  const handleTransferChanged = (input: string) => {
    setTransferValue(input)
  }

  const handleDepositWallet = async () => {
    setContractProcessing(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const [chainId] = await Promise.all([
      provider.send('eth_chainId', []),
    ]);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(getWalletAddress(Number(chainId)), walletAbi, signer);
    try {
      const eth = Number(transferValue) * 1000000000000000000
      const result = await contract.functions.deposit({value: BigNumber.from(eth.toString())})
      await result.wait()
      setTransferValue('0')

      const balance = await contract.functions.balance()
      setWalletBalance(ethers.utils.formatEther(balance.toString()))

    } catch(err) {
      console.log(err)
    }
    setContractProcessing(false)
  }

  const handleWithdrawWallet = async () => {
    setContractProcessing(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const [chainId] = await Promise.all([
      provider.send('eth_chainId', []),
    ]);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(getWalletAddress(Number(chainId)), walletAbi, signer);
    try {
      const eth = Number(transferValue) * 1000000000000000000
      const result = await contract.functions.withdraw(BigNumber.from(eth.toString()))
      await result.wait()
      setTransferValue('0')

      const balance = await contract.functions.balance()
      setWalletBalance(ethers.utils.formatEther(balance.toString()))

    } catch(err) {
      console.log(err)
    }
    setContractProcessing(false)
  }

  const handleBalanceWallet = async () => {
    setContractProcessing(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const [chainId] = await Promise.all([
      provider.send('eth_chainId', []),
    ]);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(getWalletAddress(Number(chainId)), walletAbi, signer);
    try {
      const result = await contract.functions.balance()
      setWalletBalance(ethers.utils.formatEther(result.toString()))
    } catch(err) {
      console.log(err)
    }
    setContractProcessing(false)
  }

  return (
    <StyledCard>
      <CardHeader p="16px 24px">
        <Flex justifyContent="space-between">
          <Heading mr="12px">{t('Wallet Transfer')}</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Grid>
          <Flex justifyContent={['left', null, null, 'flex-start']}>
            <Text textAlign="left" color="textSubtle">
              {t('Balance')}
            </Text>
          </Flex>
          <Flex flexDirection="column" mb="18px">
            <Heading color="secondary">{walletBalance}</Heading>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Text textAlign="left" color="textsubtitle">
              {t('Total Transfer')}
            </Text>
          </Flex>
          <Flex flexDirection="column" mb="18px">
            <BalanceInput
              value={transferValue}
              // placeholder={'0'}
              onUserInput={handleTransferChanged}
              // isWarning={showFieldWarning}
              // inputProps={{disabled: !isAuthenticated || isTxPending}}
              // className={!isAuthenticated || isTxPending ? '' : 'swiper-no-swiping'}
            />
          </Flex>
        </Grid>
        <Box mb="8px">
          <Button
            width="100%"
            // disabled={isContractOwner || !isAuthenticated}
            className="swiper-no-swiping"
            onClick={handleDepositWallet}
            // isLoading={isTxPending}
            isLoading={contractProcessing}
            // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
          >
            {t('deposit')}
          </Button>
        </Box>
        <Box mb="8px">
          <Button
            width="100%"
            // disabled={isContractOwner || !isAuthenticated}
            className="swiper-no-swiping"
            onClick={handleWithdrawWallet}
            // isLoading={isTxPending}
            isLoading={contractProcessing}
            // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
          >
            {t('withdraw')}
          </Button>
        </Box>
        <Box mb="8px">
          <Button
            width="100%"
            // disabled={isContractOwner || !isAuthenticated}
            className="swiper-no-swiping"
            onClick={handleBalanceWallet}
            // isLoading={isTxPending}
            isLoading={contractProcessing}
            // endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
          >
            {t('balance wallet')}
          </Button>
        </Box>
      </CardBody>
    </StyledCard>
  )
}

export default TransferCard
