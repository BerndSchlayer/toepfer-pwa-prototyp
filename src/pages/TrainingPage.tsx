import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import trainingData from "../data/trainingData.json";
import "./CommonPage.css";
import "./TrainingPage.css";

interface VideoData {
  id: string;
  youtubeId: string;
  titleKey: string;
  descriptionKey: string;
}

export default function TrainingPage() {
  const { t } = useTranslation("app");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videos = trainingData.videos as VideoData[];

  const getThumbnailUrl = (youtubeId: string): string => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  const handleVideoClick = (youtubeId: string) => {
    setSelectedVideo(youtubeId);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  // Prevent body scroll when video modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedVideo]);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">{t("training.title")}</h1>
      </header>

      <div className="video-list">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-item"
            onClick={() => handleVideoClick(video.youtubeId)}
          >
            <div className="video-thumbnail-container">
              <img
                src={getThumbnailUrl(video.youtubeId)}
                alt={t(video.titleKey)}
                className="video-thumbnail"
              />
              <div className="video-play-overlay">
                <Play size={48} />
              </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">{t(video.titleKey)}</h3>
              <p className="video-description">{t(video.descriptionKey)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={handleCloseVideo}>
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-modal-close"
              onClick={handleCloseVideo}
            >
              ×
            </button>
            <div className="video-player-container">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
