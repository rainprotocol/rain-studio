import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

import { createDbClient, createSgClient } from './deps.ts';
import {
	getSubgraph,
	getSGInterpreters,
	getDBInterpretersData,
	filterNonAddedDeployers,
	filterNonAddedRainterpreters,
	filterNonAddedStores,
	filterUniqueIDs
} from './utils/index.ts';

import type {
	DataDeployerAddressUpload,
	DataDeployerUpload,
	DataRainterpreterAddressUpload,
	DataRainterpreterStoreAddressUpload,
	DataRainterpreterStoreUpload,
	DataRainterpreterUpload
} from './types.ts';

serve(async (req) => {
	try {
		// Stablishing just one connection to the DB
		const supabaseClient = createDbClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			// This allow to get the Authorization from the header of the request (the bearer key)
			{ global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
		);

		// Obtaining the subgraph_url and his chain ID. This allow to add different
		// chains and subgraphs.
		const subgraphs = getSubgraph();

		let deployerToAdd: DataDeployerUpload[] = [];
		let deployerAddressesToAdd: DataDeployerAddressUpload[] = [];
		let rainterpretersToAdd: DataRainterpreterUpload[] = [];
		let rainterpreterAddressesToAdd: DataRainterpreterAddressUpload[] = [];
		let storesToAdd: DataRainterpreterStoreUpload[] = [];
		let storeAddressesToAdd: DataRainterpreterStoreAddressUpload[] = [];

		for (let i = 0; i < subgraphs.length; i++) {
			const { subgraph_url, chain_id } = subgraphs[i];

			// Create connection the current subgraph (chainID)
			const subgraphClient = createSgClient({
				url: subgraph_url
			});

			// ** Filling the interpreter table
			// Getting data and information related to interpreters
			const { deployersDB, rainterpretersDB, rainterpreter_storesDB } = await getDBInterpretersData(
				supabaseClient
			);

			const { deployersSG, rainterpretersSG, rainterpreter_storesSG } = await getSGInterpreters(
				subgraphClient
			);

			const filteredDeployers = filterNonAddedDeployers(deployersSG, deployersDB, chain_id);
			const filteredRainterpreters = filterNonAddedRainterpreters(
				rainterpretersSG,
				rainterpretersDB,
				chain_id
			);
			const filteredStores = filterNonAddedStores(
				rainterpreter_storesSG,
				rainterpreter_storesDB,
				chain_id
			);

			// Concat and filling the arrays
			// - Deployers
			deployerToAdd = deployerToAdd.concat(Object.values(filteredDeployers.deployersToAdd));
			deployerAddressesToAdd = deployerAddressesToAdd.concat(
				Object.values(filteredDeployers.deployersAddressesToAdd)
			);

			// - Rainterpreters
			rainterpretersToAdd = rainterpretersToAdd.concat(
				Object.values(filteredRainterpreters.rainterpretersToAdd)
			);
			rainterpreterAddressesToAdd = rainterpreterAddressesToAdd.concat(
				Object.values(filteredRainterpreters.rainterpreterAddressesToAdd)
			);

			// - Stores
			storesToAdd = storesToAdd.concat(Object.values(filteredStores.storesToAdd));
			storeAddressesToAdd = storeAddressesToAdd.concat(
				Object.values(filteredStores.storeAddressesToAdd)
			);
		}

		// Use reduce to avoid duplicated data on Cross Chain tables on deployers.
		// The other items for entities like `addresses` do not need this
		// filter since they are already have an unique ID because use the ChainId
		// for generate their ID. Read the `filterUniqueIDs` for similar explanation.
		deployerToAdd = filterUniqueIDs(deployerToAdd);
		rainterpretersToAdd = filterUniqueIDs(rainterpretersToAdd);
		storesToAdd = filterUniqueIDs(storesToAdd);

		// Handle and send insert to DB
		const nonChanged = 'No new data added';

		// Only send the query if the arrays are filled with data

		// - Rainterpreters;
		const respRainterpreters = rainterpretersToAdd.length
			? await supabaseClient.from('rainterpreters').insert(rainterpretersToAdd)
			: nonChanged;

		const respRainterpreterAdresses = rainterpreterAddressesToAdd.length
			? await supabaseClient.from('rainterpreter_addresses').insert(rainterpreterAddressesToAdd)
			: nonChanged;

		// - Stores
		const respStores = storesToAdd.length
			? await supabaseClient.from('rainterpreter_stores').insert(storesToAdd)
			: nonChanged;

		const respStoreAddresses = storeAddressesToAdd.length
			? await supabaseClient.from('rainterpreter_store_addresses').insert(storeAddressesToAdd)
			: nonChanged;

		// - Deployers: They are added/updated at the end since have a dependency with Rainterpreters and Storess
		const respDeployers = deployerToAdd.length
			? await supabaseClient.from('deployers').insert(deployerToAdd)
			: nonChanged;

		const respDeployerAddresses = deployerAddressesToAdd.length
			? await supabaseClient.from('deployers_addresses').insert(deployerAddressesToAdd)
			: nonChanged;

		// Return a response with the fully information about any result and well formatted for readability
		return new Response(
			JSON.stringify(
				{
					responses: {
						respDeployers,
						respDeployerAddresses,
						respRainterpreters,
						respRainterpreterAdresses,
						respStores,
						respStoreAddresses
					}
				},
				null,
				2
			),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 200
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400
		});
	}
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
