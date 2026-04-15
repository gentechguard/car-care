'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DistributorEnquiry } from '@/types/enquiries';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormSubmitButton from './FormSubmitButton';

interface DistributorEnquiryFormProps {
  onClose: () => void;
}

const productOptions = [
  { value: 'PPF', label: 'Paint Protection Film' },
  { value: 'SUNFILM', label: 'Sunfilm' },
  { value: 'GRAPHENE', label: 'Graphene Coating' },
  { value: 'CERAMIC', label: 'Ceramic Coating' },
  { value: 'ALL', label: 'All Products' }
];

export default function DistributorEnquiryForm({ onClose }: DistributorEnquiryFormProps) {
  const [formData, setFormData] = useState<Partial<DistributorEnquiry>>({
    products_interested: []
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.distributor_name?.trim()) {
      newErrors.distributor_name = 'Distributor name is required';
    }
    
    if (!formData.mobile_number?.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.firm_name?.trim()) {
      newErrors.firm_name = 'Firm/Company name is required';
    }
    
    if (selectedProducts.length === 0) {
      newErrors.products = 'Please select at least one product';
    }
    
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductChange = (value: string) => {
    const values = value.split(',').filter(Boolean);
    setSelectedProducts(values);
    setFormData(prev => ({ ...prev, products_interested: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('distributor_enquiries')
        .insert([{
          ...formData,
          mobile_number: `+91${formData.mobile_number}`,
          products_interested: selectedProducts,
          status: 'PENDING'
        }]);
        
      if (error) throw error;
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-950/30 via-black/60 to-black/80 backdrop-blur-xl border border-white/10">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                Distributor Enquiry
              </h2>
              <p className="text-emerald-300 text-xs uppercase tracking-widest font-bold mt-1">
                Wholesale Partnership
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Distributor Name"
            value={formData.distributor_name || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, distributor_name: val }))}
            error={errors.distributor_name}
            theme="green"
            delay={0}
            placeholder="Enter your name"
          />
          
          <FormInput
            label="Mobile Number"
            type="tel"
            value={formData.mobile_number || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, mobile_number: val.replace(/\D/g, '').slice(0, 10) }))}
            error={errors.mobile_number}
            theme="green"
            delay={0.05}
            placeholder="9876543210"
          />
          
          <FormInput
            label="Firm/Company Name"
            value={formData.firm_name || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, firm_name: val }))}
            error={errors.firm_name}
            theme="green"
            delay={0.1}
            placeholder="Enter company name"
          />
          
          <FormSelect
            label="Products Interested In"
            value={selectedProducts.join(',')}
            onChange={handleProductChange}
            options={productOptions}
            theme="green"
            delay={0.15}
            multiple={true}
            selectedValues={selectedProducts}
            error={errors.products}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="City"
              value={formData.city || ''}
              onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
              error={errors.city}
              theme="green"
              delay={0.2}
              placeholder="City"
            />
            
            <FormInput
              label="State"
              value={formData.state || ''}
              onChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
              error={errors.state}
              theme="green"
              delay={0.25}
              placeholder="State"
            />
          </div>
          
          <FormInput
            label="GST Number (Optional)"
            value={formData.gst_number || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, gst_number: val.toUpperCase() }))}
            theme="green"
            delay={0.3}
            placeholder="22AAAAA0000A1Z5"
          />

          <AnimatePresence>
            {errors.submit && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20"
              >
                {errors.submit}
              </motion.p>
            )}
          </AnimatePresence>

          <FormSubmitButton
            label="Submit Application"
            loading={isSubmitting}
            success={isSuccess}
            theme="green"
            delay={0.35}
          />
        </form>
      </div>
    </div>
  );
}