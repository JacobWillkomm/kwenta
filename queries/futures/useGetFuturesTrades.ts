import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesEndpoint, mapTrades } from './utils';
import { FuturesTrade } from './types';
import { getFuturesTrades } from './subgraph';
import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';

const useGetFuturesTrades = (
	currencyKey: string | undefined,
	options?: UseQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.Trades(network.id, currencyKey || null),
		async () => {
			if (!currencyKey) return null;

			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: DEFAULT_NUMBER_OF_TRADES,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
						},
						orderDirection: 'desc',
						orderBy: 'timestamp',
					},
					{
						id: true,
						timestamp: true,
						account: true,
						size: true,
						asset: true,
						price: true,
						positionId: true,
						positionSize: true,
						positionClosed: true,
						pnl: true,
						feesPaid: true,
						orderType: true,
					}
				);
				return response ? mapTrades(response) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isWalletConnected ? isL2 && isAppReady : isAppReady,
			refetchInterval: 15000,
			...options,
		}
	);
};

export default useGetFuturesTrades;
