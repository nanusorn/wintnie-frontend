import { Flex, Heading } from '@pancakeswap/uikit'
// import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from '@pancakeswap/localization'
import useTheme from 'hooks/useTheme'
import Image from 'next/image'
import styled, { keyframes } from 'styled-components'
import honeyJarImage from '../../../../public/images/home/bear/honey@2x.png'
import CompositeImage, { CompositeImageProps } from './CompositeImage'
import { SlideSvgDark, SlideSvgLight } from './SlideSvg'

const flyingAnim = () => keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-15px, 0px);
  }
  to {
    transform: translate(0, 0px);
  }
`

const fading = () => keyframes`
  from {
    opacity: 0.9;
  }
  50% {
    opacity: 0.1;
  }
  to {
    opacity: 0.9;
  }
`

const BgWrapper = styled.div`
  z-index: -1;
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0px;
  left: 0px;
`

const InnerWrapper = styled.div`
  position: absolute;
  width: 100%;
  bottom: -3px;
`

const JarWrapper = styled.div`
  width: 100%;
  animation: ${flyingAnim} 5.5s ease-in-out infinite;
  will-change: transform;
  > span {
    overflow: visible !important; // make sure the next-image pre-build blur image not be cropped
  }
`

const CoinsWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  & :nth-child(2) {
    animation: ${fading} 5s ease-in-out infinite;
    animation-delay: 1s;
  }

  & :nth-child(3) {
    animation: ${fading} 3s ease-in-out infinite;
    animation-delay: 0.66s;
  }

  & :nth-child(4) {
    animation: ${fading} 1.5s ease-in-out infinite;
    animation-delay: 0.33s;
  }
`

const coinsImage: CompositeImageProps = {
  path: '/images/home/bear/',
  attributes: [
    { src: 'coin-l', alt: '3D Coin' },
    { src: 'coin-r', alt: '3D Coin' },
    { src: 'coin-top-r', alt: '3D Coin' },
  ],
}

const Hero = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <>
      <BgWrapper>
        <InnerWrapper>{theme.isDark ? <SlideSvgDark width="100%" /> : <SlideSvgLight width="100%" />}</InnerWrapper>
      </BgWrapper>
      <Flex
        position="relative"
        flexDirection={['column-reverse', null, null, 'row']}
        alignItems={['flex-end', null, null, 'center']}
        justifyContent="center"
        mt={['0px', null, 0]}
        id="homepage-hero"
      >
        <Flex flex="1" flexDirection="column">
          <Heading scale="xxl" color="secondary" mb="24px">
            {t('This is an opportunity that only comes once in a lifetime.')}
          </Heading>
          <Heading scale="md" mb="24px">
            {t(
              'What are you waiting for? Take it, Grab it and Hop onto the Bandwagon to earn some Real Stash on the Most Profitable Crypto Game now!',
            )}
          </Heading>
          {/* <Flex> */}
          {/* {!account && <ConnectWalletButton mr="8px" />} */}
          {/* /!*<NextLinkFromReactRouter to="/swap">*!/ */}
          {/* /!*  <Button variant={!account ? 'secondary' : 'primary'}>{t('Trade Now')}</Button>*!/ */}
          {/* /!*</NextLinkFromReactRouter>*!/ */}
          {/* </Flex> */}
        </Flex>
        <Flex
          height={['192px', null, null, '100%']}
          width={['192px', null, null, '100%']}
          flex={[null, null, null, '1']}
          mb={['24px', null, null, '0']}
          position="relative"
        >
          <JarWrapper>
            <Image src={honeyJarImage} priority placeholder="blur" alt={t('Lunar bunny')} />
          </JarWrapper>
          <CoinsWrapper>
            <CompositeImage {...coinsImage} />
          </CoinsWrapper>
        </Flex>
      </Flex>
    </>
  )
}

export default Hero
