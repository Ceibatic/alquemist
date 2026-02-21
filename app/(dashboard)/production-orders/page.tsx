import { redirect } from 'next/navigation';

export default function ProductionOrdersRedirect() {
  redirect('/production?tab=ordenes');
}
