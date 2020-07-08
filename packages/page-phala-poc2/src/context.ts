import React from 'react';

import { GetInfoResp } from './pruntime/models';
import { KeyringPair } from '@polkadot/keyring/types';
import PRuntime from './pruntime';
import { EcdhChannel } from './pruntime/crypto';

export interface PhalaSharedStruct {
  pRuntimeEndpoint: string | null,
  setPRuntimeEndpoint: React.Dispatch<PhalaSharedStruct['pRuntimeEndpoint']> | null,
  accountId: string | null,
  setAccountId: React.Dispatch<PhalaSharedStruct['accountId']> | null,
  keypair: KeyringPair | null,
  setKeypair: React.Dispatch<PhalaSharedStruct['keypair']> | null,
  latency: number | null,
  setLatency: React.Dispatch<PhalaSharedStruct['latency']> | null,
  info: GetInfoResp | null,
  setInfo: React.Dispatch<PhalaSharedStruct['info']> | null,
  error: boolean,
  setError: React.Dispatch<PhalaSharedStruct['error']> | null,
  pApi: PRuntime | null,
  ecdhChannel: EcdhChannel | null,
  setEcdhChannel: React.Dispatch<PhalaSharedStruct['ecdhChannel']> | null,
  ecdhShouldJoin: boolean,
  setEcdhShouldJoin: React.Dispatch<PhalaSharedStruct['ecdhShouldJoin']> | null
}

export const PhalaSharedContext = React.createContext<PhalaSharedStruct>({
  pRuntimeEndpoint: null,
  setPRuntimeEndpoint: null,
  accountId: null,
  setAccountId: null,
  keypair: null,
  setKeypair: null,
  latency: null,
  setLatency: null,
  info: null,
  setInfo: null,
  error: false,
  setError: null,
  pApi: null,
  ecdhChannel: null,
  setEcdhChannel: null,
  ecdhShouldJoin: false,
  setEcdhShouldJoin: null

});

export const usePhalaShared = (): PhalaSharedStruct => React.useContext(PhalaSharedContext);
