/**
 * Midnight Network endpoint configuration.
 *
 * Defaults to Preprod (no Docker required).
 * Override via .env file for local dev or mainnet when endpoints are published.
 *
 * Preprod endpoints (latest stable release):
 *   Node RPC:          https://rpc.preprod.midnight.network
 *   Proof Server:      https://lace-proof-pub.preprod.midnight.network
 *   Indexer (GraphQL): https://indexer.preprod.midnight.network/api/v3/graphql
 *   Faucet:            https://faucet.preprod.midnight.network
 *   Explorer:          https://explorer.preprod.midnight.network
 *
 * Preview endpoints (bleeding edge):
 *   Node RPC:          https://rpc.preview.midnight.network
 *   Proof Server:      https://lace-proof-pub.preview.midnight.network
 *   Indexer (GraphQL): https://indexer.preview.midnight.network/api/v3/graphql
 */

export const networkConfig = {
  nodeEndpoint:    import.meta.env.VITE_NODE_ENDPOINT    ?? 'https://rpc.preprod.midnight.network',
  indexerEndpoint: import.meta.env.VITE_INDEXER_ENDPOINT ?? 'https://indexer.preprod.midnight.network/api/v3/graphql',
  proofServerUrl:  import.meta.env.VITE_PROOF_SERVER_URL ?? 'https://proof-server.preprod.midnight.network',
  networkId:       import.meta.env.VITE_NETWORK_ID       ?? 'PreprodMidnight',
};
