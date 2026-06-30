import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="font-display text-3xl font-semibold text-ink">This page isn't in the ledger</h1>
      <p className="text-inkSoft">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="btn-primary mt-3">Back to dashboard</Link>
    </div>
  );
}
