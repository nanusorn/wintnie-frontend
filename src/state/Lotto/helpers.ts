import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import { LottoStatus, LottoTicket } from 'config/constants/types'
import LottoV2Abi from 'config/abi/LottoV2.json'
import { getLottoV2Address } from 'utils/addressHelpers'
import { multicallv2 } from 'utils/multicall'
import { LottoResponse } from 'state/types'
import { getLottoV2Contract } from 'utils/contractHelpers'
import { ethersToSerializedBigNumber } from 'utils/bigNumber'
import { NUM_ROUNDS_TO_FETCH_FROM_NODES } from 'config/constants/Lotto'

const LottoContract = getLottoV2Contract()

const processViewLottoSuccessResponse = (response, LottoId: string): LottoResponse => {
  const {
    status,
    startTime,
    endTime,
    priceTicketInCake,
    discountDivisor,
    treasuryFee,
    firstTicketId,
    lastTicketId,
    amountCollectedInCake,
    finalNumber,
    cakePerBracket,
    countWinnersPerBracket,
    rewardsBreakdown,
  } = response

  const statusKey = Object.keys(LottoStatus)[status]
  const serializedCakePerBracket = cakePerBracket.map((cakeInBracket) => ethersToSerializedBigNumber(cakeInBracket))
  const serializedCountWinnersPerBracket = countWinnersPerBracket.map((winnersInBracket) =>
    ethersToSerializedBigNumber(winnersInBracket),
  )
  const serializedRewardsBreakdown = rewardsBreakdown.map((reward) => ethersToSerializedBigNumber(reward))

  return {
    isLoading: false,
    LottoId,
    status: LottoStatus[statusKey],
    startTime: startTime?.toString(),
    endTime: endTime?.toString(),
    priceTicketInCake: ethersToSerializedBigNumber(priceTicketInCake),
    discountDivisor: discountDivisor?.toString(),
    treasuryFee: treasuryFee?.toString(),
    firstTicketId: firstTicketId?.toString(),
    lastTicketId: lastTicketId?.toString(),
    amountCollectedInCake: ethersToSerializedBigNumber(amountCollectedInCake),
    finalNumber,
    cakePerBracket: serializedCakePerBracket,
    countWinnersPerBracket: serializedCountWinnersPerBracket,
    rewardsBreakdown: serializedRewardsBreakdown,
  }
}

const processViewLottoErrorResponse = (LottoId: string): LottoResponse => {
  return {
    isLoading: true,
    LottoId,
    status: LottoStatus.PENDING,
    startTime: '',
    endTime: '',
    priceTicketInCake: '',
    discountDivisor: '',
    treasuryFee: '',
    firstTicketId: '',
    lastTicketId: '',
    amountCollectedInCake: '',
    finalNumber: null,
    cakePerBracket: [],
    countWinnersPerBracket: [],
    rewardsBreakdown: [],
  }
}

export const fetchLotto = async (LottoId: string): Promise<LottoResponse> => {
  try {
    const LottoData = await LottoContract.viewLotto(LottoId)
    return processViewLottoSuccessResponse(LottoData, LottoId)
  } catch (error) {
    return processViewLottoErrorResponse(LottoId)
  }
}

export const fetchMultipleLotteries = async (LottoIds: string[]): Promise<LottoResponse[]> => {
  const calls = LottoIds.map((id) => ({
    name: 'viewLotto',
    address: getLottoV2Address(),
    params: [id],
  }))
  try {
    const multicallRes = await multicallv2({ abi: LottoV2Abi, calls, options: { requireSuccess: false } })
    const processedResponses = multicallRes.map((res, index) =>
      processViewLottoSuccessResponse(res[0], LottoIds[index]),
    )
    return processedResponses
  } catch (error) {
    console.error(error)
    return calls.map((call, index) => processViewLottoErrorResponse(LottoIds[index]))
  }
}

export const fetchCurrentLottoId = async (): Promise<EthersBigNumber> => {
  return LottoContract.currentLottoId()
}

export const fetchCurrentLottoIdAndMaxBuy = async () => {
  try {
    const calls = ['currentLottoId', 'maxNumberTicketsPerBuyOrClaim'].map((method) => ({
      address: getLottoV2Address(),
      name: method,
    }))
    const [[currentLottoId], [maxNumberTicketsPerBuyOrClaim]] = (await multicallv2({
      abi: LottoV2Abi,
      calls,
    })) as EthersBigNumber[][]

    return {
      currentLottoId: currentLottoId ? currentLottoId.toString() : null,
      maxNumberTicketsPerBuyOrClaim: maxNumberTicketsPerBuyOrClaim ? maxNumberTicketsPerBuyOrClaim.toString() : null,
    }
  } catch (error) {
    return {
      currentLottoId: null,
      maxNumberTicketsPerBuyOrClaim: null,
    }
  }
}

export const getRoundIdsArray = (currentLottoId: string): string[] => {
  const currentIdAsInt = parseInt(currentLottoId, 10)
  const roundIds = []
  for (let i = 0; i < NUM_ROUNDS_TO_FETCH_FROM_NODES; i++) {
    roundIds.push(currentIdAsInt - i)
  }
  return roundIds.map((roundId) => roundId.toString())
}

export const hasRoundBeenClaimed = (tickets: LottoTicket[]): boolean => {
  const claimedTickets = tickets.filter((ticket) => ticket.status)
  return claimedTickets.length > 0
}
