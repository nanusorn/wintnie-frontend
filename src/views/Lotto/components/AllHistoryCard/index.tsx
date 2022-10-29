import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Card, Text, Skeleton, CardHeader, Box } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useAppDispatch } from 'state'
import { useLotto } from 'state/Lotto/hooks'
import { fetchLotto } from 'state/Lotto/helpers'
import { LottoStatus } from 'config/constants/types'
import RoundSwitcher from './RoundSwitcher'
import { getDrawnDate, processLottoResponse } from '../../helpers'
import PreviousRoundCardBody from '../PreviousRoundCard/Body'
import PreviousRoundCardFooter from '../PreviousRoundCard/Footer'

const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 756px;
  }
`

const StyledCardHeader = styled(CardHeader)`
  z-index: 2;
  background: none;
  border-bottom: 1px ${({ theme }) => theme.colors.cardBorder} solid;
`

const AllHistoryCard = () => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    currentLottoId,
    lotteriesData,
    currentRound: { status, isLoading },
  } = useLotto()
  const [latestRoundId, setLatestRoundId] = useState(null)
  const [selectedRoundId, setSelectedRoundId] = useState('')
  const [selectedLottoNodeData, setSelectedLottoNodeData] = useState(null)
  const timer = useRef(null)

  const numRoundsFetched = lotteriesData?.length

  useEffect(() => {
    if (currentLottoId) {
      const currentLottoIdAsInt = currentLottoId ? parseInt(currentLottoId) : null
      const mostRecentFinishedRoundId =
        status === LottoStatus.CLAIMABLE ? currentLottoIdAsInt : currentLottoIdAsInt - 1
      setLatestRoundId(mostRecentFinishedRoundId)
      setSelectedRoundId(mostRecentFinishedRoundId.toString())
    }
  }, [currentLottoId, status])

  useEffect(() => {
    setSelectedLottoNodeData(null)

    const fetchLottoData = async () => {
      const LottoData = await fetchLotto(selectedRoundId)
      const processedLottoData = processLottoResponse(LottoData)
      setSelectedLottoNodeData(processedLottoData)
    }

    timer.current = setInterval(() => {
      if (selectedRoundId) {
        fetchLottoData()
      }
      clearInterval(timer.current)
    }, 1000)

    return () => clearInterval(timer.current)
  }, [selectedRoundId, currentLottoId, numRoundsFetched, dispatch])

  const handleInputChange = (event) => {
    const {
      target: { value },
    } = event
    if (value) {
      setSelectedRoundId(value)
      if (parseInt(value, 10) <= 0) {
        setSelectedRoundId('')
      }
      if (parseInt(value, 10) >= latestRoundId) {
        setSelectedRoundId(latestRoundId.toString())
      }
    } else {
      setSelectedRoundId('')
    }
  }

  const handleArrowButtonPress = (targetRound) => {
    if (targetRound) {
      setSelectedRoundId(targetRound.toString())
    } else {
      // targetRound is NaN when the input is empty, the only button press that will trigger this func is 'forward one'
      setSelectedRoundId('1')
    }
  }

  return (
    <StyledCard>
      <StyledCardHeader>
        <RoundSwitcher
          isLoading={isLoading}
          selectedRoundId={selectedRoundId}
          mostRecentRound={latestRoundId}
          handleInputChange={handleInputChange}
          handleArrowButtonPress={handleArrowButtonPress}
        />
        <Box mt="8px">
          {selectedRoundId ? (
            selectedLottoNodeData?.endTime ? (
              <Text fontSize="14px">
                {t('Drawn')} {getDrawnDate(locale, selectedLottoNodeData.endTime)}
              </Text>
            ) : (
              <Skeleton width="185px" height="21px" />
            )
          ) : null}
        </Box>
      </StyledCardHeader>
      <PreviousRoundCardBody LottoNodeData={selectedLottoNodeData} LottoId={selectedRoundId} />
      <PreviousRoundCardFooter LottoNodeData={selectedLottoNodeData} LottoId={selectedRoundId} />
    </StyledCard>
  )
}

export default AllHistoryCard
