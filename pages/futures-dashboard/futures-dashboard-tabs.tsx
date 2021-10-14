import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { castArray } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';

import { TabButton, TabList, TabPanel } from 'components/Tab';
import ROUTES from 'constants/routes';
import PositionCard from 'sections/futures/PositionCard';
import { FuturesMarket } from 'queries/futures/types';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAllMarkets from 'queries/futures/useGetFuturesPositionForAllMarkets';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from '@synthetixio/contracts-interface';
import AllAssetsTradeHistory from './all-assets-trade-history';

enum FuturesDashboardTab {
	POSITION = 'position',
	TRADES = 'trades',
}
const FutureDashboardTabs = Object.values(FuturesDashboardTab);

const FuturesDashboardTabs = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);
	const futuresMarketsPositionQuery = useGetFuturesPositionForAllMarkets(
		(futuresMarkets as FuturesMarket[]).map(({ asset }: { asset: string }) => asset)
	);
	const positions = (futuresMarketsPositionQuery?.data ?? []).filter(({ position }) =>
		Boolean(position)
	);

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = castArray(router.query.tab)[0] as FuturesDashboardTab;
			if (FutureDashboardTabs.includes(tab)) {
				return tab;
			}
		}
		return null;
	}, [router]);

	const activeTab = tabQuery ?? FuturesDashboardTab.POSITION;

	const tabs = [
		{
			name: FuturesDashboardTab.POSITION,
			label: t('futures-dashboard.position.tab'),
			active: activeTab === FuturesDashboardTab.POSITION,
			onClick: () => router.push(ROUTES.FuturesDashboard.Position),
		},

		{
			name: FuturesDashboardTab.TRADES,
			label: t('futures-dashboard.trades.tab'),
			active: activeTab === FuturesDashboardTab.TRADES,
			onClick: () => router.push(ROUTES.FuturesDashboard.Trades),
		},
	];
	return (
		<Wrapper>
			<StyledTabList>
				{tabs.map(({ name, label, active, onClick }) => (
					<StyledTabButton key={name} name={name} active={active} onClick={onClick}>
						{label}
					</StyledTabButton>
				))}
			</StyledTabList>
			<TabPanel name={FuturesDashboardTab.POSITION} activeTab={activeTab}>
				{positions.length === 0 && <p>TODO: No position design</p>}
				{positions.map((pos) => {
					return (
						<PositionCardWrapper>
							<PositionCard
								position={pos}
								currencyKey={pos.asset}
								currencyKeyRate={getExchangeRatesForCurrencies(
									exchangeRates,
									pos.asset,
									Synths.sUSD
								)}
								dashboard
							/>
						</PositionCardWrapper>
					);
				})}
			</TabPanel>
			<TabPanel name={FuturesDashboardTab.TRADES} activeTab={activeTab}>
				<AllAssetsTradeHistory />
			</TabPanel>
		</Wrapper>
	);
};

const Wrapper = styled.div`
	margin-top: 12px;
`;
const PositionCardWrapper = styled.div`
	margin-bottom: 12px;
`;

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;

const StyledTabButton = styled(TabButton)`
	text-transform: capitalize;
`;
export default FuturesDashboardTabs;
