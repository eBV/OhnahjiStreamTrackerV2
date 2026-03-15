import { Link } from "react-router-dom";
import { Radio } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
      <div className="neo-card-pink p-8 text-center max-w-sm w-full">
        <Radio size={48} className="mx-auto mb-4 opacity-60" />
        <h1 className="stat-value text-6xl mb-2">404</h1>
        <p className="text-sm font-mono opacity-70 mb-6">Page not found</p>
        <Link
          to="/"
          className="neo-badge bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
