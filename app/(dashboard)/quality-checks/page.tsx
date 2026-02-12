import { redirect } from 'next/navigation';

export default function QualityChecksPage() {
  redirect('/templates?tab=quality');
}
