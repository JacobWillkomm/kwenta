export const EPOCH_START: Record<number, number> = {
	420: 1665878400,
	10: 1668556800,
};

export const WEEK = 604800;
export const DECAY_RATE = 0.0205;
export const INITIAL_WEEKLY_SUPPLY = 14463.36923076923076923;
export const STAKING_REWARDS_RATIO = 0.6;

export function getEpochDetails(networkId: number, epoch: number) {
	const currentEpochTime = EPOCH_START[networkId]
		? EPOCH_START[networkId] + WEEK * epoch
		: EPOCH_START[10];
	const epochEndTime = currentEpochTime + WEEK;
	return {
		epochStart: currentEpochTime,
		epochEnd: epochEndTime,
	};
}

export function getStakingApy(totalStakedBalance: number, weekCounter: number) {
	const supplyRate = 1 - DECAY_RATE;
	const initialWeeklySupply = INITIAL_WEEKLY_SUPPLY;
	const startWeeklySupply = initialWeeklySupply * supplyRate ** weekCounter;
	const yearlyRewards = (startWeeklySupply * (1 - supplyRate ** 52)) / (1 - supplyRate);
	return totalStakedBalance > 0 ? (yearlyRewards * STAKING_REWARDS_RATIO) / totalStakedBalance : 0;
}
