// import { useCallback, useMemo } from 'react';

// // Hooks from each wallet provider
// import { useDynamicWalletLogic } from './walletProviders/dynamic';
// import { usePrivyWalletLogic } from './walletProviders/privy';
// import { useTurnkeyWalletLogic } from './walletProviders/turnkey';

// // Choose wallet type here or make it dynamic based on app settings/user selection
// const walletType: 'privy' | 'dynamic' | 'turnkey' = 'privy';

// export const useAuth = () => {
//   // Call all hooks unconditionally
//   const privy = usePrivyWalletLogic();
//   const dynamic = useDynamicWalletLogic();
//   const turnkey = useTurnkeyWalletLogic();

//   // Unified login
//   const login = useCallback(
//     async ({ loginMethod, setStatusMessage }: { loginMethod?: any; setStatusMessage?: (msg: string) => void }) => {
//       if (walletType === 'privy') {
//         return await privy.handlePrivyLogin({ loginMethod, setStatusMessage });
//       } else if (walletType === 'dynamic') {
//         return await dynamic.handleDynamicLogin({ loginMethod, setStatusMessage });
//       } else {
//         return await turnkey.handleTurnkeyLogin({ loginMethod, setStatusMessage });
//       }
//     },
//     [privy, dynamic, turnkey]
//   );

//   // Unified logout
//   const logout = useCallback(() => {
//     if (walletType === 'privy') {
//       return privy.handlePrivyLogout();
//     } else if (walletType === 'dynamic') {
//       return dynamic.handleDynamicLogout();
//     } else {
//       return turnkey.handleTurnkeyLogout();
//     }
//   }, [privy, dynamic, turnkey]);

//   // Unified user, address, and authentication status
//   const user = useMemo(() => {
//     return privy.user || dynamic.user || turnkey.user;
//   }, [privy.user, dynamic.user, turnkey.user]);

//   const walletAddress = useMemo(() => {
//     return privy.solanaWallet?.address || dynamic.walletAddress || turnkey.walletAddress;
//   }, [privy.solanaWallet?.address, dynamic.walletAddress, turnkey.walletAddress]);

//   const isAuthenticated = useMemo(() => {
//     return dynamic.isAuthenticated || turnkey.isAuthenticated || !!privy.user;
//   }, [dynamic.isAuthenticated, turnkey.isAuthenticated, privy.user]);

//   const isReady = useMemo(() => {
//     return privy.isReady || dynamic.isAuthenticated || turnkey.isAuthenticated;
//   }, [privy.isReady, dynamic.isAuthenticated, turnkey.isAuthenticated]);

//   return {
//     login,
//     logout,
//     user,
//     walletAddress,
//     isAuthenticated,
//     isReady,
//   };
// };
