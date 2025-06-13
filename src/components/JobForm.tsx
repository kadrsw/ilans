import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { CategorySelect } from './CategorySelect';
import { LocationSelect } from './LocationSelect';
import { Toaster } from 'react-hot-toast';
import type { JobFormData } from '../types';

interface FormData extends JobFormData {
  acceptTerms: boolean;
}

const jobTypes = [
  'Tam Zamanlı',
  'Yarı Zamanlı',
  'Uzaktan',
  'Stajyer',
  'Sözleşmeli'
];

const educationLevels = [
  'Fark Etmez',
  'En Az İlköğretim Mezunu',
  'En Az Lise Mezunu',
  'En Az Üniversite Mezunu',
  'En Az Yüksek Lisans Mezunu'
];

export function JobForm({ initialData, onSubmit, isSubmitting }: {
  initialData?: JobFormData;
  onSubmit: (data: JobFormData) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      ...initialData,
      acceptTerms: false
    }
  });
  const navigate = useNavigate();

  const handleCategoryChange = (category: string, subCategory: string) => {
    setValue('category', category);
    setValue('subCategory', subCategory);
  };

  const handleLocationChange = (location: string) => {
    setValue('location', location);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!data.acceptTerms) {
      alert('Lütfen kullanım koşullarını kabul edin');
      return;
    }

    // Format phone numbers
    if (data.contactPhone) {
      data.contactPhone = formatPhoneNumber(data.contactPhone);
    }
    if (data.businessPhone) {
      data.businessPhone = formatPhoneNumber(data.businessPhone);
    }

    const { acceptTerms, ...jobData } = data;
    await onSubmit(jobData);
  };

  const watchEmail = watch('contactEmail');
  const watchMobilePhone = watch('contactPhone');
  const watchBusinessPhone = watch('businessPhone');

  const validatePhoneNumber = (value: string) => {
    if (!value) return true;
    const cleaned = formatPhoneNumber(value);
    if (!/^[5][0-9]{9}$/.test(cleaned)) {
      return 'Geçerli bir telefon numarası girin';
    }
    return true;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Toaster />
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {initialData?.jobId && (
          <div className="text-sm text-gray-500">
            İlan No: {initialData.jobId}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="İlan Başlığı"
            error={errors.title?.message}
            {...register('title', { required: 'İlan başlığı gerekli' })}
          />
          
          <Input
            label="Şirket Adı"
            error={errors.company?.message}
            {...register('company', { required: 'Şirket adı gerekli' })}
          />
        </div>

        <CategorySelect 
          onCategoryChange={handleCategoryChange}
          error={errors.category?.message || errors.subCategory?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasyon
            </label>
            <LocationSelect
              value={watch('location')}
              onChange={handleLocationChange}
              error={errors.location?.message}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Çalışma Şekli
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('type', { required: 'Çalışma şekli gerekli' })}
            >
              <option value="">Seçiniz</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            İş Tanımı
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            {...register('description', { required: 'İş tanımı gerekli' })}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <Input
          label="Maaş Aralığı"
          placeholder="Örn: 15.000₺ - 25.000₺"
          error={errors.salary?.message}
          {...register('salary')}
        />

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">İletişim Bilgileri</h3>
          
          <Input
            label="İletişim E-postası"
            type="email"
            error={errors.contactEmail?.message}
            {...register('contactEmail', {
              validate: value => {
                if (!value && !watchMobilePhone && !watchBusinessPhone) {
                  return 'En az bir iletişim yöntemi gereklidir';
                }
                if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                  return 'Geçerli bir e-posta adresi girin';
                }
                return true;
              }
            })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Cep Telefonu"
              placeholder="05XX XXX XX XX"
              error={errors.contactPhone?.message}
              {...register('contactPhone', {
                validate: value => {
                  if (!value && !watchEmail && !watchBusinessPhone) {
                    return 'En az bir iletişim yöntemi gereklidir';
                  }
                  return validatePhoneNumber(value);
                }
              })}
            />

            <Input
              label="İş Telefonu (İsteğe bağlı)"
              placeholder="0212 XXX XX XX"
              error={errors.businessPhone?.message}
              {...register('businessPhone', {
                validate: validatePhoneNumber
              })}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg bg-yellow-50 p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Önemli Uyarılar</h3>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Bu ilan tüm site ziyaretçileri tarafından görüntülenebilecektir</li>
                <li>• Paylaştığınız iletişim bilgileri herkese açık olacaktır</li>
                <li>• Küfür, hakaret ve yasadışı içerik paylaşımı yasaktır</li>
                <li>• İlan içeriğinden ve doğruluğundan siz sorumlusunuz</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-2 border-t border-yellow-200">
            <input
              type="checkbox"
              className="mt-1"
              {...register('acceptTerms', {
                required: 'Kullanım koşullarını kabul etmelisiniz'
              })}
            />
            <label className="text-sm text-yellow-700">
              İlanımın herkese açık olarak yayınlanacağını, içeriğinden ve doğruluğundan sorumlu olduğumu,
              Bilwin Inc.'nın hiçbir sorumluluk kabul etmediğini anlıyor ve kabul ediyorum.
              {errors.acceptTerms && (
                <span className="block text-red-600 mt-1">{errors.acceptTerms.message}</span>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            İptal
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {initialData ? 'İlanı Güncelle' : 'İlanı Yayınla'}
          </Button>
        </div>
      </form>
    </div>
  );
}