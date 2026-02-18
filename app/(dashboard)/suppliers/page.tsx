import { redirect } from 'next/navigation';

export default function SuppliersPage() {
  redirect('/resources?tab=suppliers');
}
