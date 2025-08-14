// src/components/learn/PlaylistViewer.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Video {
  partTitle: string;
  videoId: string;
}

interface PlaylistViewerProps {
  playlist: Video[];
  lessonTitle: string;
}

const PlaylistViewer: React.FC<PlaylistViewerProps> = ({ playlist, lessonTitle }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  if (!playlist || playlist.length === 0) {
    return <p className="text-center text-muted-foreground">This video playlist is empty.</p>;
  }

  const currentVideo = playlist[currentVideoIndex];

  const goToNextVideo = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-1 pt-0">
          <CardTitle className="font-headline text-xl text-primary-foreground">{currentVideo.partTitle}</CardTitle>
          <CardDescription className="font-body text-sm text-muted-foreground">
            {lessonTitle} - Video {currentVideoIndex + 1} of {playlist.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-md border border-border"
              src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
              title={currentVideo.partTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-1 pt-4">
          <Button 
            onClick={goToPreviousVideo} 
            disabled={currentVideoIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            Previous
          </Button>
          <Button 
            onClick={goToNextVideo} 
            disabled={currentVideoIndex === playlist.length - 1}
          >
            Next
            <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PlaylistViewer;
