/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LottoTicket, LottoStatus } from 'config/constants/types'
import { LottoState, LottoRoundGraphEntity, LottoUserGraphEntity, LottoResponse } from 'state/types'
import { fetchLotto, fetchCurrentLottoIdAndMaxBuy } from './helpers'
import getLotteriesData from './getLotteriesData'
import getUserLottoData, { getGraphLottoUser } from './getUserLottoData'
import { resetUserState } from '../global/actions'

interface PublicLottoData {
  currentLottoId: string
  maxNumberTicketsPerBuyOrClaim: string
}

const initialState: LottoState = {
  currentLottoId: null,
  isTransitioning: false,
  maxNumberTicketsPerBuyOrClaim: null,
  currentRound: {
    isLoading: true,
    LottoId: null,
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
    userTickets: {
      isLoading: true,
      tickets: [],
    },
  },
  lotteriesData: null,
  userLottoData: { account: '', totalCake: '', totalTickets: '', rounds: [] },
}

export const fetchCurrentLotto = createAsyncThunk<LottoResponse, { currentLottoId: string }>(
  'Lotto/fetchCurrentLotto',
  async ({ currentLottoId }) => {
    const LottoInfo = await fetchLotto(currentLottoId)
    return LottoInfo
  },
)

export const fetchCurrentLottoId = createAsyncThunk<PublicLottoData>('Lotto/fetchCurrentLottoId', async () => {
  const currentIdAndMaxBuy = await fetchCurrentLottoIdAndMaxBuy()
  return currentIdAndMaxBuy
})

export const fetchUserTicketsAndLotteries = createAsyncThunk<
  { userTickets: LottoTicket[]; userLotteries: LottoUserGraphEntity },
  { account: string; currentLottoId: string }
>('Lotto/fetchUserTicketsAndLotteries', async ({ account, currentLottoId }) => {
  const userLotteriesRes = await getUserLottoData(account, currentLottoId)
  const userParticipationInCurrentRound = userLotteriesRes.rounds?.find((round) => round.LottoId === currentLottoId)
  const userTickets = userParticipationInCurrentRound?.tickets

  // User has not bought tickets for the current Lotto, or there has been an error
  if (!userTickets || userTickets.length === 0) {
    return { userTickets: [], userLotteries: userLotteriesRes }
  }

  return { userTickets, userLotteries: userLotteriesRes }
})

export const fetchPublicLotteries = createAsyncThunk<LottoRoundGraphEntity[], { currentLottoId: string }>(
  'Lotto/fetchPublicLotteries',
  async ({ currentLottoId }) => {
    const lotteries = await getLotteriesData(currentLottoId)
    return lotteries
  },
)

export const fetchUserLotteries = createAsyncThunk<
  LottoUserGraphEntity,
  { account: string; currentLottoId: string }
>('Lotto/fetchUserLotteries', async ({ account, currentLottoId }) => {
  const userLotteries = await getUserLottoData(account, currentLottoId)
  return userLotteries
})

export const fetchAdditionalUserLotteries = createAsyncThunk<
  LottoUserGraphEntity,
  { account: string; skip?: number }
>('Lotto/fetchAdditionalUserLotteries', async ({ account, skip }) => {
  const additionalUserLotteries = await getGraphLottoUser(account, undefined, skip)
  return additionalUserLotteries
})

export const setLottoIsTransitioning = createAsyncThunk<{ isTransitioning: boolean }, { isTransitioning: boolean }>(
  `Lotto/setIsTransitioning`,
  async ({ isTransitioning }) => {
    return { isTransitioning }
  },
)

export const LottoSlice = createSlice({
  name: 'Lotto',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      state.userLottoData = { ...initialState.userLottoData }
      state.currentRound = { ...state.currentRound, userTickets: { ...initialState.currentRound.userTickets } }
    })
    builder.addCase(fetchCurrentLotto.fulfilled, (state, action: PayloadAction<LottoResponse>) => {
      state.currentRound = { ...state.currentRound, ...action.payload }
    })
    builder.addCase(fetchCurrentLottoId.fulfilled, (state, action: PayloadAction<PublicLottoData>) => {
      state.currentLottoId = action.payload.currentLottoId
      state.maxNumberTicketsPerBuyOrClaim = action.payload.maxNumberTicketsPerBuyOrClaim
    })
    builder.addCase(
      fetchUserTicketsAndLotteries.fulfilled,
      (state, action: PayloadAction<{ userTickets: LottoTicket[]; userLotteries: LottoUserGraphEntity }>) => {
        state.currentRound = {
          ...state.currentRound,
          userTickets: { isLoading: false, tickets: action.payload.userTickets },
        }
        state.userLottoData = action.payload.userLotteries
      },
    )
    builder.addCase(fetchPublicLotteries.fulfilled, (state, action: PayloadAction<LottoRoundGraphEntity[]>) => {
      state.lotteriesData = action.payload
    })
    builder.addCase(fetchUserLotteries.fulfilled, (state, action: PayloadAction<LottoUserGraphEntity>) => {
      state.userLottoData = action.payload
    })
    builder.addCase(fetchAdditionalUserLotteries.fulfilled, (state, action: PayloadAction<LottoUserGraphEntity>) => {
      const mergedRounds = [...state.userLottoData.rounds, ...action.payload.rounds]
      state.userLottoData = { ...state.userLottoData, rounds: mergedRounds }
    })
    builder.addCase(
      setLottoIsTransitioning.fulfilled,
      (state, action: PayloadAction<{ isTransitioning: boolean }>) => {
        state.isTransitioning = action.payload.isTransitioning
      },
    )
  },
})

export default LottoSlice.reducer
