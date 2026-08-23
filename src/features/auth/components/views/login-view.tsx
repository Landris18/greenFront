import { Icon } from '@iconify/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CONFIG } from 'src/config/env';
import { useAuth } from 'src/features/auth/hooks/use-auth';
import { getErrorMessage } from 'src/shared/utils/error-handler';

export function LoginView() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!email.trim() || !password) {
            setError('Renseignez votre email et votre mot de passe.');
            return;
        }

        setSubmitting(true);
        try {
            await signIn(email.trim(), password);
            navigate('/', { replace: true });
        } catch (caught) {
            setError(getErrorMessage(caught));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                py: 6,
                backgroundColor: 'background.default',
            }}
        >
            <Box sx={{ width: 1, maxWidth: 420 }}>
                <Stack spacing={1.5} sx={{ alignItems: 'center', mb: 3, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            color: 'primary.contrastText',
                            backgroundColor: 'primary.main',
                        }}
                    >
                        <Icon icon="solar:leaf-bold" width={28} />
                    </Box>
                    <Typography variant="h2">{CONFIG.appName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
                        Mesure et optimisation de l&apos;empreinte énergétique et carbone des
                        infrastructures conteneurisées.
                    </Typography>
                </Stack>

                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Stack spacing={2.5}>
                                <Typography variant="h4">Connexion</Typography>

                                {error && <Alert severity="error">{error}</Alert>}

                                <TextField
                                    label="Adresse email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                    autoFocus
                                    fullWidth
                                />

                                <TextField
                                    label="Mot de passe"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={() => setShowPassword((v) => !v)}
                                                        aria-label={
                                                            showPassword
                                                                ? 'Masquer le mot de passe'
                                                                : 'Afficher le mot de passe'
                                                        }
                                                        sx={{
                                                            border: 0,
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            color: 'text.secondary',
                                                            p: 0.5,
                                                        }}
                                                    >
                                                        <Icon
                                                            icon={
                                                                showPassword
                                                                    ? 'solar:eye-closed-linear'
                                                                    : 'solar:eye-linear'
                                                            }
                                                            width={19}
                                                        />
                                                    </Box>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={submitting}
                                >
                                    {submitting ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2.5, textAlign: 'center' }}
                >
                    La puissance est mesurée au niveau de la machine lorsqu&apos;un capteur
                    matériel est accessible, puis répartie entre les conteneurs au prorata de leurs
                    ressources. Sans capteur, elle est estimée par le modèle énergétique.
                </Typography>
            </Box>
        </Box>
    );
}
