import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Empeche `next dev` de creer/modifier AGENTS.md et CLAUDE.md avec son bloc
    // "agent rules" (voir node_modules/next/dist/docs/01-app/02-guides/ai-agents.md).
    agentRules: false,
};

export default nextConfig;
