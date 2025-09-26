import React, { useEffect } from 'react';
import { X, MapPin, Building2, Clock, Mail, Phone, MessageCircle, Briefcase, ArrowLeft } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { JobActions } from './JobActions';
import type { JobListing } from '../../types';

interface JobDetailsModalProps {
  job: JobListing;
  onClose: () => void;
}

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  useEffect(() => {
    // Lock body scroll when modal opens
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = '';
    };
  }, []);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.startsWith('0') ? cleaned : `0${cleaned}`;
  };

  const getWhatsAppLink = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/90${cleaned.startsWith('0') ? cleaned.substring(1) : cleaned}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 pointer-events-none flex items-start sm:items-center justify-center p-4">
        <div 
          className="w-full max-w-3xl bg-white rounded-lg shadow-xl pointer-events-auto"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Mobile header */}
          <div className="sm:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
            <button
              onClick={onClose}
              className="flex items-center text-gray-600"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Geri
            </button>
          </div>

          {/* Desktop close button */}
          <button
            onClick={onClose}
            className="hidden sm:block absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{job.title}</h2>
                  <h3 className="text-xl text-gray-700 mb-4">{job.company}</h3>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Building2 className="h-5 w-5 mr-2 text-gray-400" />
                      {job.type}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span title={formatDateTime(job.createdAt)}>
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  {job.salary && (
                    <div className="mt-4">
                      <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-base font-medium">
                        {job.salary}
                      </span>
                    </div>
                  )}

                  {/* Job Actions */}
                  <div className="mt-6">
                    <JobActions jobId={job.id} jobTitle={job.title} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">İş Tanımı</h3>
                  <div className="prose max-w-none text-gray-700 text-[15px] leading-relaxed">
                    {job.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                  
                  {/* Contact Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {job.contactEmail && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Mail className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-900">E-posta ile İletişim</h4>
                        </div>
                        <a 
                          href={`mailto:${job.contactEmail}`}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                    
                    {job.contactPhone && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Phone className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-900">Cep Telefonu</h4>
                        </div>
                        <a 
                          href={`tel:${formatPhoneNumber(job.contactPhone)}`}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          {formatPhoneNumber(job.contactPhone)}
                        </a>
                      </div>
                    )}

                    {job.businessPhone && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-900">İş Telefonu</h4>
                        </div>
                        <a 
                          href={`tel:${formatPhoneNumber(job.businessPhone)}`}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          {formatPhoneNumber(job.businessPhone)}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Button */}
                  {job.contactPhone && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-900">WhatsApp ile Hızlı İletişim</h4>
                      </div>
                      <p className="text-green-700 text-sm mb-3">
                        WhatsApp üzerinden hemen iletişime geçin
                      </p>
                      <a 
                        href={getWhatsAppLink(job.contactPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        WhatsApp'tan Mesaj Gönder
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}