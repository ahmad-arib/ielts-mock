import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TestRunner } from '@/components/test/TestRunner';
import { getTestDefinition, getTestIds } from '@/lib/tests';

export async function generateStaticParams() {
  const ids = await getTestIds();
  return ids.map((testId) => ({ testId }));
}

export async function generateMetadata({ params }: { params: { testId: string } }): Promise<Metadata> {
  const test = await getTestDefinition(params.testId);
  if (!test) {
    return { title: 'IELTS Mock Test' };
  }
  return {
    title: `${test.title} – IELTS Mock Test`,
  };
}

export default async function TestPage({ params }: { params: { testId: string } }) {
  const test = await getTestDefinition(params.testId);
  if (!test) {
    notFound();
  }

  return <TestRunner test={test} />;
}
