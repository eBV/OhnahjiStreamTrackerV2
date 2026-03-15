import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal = ({ onClose, children, title }: ModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="neo-card w-full max-w-2xl max-h-[90vh] overflow-auto relative"
        style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10">
          {title ? (
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {title}
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted/40"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
