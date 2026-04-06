import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TransactionModal from '../components/TransactionModal';

const defaultProps = {
  type: 'deposit',
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  txState: { status: 'idle', txId: null, error: null },
  walletConnected: true,
};

afterEach(() => jest.clearAllMocks());

describe('TransactionModal', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('renders deposit form when type is deposit', () => {
    render(<TransactionModal {...defaultProps} />);
    expect(screen.getByText('Deposit to Vault')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  test('renders withdraw form when type is withdraw', () => {
    render(<TransactionModal {...defaultProps} type="withdraw" />);
    expect(screen.getByText('Withdraw from Vault')).toBeInTheDocument();
  });

  test('shows wallet warning when not connected', () => {
    render(<TransactionModal {...defaultProps} walletConnected={false} />);
    expect(screen.getByText(/connect your lace wallet/i)).toBeInTheDocument();
  });

  // ── Submit button states ───────────────────────────────────────────────────

  test('submit button disabled when amount is empty', () => {
    render(<TransactionModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /deposit/i })).toBeDisabled();
  });

  test('submit button disabled when wallet not connected', () => {
    render(<TransactionModal {...defaultProps} walletConnected={false} />);
    const btn = screen.getByRole('button', { name: /deposit/i });
    expect(btn).toBeDisabled();
  });

  test('submit button enabled with valid amount and connected wallet', async () => {
    render(<TransactionModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('0.00'), '10');
    expect(screen.getByRole('button', { name: /deposit/i })).not.toBeDisabled();
  });

  // ── Form submission ────────────────────────────────────────────────────────

  test('calls onSubmit with correct units on submit', async () => {
    render(<TransactionModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('0.00'), '1.5');
    fireEvent.submit(screen.getByRole('button', { name: /deposit/i }).closest('form'));
    await waitFor(() => expect(defaultProps.onSubmit).toHaveBeenCalledWith(1500000));
  });

  test('does not submit with zero amount', async () => {
    render(<TransactionModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('0.00'), '0');
    fireEvent.submit(screen.getByRole('button', { name: /deposit/i }).closest('form'));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('does not submit with negative amount', async () => {
    render(<TransactionModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('0.00'), '-5');
    fireEvent.submit(screen.getByRole('button', { name: /deposit/i }).closest('form'));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  test('shows loading spinner during proof generation', () => {
    render(<TransactionModal {...defaultProps} txState={{ status: 'loading', txId: null, error: null }} />);
    expect(screen.getByText(/generating zk proof/i)).toBeInTheDocument();
  });

  test('hides form during loading', () => {
    render(<TransactionModal {...defaultProps} txState={{ status: 'loading', txId: null, error: null }} />);
    expect(screen.queryByPlaceholderText('0.00')).not.toBeInTheDocument();
  });

  // ── Success state ──────────────────────────────────────────────────────────

  test('shows success state with tx ID', () => {
    const txId = 'abc123def456';
    render(<TransactionModal {...defaultProps} txState={{ status: 'success', txId, error: null }} />);
    expect(screen.getByText(/transaction confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(txId)).toBeInTheDocument();
  });

  test('shows explorer link on success', () => {
    render(<TransactionModal {...defaultProps} txState={{ status: 'success', txId: 'abc', error: null }} />);
    expect(screen.getByText(/view on explorer/i)).toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────────────────

  test('shows error message on failure', () => {
    render(<TransactionModal {...defaultProps} txState={{ status: 'error', txId: null, error: 'Insufficient funds' }} />);
    expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
  });

  test('shows user rejection message', () => {
    render(<TransactionModal {...defaultProps} txState={{ status: 'error', txId: null, error: 'Transaction rejected by user' }} />);
    expect(screen.getByText(/rejected by user/i)).toBeInTheDocument();
  });

  test('close button calls onClose', () => {
    render(<TransactionModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: '' })); // X button
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

});
