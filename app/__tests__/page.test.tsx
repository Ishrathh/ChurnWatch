import '@testing-library/jest-dom'
import { fireEvent, render, screen, act } from '@testing-library/react'
import Dashboard from '../src/app/page'

describe('Dashboard Component', () => {
    beforeEach(() => {
        // Reset fetch mock before each test
        (global.fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({ customers: [], models: [] }),
            })
        );
    });

    test('renders correctly', async () => {
        await act(async () => {
            render(<Dashboard />);
        });
        // Wait for any pending promises to resolve
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        expect(screen.getByText(/ChurnWatch Prediction Dashboard/i)).toBeInTheDocument();
    });

    test('upload button is disabled when no file is selected', async () => {
        await act(async () => {
            render(<Dashboard />);
        });
        // Wait for any pending promises to resolve
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        const uploadButton = screen.getByText(/Upload CSV/i);
        expect(uploadButton).toBeDisabled();
    });

    test('handles file upload', async () => {
        await act(async () => {
            render(<Dashboard />);
        });
        // Wait for any pending promises to resolve
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Get the file input by its type instead of label
        const fileInput = screen.getByRole('button', { name: /upload csv/i });
        const input = document.querySelector('input[type="file"]');

        const file = new File(['dummy content'], 'example.csv', { type: 'text/csv' });

        await act(async () => {
            if (input) {
                fireEvent.change(input, { target: { files: [file] } });
            }
        });

        expect(fileInput).not.toBeDisabled();
    });
});