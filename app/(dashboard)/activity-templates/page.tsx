import { redirect } from 'next/navigation';

export default function ActivityTemplatesPage() {
  redirect('/templates?tab=activities');
}
