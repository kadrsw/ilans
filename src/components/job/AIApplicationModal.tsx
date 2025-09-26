import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Download, Mail, User, GraduationCap, Briefcase, Award, Languages, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { aiService } from '../../services/aiService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import type { JobListing } from '../../types';

interface AIApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing;
}

interface CVData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  education: string;
  experience: string;
  skills: string;
  languages: string;
  achievements: string;
}

export function AIApplicationModal({ isOpen, onClose, job }: AIApplicationModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
  const [cvData, setCvData] = useState<CVData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    education: '',
    experience: '',
    skills: '',
    languages: '',
    achievements: ''
  });
  const [generatedCV, setGeneratedCV] = useState<string>('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedCV(file);
      toast.success('CV başarıyla yüklendi');
    } else {
      toast.error('Lütfen PDF formatında bir dosya yükleyin');
    }
  };

  const handleGenerate = async () => {
    try {
      setStep('generating');
      
      // CV verilerini kontrol et
      if (!cvData.fullName || !cvData.email || !cvData.experience) {
        toast.error('Lütfen en az ad, email ve deneyim bilgilerini doldurun');
        setStep('input');
        return;
      }

      // AI ile CV ve ön yazı oluştur
      const result = await aiService.generateCVContent(
        {
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          type: job.type
        },
        cvData
      );

      setGeneratedCV(result.cv);
      setGeneratedCoverLetter(result.coverLetter);
      setStep('result');
      
      toast.success('CV ve ön yazı başarıyla oluşturuldu!');
      
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Oluşturma sırasında bir hata oluştu');
      setStep('input');
    }
  };

  const handleDownloadCV = async () => {
    try {
      const element = document.getElementById('generated-cv');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${cvData.fullName}_CV.pdf`);
      
      toast.success('CV başarıyla indirildi');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('İndirme sırasında bir hata oluştu');
    }
  };

  const handleSendApplication = () => {
    const subject = `${job.title} Pozisyonu Başvurusu - ${cvData.fullName}`;
    const body = `${generatedCoverLetter}\n\nEk: CV dosyası\n\nSaygılarımla,\n${cvData.fullName}`;
    
    if (job.contactEmail) {
      window.location.href = `mailto:${job.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI ile Başvurunu Güçlendir</h2>
                <p className="text-sm text-gray-600">{job.title} - {job.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">AI Nasıl Yardımcı Olur?</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Bu iş ilanına özel CV oluşturur</li>
                  <li>• Profesyonel ön yazı hazırlar</li>
                  <li>• Anahtar kelimeleri optimize eder</li>
                  <li>• PDF olarak indirebilirsiniz</li>
                </ul>
              </div>

              {/* File Upload Option */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Mevcut CV'nizi yükleyin (PDF)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                  Dosya Seç
                </label>
                {uploadedCV && (
                  <p className="text-green-600 text-sm mt-2">✓ {uploadedCV.name} yüklendi</p>
                )}
              </div>

              <div className="text-center text-gray-500">veya</div>

              {/* Manual Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ad Soyad"
                  value={cvData.fullName}
                  onChange={(e) => setCvData({...cvData, fullName: e.target.value})}
                  placeholder="Adınız ve soyadınız"
                />
                <Input
                  label="E-posta"
                  type="email"
                  value={cvData.email}
                  onChange={(e) => setCvData({...cvData, email: e.target.value})}
                  placeholder="email@example.com"
                />
                <Input
                  label="Telefon"
                  value={cvData.phone}
                  onChange={(e) => setCvData({...cvData, phone: e.target.value})}
                  placeholder="05XX XXX XX XX"
                />
                <Input
                  label="Adres"
                  value={cvData.address}
                  onChange={(e) => setCvData({...cvData, address: e.target.value})}
                  placeholder="Şehir, İlçe"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kısa Özet
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    value={cvData.summary}
                    onChange={(e) => setCvData({...cvData, summary: e.target.value})}
                    placeholder="Kendinizi kısaca tanıtın..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İş Deneyimi *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    value={cvData.experience}
                    onChange={(e) => setCvData({...cvData, experience: e.target.value})}
                    placeholder="Önceki iş deneyimlerinizi yazın..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eğitim
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      value={cvData.education}
                      onChange={(e) => setCvData({...cvData, education: e.target.value})}
                      placeholder="Eğitim bilgileriniz..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yetenekler
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      value={cvData.skills}
                      onChange={(e) => setCvData({...cvData, skills: e.target.value})}
                      placeholder="Yeteneklerinizi yazın..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={onClose}>
                  İptal
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  AI ile Oluştur
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Generating */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Çalışıyor...</h3>
              <p className="text-gray-600">Size özel CV ve ön yazı hazırlanıyor</p>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Oluşturulan Belgeler</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadCV}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    CV İndir
                  </Button>
                  <Button
                    onClick={handleSendApplication}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Başvuru Gönder
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generated CV */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Oluşturulan CV
                  </h4>
                  <div 
                    id="generated-cv"
                    className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: generatedCV }}
                  />
                </div>

                {/* Generated Cover Letter */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    Oluşturulan Ön Yazı
                  </h4>
                  <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {generatedCoverLetter}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Başvuru Hazır!</h4>
                <p className="text-sm text-green-700">
                  CV'nizi indirip ön yazı ile birlikte başvurunuzu gönderebilirsiniz. 
                  "Başvuru Gönder" butonu ile doğrudan e-posta uygulamanız açılacak.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setStep('input')}>
                  Yeniden Düzenle
                </Button>
                <Button onClick={onClose}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}