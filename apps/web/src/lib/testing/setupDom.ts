import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sans `globals: true`, Testing Library ne peut pas enregistrer son nettoyage automatique :
// on démonte explicitement ce que chaque test a affiché.
afterEach(() => {
    cleanup();
});
