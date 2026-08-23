import type { UserRole } from 'src/shared/types/api';

export interface NavItem {
    title: string;
    path: string;
    icon: string;
    roles?: UserRole[];
}

export const navItems: NavItem[] = [
    { title: 'Tableau de bord', path: '/', icon: 'solar:widget-5-bold-duotone' },
    { title: 'Conteneurs', path: '/conteneurs', icon: 'solar:box-bold-duotone' },
    { title: 'Comparaison', path: '/comparaison', icon: 'solar:chart-square-bold-duotone' },
    { title: 'Optimisation', path: '/optimiser', icon: 'solar:lightbulb-bold-duotone' },
    { title: 'Kanban', path: '/kanban', icon: 'solar:clipboard-list-bold-duotone' },
    {
        title: 'Paramètres',
        path: '/parametres',
        icon: 'solar:settings-bold-duotone',
        roles: ['ADMIN'],
    },
];
