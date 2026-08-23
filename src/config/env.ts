export const CONFIG = {
    appName: 'GreenSI',
    appDescription:
        "Plateforme décisionnelle Green IT pour la mesure et l'optimisation de l'empreinte énergétique et carbone des infrastructures conteneurisées.",
    serverUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    tokenKey: 'greensi_token',
    refreshTokenKey: 'greensi_refresh_token',
    defaultWindowHours: 24,
} as const;
