/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import ClassesPage from '@/app/dashboard/classes/page';
import { getClasses } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockGetClasses = getClasses as jest.MockedFunction<typeof getClasses>;

describe('Classes Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    mockGetClasses.mockImplementation(() => new Promise(() => {}));
    render(<ClassesPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders classes list after loading', async () => {
    const mockClasses = [
      {
        id: '1',
        name: 'Yoga',
        instructor: 'John Doe',
        date: '2026-02-01T00:00:00Z',
        start_time: '09:00',
        end_time: '10:00',
        capacity: 20,
        status: 'scheduled',
      },
      {
        id: '2',
        name: 'Pilates',
        instructor: 'Jane Smith',
        date: '2026-02-02T00:00:00Z',
        start_time: '10:00',
        end_time: '11:00',
        capacity: 15,
        status: 'scheduled',
      },
    ];

    mockGetClasses.mockResolvedValueOnce(mockClasses);

    render(<ClassesPage />);

    await waitFor(() => {
      expect(screen.getByText('Yoga')).toBeInTheDocument();
      expect(screen.getByText('Pilates')).toBeInTheDocument();
    });
  });

  test('displays class count correctly', async () => {
    const mockClasses = [
      { id: '1', name: 'Yoga', instructor: 'John', capacity: 20, status: 'scheduled' },
      { id: '2', name: 'Pilates', instructor: 'Jane', capacity: 15, status: 'scheduled' },
    ];

    mockGetClasses.mockResolvedValueOnce(mockClasses);

    render(<ClassesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Total Classes/i)).toBeInTheDocument();
    });
  });

  test('handles empty classes list', async () => {
    mockGetClasses.mockResolvedValueOnce([]);

    render(<ClassesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No classes scheduled/i)).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    mockGetClasses.mockRejectedValueOnce(new Error('Failed to load classes'));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();

    render(<ClassesPage />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });
});
