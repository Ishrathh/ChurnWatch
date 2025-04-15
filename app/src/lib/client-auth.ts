// Client-side authentication utilities
export async function getAuthStatus() {
    try {
        const response = await fetch('/api/auth/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return { authenticated: false, user: null };
        }

        const data = await response.json();
        return {
            authenticated: data.authenticated,
            user: data.user || null
        };
    } catch (error) {
        console.error('Auth status check error:', error);
        return { authenticated: false, user: null };
    }
}