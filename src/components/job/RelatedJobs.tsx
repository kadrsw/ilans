import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobListing } from '../../types';
import { formatDate } from '../../utils/dateUtils';
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
    .slice(0, 5);

  if (relatedJobs.length === 0) return null;

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Benzer İlanlar</h2>
      <div className="space-y-4">
        {relatedJobs.map(job => (
          <button
            key={job.id}
            onClick={() => navigate(generateJobUrl(job))}
            className="w-full text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{job.company}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{job.location}</span>
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}