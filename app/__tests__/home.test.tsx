import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import Home from '../src/app/page'

describe('Home Component', () => {
    test('renders correctly', async () => {
        await act(async () => {
            render(<Home />);
        });

        // Check for main heading
        expect(screen.getByText(/Predict Customer Churn/i)).toBeInTheDocument();
        expect(screen.getByText(/with ChurnWatch/i)).toBeInTheDocument();

        // Check for description text
        expect(screen.getByText(/ChurnWatch helps businesses predict and prevent customer churn/i)).toBeInTheDocument();

        // Check for Get Started button
        const getStartedButton = screen.getByText(/Get Started/i);
        expect(getStartedButton).toBeInTheDocument();
        expect(getStartedButton).toHaveAttribute('href', '/dashboard');
    });
}); 