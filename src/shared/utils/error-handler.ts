type ApiError = {
    detail?: string | { msg?: string }[];
    message?: string;
};

export function getErrorMessage(error: unknown): string {
    const payload = error as ApiError | undefined;

    if (payload?.detail) {
        if (typeof payload.detail === 'string') {
            return payload.detail;
        }
        const first = payload.detail[0];
        if (first?.msg) {
            return first.msg;
        }
    }

    if (payload?.message) {
        return payload.message;
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
}
