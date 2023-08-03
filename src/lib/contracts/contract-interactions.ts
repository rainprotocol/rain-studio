import { prepareWriteContract } from '@wagmi/core';
import type { Abi } from 'abitype';
import type { Address } from '@wagmi/core';

export const prepareWriteFunction = async (
	address_: Address,
	abi: Abi,
	functionName_: string,
	args_?: any
) => {
	const { request } = await prepareWriteContract({
		address: address_,
		abi: abi,
		functionName: functionName_,
		args: args_
	});

	return request;
};

export const CloneFactoryAbi: Abi = [
	{
		type: 'constructor',
		inputs: [
			{
				name: 'config',
				type: 'tuple',
				components: [
					{
						name: 'deployer',
						type: 'address',
						internalType: 'address'
					},
					{
						name: 'meta',
						type: 'bytes',
						internalType: 'bytes'
					}
				],
				internalType: 'struct DeployerDiscoverableMetaV1ConstructionConfig'
			}
		],
		stateMutability: 'nonpayable'
	},
	// The MinFinalStack error comes from the ExpressionDeployer. It's not defined
	// on CloneFactory, but could be throw since ExpressionDeployer integrity.
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'minStackOutputs',
				type: 'uint256'
			},
			{
				internalType: 'uint256',
				name: 'actualStackOutputs',
				type: 'uint256'
			}
		],
		name: 'MinFinalStack',
		type: 'error'
	},
	{
		name: 'InitializationFailed',
		type: 'error',
		inputs: []
	},
	{
		name: 'NotRainMetaV1',
		type: 'error',
		inputs: [
			{
				name: 'unmeta',
				type: 'bytes',
				internalType: 'bytes'
			}
		]
	},
	{
		name: 'UnexpectedMetaHash',
		type: 'error',
		inputs: [
			{
				name: 'expectedHash',
				type: 'bytes32',
				internalType: 'bytes32'
			},
			{
				name: 'actualHash',
				type: 'bytes32',
				internalType: 'bytes32'
			}
		]
	},
	{
		name: 'ZeroImplementationCodeSize',
		type: 'error',
		inputs: []
	},
	{
		name: 'MetaV1',
		type: 'event',
		inputs: [
			{
				name: 'sender',
				type: 'address',
				indexed: false,
				internalType: 'address'
			},
			{
				name: 'subject',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256'
			},
			{
				name: 'meta',
				type: 'bytes',
				indexed: false,
				internalType: 'bytes'
			}
		],
		anonymous: false
	},
	{
		name: 'NewClone',
		type: 'event',
		inputs: [
			{
				name: 'sender',
				type: 'address',
				indexed: false,
				internalType: 'address'
			},
			{
				name: 'implementation',
				type: 'address',
				indexed: false,
				internalType: 'address'
			},
			{
				name: 'clone',
				type: 'address',
				indexed: false,
				internalType: 'address'
			}
		],
		anonymous: false
	},
	{
		name: 'clone',
		type: 'function',
		inputs: [
			{
				name: 'implementation',
				type: 'address',
				internalType: 'address'
			},
			{
				name: 'data',
				type: 'bytes',
				internalType: 'bytes'
			}
		],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'address'
			}
		],
		stateMutability: 'nonpayable'
	}
];
