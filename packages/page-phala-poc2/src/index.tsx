// Copyright 2017-2019 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// some types, AppProps for the app and I18nProps to indicate
// translatable strings. Generally the latter is quite "light",
// `t` is inject into props (see the HOC export) and `t('any text')
// does the translation
import { AppProps } from '@polkadot/react-components/types';
import Tabs from '@polkadot/react-components/Tabs';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useMemo } from 'react';
import { Route, Switch } from 'react-router';
import styled from 'styled-components';

// local imports and components
import BalancesTab from './contracts/balances';
import AssetsTab from './contracts/assets';
import SettingsTab from './SettingsTab';
import { useTranslation } from './translate';

import PRuntime, {measure} from './pruntime';
import Crypto, {EcdhChannel} from './pruntime/crypto';
import config from './config';
import { PhalaSharedContext, PhalaSharedStruct, usePhalaShared } from './context';

interface Props extends AppProps {}

const Banner = styled.div`
  padding: 0 0.5rem 0.5rem;
  margin-top: 10px;
  margin-bottom: 20px;

  .box {
    background: #fff6e5;
    border-left: 0.25rem solid darkorange;
    border-radius: 0 0.25rem 0.25rem 0;
    box-sizing: border-box;
    padding: 1rem 1.5rem;

    .info {
      max-width: 50rem;
    }
  }
`;

function PhalaPoc2 (props: Props): React.ReactElement<Props> {
  const [pRuntimeEndpoint, setPRuntimeEndpoint] = useState<PhalaSharedStruct['pRuntimeEndpoint']>(config.pRuntimeEndpoint);
  const [accountId, setAccountId] = useState<PhalaSharedStruct['accountId']>(null);
  const [keypair, setKeypair] = useState<PhalaSharedStruct['keypair']>(null);
  const [latency, setLatency] = useState<PhalaSharedStruct['latency']>(0);
  const [info, setInfo] = useState<PhalaSharedStruct['info']>(null);
  const [error, setError] = useState<boolean>(false);

  const pApi = useMemo(() => new PRuntime(pRuntimeEndpoint), [pRuntimeEndpoint]);

  const [ecdhChannel, setEcdhChannel] = useState<EcdhChannel | null>(null);
  const [ecdhShouldJoin, setEcdhShouldJoin] = useState(false);

  React.useEffect(() => {
    setError(false);
    setLatency(0);
    setInfo(null);
  }, [pRuntimeEndpoint])

  React.useEffect(() => {
    if (!pApi) {
      return
    }

    const interval: number = setInterval(() => {
      measure((() =>
        pApi.getInfo()
          .then(i => setInfo(i))
          .catch(e => {
            setError(true);
            console.warn('Error getting /info', e);
          })
      ))
        .then(dt => setLatency(l => l ? l * 0.8 + dt * 0.2 : dt))
    }, 1000);

    return () => clearTimeout(interval);
  }, [pRuntimeEndpoint])

  React.useEffect(() => {
    Crypto.newChannel()
      .then(ch => {
        setEcdhChannel(ch)
        setEcdhShouldJoin(true)
      })
  }, []);

  React.useEffect(() => {
    if (!(ecdhShouldJoin && ecdhChannel && info?.ecdhPublicKey)) {
      return
    }
    Crypto.joinChannel(ecdhChannel, info.ecdhPublicKey)
      .then(ch => {
        setEcdhChannel(ch);
        setEcdhShouldJoin(false);
        console.log('joined channel:', ch);
      })
  }, [setEcdhShouldJoin, info?.ecdhPublicKey]);

  const contextValue = useMemo(() => ({
    pRuntimeEndpoint, setPRuntimeEndpoint,
    accountId, setAccountId,
    keypair, setKeypair,
    latency, setLatency,
    info, setInfo,
    error, setError,
    ecdhChannel, setEcdhChannel,
    pApi
  }), [
    pRuntimeEndpoint, setPRuntimeEndpoint,
    accountId, setAccountId,
    keypair, setKeypair,
    latency, setLatency,
    info, setInfo,
    error, setError,
    ecdhChannel, setEcdhChannel,
    ecdhShouldJoin, setEcdhShouldJoin,
    pApi
  ]);

  return <PhalaSharedContext.Provider value={contextValue as PhalaSharedStruct}>
    <_PhalaPoc2 {...props} />
  </PhalaSharedContext.Provider>
}

function _PhalaPoc2 ({ className, basePath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const {
    pRuntimeEndpoint,
    accountId,
    keypair,
    ecdhChannel
  } = usePhalaShared();

  return (
    <main className={className}>
      <Tabs
          basePath={basePath}
          hidden={(keypair && !keypair.isLocked) ? ['balances'] : ['assets', 'balances']}
          items={[
            {
              isRoot: true,
              name: 'items',
              text: t('Items')
            },
            {
              name: 'list',
              text: t('Publish')
            },
            {
              name: 'orders',
              text: t('Orders')
            },
            {
              name: 'account',
              text: t('Account')
            },
            {
              name: 'assets',
              text: t('Assets')
            },
            {
              name: 'balances',
              text: t('Balances')
            },
            {
              name: 'settings',
              text: t('Settings')
            }
          ]}
        />
      <Switch>
        <Route path={`${basePath}/balances`}>
          <BalancesTab
            accountId={accountId}
            ecdhChannel={ecdhChannel}
            pRuntimeEndpoint={pRuntimeEndpoint}
            keypair={keypair}
          />
        </Route>
        <Route path={`${basePath}/assets`}>
          <AssetsTab
            accountId={accountId}
            ecdhChannel={ecdhChannel}
            pRuntimeEndpoint={pRuntimeEndpoint}
            keypair={keypair}
          />
        </Route>
        <Route path={`${basePath}/settings`}>
          <Banner>
            <div className='box'>
              <div className='info'>
                <p><strong>Phala Network testnet POC2</strong></p>
                <p>Test only. The network may be reset randomly. pRuntime is running in development mode. So currently the confidentiality is not guaranteed.</p>
                <p>Please select an account first.</p>
              </div>
            </div>
          </Banner>
          <SettingsTab />
        </Route>
        {/* <Route path={`${basePath}/list`} render={(): React.ReactElement<{}> => (
          <List basePath={basePath} accountId={accountId} />
          )} />
        <Route path={`${basePath}/new_order/:value`} render={(): React.ReactElement<{}> => (
          <NewOrder basePath={basePath} accountId={accountId} />
        )} />
        <Route path={`${basePath}/orders`} component={Orders} />
        <Route path={`${basePath}/item/:value`} render={(): React.ReactElement<{}> => (
          <ViewItem basePath={basePath} />
        )} />
        <Route path={`${basePath}/account`} render={(): React.ReactElement<{}> => (
          <AccountSelector onChange={setAccountId} />
        )} />
        <Route path={`${basePath}/result/:type/:value`} render={(): React.ReactElement<{}> => (
          <Result basePath={basePath} accountId={accountId} />
        )} /> */}
        <Route component={Items} />
      </Switch>
    </main>
  );
}

export default PhalaPoc2;
