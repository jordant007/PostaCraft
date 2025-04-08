// src/app/design/page.js
import { Suspense } from 'react';
import DesignContent from '../../components/DesignContent';

export default function Design() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DesignContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
export const ssr = false;