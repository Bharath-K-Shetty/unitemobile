import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer'; // polyfill
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-get-random-values'; // polyfill for Buffer

interface EmbeddedWalletAuthProps {
  onConnected: (address: string) => void;
}

/**
 * EmbeddedWalletAuth component renders a connect/disconnect button
 * and notifies parent via onConnected callback.
 */
export default function EmbeddedWalletAuth({ onConnected }: EmbeddedWalletAuthProps) {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      const auth = await transact((wallet: Web3MobileWallet) =>
        wallet.authorize({
          chain: 'solana:devnet',               // or 'solana:mainnet'
          identity: {
            name: 'Unite',
            uri: 'https://letsunite.fun',
            icon: 'https://letsunite.fun/icon.png',
          },
        })
      );

      const b64 = auth.accounts?.[0]?.address;
      if (!b64) throw new Error('No accounts returned');

      const raw = Buffer.from(b64, 'base64');
      const pubkey = new PublicKey(raw);
      const addr = pubkey.toBase58();
      setAddress(addr);
      onConnected(addr);
    } catch (err: any) {
      console.error('MWA Error', err);
      Alert.alert('Connection Error', err.message || String(err));
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unite Wallet</Text>
      {address ? (
        <>
          <Text style={styles.text}>Connected:</Text>
          <Text style={styles.key}>{address}</Text>
          <Button title="Disconnect" onPress={disconnect} />
        </>
      ) : (
        <Button title="Connect Wallet" onPress={connectWallet} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 4 },
  key: { fontSize: 14, fontStyle: 'italic', marginBottom: 16, textAlign: 'center', paddingHorizontal: 8 },
});
