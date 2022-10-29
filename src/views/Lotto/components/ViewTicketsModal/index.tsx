import styled from 'styled-components'
import { Modal } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { LottoStatus } from 'config/constants/types'
import { useLotto } from 'state/Lotto/hooks'
import useTheme from 'hooks/useTheme'
import PreviousRoundTicketsInner from './PreviousRoundTicketsInner'
import CurrentRoundTicketsInner from './CurrentRoundTicketsInner'

const StyledModal = styled(Modal)`
  ${({ theme }) => theme.mediaQueries.md} {
    width: 280px;
  }
`

interface ViewTicketsModalProps {
  roundId: string
  roundStatus?: LottoStatus
  onDismiss?: () => void
}

const ViewTicketsModal: React.FC<React.PropsWithChildren<ViewTicketsModalProps>> = ({
  onDismiss,
  roundId,
  roundStatus,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentLottoId } = useLotto()
  const isPreviousRound = roundStatus?.toLowerCase() === LottoStatus.CLAIMABLE || roundId !== currentLottoId

  return (
    <StyledModal
      title={`${t('Round')} ${roundId}`}
      onDismiss={onDismiss}
      headerBackground={theme.colors.gradientCardHeader}
    >
      {isPreviousRound ? <PreviousRoundTicketsInner roundId={roundId} /> : <CurrentRoundTicketsInner />}
    </StyledModal>
  )
}

export default ViewTicketsModal
