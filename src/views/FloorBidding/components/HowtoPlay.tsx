import {Flex, Heading} from "@pancakeswap/uikit";
import {Hammer} from "../svgs";
import styled, {keyframes} from "styled-components";
import {useTranslation} from "@pancakeswap/localization";

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

const HowToPlay = () => {
    const { t } = useTranslation()

    return (
        <Flex flexDirection="column" alignItems="center" justifyContent="center">
            <Decorations />
            <Heading mb="8px" scale="xl" color="#ffffff" id="lottery-hero-title">
                {t('How to play')}
            </Heading>
        </Flex>
    )
}

export default HowToPlay