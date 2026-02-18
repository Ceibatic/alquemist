import { redirect } from 'next/navigation';

export default function SupplierEditPage() {
  redirect('/resources?tab=suppliers');
}
