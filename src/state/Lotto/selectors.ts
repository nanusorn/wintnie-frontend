import BigNumber from 'bignumber.js'
import { createSelector } from '@reduxjs/toolkit'
import { State } from '../types'

const selectCurrentLottoId = (state: State) => state.Lotto.currentLottoId
const selectIsTransitioning = (state: State) => state.Lotto.isTransitioning
const selectCurrentRound = (state: State) => state.Lotto.currentRound
const selectUserLottoData = (state: State) => state.Lotto.userLottoData
const selectLotteriesData = (state: State) => state.Lotto.lotteriesData
const selectMaxNumberTicketsPerBuyOrClaim = (state: State) => state.Lotto.maxNumberTicketsPerBuyOrClaim

export const makeLottoGraphDataByIdSelector = (LottoId: string) =>
  createSelector([selectLotteriesData], (lotteriesData) => lotteriesData?.find((Lotto) => Lotto.id === LottoId))

export const maxNumberTicketsPerBuyOrClaimSelector = createSelector(
  [selectMaxNumberTicketsPerBuyOrClaim],
  (maxNumberTicketsPerBuyOrClaimAsString) => {
    return new BigNumber(maxNumberTicketsPerBuyOrClaimAsString)
  },
)

export const currentRoundSelector = createSelector([selectCurrentRound], (currentRound) => {
  const {
    priceTicketInCake: priceTicketInCakeAsString,
    discountDivisor: discountDivisorAsString,
    amountCollectedInCake: amountCollectedInCakeAsString,
  } = currentRound

  return {
    ...currentRound,
    priceTicketInCake: new BigNumber(priceTicketInCakeAsString),
    discountDivisor: new BigNumber(discountDivisorAsString),
    amountCollectedInCake: new BigNumber(amountCollectedInCakeAsString),
  }
})

export const LottoSelector = createSelector(
  [
    currentRoundSelector,
    selectIsTransitioning,
    selectCurrentLottoId,
    selectUserLottoData,
    selectLotteriesData,
    maxNumberTicketsPerBuyOrClaimSelector,
  ],
  (
    processedCurrentRound,
    isTransitioning,
    currentLottoId,
    userLottoData,
    lotteriesData,
    maxNumberTicketsPerBuyOrClaim,
  ) => {
    return {
      currentLottoId,
      maxNumberTicketsPerBuyOrClaim,
      isTransitioning,
      userLottoData,
      lotteriesData,
      currentRound: processedCurrentRound,
    }
  },
)
