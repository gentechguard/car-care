'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CustomerEnquiry } from '@/types/enquiries';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormSubmitButton from './FormSubmitButton';

interface CustomerEnquiryFormProps {
  onClose: () => void;
}

const treatmentOptions = [
  { value: 'PPF', label: 'Paint Protection Film (PPF)' },
  { value: 'SUNFILM', label: 'Sunfilm' },
  { value: 'GRAPHENE_COATING', label: 'Graphene Coating' },
  { value: 'MULTIPLE', label: 'Multiple Treatments' }
];

export default function CustomerEnquiryForm({ onClose }: CustomerEnquiryFormProps) {
  const [formData, setFormData] = useState<Partial<CustomerEnquiry>>({
    treatment_type: 'PPF'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_name?.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    
    if (!formData.mobile_number?.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.city_name?.trim()) {
      newErrors.city_name = 'City name is required';
    }
    
    if (!formData.vehicle_name_model?.trim()) {
      newErrors.vehicle_name_model = 'Vehicle details are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('customer_enquiries')
        .insert([{
          ...formData,
          mobile_number: `+91${formData.mobile_number}`,
          status: 'NEW',
          source: 'WEBSITE_HEADER'
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
    <div className="min-h-full bg-gradient-to-b from-violet-950/30 via-black/60 to-black/80 backdrop-blur-xl border border-white/10">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                Customer Enquiry
              </h2>
              <p className="text-violet-300 text-xs uppercase tracking-widest font-bold mt-1">
                For Treatments
              </p>
            </div>
          </div>
          
          {/* Desktop close button (hidden on mobile, shown on larger screens if needed inside form) */}
          <button
            onClick={onClose}
            className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Customer Name"
            value={formData.customer_name || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, customer_name: val }))}
            error={errors.customer_name}
            theme="purple"
            delay={0}
            placeholder="Enter your full name"
          />
          
          <FormInput
            label="Mobile Number"
            type="tel"
            value={formData.mobile_number || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, mobile_number: val.replace(/\D/g, '').slice(0, 10) }))}
            error={errors.mobile_number}
            theme="purple"
            delay={0.05}
            placeholder="9876543210"
          />
          
          <FormInput
            label="City Name"
            value={formData.city_name || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, city_name: val }))}
            error={errors.city_name}
            theme="purple"
            delay={0.1}
            placeholder="Enter your city"
          />
          
          <FormInput
            label="Vehicle Name and Model"
            value={formData.vehicle_name_model || ''}
            onChange={(val) => setFormData(prev => ({ ...prev, vehicle_name_model: val }))}
            error={errors.vehicle_name_model}
            theme="purple"
            delay={0.15}
            placeholder="e.g., BMW X5 2024"
          />
          
          <FormSelect
            label="Treatment Type"
            value={formData.treatment_type || 'PPF'}
            onChange={(val) => setFormData(prev => ({ ...prev, treatment_type: val as any }))}
            options={treatmentOptions}
            theme="purple"
            delay={0.2}
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
            label="Submit Enquiry"
            loading={isSubmitting}
            success={isSuccess}
            theme="purple"
            delay={0.25}
          />
        </form>
      </div>
    </div>
  );
}