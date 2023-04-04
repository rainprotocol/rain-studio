import type { ContractAddressRow, DeployerAddressesRow } from '$lib/types/types';
import type { Abi, AbiError, AbiEvent, AbiFunction } from 'abitype';
import { allChainsData } from 'svelte-ethers-store';

// getting all of the state changing methods for this abi
export const getWriteMethods = (
	abi: Abi
): { label: string; value: { name: string; def: AbiFunction }; index: number }[] => {
	return abi
		.filter(
			(method: AbiFunction | AbiEvent | AbiError): method is AbiFunction =>
				method.type == 'function' &&
				'inputs' in method &&
				'name' in method &&
				method.name !== 'createChild' &&
				method.stateMutability !== 'view'
		)
		.map((method: AbiFunction, index: number) => ({
			label: method.name,
			value: { name: method.name, def: method },
			index
		}));
};

export const getNameFromChainId = (id: number): string => {
	const name = allChainsData.find((chain) => chain.chainId == id)?.name;
	if (!name) throw Error('Unknown chainId');
	return name;
};

// getting the chains for which there's both a known address for contract and interpreter
export const getCommonChains = (
	deployers: DeployerAddressesRow[],
	contractAddresses: ContractAddressRow[]
): number[] => {
	// will only include unique chains
	const chains: Set<number> = new Set();
	deployers.forEach((deployer) => {
		chains.add(deployer.chainId);
	});
	contractAddresses.forEach((el) => {
		chains.add(el.chainId);
	});
	return Array.from(chains.values());
};

export const getInterpretersForChain = (
	deployers: DeployerAddressesRow[],
	chainId: number
): {
	label: string;
	value: {
		id: string;
		deployerAddress: string;
		deployer: DeployerAddressesRow;
	}
}[] => {
	const deployersForSelect: {
		label: string;
		value: {
			id: string;
			deployerAddress: string;
			deployer: DeployerAddressesRow;
		};
	}[] = [];
	deployers.forEach((deployer) => {
		if (deployer.chainId == chainId) {
			deployersForSelect.push({
				label: `${deployer.address}`,
				value: {
					id: deployer.id,
					deployer,
					deployerAddress: deployer.address,
				}
			})
		}
	})
	return deployersForSelect;
};

// filtering to the known addresses for the selected chain
export const getKnownContractAddressesForChain = (contractAddresses: ContractAddressRow[], chainId: number) => {
	return contractAddresses
		.filter((contractAddress) => contractAddress.chainId == chainId)
		?.map((contractAddress) => {
			return { label: contractAddress.address, value: contractAddress.address };
		});
};
