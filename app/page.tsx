import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to signup
  // Later, this will check auth state and redirect accordingly
  redirect('/signup');
}
