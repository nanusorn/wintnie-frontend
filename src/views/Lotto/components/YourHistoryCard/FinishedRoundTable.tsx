import styled from 'styled-components'
import { Text, Box, Flex, Button } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { LottoStatus } from 'config/constants/types'
import { useGetUserLotteriesGraphData } from 'state/Lotto/hooks'
import FinishedRoundRow from './FinishedRoundRow'

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
`

interface FinishedRoundTableProps {
  handleHistoryRowClick: (string) => void
  handleShowMoreClick: () => void
  numUserRoundsRequested: number
}

const FinishedRoundTable: React.FC<React.PropsWithChildren<FinishedRoundTableProps>> = ({
  handleShowMoreClick,
  numUserRoundsRequested,
  handleHistoryRowClick,
}) => {
  const { t } = useTranslation()
  const userLottoData = useGetUserLotteriesGraphData()

  const filteredForClaimable = userLottoData?.rounds.filter((round) => {
    return round.status.toLowerCase() === LottoStatus.CLAIMABLE
  })

  const sortedByRoundId = filteredForClaimable?.sort((roundA, roundB) => {
    return parseInt(roundB.LottoId, 10) - parseInt(roundA.LottoId, 10)
  })

  return (
    <>
      <Grid px="24px" pt="24px" mb="8px">
        <Text bold fontSize="12px" color="secondary">
          #
        </Text>
        <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
          {t('Date')}
        </Text>
        <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
          {t('Your Tickets')}
        </Text>
        <Box width="20px" />
      </Grid>
      <Flex px="24px" pb="24px" flexDirection="column" overflowY="scroll" height="240px">
        {userLottoData &&
          sortedByRoundId.map((finishedRound) => (
            <FinishedRoundRow
              key={finishedRound.LottoId}
              roundId={finishedRound.LottoId}
              hasWon={finishedRound.claimed}
              numberTickets={finishedRound.totalTickets}
              endTime={finishedRound.endTime}
              onClick={handleHistoryRowClick}
            />
          ))}
        {userLottoData?.rounds?.length === numUserRoundsRequested && (
          <Flex justifyContent="center">
            <Button mt="12px" variant="text" width="fit-content" onClick={handleShowMoreClick}>
              {t('Show More')}
            </Button>
          </Flex>
        )}
      </Flex>
    </>
  )
}

export default FinishedRoundTable
