import React from 'react';
import { Share2, MapIcon as WhatsappIcon, LinkedinIcon, TwitterIcon, FacebookIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface JobShareProps {
  jobTitle: string;
  jobUrl: string;
}

export function JobShare({ jobTitle, jobUrl }: JobShareProps) {
  const shareText = `${jobTitle} - İş İlanı | İsilanlarim.org`;
  
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${jobUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => window.open(shareLinks.whatsapp, '_blank')}
        className="flex items-center gap-2"
      >
        <WhatsappIcon className="h-5 w-5 text-green-600" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        onClick={() => window.open(shareLinks.linkedin, '_blank')}
        className="flex items-center gap-2"
      >
        <LinkedinIcon className="h-5 w-5 text-blue-600" />
        LinkedIn
      </Button>
      
      <Button
        variant="outline"
        onClick={() => window.open(shareLinks.twitter, '_blank')}
        className="flex items-center gap-2"
      >
        <TwitterIcon className="h-5 w-5 text-blue-400" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        onClick={() => window.open(shareLinks.facebook, '_blank')}
        className="flex items-center gap-2"
      >
        <FacebookIcon className="h-5 w-5 text-blue-600" />
        Facebook
      </Button>
    </div>
  );
}