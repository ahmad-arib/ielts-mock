import { redirect } from 'next/navigation';

import { DEFAULT_TEST_PATH } from '@/config/tests';

export default function TestIndexPage() {
  redirect(DEFAULT_TEST_PATH);
}
