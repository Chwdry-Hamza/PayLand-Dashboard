// import Link from 'next/link'; // Import Link from next/link

// export default function Home() {
//   return (
//     <div className="container mx-auto text-center py-10">
//       <h1 className="text-4xl font-bold mb-4">Welcome to the School Management System</h1>
//       <p className="text-lg">Manage students, teachers, and more with ease.</p>
//       <Link
//         href="/auth/login"
//         className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded"
//       >
//         Get Started
//       </Link>
//     </div>
//   );
// }
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/login');
}