import { request, gql } from 'graphql-request'
import { GRAPH_API_Lotto } from 'config/constants/endpoints'
import { LottoTicket } from 'config/constants/types'
import { LottoUserGraphEntity, LottoResponse, UserRound } from 'state/types'
import { getRoundIdsArray, fetchMultipleLotteries, hasRoundBeenClaimed } from './helpers'
import { fetchUserTicketsForMultipleRounds } from './getUserTicketsData'

export const MAX_USER_LOTTERIES_REQUEST_SIZE = 100

/* eslint-disable camelcase */
type UserLotteriesWhere = { Lotto_in?: string[] }

const applyNodeDataToUserGraphResponse = (
  userNodeData: { roundId: string; userTickets: LottoTicket[] }[],
  userGraphData: UserRound[],
  LottoNodeData: LottoResponse[],
): UserRound[] => {
  //   If no graph rounds response - return node data
  if (userGraphData.length === 0) {
    return LottoNodeData.map((nodeRound) => {
      const ticketDataForRound = userNodeData.find((roundTickets) => roundTickets.roundId === nodeRound.LottoId)
      return {
        endTime: nodeRound.endTime,
        status: nodeRound.status,
        LottoId: nodeRound.LottoId.toString(),
        claimed: hasRoundBeenClaimed(ticketDataForRound.userTickets),
        totalTickets: `${ticketDataForRound.userTickets.length.toString()}`,
        tickets: ticketDataForRound.userTickets,
      }
    })
  }

  // Return the rounds with combined node + subgraph data, plus all remaining subgraph rounds.
  const nodeRoundsWithGraphData = userNodeData.map((userNodeRound) => {
    const userGraphRound = userGraphData.find(
      (graphResponseRound) => graphResponseRound.LottoId === userNodeRound.roundId,
    )
    const nodeRoundData = LottoNodeData.find((nodeRound) => nodeRound.LottoId === userNodeRound.roundId)
    return {
      endTime: nodeRoundData.endTime,
      status: nodeRoundData.status,
      LottoId: nodeRoundData.LottoId.toString(),
      claimed: hasRoundBeenClaimed(userNodeRound.userTickets),
      totalTickets: userGraphRound?.totalTickets || userNodeRound.userTickets.length.toString(),
      tickets: userNodeRound.userTickets,
    }
  })

  // Return the rounds with combined data, plus all remaining subgraph rounds.
  const [lastCombinedDataRound] = nodeRoundsWithGraphData.slice(-1)
  const lastCombinedDataRoundIndex = userGraphData
    .map((graphRound) => graphRound?.LottoId)
    .indexOf(lastCombinedDataRound?.LottoId)
  const remainingSubgraphRounds = userGraphData ? userGraphData.splice(lastCombinedDataRoundIndex + 1) : []
  const mergedResponse = [...nodeRoundsWithGraphData, ...remainingSubgraphRounds]
  return mergedResponse
}

export const getGraphLottoUser = async (
  account: string,
  first = MAX_USER_LOTTERIES_REQUEST_SIZE,
  skip = 0,
  where: UserLotteriesWhere = {},
): Promise<LottoUserGraphEntity> => {
  let user
  const blankUser = {
    account,
    totalCake: '',
    totalTickets: '',
    rounds: [],
  }

  try {
    const response = await request(
      GRAPH_API_Lotto,
      gql`
        query getUserLotteries($account: ID!, $first: Int!, $skip: Int!, $where: Round_filter) {
          user(id: $account) {
            id
            totalTickets
            totalCake
            rounds(first: $first, skip: $skip, where: $where, orderDirection: desc, orderBy: block) {
              id
              Lotto {
                id
                endTime
                status
              }
              claimed
              totalTickets
            }
          }
        }
      `,
      { account: account.toLowerCase(), first, skip, where },
    )
    const userRes = response.user

    // If no user returned - return blank user
    if (!userRes) {
      user = blankUser
    } else {
      user = {
        account: userRes.id,
        totalCake: userRes.totalCake,
        totalTickets: userRes.totalTickets,
        rounds: userRes.rounds.map((round) => {
          return {
            LottoId: round?.Lotto?.id,
            endTime: round?.Lotto?.endTime,
            claimed: round?.claimed,
            totalTickets: round?.totalTickets,
            status: round?.Lotto?.status.toLowerCase(),
          }
        }),
      }
    }
  } catch (error) {
    console.error(error)
    user = blankUser
  }

  return user
}

const getUserLottoData = async (account: string, currentLottoId: string): Promise<LottoUserGraphEntity> => {
  const idsForTicketsNodeCall = getRoundIdsArray(currentLottoId)
  const roundDataAndUserTickets = await fetchUserTicketsForMultipleRounds(idsForTicketsNodeCall, account)
  const userRoundsNodeData = roundDataAndUserTickets.filter((round) => round.userTickets.length > 0)
  const idsForLotteriesNodeCall = userRoundsNodeData.map((round) => round.roundId)
  const [lotteriesNodeData, graphResponse] = await Promise.all([
    fetchMultipleLotteries(idsForLotteriesNodeCall),
    getGraphLottoUser(account),
  ])
  const mergedRoundData = applyNodeDataToUserGraphResponse(userRoundsNodeData, graphResponse.rounds, lotteriesNodeData)
  const graphResponseWithNodeRounds = { ...graphResponse, rounds: mergedRoundData }
  return graphResponseWithNodeRounds
}

export default getUserLottoData
