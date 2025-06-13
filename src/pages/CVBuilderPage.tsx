import React from 'react';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Printer, Smartphone, Laptop } from 'lucide-react';
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
  const { register, handleSubmit, watch } = useForm<CVFormData>();
  const { user } = useAuthContext();
  const cvRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = React.useState<'A4' | 'mobile'>('A4');

  const handlePrint = useReactToPrint({
    content: () => cvRef.current,
    documentTitle: 'CV',
    onAfterPrint: () => toast.success('CV başarıyla yazdırıldı')
  });

  const handleDownload = async () => {
    if (!cvRef.current) return;

    try {
      toast.loading('CV hazırlanıyor...');

      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // PDF boyutunu seç
      const pdf = format === 'A4' 
        ? new jsPDF('p', 'mm', 'a4')
        : new jsPDF('p', 'mm', [canvas.width * 0.264583, canvas.height * 0.264583]);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Dosya adını oluştur
      const fileName = `${watch('fullName') || 'CV'}_${format === 'A4' ? 'A4' : 'Mobil'}.pdf`;
      
      pdf.save(fileName);
      toast.dismiss();
      toast.success('CV başarıyla indirildi');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.dismiss();
      toast.error('CV indirilirken bir hata oluştu');
    }
  };

  const formData = watch();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">CV Oluşturucu</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h2>
            <div className="space-y-4">
              <Input
                label="Ad Soyad"
                {...register('fullName')}
              />
              <Input
                label="E-posta"
                type="email"
                defaultValue={user?.email}
                {...register('email')}
              />
              <Input
                label="Telefon"
                defaultValue={user?.phone}
                {...register('phone')}
              />
              <Input
                label="Adres"
                {...register('address')}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Özet</h2>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              placeholder="Kendinizi kısaca tanıtın..."
              {...register('summary')}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Eğitim</h2>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              placeholder="Eğitim bilgilerinizi yazın..."
              {...register('education')}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">İş Deneyimi</h2>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              placeholder="İş deneyimlerinizi yazın..."
              {...register('experience')}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Yetenekler</h2>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              placeholder="Yeteneklerinizi yazın..."
              {...register('skills')}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Yabancı Diller</h2>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              placeholder="Bildiğiniz yabancı dilleri yazın..."
              {...register('languages')}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 space-y-4">
          {/* Format seçimi */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Format:</span>
            <div className="flex gap-2">
              <Button
                variant={format === 'A4' ? 'primary' : 'outline'}
                onClick={() => setFormat('A4')}
                className="flex items-center gap-2"
              >
                <Laptop className="h-4 w-4" />
                A4
              </Button>
              <Button
                variant={format === 'mobile' ? 'primary' : 'outline'}
                onClick={() => setFormat('mobile')}
                className="flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Mobil
              </Button>
            </div>
          </div>

          {/* İndirme butonları */}
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Yazdır
            </Button>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {format === 'mobile' ? 'Mobil PDF İndir' : 'PDF İndir'}
            </Button>
          </div>

          {/* CV Önizleme */}
          <div 
            ref={cvRef}
            className={`bg-white p-8 rounded-lg shadow-sm mx-auto ${
              format === 'A4' 
                ? 'min-h-[297mm] w-[210mm]' 
                : 'w-[90mm] min-h-[160mm]'
            }`}
            style={{
              fontSize: format === 'mobile' ? '12px' : '16px'
            }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b pb-6">
                <h1 className={`${format === 'mobile' ? 'text-xl' : 'text-3xl'} font-bold mb-2`}>
                  {formData.fullName || 'Ad Soyad'}
                </h1>
                <div className="text-gray-600 space-y-1">
                  {formData.email && <div>{formData.email}</div>}
                  {formData.phone && <div>{formData.phone}</div>}
                  {formData.address && <div>{formData.address}</div>}
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Özet</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.summary}</p>
                </div>
              )}

              {/* Education */}
              {formData.education && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Eğitim</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.education}</p>
                </div>
              )}

              {/* Experience */}
              {formData.experience && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">İş Deneyimi</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.experience}</p>
                </div>
              )}

              {/* Skills */}
              {formData.skills && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Yetenekler</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.skills}</p>
                </div>
              )}

              {/* Languages */}
              {formData.languages && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Yabancı Diller</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.languages}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}