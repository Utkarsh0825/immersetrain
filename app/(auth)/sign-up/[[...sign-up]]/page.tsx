import { redirect } from 'next/navigation';

/** Demo mode: authentication disabled — send users to the dashboard. */
export default function SignUpPage() {
  redirect('/dashboard');
}
