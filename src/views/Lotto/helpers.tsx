import BigNumber from 'bignumber.js'
import { LottoResponse, LottoRound, LottoRoundUserTickets } from 'state/types'

/**
 * Remove the '1' and reverse the digits in a Lotto number retrieved from the smart contract
 */
export const parseRetrievedNumber = (number: string): string => {
  const numberAsArray = number.split('')
  numberAsArray.splice(0, 1)
  numberAsArray.reverse()
  return numberAsArray.join('')
}

export const getDrawnDate = (locale: string, endTime: string) => {
  const endTimeInMs = parseInt(endTime, 10) * 1000
  const endTimeAsDate = new Date(endTimeInMs)
  return endTimeAsDate.toLocaleDateString(locale, dateTimeOptions)
}

export const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export const timeOptions: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
}

export const dateTimeOptions: Intl.DateTimeFormatOptions = {
  ...dateOptions,
  ...timeOptions,
}

export const processLottoResponse = (
  LottoData: LottoResponse & { userTickets?: LottoRoundUserTickets },
): LottoRound => {
  const {
    priceTicketInCake: priceTicketInCakeAsString,
    discountDivisor: discountDivisorAsString,
    amountCollectedInCake: amountCollectedInCakeAsString,
  } = LottoData

  const discountDivisor = new BigNumber(discountDivisorAsString)
  const priceTicketInCake = new BigNumber(priceTicketInCakeAsString)
  const amountCollectedInCake = new BigNumber(amountCollectedInCakeAsString)

  return {
    isLoading: LottoData.isLoading,
    LottoId: LottoData.LottoId,
    userTickets: LottoData.userTickets,
    status: LottoData.status,
    startTime: LottoData.startTime,
    endTime: LottoData.endTime,
    priceTicketInCake,
    discountDivisor,
    treasuryFee: LottoData.treasuryFee,
    firstTicketId: LottoData.firstTicketId,
    lastTicketId: LottoData.lastTicketId,
    amountCollectedInCake,
    finalNumber: LottoData.finalNumber,
    cakePerBracket: LottoData.cakePerBracket,
    countWinnersPerBracket: LottoData.countWinnersPerBracket,
    rewardsBreakdown: LottoData.rewardsBreakdown,
  }
}
