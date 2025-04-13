import { render } from '@testing-library/react'
import Dashboard from '../src/app/dashboard/page'
import Home from '../src/app/page'

describe('Component Snapshots', () => {
    test('Dashboard component snapshot', () => {
        const { container } = render(<Dashboard />)
        expect(container).toMatchSnapshot()
    })

    test('Home component snapshot', () => {
        const { container } = render(<Home />)
        expect(container).toMatchSnapshot()
    })
})