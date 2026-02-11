import { redirect } from 'next/navigation';

export default function QualityChecksRedirect() {
  redirect('/templates?tab=quality');
}
