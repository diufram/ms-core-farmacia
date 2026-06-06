import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export const MidnightPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f2f5f7',
            100: '#e0e8ed',
            200: '#c2ced6',
            300: '#9eaeb8',
            400: '#768a96',
            500: '#023047', // <--- TU COLOR BASE AQUÍ (Botones, activos, etc.)
            600: '#02293d',
            700: '#012133',
            800: '#011926',
            900: '#01101a',
            950: '#00080d'
        },
        // Opcional: Si quieres que los anillos de foco (focus ring) combinen
        focusRing: {
            width: '2px',
            style: 'solid',
            color: '{primary.500}', 
            offset: '2px'
        }
    }
});