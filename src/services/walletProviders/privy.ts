import {
  isNotCreated,
  needsRecovery,
  useEmbeddedSolanaWallet,
  useLoginWithOAuth,
  usePrivy,
  useRecoverEmbeddedWallet,
} from '@privy-io/expo';

import { useCustomization } from '@/shared/config/CustomizationProvider';
import { useCallback } from 'react';

export function usePrivyWalletLogic() {
  const { login: loginWithOAuth } = useLoginWithOAuth();
  const { user, logout, isReady } = usePrivy();

  const solanaWallet = useEmbeddedSolanaWallet();
  const { recover } = useRecoverEmbeddedWallet();

  const {
    auth: { privy: privyConfig },
  } = useCustomization();

  const handlePrivyLogin = useCallback(
    async ({
      loginMethod = 'google',
      setStatusMessage,
    }: {
      loginMethod?: 'google' | 'apple';
      setStatusMessage?: (msg: string) => void;
    }) => {
      if (user) {
        setStatusMessage?.(`Already logged in as ${user.id}`);
        return;
      }

      try {
        setStatusMessage?.(`Logging in with ${loginMethod}...`);

        const result = await loginWithOAuth({ provider: loginMethod });

        if (!result) {
          throw new Error(`${loginMethod} login failed`);
        }

        setStatusMessage?.(`Logged in via ${loginMethod}`);
        return result;
      } catch (err: any) {
        console.error('Privy Login Error:', err);
        setStatusMessage?.(`Login failed: ${err.message}`);
        throw err;
      }
    },
    [user, loginWithOAuth]
  );

  const monitorSolanaWallet = useCallback(
    async ({
      selectedProvider,
      setStatusMessage,
      onWalletConnected,
    }: {
      selectedProvider: string;
      setStatusMessage?: (msg: string) => void;
      onWalletConnected?: (info: { provider: 'privy'; address: string }) => void;
    }) => {
      if (selectedProvider !== 'privy') return;
      if (!user || !isReady || !solanaWallet) return;

      try {
        if (solanaWallet.status === 'connected' && solanaWallet.wallets?.length) {
          const connectedWallet = solanaWallet.wallets[0];
          onWalletConnected?.({
            provider: 'privy',
            address: connectedWallet.publicKey,
          });
          setStatusMessage?.(`Connected wallet: ${connectedWallet.publicKey}`);
          return;
        }

        if (needsRecovery(solanaWallet)) {
          setStatusMessage?.('Wallet needs recovery');
          return;
        }

        if (isNotCreated(solanaWallet)) {
          setStatusMessage?.('Creating wallet...');
          const result = await solanaWallet.create();

          if (solanaWallet.wallets?.length) {
            const newWallet = solanaWallet.wallets[0];
            onWalletConnected?.({
              provider: 'privy',
              address: newWallet.publicKey,
            });
            setStatusMessage?.(`Created wallet: ${newWallet.publicKey}`);
            return;
          } else {
            throw new Error('Wallet creation failed: No wallet returned');
          }
        }

        if (solanaWallet.getProvider) {
          const provider = await solanaWallet.getProvider();
          if (provider && solanaWallet.wallets?.length) {
            const wallet = solanaWallet.wallets[0];
            onWalletConnected?.({
              provider: 'privy',
              address: wallet.publicKey,
            });
            setStatusMessage?.(`Connected via provider: ${wallet.publicKey}`);
          } else {
            throw new Error('Wallet provider available but no wallet');
          }
        } else {
          throw new Error('Provider not available');
        }
      } catch (error: any) {
        console.error('monitorSolanaWallet error:', error);
        setStatusMessage?.(`Wallet connection error: ${error.message}`);
      }
    },
    [user, isReady, solanaWallet]
  );

  const handleWalletRecovery = useCallback(
    async ({
      recoveryMethod,
      password,
      setStatusMessage,
      onWalletRecovered,
    }: {
      recoveryMethod: 'user-passcode' | 'google-drive' | 'icloud';
      password: string;
      setStatusMessage?: (msg: string) => void;
      onWalletRecovered?: (info: { provider: 'privy'; address: string }) => void;
    }) => {
      try {
        setStatusMessage?.('Recovering wallet...');
        await recover({ recoveryMethod, password });
        const provider = solanaWallet.getProvider
          ? await solanaWallet.getProvider().catch(() => null)
          : null;

        if (provider && solanaWallet.wallets?.length) {
          const recoveredWallet = solanaWallet.wallets[0];
          onWalletRecovered?.({
            provider: 'privy',
            address: recoveredWallet.publicKey,
          });
          setStatusMessage?.(`Recovered wallet: ${recoveredWallet.publicKey}`);
        } else {
          setStatusMessage?.('Wallet recovery failed: No wallet');
        }
      } catch (error: any) {
        setStatusMessage?.(`Wallet recovery failed: ${error.message}`);
      }
    },
    [recover, solanaWallet]
  );

  const handlePrivyLogout = useCallback(
    async (setStatusMessage?: (msg: string) => void) => {
      try {
        await logout();
        setStatusMessage?.('Logged out successfully');
      } catch (error: any) {
        setStatusMessage?.(error.message || 'Logout failed');
      }
    },
    [logout]
  );

  return {
    user,
    isReady,
    solanaWallet,
    handlePrivyLogin,
    handlePrivyLogout,
    monitorSolanaWallet,
    handleWalletRecovery,
  };
}

export default usePrivyWalletLogic;
