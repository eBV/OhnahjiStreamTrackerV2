import { Calendar, Clock, Eye, Gamepad2, ExternalLink } from "lucide-react";
import Modal from "@/components/ui/modal";
import { TwitchClip } from "@/hooks/useTwitchStats";

interface ClipModalProps {
  clip: TwitchClip;
  onClose: () => void;
}

const ClipModal = ({ clip, onClose }: ClipModalProps) => {
  const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}m${sec.toString().padStart(2, "0")}s` : `${sec}s`;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Modal onClose={onClose} title="Clip">
      <div className="p-5 space-y-4">
        {/* Twitch clip embed */}
        <div className="relative w-full rounded-lg overflow-hidden border border-foreground/10 bg-black" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://clips.twitch.tv/embed?clip=${clip.id}&parent=${parent}&autoplay=false`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            title={clip.title}
          />
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm md:text-base leading-snug">{clip.title}</h3>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{formatDate(clip.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-accent flex-shrink-0" />
            <span className="text-muted-foreground">{fmtDuration(clip.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-primary flex-shrink-0" />
            <span className="text-foreground font-bold">{clip.viewCount.toLocaleString()} views</span>
          </div>
          {clip.gameName && (
            <div className="flex items-center gap-2">
              <Gamepad2 size={12} className="text-accent flex-shrink-0" />
              <span className="text-muted-foreground truncate">{clip.gameName}</span>
            </div>
          )}
        </div>

        {/* External link */}
        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink size={11} />
          Open on Twitch
        </a>
      </div>
    </Modal>
  );
};

export default ClipModal;
