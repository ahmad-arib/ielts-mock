import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TestRunner } from '@/components/test/TestRunner';
import { getTestDefinition, getTestIds } from '@/lib/tests';

export async function generateStaticParams() {
  const ids = await getTestIds();
  return ids.map((testId) => ({ testId }));
}

export async function generateMetadata({ params }: { params: Promise<{ testId: string }> }): Promise<Metadata> {
  const { testId } = await params;
  const test = await getTestDefinition(testId);
  if (!test) {
    return { title: 'IELTS Mock Test' };
  }
  return {
    title: `${test.title} – IELTS Mock Test`,
  };
}

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = await getTestDefinition(testId);
  if (!test) {
    notFound();
  }

  return <TestRunner test={test} />;
}
