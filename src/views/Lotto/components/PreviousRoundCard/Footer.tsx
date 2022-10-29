import { useEffect, useState } from 'react'
import { Flex, ExpandableLabel, CardFooter } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { LottoRound } from 'state/types'
import FooterExpanded from './FooterExpanded'

interface PreviousRoundCardFooterProps {
  LottoNodeData: LottoRound
  LottoId: string
}

const PreviousRoundCardFooter: React.FC<React.PropsWithChildren<PreviousRoundCardFooterProps>> = ({
  LottoNodeData,
  LottoId,
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!LottoId) {
      setIsExpanded(false)
    }
  }, [LottoId])

  return (
    <CardFooter p="0">
      {isExpanded && <FooterExpanded LottoNodeData={LottoNodeData} LottoId={LottoId} />}
      <Flex p="8px 24px" alignItems="center" justifyContent="center">
        <ExpandableLabel
          expanded={isExpanded}
          onClick={() => {
            if (LottoId) {
              setIsExpanded(!isExpanded)
            }
          }}
        >
          {isExpanded ? t('Hide') : t('Details')}
        </ExpandableLabel>
      </Flex>
    </CardFooter>
  )
}

export default PreviousRoundCardFooter
