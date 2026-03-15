import { Calendar, Clock, Eye, Gamepad2, ExternalLink } from "lucide-react";
import Modal from "@/components/ui/modal";
import { TwitchStream } from "@/hooks/useTwitchStats";

interface StreamModalProps {
  stream: TwitchStream;
  username: string;
  onClose: () => void;
}

const StreamModal = ({ stream, username, onClose }: StreamModalProps) => {
  const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";

  const thumbSrc = stream.thumbnailUrl
    ? stream.thumbnailUrl.replace("%{width}", "640").replace("%{height}", "360")
    : null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Modal onClose={onClose} title="Past Stream">
      <div className="p-5 space-y-4">
        {/* Twitch VOD embed */}
        <div className="relative w-full rounded-lg overflow-hidden border border-foreground/10 bg-black" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://player.twitch.tv/?video=${stream.id}&parent=${parent}&autoplay=false`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            title={stream.title}
          />
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm md:text-base leading-snug">{stream.title}</h3>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{formatDate(stream.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-accent flex-shrink-0" />
            <span className="text-muted-foreground">{stream.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-primary flex-shrink-0" />
            <span className="text-foreground font-bold">{stream.viewCount.toLocaleString()} views</span>
          </div>
          {stream.gameName && (
            <div className="flex items-center gap-2">
              <Gamepad2 size={12} className="text-accent flex-shrink-0" />
              <span className="text-muted-foreground truncate">{stream.gameName}</span>
            </div>
          )}
        </div>

        {/* External link */}
        <a
          href={`https://www.twitch.tv/videos/${stream.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink size={11} />
          Watch on Twitch
        </a>
      </div>
    </Modal>
  );
};

export default StreamModal;
