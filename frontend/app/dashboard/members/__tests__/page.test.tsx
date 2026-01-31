/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import MembersPage from '@/app/dashboard/members/page';
import { getMembers, deleteMember } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockGetMembers = getMembers as jest.MockedFunction<typeof getMembers>;
const mockDeleteMember = deleteMember as jest.MockedFunction<typeof deleteMember>;

describe('Members Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  test('renders loading state initially', () => {
    mockGetMembers.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<MembersPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders members list after loading', async () => {
    const mockMembers = [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        status: 'active',
        membership_type: 'monthly',
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone: '9876543210',
        status: 'active',
        membership_type: 'annual',
      },
    ];

    mockGetMembers.mockResolvedValueOnce(mockMembers);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('displays member count correctly', async () => {
    const mockMembers = [
      { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
      { id: '3', first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com' },
    ];

    mockGetMembers.mockResolvedValueOnce(mockMembers);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText(/3 Total Members/i)).toBeInTheDocument();
    });
  });

  test('handles empty members list', async () => {
    mockGetMembers.mockResolvedValueOnce([]);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText(/No members found/i)).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    mockGetMembers.mockRejectedValueOnce(new Error('Failed to load members'));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();

    render(<MembersPage />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to load members');
    });

    alertMock.mockRestore();
  });
});
