import next from 'eslint-config-next'

/**
 * Configuration ESLint (flat config) de Barber Cuts.
 * Base : `eslint-config-next` (Règles Next, React, React Hooks, a11y, TypeScript).
 * Les règles trop bruyantes sur un code encore en consolidation sont en `warn`
 * pour garder un `npm run lint` exploitable en CI.
 */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
      'eslint.config.mjs',
    ],
  },
  ...next,
  {
    // Les apostrophes françaises sont échappées à la main dans le JSX.
    rules: {
      'react/no-unescaped-entities': 'off',
      // Les visuels distants (photos de salon en base64/URL) utilisent <img>.
      '@next/next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Règles du React Compiler, très strictes : elles signalent des motifs
      // encore fréquents ici (Date.now() dans un handler, setState dans un
      // effet de chargement). On les garde visibles sans bloquer la CI.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Le projet utilise encore `any` sur les lignes Supabase non typées.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
