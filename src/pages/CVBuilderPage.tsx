import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { Download, Printer, Eye, EyeOff, Smartphone, Laptop, User, Mail, Phone, MapPin, FileText, BookOpen, Briefcase, Award, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthContext } from '../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface CVFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  education: string;
  experience: string;
  skills: string;
  languages: string;
}

export function CVBuilderPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CVFormData>();
  const { user } = useAuthContext();
  const cvRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<'A4' | 'mobile'>('A4');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => cvRef.current,
    documentTitle: `${watch('fullName') || 'CV'}.pdf`,
    onAfterPrint: () => toast.success('CV başarıyla yazdırıldı'),
    pageStyle: `
      @media print {
        body { -webkit-print-color-adjust: exact; }
        @page { margin: 0; }
      }
    `
  });

  const handleDownload = async () => {
    if (!cvRef.current) return;

    setIsGenerating(true);
    
    try {
      const loadingToast = toast.loading('CV hazırlanıyor...');

      // Canvas ayarlarını optimize et
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: format === 'A4' ? 794 : 360,
        windowHeight: format === 'A4' ? 1123 : 640,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      let pdf;
      if (format === 'A4') {
        pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      } else {
        // Mobil format için optimize boyut
        const aspectRatio = canvas.height / canvas.width;
        const width = 105; // mm
        const height = width * aspectRatio;
        
        pdf = new jsPDF('p', 'mm', [width, height]);
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
      }
      
      const fileName = `${watch('fullName') || 'CV'}_${format === 'A4' ? 'A4' : 'Mobil'}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss(loadingToast);
      toast.success(`CV başarıyla indirildi: ${fileName}`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.error('CV indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formData = watch();
  const completionPercentage = Object.values(formData).filter(Boolean).length / 9 * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Header - Only on top */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CV Oluşturucu</h1>
            <p className="text-lg text-gray-600 mt-2">
              Profesyonel CV'nizi kolayca oluşturun ve indirin
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Tamamlanma Oranı</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Sticky Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900">CV Builder</span>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
            </div>
            
            {/* Mobile Preview Toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewVisible(!previewVisible)}
                className="flex items-center gap-2"
              >
                {previewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewVisible ? 'Form' : 'Önizleme'}
              </Button>
            </div>

            {/* Quick Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
                disabled={isGenerating}
              >
                <Printer className="h-4 w-4" />
                Yazdır
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
                disabled={isGenerating}
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Hazırlanıyor...' : 'İndir'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form - Sol taraf */}
          <div className={`lg:col-span-3 space-y-6 ${previewVisible ? 'hidden lg:block' : 'block'}`}>
            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Input
                    label="Ad Soyad *"
                    placeholder="Örn: Ahmet Yılmaz"
                    error={errors.fullName?.message}
                    {...register('fullName', { 
                      required: 'Ad soyad gereklidir',
                      minLength: { value: 2, message: 'En az 2 karakter olmalıdır' }
                    })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="E-posta *"
                    type="email"
                    placeholder="ornek@email.com"
                    defaultValue={user?.email}
                    error={errors.email?.message}
                    {...register('email', { 
                      required: 'E-posta gereklidir',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Geçerli bir e-posta adresi girin'
                      }
                    })}
                  />
                  <Input
                    label="Telefon *"
                    placeholder="0555 123 45 67"
                    defaultValue={user?.phone}
                    error={errors.phone?.message}
                    {...register('phone', { 
                      required: 'Telefon numarası gereklidir'
                    })}
                  />
                </div>
                
                <Input
                  label="Adres"
                  placeholder="İl, İlçe"
                  {...register('address')}
                />
              </div>
            </div>

            {/* Özet */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Profesyonel Özet</h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Kendinizi ve kariyerinizi kısaca özetleyin. Örn: 5 yıl deneyimli yazılım geliştirici..."
                  {...register('summary')}
                />
                <p className="text-sm text-gray-500 mt-2">
                  İpucu: 2-3 cümle ile en güçlü yanlarınızı vurgulayın
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eğitim */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Eğitim</h2>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Üniversite, lise ve diğer eğitim bilgilerinizi yazın..."
                    {...register('education')}
                  />
                </div>
              </div>

              {/* İş Deneyimi */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-orange-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">İş Deneyimi</h2>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Çalıştığınız şirketler ve pozisyonları yazın..."
                    {...register('experience')}
                  />
                </div>
              </div>

              {/* Yetenekler */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-red-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Yetenekler</h2>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Teknik ve kişisel yeteneklerinizi yazın..."
                    {...register('skills')}
                  />
                </div>
              </div>

              {/* Yabancı Diller */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Yabancı Diller</h2>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Bildiğiniz dilleri ve seviyelerini yazın..."
                    {...register('languages')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview - Sağ taraf */}
          <div className={`lg:col-span-2 ${!previewVisible ? 'hidden lg:block' : 'block'}`}>
            <div className="space-y-4">
              {/* Kontroller - Normal position (not sticky) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">CV Formatı</h3>
                
                {/* Format Seçimi */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={format === 'A4' ? 'primary' : 'outline'}
                    onClick={() => setFormat('A4')}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Laptop className="h-4 w-4" />
                    A4 Format
                  </Button>
                  <Button
                    variant={format === 'mobile' ? 'primary' : 'outline'}
                    onClick={() => setFormat('mobile')}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobil Format
                  </Button>
                </div>

                {/* Aksiyon Butonları */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    disabled={isGenerating}
                  >
                    <Printer className="h-4 w-4" />
                    Yazdır
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2"
                    disabled={isGenerating}
                  >
                    <Download className="h-4 w-4" />
                    {isGenerating ? 'Hazırlanıyor...' : 'PDF İndir'}
                  </Button>
                </div>
              </div>

              {/* CV Önizleme */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Önizleme</h3>
                
                <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <div 
                    ref={cvRef}
                    className={`bg-white mx-auto shadow-lg ${
                      format === 'A4' 
                        ? 'w-[210mm] min-h-[297mm] p-8' 
                        : 'w-full max-w-sm min-h-[400px] p-6'
                    }`}
                    style={{
                      fontSize: format === 'mobile' ? '14px' : '16px',
                      transform: format === 'A4' ? 'scale(0.5)' : 'scale(1)',
                      transformOrigin: 'top center'
                    }}
                  >
                    <CVPreview formData={formData} format={format} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CV Önizleme Komponenti
const CVPreview: React.FC<{ formData: any; format: 'A4' | 'mobile' }> = ({ formData, format }) => {
  const isEmpty = !Object.values(formData).some(value => value);

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Formu doldurmaya başlayın</p>
          <p className="text-sm">CV'niz burada görünecek</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4">
        <h1 className={`${format === 'mobile' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 mb-2`}>
          {formData.fullName || 'Ad Soyad'}
        </h1>
        <div className="text-gray-600 space-y-1">
          {formData.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {formData.email}
            </div>
          )}
          {formData.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {formData.phone}
            </div>
          )}
          {formData.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {formData.address}
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      {[
        { key: 'summary', title: 'PROFESYONEL ÖZET', icon: FileText },
        { key: 'experience', title: 'İŞ DENEYİMİ', icon: Briefcase },
        { key: 'education', title: 'EĞİTİM', icon: BookOpen },
        { key: 'skills', title: 'YETENEKLER', icon: Award },
        { key: 'languages', title: 'YABANCI DİLLER', icon: Globe }
      ].map(({ key, title, icon: Icon }) => (
        formData[key] && (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">
                {title}
              </h2>
            </div>
            <div className="border-l-2 border-gray-300 pl-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {formData[key]}
              </p>
            </div>
          </div>
        )
      ))}
    </div>
  );
};