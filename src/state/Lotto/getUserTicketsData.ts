import { LottoV2 } from 'config/abi/types'
import { TICKET_LIMIT_PER_REQUEST } from 'config/constants/Lotto'
import { LottoTicket } from 'config/constants/types'
import { getLottoV2Contract } from 'utils/contractHelpers'

const LottoContract = getLottoV2Contract()

export const processRawTicketsResponse = (
  ticketsResponse: Awaited<ReturnType<LottoV2['viewUserInfoForLottoId']>>,
): LottoTicket[] => {
  const [ticketIds, ticketNumbers, ticketStatuses] = ticketsResponse

  if (ticketIds?.length > 0) {
    return ticketIds.map((ticketId, index) => {
      return {
        id: ticketId.toString(),
        number: ticketNumbers[index].toString(),
        status: ticketStatuses[index],
      }
    })
  }
  return []
}

export const viewUserInfoForLottoId = async (
  account: string,
  LottoId: string,
  cursor: number,
  perRequestLimit: number,
): Promise<LottoTicket[]> => {
  try {
    const data = await LottoContract.viewUserInfoForLottoId(account, LottoId, cursor, perRequestLimit)
    return processRawTicketsResponse(data)
  } catch (error) {
    console.error('viewUserInfoForLottoId', error)
    return null
  }
}

export const fetchUserTicketsForOneRound = async (account: string, LottoId: string): Promise<LottoTicket[]> => {
  let cursor = 0
  let numReturned = TICKET_LIMIT_PER_REQUEST
  const ticketData = []

  while (numReturned === TICKET_LIMIT_PER_REQUEST) {
    // eslint-disable-next-line no-await-in-loop
    const response = await viewUserInfoForLottoId(account, LottoId, cursor, TICKET_LIMIT_PER_REQUEST)
    cursor += TICKET_LIMIT_PER_REQUEST
    numReturned = response.length
    ticketData.push(...response)
  }

  return ticketData
}

export const fetchUserTicketsForMultipleRounds = async (
  idsToCheck: string[],
  account: string,
): Promise<{ roundId: string; userTickets: LottoTicket[] }[]> => {
  const results = await Promise.all(
    idsToCheck.map((roundId) => Promise.all([Promise.resolve(roundId), fetchUserTicketsForOneRound(account, roundId)])),
  )

  return results.map((result) => {
    const [roundId, ticketsForRound] = result
    return {
      roundId,
      userTickets: ticketsForRound,
    }
  })
}
