import React, { useEffect } from 'react';
import { MapPin, Building2, Clock, Mail, Phone, MessageCircle, Briefcase, FileText, Calendar, DollarSign, User, ChevronLeft, Share2, Heart, Bookmark } from 'lucide-react';
import { formatDate, formatDateTime, getTimeAgo } from '../../utils/dateUtils';
import { RelatedJobs } from './RelatedJobs';
import { ApplyButton } from './ApplyButton';
import { JobActions } from './JobActions';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { generateMetaTags } from '../../utils/seoUtils';
import { useJobs } from '../../hooks/useJobs';
import type { JobListing } from '../../types';

interface JobDetailsProps {
  job: JobListing;
}

export function JobDetails({ job }: JobDetailsProps) {
  const { jobs } = useJobs();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // SEO Meta Tags - Google için optimize edilmiş
    generateMetaTags({
      title: `${job.title} - ${job.company}, ${job.location} İş İlanı | İsilanlarim.org`,
      description: `${job.title} pozisyonu için ${job.company} şirketi ${job.location}'da eleman arıyor. ${job.description.substring(0, 100)}... Hemen başvuru yapın!`,
      keywords: [
        job.title.toLowerCase(),
        `${job.title.toLowerCase()} iş ilanı`,
        `${job.location.toLowerCase()} ${job.title.toLowerCase()}`,
        `${job.company.toLowerCase()} iş ilanları`,
        job.category,
        job.type.toLowerCase(),
        job.location.toLowerCase(),
        'iş ilanı',
        'kariyer',
        `${job.location.toLowerCase()} iş ilanları`,
        `${job.category} pozisyonu`,
        'güncel iş ilanları',
        'iş fırsatları'
      ],
      url: window.location.pathname,
      jobData: job
    });
  }, [job]);

  const breadcrumbItems = [
    { label: 'İş İlanları', href: '/' },
    { label: job.location, href: `/${job.location.toLowerCase()}-is-ilanlari` },
    { label: job.category, href: `/is-ilanlari/${job.category}` },
    { label: job.title }
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
          aria-label="Geri dön"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {job.title}
          </h1>
          <p className="text-xs text-gray-500 line-clamp-1">
            {job.company} • {job.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors touch-target">
            <Heart className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors touch-target">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden lg:block max-w-6xl mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-6xl mx-auto">
        <article className="bg-white lg:rounded-2xl lg:shadow-lg overflow-hidden lg:mt-6" itemScope itemType="https://schema.org/JobPosting">
          
          {/* Desktop Header */}
          <div className="hidden lg:block bg-gradient-to-r from-red-50 to-blue-50 p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1 min-w-0">
                {/* Company Logo */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-gray-800 font-bold mb-1" itemProp="hiringOrganization">
                      {job.company}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location} • {job.type}
                    </p>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight" itemProp="title">
                  {job.title}
                </h1>
              </div>
              
              <div className="flex flex-col gap-3">
                <JobActions jobId={job.id} jobTitle={job.title} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                {job.category}
              </span>
              {job.subCategory && job.subCategory !== 'custom' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {job.subCategory}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg text-gray-700 font-bold" itemProp="hiringOrganization">
                  {job.company}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </p>
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight" itemProp="title">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                {job.category}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {job.type}
              </span>
            </div>
          </div>

          <div className="p-4 lg:p-8 space-y-8">
            {/* Job Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-xs text-gray-500">Lokasyon</div>
                  <div className="font-semibold text-gray-900" itemProp="jobLocation">{job.location}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Çalışma Şekli</div>
                  <div className="font-semibold text-gray-900" itemProp="employmentType">{job.type}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">Yayın Tarihi</div>
                  <div className="font-semibold text-gray-900" title={formatDateTime(job.createdAt)}>
                    {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
              
              {job.salary && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-500">Maaş</div>
                    <div className="font-semibold text-green-700">{job.salary}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-red-600" />
                İş Tanımı ve Detayları
              </h3>
              <div className="prose max-w-none text-gray-700 leading-relaxed" itemProp="description">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-base leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* SEO Content for City */}
            <section className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {job.location}'da {job.title} İş İlanları ve Kariyer Fırsatları
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>{job.location} {job.title} iş ilanları</strong> arasında öne çıkan bu pozisyon, 
                <strong>{job.company}</strong> şirketi tarafından <strong>{job.category}</strong> sektöründe 
                sunulmaktadır. <strong>{job.type}</strong> çalışma şekli ile kariyer fırsatı.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>{job.location}'da {job.category} iş ilanları</strong> arayanlar için ideal fırsat. 
                {job.salary && `<strong>Maaş aralığı: ${job.salary}</strong>. `}
                <strong>{job.location} iş fırsatları</strong> ve <strong>{job.location} kariyer imkanları</strong> 
                hakkında detaylı bilgi için iletişime geçin. <strong>Güncel {job.location} iş ilanları</strong> 
                platformumuzda sürekli güncellenmektedir.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-red-600" />
                İletişim Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {job.contactEmail && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-3">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-900">E-posta ile İletişim</h4>
                    </div>
                    <a 
                      href={`mailto:${job.contactEmail}`}
                      className="text-blue-700 hover:text-blue-800 font-semibold break-all"
                    >
                      {job.contactEmail}
                    </a>
                  </div>
                )}
                
                {job.contactPhone && (
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center mb-3">
                      <Phone className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-900">Telefon İletişimi</h4>
                    </div>
                    <div className="space-y-3">
                      <a 
                        href={`tel:${formatPhoneNumber(job.contactPhone)}`}
                        className="block text-green-700 hover:text-green-800 font-semibold"
                      >
                        {formatPhoneNumber(job.contactPhone)}
                      </a>
                      <a 
                        href={getWhatsAppLink(job.contactPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp ile Mesaj
                      </a>
                    </div>
                  </div>
                )}

                {job.businessPhone && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-5 w-5 text-gray-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">İş Telefonu</h4>
                    </div>
                    <a 
                      href={`tel:${formatPhoneNumber(job.businessPhone)}`}
                      className="text-gray-700 hover:text-gray-800 font-semibold"
                    >
                      {formatPhoneNumber(job.businessPhone)}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Additional Job Info */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">İlan Detayları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Kategori:</span>
                  <span className="ml-2 font-semibold text-gray-900">{job.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Alt Kategori:</span>
                  <span className="ml-2 font-semibold text-gray-900">{job.subCategory}</span>
                </div>
                <div>
                  <span className="text-gray-500">Yayın Tarihi:</span>
                  <span className="ml-2 font-semibold text-gray-900">{formatDate(job.createdAt)} ({getTimeAgo(job.createdAt)})</span>
                </div>
                {job.salary && (
                  <div>
                    <span className="text-gray-500">Maaş:</span>
                    <span className="ml-2 font-semibold text-green-700">{job.salary}</span>
                  </div>
                )}
                {job.educationLevel && (
                  <div>
                    <span className="text-gray-500">Eğitim Seviyesi:</span>
                    <span className="ml-2 font-semibold text-gray-900">{job.educationLevel}</span>
                  </div>
                )}
                {job.experience && (
                  <div>
                    <span className="text-gray-500">Deneyim:</span>
                    <span className="ml-2 font-semibold text-gray-900">{job.experience}</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Related Jobs */}
          <RelatedJobs currentJob={job} jobs={jobs} />

          {/* Fixed Apply Button */}
          <ApplyButton 
            email={job.contactEmail} 
            phone={job.contactPhone || job.businessPhone} 
          />
        </article>
      </div>
    </div>
  );
}