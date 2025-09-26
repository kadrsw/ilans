import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobListing } from '../../types';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { generateJobUrl } from '../../utils/seoUtils';

interface RelatedJobsProps {
  currentJob: JobListing;
  jobs: JobListing[];
}

export function RelatedJobs({ currentJob, jobs }: RelatedJobsProps) {
  const navigate = useNavigate();
  
  // Filter related jobs by category and location
  const relatedJobs = jobs
    .filter(job => 
      job.id !== currentJob.id && 
      (job.category === currentJob.category || job.location === currentJob.location)
    )
    .slice(0, 3);

  if (relatedJobs.length === 0) return null;

  return (
    <div className="border-t bg-gray-50 p-6">
      <h2 className="text-lg font-semibold mb-4">Benzer İlanlar</h2>
      <div className="space-y-4">
        {relatedJobs.map(job => (
          <button
            key={job.id}
            onClick={() => navigate(generateJobUrl(job))}
            className="w-full text-left p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-100"
          >
            <h3 className="font-medium text-gray-900 text-sm">{job.title}</h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>{job.location}</span>
              <span title={formatDateTime(job.createdAt)}>{formatDate(job.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}