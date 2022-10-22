import styled from "styled-components";
import {Card} from "@pancakeswap/uikit";
import FloorBiddingGameCard from "./FloorBiddingGameCard";


const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 500px;
  }
`

const BidAdminCard = () => {

    return (
        <StyledCard>
            <FloorBiddingGameCard/>
        </StyledCard>
    )
}

export default BidAdminCard;