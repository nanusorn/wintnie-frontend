import { useState, useEffect } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Flex, Skeleton, Heading, Box, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { LottoRound, LottoRoundGraphEntity } from 'state/types'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useGetLottoGraphDataById } from 'state/Lotto/hooks'
import { getGraphLotteries } from 'state/Lotto/getLotteriesData'
import { formatNumber, getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import RewardBrackets from '../RewardBrackets'

const NextDrawWrapper = styled(Flex)`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
  }
`

const PreviousRoundCardFooter: React.FC<
  React.PropsWithChildren<{ LottoNodeData: LottoRound; LottoId: string }>
> = ({ LottoNodeData, LottoId }) => {
  const { t } = useTranslation()
  const [fetchedLottoGraphData, setFetchedLottoGraphData] = useState<LottoRoundGraphEntity>()
  const LottoGraphDataFromState = useGetLottoGraphDataById(LottoId)
  const cakePriceBusd = usePriceCakeBusd()

  useEffect(() => {
    const getGraphData = async () => {
      const fetchedGraphData = await getGraphLotteries(undefined, undefined, { id_in: [LottoId] })
      setFetchedLottoGraphData(fetchedGraphData[0])
    }
    if (!LottoGraphDataFromState) {
      getGraphData()
    }
  }, [LottoGraphDataFromState, LottoId])

  let prizeInBusd = new BigNumber(NaN)
  if (LottoNodeData) {
    const { amountCollectedInCake } = LottoNodeData
    prizeInBusd = amountCollectedInCake.times(cakePriceBusd)
  }

  const getTotalUsers = (): string => {
    if (!LottoGraphDataFromState && fetchedLottoGraphData) {
      return fetchedLottoGraphData?.totalUsers?.toLocaleString()
    }

    if (LottoGraphDataFromState) {
      return LottoGraphDataFromState?.totalUsers?.toLocaleString()
    }

    return null
  }

  const getPrizeBalances = () => {
    return (
      <>
        {prizeInBusd.isNaN() ? (
          <Skeleton my="7px" height={40} width={200} />
        ) : (
          <Heading scale="xl" lineHeight="1" color="secondary">
            ~${formatNumber(getBalanceNumber(prizeInBusd), 0, 0)}
          </Heading>
        )}
        {prizeInBusd.isNaN() ? (
          <Skeleton my="2px" height={14} width={90} />
        ) : (
          <Balance
            fontSize="14px"
            color="textSubtle"
            unit=" CAKE"
            value={getBalanceNumber(LottoNodeData?.amountCollectedInCake)}
            decimals={0}
          />
        )}
      </>
    )
  }

  return (
    <NextDrawWrapper>
      <Flex mr="24px" flexDirection="column" justifyContent="space-between">
        <Box>
          <Heading>{t('Prize pot')}</Heading>
          {getPrizeBalances()}
        </Box>
        <Box mb="24px">
          <Flex>
            <Text fontSize="14px" display="inline">
              {t('Total players this round')}:{' '}
              {LottoNodeData && (LottoGraphDataFromState || fetchedLottoGraphData) ? (
                getTotalUsers()
              ) : (
                <Skeleton height={14} width={31} />
              )}
            </Text>
          </Flex>
        </Box>
      </Flex>
      <RewardBrackets LottoNodeData={LottoNodeData} isHistoricRound />
    </NextDrawWrapper>
  )
}

export default PreviousRoundCardFooter
