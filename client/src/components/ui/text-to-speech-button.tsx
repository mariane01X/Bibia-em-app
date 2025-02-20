import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export function TextToSpeechButton({ text, className }: TextToSpeechButtonProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported } = useTextToSpeech();

  if (!supported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => (speaking ? stop() : speak(text))}
      aria-label={speaking ? t("Parar leitura") : t("Ler texto")}
      title={speaking ? t("Parar leitura") : t("Ler texto")}
    >
      {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
}
