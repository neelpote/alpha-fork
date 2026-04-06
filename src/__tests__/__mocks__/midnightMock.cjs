// Mock for all @midnight-ntwrk/* packages in tests
module.exports = {
  CompiledContract: {
    make: jest.fn(() => ({ pipe: jest.fn(() => ({})) })),
    withWitnesses: jest.fn(w => w),
    withVacantWitnesses: {},
    withCompiledFileAssets: jest.fn(() => ({})),
  },
  deployContract:      jest.fn(),
  findDeployedContract: jest.fn(),
  setNetworkId:        jest.fn(),
  getNetworkId:        jest.fn(() => 'preprod'),
  FetchZkConfigProvider: jest.fn().mockImplementation(() => ({})),
  indexerPublicDataProvider: jest.fn(() => ({})),
};
