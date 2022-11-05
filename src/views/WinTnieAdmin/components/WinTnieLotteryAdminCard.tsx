import styled from "styled-components";
import {Card} from "@pancakeswap/uikit";
import FloorBiddingGameCard from "./FloorBiddingGameCard";
import WinTnieLotteryAdminGameCard from "./WinTnieLotteryAdminGameCard";


const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 500px;
  }
`

const WinTnieLotteryAdminCard = () => {

  return (
    <StyledCard>
      <WinTnieLotteryAdminGameCard/>
    </StyledCard>
  )
}

export default WinTnieLotteryAdminCard;