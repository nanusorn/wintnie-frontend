import { Flex, Heading } from '@pancakeswap/uikit'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Hammer } from '../svgs'

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(6deg);
  }
  to {
    transform: rotate(0deg);
  }  
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 3s ease-in-out infinite;
`

const HammerSvgWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`

const Decorations = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: url(/images/decorations/bg-dotdotdot.svg);
  background-repeat: no-repeat;
  background-position: center 100;
`

const Hero = () => {
  const { t } = useTranslation()

  const getHeroHeading = () => {
    return (
      <Heading mb="24px" scale="xl" color="#ffffff">
        {t('Floor Bidding')}
      </Heading>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <Decorations />
      <Heading mb="8px" scale="md" color="#ffffff" id="lottery-hero-title">
        {t('winTnie')}
      </Heading>
      {getHeroHeading()}
      <TicketContainer
        position="relative"
        width={['240px', '288px']}
        height={['94px', '113px']}
        alignItems="center"
        justifyContent="center"
      >
        <HammerSvgWrapper>
          <Hammer width="100%" />
        </HammerSvgWrapper>
      </TicketContainer>
    </Flex>
  )
}

export default Hero
