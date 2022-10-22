import { useTranslation } from '@pancakeswap/localization'
import { WalletConnectorNotFoundError, WalletSwitchChainError } from '@pancakeswap/ui-wallets'
import { connectorLocalStorageKey } from '@pancakeswap/uikit'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { ConnectorNames } from 'config/wallet'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import {
  ConnectorNotFoundError,
  SwitchChainError,
  SwitchChainNotSupportedError,
  useConnect,
  useDisconnect,
  useNetwork,
} from 'wagmi'
import { useSignMessage } from '@pancakeswap/wagmi'
import { signIn } from 'next-auth/react'
import { clearUserStates } from '../utils/clearUserStates'
import { useActiveChainId } from './useActiveChainId'
import { useSessionChainId } from './useSessionChainId'
import apiPost from '../../apps/moralis/utils/apiPost'

const useAuth = () => {
  const dispatch = useAppDispatch()
  const { connectAsync, connectors } = useConnect()
  const { chain } = useNetwork()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setSessionChainId] = useSessionChainId()
  const { t } = useTranslation()
  const { signMessageAsync } = useSignMessage()

  const login = useCallback(
    // eslint-disable-next-line consistent-return
    async (connectorID: ConnectorNames) => {
      const findConnector = connectors.find((c) => c.id === connectorID)
      try {
        const connected = await connectAsync({ connector: findConnector, chainId })
        if (!connected.chain.unsupported && connected.chain.id !== chainId) {
          replaceBrowserHistory('chainId', connected.chain.id)
          setSessionChainId(connected.chain.id)
        }

        // winTnie: alternative authenticate for Moralis, experimental
        console.log('winTnie: Alternative authenticate')
        const userData = { address: connected.account, chain: connected.chain.id, network: 'evm' }
        const { message } = await apiPost('/auth/request-message', userData)
        console.log(message)
        const signature = await signMessageAsync({ message })
        await signIn('credentials', { message, signature, redirect: false })
        // -----------------------------------------------------------

        return connected
      } catch (error) {
        window?.localStorage?.removeItem(connectorLocalStorageKey)
        if (error instanceof ConnectorNotFoundError) {
          throw new WalletConnectorNotFoundError()
        }
        if (error instanceof SwitchChainNotSupportedError || error instanceof SwitchChainError) {
          throw new WalletSwitchChainError(t('Unable to switch network. Please try it on your wallet'))
        }
      }
    },
    [connectors, connectAsync, chainId, setSessionChainId, t],
  )

  const logout = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error(error)
    } finally {
      clearUserStates(dispatch, { chainId: chain?.id, isDeactive: true })
    }
  }, [disconnectAsync, dispatch, chain?.id])

  return { login, logout }
}

export default useAuth
