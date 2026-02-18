import { redirect } from 'next/navigation';

export default function SupplierDetailPage() {
  redirect('/resources?tab=suppliers');
}
