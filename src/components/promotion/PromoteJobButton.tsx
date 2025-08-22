import React, { useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { PromoteJobModal } from './PromoteJobModal';

interface PromoteJobButtonProps {
  jobId: string;
  jobTitle: string;
  isPremium?: boolean;
  className?: string;
}

export function PromoteJobButton({ jobId, jobTitle, isPremium, className }: PromoteJobButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (isPremium) {
    return (
      <div className={`flex items-center gap-2 text-yellow-600 ${className}`}>
        <Star className="h-4 w-4 fill-current" />
        <span className="text-sm font-medium">Öne Çıkarılmış</span>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className={`flex items-center gap-2 text-yellow-600 hover:bg-yellow-50 border-yellow-300 ${className}`}
      >
        <TrendingUp className="h-4 w-4" />
        <span className="hidden sm:inline">İlanı Öne Çıkar</span>
        <span className="sm:hidden">Öne Çıkar</span>
      </Button>

      <PromoteJobModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        jobId={jobId}
        jobTitle={jobTitle}
      />
    </>
  );
}