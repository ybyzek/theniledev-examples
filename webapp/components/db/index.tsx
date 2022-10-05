import dynamic from 'next/dynamic';

// https://nextjs.org/docs/advanced-features/dynamic-import
export const GridView = dynamic(() => import('./GridView'));
