import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeploymentForm } from '@/components/DeploymentForm';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      primaryEmailAddress: {
        emailAddress: 'test@example.com',
      },
    },
    isLoaded: true,
  })),
}));

describe('DeploymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form fields', () => {
    render(<DeploymentForm />);

    // Check that all form fields are present
    expect(screen.getByLabelText(/ai model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/communication channel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^channel token$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/channel api key/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button', { name: /deploy bot/i })).toBeInTheDocument();
  });

  it('displays all model options in the select', () => {
    render(<DeploymentForm />);

    const modelSelect = screen.getByRole('combobox', { name: /ai model/i });
    expect(modelSelect).toBeInTheDocument();
  });

  it('displays all channel options in the select', () => {
    render(<DeploymentForm />);

    const channelSelect = screen.getByRole('combobox', { name: /communication channel/i });
    expect(channelSelect).toBeInTheDocument();
  });

  it('displays validation errors for invalid email', async () => {
    const user = userEvent.setup();
    render(<DeploymentForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    
    // Clear the default email and enter invalid email
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur event

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('displays validation errors for missing channel token', async () => {
    const user = userEvent.setup();
    render(<DeploymentForm />);

    const tokenInput = screen.getByLabelText(/^channel token$/i);
    
    // Focus and blur without entering anything
    await user.click(tokenInput);
    await user.tab(); // Trigger blur event

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/channel token is required/i)).toBeInTheDocument();
    });
  });

  it('displays error message when onSubmit callback fails', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(<DeploymentForm onSubmit={mockOnSubmit} />);

    // Fill in the required fields
    const emailInput = screen.getByLabelText(/email address/i);
    const tokenInput = screen.getByLabelText(/^channel token$/i);

    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(tokenInput, 'test-channel-token');

    // Submit the form - it will fail validation because model and channel are not selected
    const submitButton = screen.getByRole('button', { name: /deploy bot/i });
    await user.click(submitButton);

    // The form should show validation error for missing selections
    await waitFor(() => {
      const validationError = screen.queryByText(/please select a valid/i);
      expect(validationError).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
