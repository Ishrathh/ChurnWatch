import { render, act } from '@testing-library/react'
import Dashboard from '../src/app/page'

it('renders Dashboard component unchanged', async () => {
    let container;
    await act(async () => {
        const result = render(<Dashboard />);
        container = result.container;
    });
    expect(container).toMatchSnapshot();
});