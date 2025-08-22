import React, { useEffect } from 'react';
import { MapPin, Building2, Clock, Mail, Phone, MessageCircle, Briefcase, FileText, ArrowLeft, Home, ExternalLink, Calendar, DollarSign, User, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { JobActions } from './JobActions';
import { JobShare } from './JobShare';
import { RelatedJobs } from './RelatedJobs';
import { ApplyButton } from './ApplyButton';
import { Button } from '../ui/Button';
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
    window.scrollTo(0, 0);
    
    generateMetaTags({
      title: job.title,
      description: job.description.substring(0, 160),
      keywords: [job.category, job.type, job.location, 'iş ilanı', 'kariyer'],
      url: window.location.pathname,
      jobData: job
    });
  }, [job]);

  const breadcrumbItems = [
    { label: 'İş İlanları', href: '/' },
    { label: job.category, href: `/is-ilanlari/${job.category}` },
    { label: job.title }
  ];

  const isPremiumJob = job.isPremium || job.isPromoted;

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <article className="bg-white rounded-2xl shadow-soft overflow-hidden mt-6" itemScope itemType="https://schema.org/JobPosting">
        {/* Premium Badge */}
        {isPremiumJob && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-center font-medium">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 fill-current" />
              <span>Öne Çıkarılmış İlan</span>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Main Content - İlan Başlığı ve Açıklaması Öne Çıkarıldı */}
        <div className="p-6 sm:p-8">
          {/* Header Section - Sadece Başlık ve Şirket */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight" itemProp="title">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl text-gray-800 font-semibold" itemProp="hiringOrganization">
                    {job.company}
                  </h2>
                </div>
              </div>

              {/* Mobile Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Geri dön"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Job Description - Ana İçerik */}
          <section className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              İş Tanımı ve Detayları
            </h3>
            <div className="prose max-w-none text-gray-700 leading-relaxed text-base sm:text-lg" itemProp="description">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {/* Contact Information - Başvuru Bölümü */}
          <section className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Başvuru ve İletişim
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {job.contactEmail && (
                <div className="card bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 text-lg">E-posta ile Başvuru</h4>
                  </div>
                  <a 
                    href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`${job.title} - İş Başvurusu`)}&body=${encodeURIComponent(`Merhaba,\n\n${job.title} pozisyonu için başvuru yapmak istiyorum.\n\nSaygılarımla,`)}`}
                    className="text-blue-700 hover:text-blue-800 font-medium text-lg break-all block mb-3"
                  >
                    {job.contactEmail}
                  </a>
                  <Button
                    onClick={() => window.location.href = `mailto:${job.contactEmail}?subject=${encodeURIComponent(`${job.title} - İş Başvurusu`)}`}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    E-posta ile Başvur
                  </Button>
                </div>
              )}
              
              {job.contactPhone && (
                <div className="card bg-green-50 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-900 text-lg">Telefon İletişimi</h4>
                  </div>
                  <a 
                    href={`tel:${job.contactPhone}`}
                    className="text-green-700 hover:text-green-800 font-medium text-lg block mb-3"
                  >
                    {job.contactPhone}
                  </a>
                  <div className="space-y-2">
                    <Button
                      onClick={() => window.location.href = `tel:${job.contactPhone}`}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Hemen Ara
                    </Button>
                    <Button
                      onClick={() => window.open(`https://wa.me/90${job.contactPhone.replace(/[^0-9]/g, '').startsWith('0') ? job.contactPhone.replace(/[^0-9]/g, '').substring(1) : job.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Merhaba, ${job.title} pozisyonu hakkında bilgi almak istiyorum.`)}`, '_blank')}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp ile Mesaj
                    </Button>
                  </div>
                </div>
              )}

              {job.businessPhone && (
                <div className="card bg-gray-50 border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-500 rounded-lg">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">İş Telefonu</h4>
                  </div>
                  <a 
                    href={`tel:${job.businessPhone}`}
                    className="text-gray-700 hover:text-gray-800 font-medium text-lg block mb-3"
                  >
                    {job.businessPhone}
                  </a>
                  <Button
                    onClick={() => window.location.href = `tel:${job.businessPhone}`}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    İş Saatleri İçinde Ara
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Sponsored Content */}
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <a
                href="https://play.google.com/store/apps/details?id=app.evimcep.android"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center gap-4 hover:opacity-90 transition-opacity"
              >
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 mb-1">EvimCep</div>
                  <div className="text-sm text-blue-700">Hızlı Emlak ve Konut Arama - Ücretsiz İndir</div>
                  <div className="text-xs text-blue-600 mt-1">Sponsorlu İçerik</div>
                </div>
                <ExternalLink className="h-5 w-5 text-blue-600" />
              </a>
            </div>
          </div>

          {/* Application Tips */}
          <section className="mb-8">
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Başvuru İpuçları
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <span>CV'nizin güncel ve detaylı olduğundan emin olun</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <span>İş tanımını dikkatlice okuyun ve uygun olduğunuzdan emin olun</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <span>Başvuru yaparken kısa ve öz bir ön yazı ekleyin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <span>İletişim bilgilerinizin doğru olduğunu kontrol edin</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Meta Information - Sayfa Altında */}
        <div className="bg-gray-50 border-t p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Detayları</h3>
          
          {/* Job Meta Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Lokasyon</div>
                <div className="font-medium text-gray-900 text-sm" itemProp="jobLocation">{job.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Çalışma Şekli</div>
                <div className="font-medium text-gray-900 text-sm" itemProp="employmentType">{job.type}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Yayın Tarihi</div>
                <div className="font-medium text-gray-900 text-sm">
                  <time itemProp="datePosted">{formatDate(job.createdAt)}</time>
                </div>
              </div>
            </div>

            {job.salary && (
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xs text-gray-600">Maaş</div>
                  <div className="font-medium text-green-700 text-sm" itemProp="baseSalary">{job.salary}</div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">İlan İşlemleri</h4>
            <JobActions jobId={job.id} jobTitle={job.title} />
          </div>

          {/* Social Share */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">İlanı Paylaş</h4>
            <JobShare jobTitle={job.title} jobUrl={window.location.href} />
          </div>
        </div>

        {/* Related Jobs */}
        <RelatedJobs currentJob={job} jobs={jobs} />

        {/* CV Creation Section */}
        <div className="border-t bg-blue-50 p-6 sm:p-8">
          <div className="card bg-white border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900 text-lg">Profesyonel CV Oluşturun</h3>
            </div>
            <p className="text-blue-700 mb-4">
              Ücretsiz CV oluşturma aracımızı kullanarak profesyonel bir özgeçmiş hazırlayın
              ve iş başvurularınızda kullanın.
            </p>
            <Button
              onClick={() => navigate('/cv-olustur')}
              className="btn-primary w-full sm:w-auto"
            >
              <FileText className="h-5 w-5 mr-2" />
              CV Oluşturmaya Başla
            </Button>
          </div>
        </div>

        {/* Fixed Apply Button */}
        <ApplyButton 
          email={job.contactEmail} 
          phone={job.contactPhone || job.businessPhone} 
        />
      </article>
    </div>
  );
}