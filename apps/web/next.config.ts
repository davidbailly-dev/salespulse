import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Empeche `next dev` de creer/modifier AGENTS.md et CLAUDE.md avec son bloc
    // "agent rules" (voir node_modules/next/dist/docs/01-app/02-guides/ai-agents.md).
    agentRules: false,
    // Le paquet partagé est publié en TypeScript source, sans étape de build : Next le compile.
    transpilePackages: ['@salespulse/contracts'],
};

export default nextConfig;
