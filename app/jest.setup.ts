// Mock fetch globally
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ customers: [], models: [] }),
    })
) as jest.Mock;

// Clear all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
}); 