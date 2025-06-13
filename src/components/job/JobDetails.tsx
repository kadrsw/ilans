import React, { useEffect } from 'react';
import { MapPin, Building2, Clock, Mail, Phone, MessageCircle, Briefcase, FileText, ArrowLeft, Home, ExternalLink, Calendar, DollarSign, User, CheckCircle } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <article className="bg-white rounded-2xl shadow-soft overflow-hidden mt-6" itemScope itemType="https://schema.org/JobPosting">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight" itemProp="title">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl text-gray-800 font-semibold" itemProp="hiringOrganization">
                  {job.company}
                </h2>
              </div>
            </div>

            {/* Mobile Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="sm:hidden p-2 rounded-lg bg-white/80 hover:bg-white transition-colors"
              aria-label="Geri dön"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Job Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Lokasyon</div>
                <div className="font-medium text-gray-900" itemProp="jobLocation">{job.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Çalışma Şekli</div>
                <div className="font-medium text-gray-900" itemProp="employmentType">{job.type}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Yayın Tarihi</div>
                <div className="font-medium text-gray-900">
                  <time itemProp="datePosted">{formatDate(job.createdAt)}</time>
                </div>
              </div>
            </div>

            {job.salary && (
              <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xs text-gray-600">Maaş</div>
                  <div className="font-medium text-green-700" itemProp="baseSalary">{job.salary}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <JobActions jobId={job.id} jobTitle={job.title} />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Sponsored Content - First Position */}
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

          {/* Job Description */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
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

          {/* Sponsored Content - Second Position */}
          <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <a
              href="https://www.ultraortaklik6.com/links/?btag=1707444"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-4 hover:opacity-90 transition-opacity"
            >
              <div className="p-3 bg-purple-500 rounded-xl">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-purple-900 mb-1">Güvenilir Sanal Oyunlar</div>
                <div className="text-sm text-purple-700">Online Oyun Platformu - Hemen Katıl</div>
                <div className="text-xs text-purple-600 mt-1">Sponsorlu İçerik</div>
              </div>
              <ExternalLink className="h-5 w-5 text-purple-600" />
            </a>
          </div>

          {/* Contact Information */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              İletişim Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.contactEmail && (
                <div className="card bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900">E-posta ile İletişim</h4>
                  </div>
                  <a 
                    href={`mailto:${job.contactEmail}`}
                    className="text-blue-700 hover:text-blue-800 font-medium text-lg break-all"
                  >
                    {job.contactEmail}
                  </a>
                  <p className="text-sm text-blue-600 mt-2">
                    E-posta ile başvuru yapabilirsiniz
                  </p>
                </div>
              )}
              
              {job.contactPhone && (
                <div className="card bg-green-50 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-900">Telefon İletişimi</h4>
                  </div>
                  <a 
                    href={`tel:${job.contactPhone}`}
                    className="text-green-700 hover:text-green-800 font-medium text-lg"
                  >
                    {job.contactPhone}
                  </a>
                  <p className="text-sm text-green-600 mt-2">
                    Doğrudan arayarak bilgi alabilirsiniz
                  </p>
                </div>
              )}

              {job.businessPhone && (
                <div className="card bg-gray-50 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-500 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">İş Telefonu</h4>
                  </div>
                  <a 
                    href={`tel:${job.businessPhone}`}
                    className="text-gray-700 hover:text-gray-800 font-medium text-lg"
                  >
                    {job.businessPhone}
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    İş saatleri içinde arayabilirsiniz
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp Contact */}
            {job.contactPhone && (
              <div className="card bg-green-50 border-green-200 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-green-900">WhatsApp ile Hızlı İletişim</h4>
                </div>
                <p className="text-green-700 mb-4">
                  WhatsApp üzerinden hemen iletişime geçin ve sorularınızı sorun
                </p>
                <a 
                  href={`https://wa.me/90${job.contactPhone.replace(/[^0-9]/g, '').startsWith('0') ? job.contactPhone.replace(/[^0-9]/g, '').substring(1) : job.contactPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp'tan Mesaj Gönder
                </a>
              </div>
            )}
          </section>

          {/* Sponsored Content - Third Position */}
          <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <a
              href="https://play.google.com/store/apps/details?id=app.mesailerim.android"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-4 hover:opacity-90 transition-opacity"
            >
              <div className="p-3 bg-green-500 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-900 mb-1">Mesailerim</div>
                <div className="text-sm text-green-700">Fazla Mesai Hesaplama - Ücretsiz İndir</div>
                <div className="text-xs text-green-600 mt-1">Sponsorlu İçerik</div>
              </div>
              <ExternalLink className="h-5 w-5 text-green-600" />
            </a>
          </div>

          {/* Application Tips */}
          <section className="card bg-yellow-50 border-yellow-200">
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
          </section>
        </div>

        {/* Related Jobs */}
        <RelatedJobs currentJob={job} jobs={jobs} />

        {/* Bottom Actions */}
        <div className="border-t bg-gray-50 p-6 sm:p-8 space-y-6">
          {/* CV Creation */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900">Profesyonel CV Oluşturun</h3>
            </div>
            <p className="text-blue-700 mb-4">
              Ücretsiz CV oluşturma aracımızı kullanarak profesyonel bir özgeçmiş hazırlayın
              ve iş başvurularınızda kullanın.
            </p>
            <Button
              onClick={() => navigate('/cv-olustur')}
              className="btn-primary"
            >
              CV Oluşturmaya Başla
            </Button>
          </div>

          {/* Social Share */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">İlanı Paylaş</h3>
            <JobShare jobTitle={job.title} jobUrl={window.location.href} />
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