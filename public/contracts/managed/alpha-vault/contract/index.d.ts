import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  callerAddress(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, admin_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          investor_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           investor_0: Uint8Array,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  updatePerformance(context: __compactRuntime.CircuitContext<PS>,
                    newApy_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getBalance(context: __compactRuntime.CircuitContext<PS>,
             investor_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, admin_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          investor_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           investor_0: Uint8Array,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  updatePerformance(context: __compactRuntime.CircuitContext<PS>,
                    newApy_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getBalance(context: __compactRuntime.CircuitContext<PS>,
             investor_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, admin_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          investor_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           investor_0: Uint8Array,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  updatePerformance(context: __compactRuntime.CircuitContext<PS>,
                    newApy_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getBalance(context: __compactRuntime.CircuitContext<PS>,
             investor_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly totalValueLocked: bigint;
  readonly verifiedApy: bigint;
  investorBalances: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly quantAdmin: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
