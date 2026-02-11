import { redirect } from 'next/navigation';

export default function ActivityTemplatesRedirect() {
  redirect('/templates?tab=activities');
}
