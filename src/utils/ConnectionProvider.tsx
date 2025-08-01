import { useCluster } from "@/utils/cluster-data-access";
import { Connection, type ConnectionConfig } from "@solana/web3.js";
import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

export interface ConnectionProviderProps {
  children: ReactNode;
  config?: ConnectionConfig;
}

export const ConnectionProvider: FC<ConnectionProviderProps> = ({
  children,
  config = { commitment: "confirmed" },
}) => {
  const { selectedCluster } = useCluster();

  const connection = useMemo(
    () => new Connection(selectedCluster.endpoint, config),
    [selectedCluster, config]
  );

  return (
    <ConnectionContext.Provider value={{ connection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export interface ConnectionContextState {
  connection: Connection;
}

export const ConnectionContext = createContext<ConnectionContextState>(
  {} as ConnectionContextState
);

export function useConnection(): ConnectionContextState {
  return useContext(ConnectionContext);
}