"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { admissionsContent } from "@/content/admissions";
import { TagChip } from "@/components/ui/TagChip";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CheckCircle2, AlertCircle, Phone, Mail, Clock, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const enquirySchema = z.object({
  parentName: z.string().min(2, "Parent name is required"),
  email: z.string().email("Please provide a valid email"),
  phone: z.string().min(8, "Valid phone number is required"),
  childName: z.string().min(2, "Child's name is required"),
  grade: z.string().min(1, "Please select a grade"),
  questions: z.string().optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export function Admissions() {
  const containerRef = useRef<HTMLElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      parentName: "",
      email: "",
      phone: "",
      childName: "",
      grade: "LKG & UKG",
      questions: "",
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSubmitSuccess(true);
        reset();
      } else {
        setSubmitError(resData.message || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="admissions" ref={containerRef} className="py-20 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 batch-reveal-text">
        <TagChip variant="cream" className="mb-4">
          {admissionsContent.sectionTag}
        </TagChip>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-indigo-deep mb-4">
          <span>{admissionsContent.headingPart1} </span>
          <span>
            {admissionsContent.headingPart2}
            <span className="headline-accent text-yellow-golden font-serif italic">
              {admissionsContent.headingAccentLetter}
            </span>
            {admissionsContent.headingPart3}
          </span>
        </h2>

        <p className="text-base sm:text-lg text-muted-text font-sans leading-relaxed">
          {admissionsContent.subtext}
        </p>
      </div>

      {/* 3 Step Progression Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {admissionsContent.steps.map((step, idx) => {
          const isIndigo = step.theme === "indigo";
          const batchClass = idx === 0 ? "batch-card-left" : idx === 2 ? "batch-card-right" : "batch-reveal-text";

          return (
            <div
              key={step.number}
              className={`rounded-kcard p-6 sm:p-8 flex flex-col justify-between border shadow-sm transition-transform duration-300 hover:-translate-y-1 ${batchClass} ${
                isIndigo
                  ? "bg-indigo-deep text-light-text border-indigo"
                  : "bg-yellow-surface text-indigo-deep border-yellow-border"
              }`}
            >
              <div>
                <span
                  className={`text-xs font-sans font-semibold tracking-wider uppercase block mb-4 ${
                    isIndigo ? "text-yellow-golden" : "text-indigo-deep/70"
                  }`}
                >
                  Step {step.number}
                </span>

                <div
                  className={`text-xs tracking-wider uppercase font-sans font-medium mb-1 ${
                    isIndigo ? "text-light-text/60" : "text-muted-text"
                  }`}
                >
                  {step.summary}
                </div>

                <h3
                  className={`text-2xl font-sans font-light tracking-tight mb-3 ${
                    isIndigo ? "text-white" : "text-indigo-deep"
                  }`}
                >
                  {step.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed font-sans ${
                    isIndigo ? "text-light-text/80" : "text-muted-text"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        {admissionsContent.chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-yellow-surface border border-yellow-border text-xs sm:text-sm font-sans text-indigo-deep shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-golden" />
            {chip}
          </span>
        ))}
      </div>

      {/* Enquiry Form & Contact Information Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-kcard overflow-hidden border border-yellow-border shadow-xl bg-white/70 backdrop-blur-md">
        {/* Left Information Pane (Deep Indigo) - Slides from LEFT */}
        <div className="lg:col-span-5 bg-indigo-deep text-light-text p-8 sm:p-12 flex flex-col justify-between batch-slide-left">
          <div>
            <TagChip variant="indigo" className="mb-4">
              Direct Contact
            </TagChip>

            <h3 className="text-3xl font-sans font-light tracking-tight text-white mb-4">
              Begin your child's journey
            </h3>

            <p className="text-sm text-light-text/80 leading-relaxed font-sans mb-8">
              {admissionsContent.formSection.subtitle}
            </p>

            {/* Contact details with placeholders as required */}
            <div className="flex flex-col gap-5 text-sm font-sans">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-ktag bg-white/10 flex items-center justify-center text-yellow-golden flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{admissionsContent.formSection.contactInfo.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-ktag bg-white/10 flex items-center justify-center text-yellow-golden flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{admissionsContent.formSection.contactInfo.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-ktag bg-white/10 flex items-center justify-center text-yellow-golden flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>{admissionsContent.formSection.contactInfo.officeHours}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-ktag bg-white/10 flex items-center justify-center text-yellow-golden flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{admissionsContent.formSection.contactInfo.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-light-text/60 font-sans">
            Admissions rolling for Academic Year 2026–2027. Early registrations prioritized.
          </div>
        </div>

        {/* Right Form Pane - Slides from RIGHT */}
        <div className="lg:col-span-7 p-8 sm:p-12 bg-yellow-surface/50 batch-slide-right">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-golden text-indigo-deep flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-sans font-light text-indigo-deep mb-2">
                Enquiry Received!
              </h4>
              <p className="text-sm text-muted-text font-sans max-w-sm mb-6">
                Thank you for reaching out to Kognitics. Our admissions counselor will contact you within 24 hours.
              </p>
              <MagneticButton
                onClick={() => setSubmitSuccess(false)}
                variant="outline"
                showIcon={false}
              >
                Send Another Enquiry
              </MagneticButton>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Parent Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider font-sans font-medium text-indigo-deep/80">
                    Parent's Full Name *
                  </label>
                  <motion.div animate={errors.parentName ? { x: [-4, 4, -4, 4, 0] } : {}}>
                    <input
                      {...register("parentName")}
                      placeholder="e.g. Anand Sharma"
                      className="w-full px-4 py-3 rounded-kbtn bg-white/90 border border-yellow-border text-indigo-deep placeholder:text-muted-text/50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-golden focus:border-transparent transition-all"
                    />
                  </motion.div>
                  {errors.parentName && (
                    <span className="text-xs text-red-600 font-sans">{errors.parentName.message}</span>
                  )}
                </div>

                {/* Child Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider font-sans font-medium text-indigo-deep/80">
                    Child's Name *
                  </label>
                  <motion.div animate={errors.childName ? { x: [-4, 4, -4, 4, 0] } : {}}>
                    <input
                      {...register("childName")}
                      placeholder="e.g. Diya Sharma"
                      className="w-full px-4 py-3 rounded-kbtn bg-white/90 border border-yellow-border text-indigo-deep placeholder:text-muted-text/50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-golden focus:border-transparent transition-all"
                    />
                  </motion.div>
                  {errors.childName && (
                    <span className="text-xs text-red-600 font-sans">{errors.childName.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider font-sans font-medium text-indigo-deep/80">
                    Email Address *
                  </label>
                  <motion.div animate={errors.email ? { x: [-4, 4, -4, 4, 0] } : {}}>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="parent@example.com"
                      className="w-full px-4 py-3 rounded-kbtn bg-white/90 border border-yellow-border text-indigo-deep placeholder:text-muted-text/50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-golden focus:border-transparent transition-all"
                    />
                  </motion.div>
                  {errors.email && (
                    <span className="text-xs text-red-600 font-sans">{errors.email.message}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider font-sans font-medium text-indigo-deep/80">
                    Phone Number *
                  </label>
                  <motion.div animate={errors.phone ? { x: [-4, 4, -4, 4, 0] } : {}}>
                    <input
                      {...register("phone")}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-kbtn bg-white/90 border border-yellow-border text-indigo-deep placeholder:text-muted-text/50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-golden focus:border-transparent transition-all"
                    />
                  </motion.div>
                  {errors.phone && (
                    <span className="text-xs text-red-600 font-sans">{errors.phone.message}</span>
                  )}
                </div>
              </div>

              {/* Grade applying for */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider font-sans font-medium text-indigo-deep/80">
                  Grade Applying For *
                </label>
                <select
                  {...register("grade")}
                  className="w-full px-4 py-3 rounded-kbtn bg-white/90 border border-yellow-border text-indigo-deep text-sm focus:outline-none focus:ring-2 focus:ring-yellow-golden focus:border-transparent transition-all"
                >
                  <option value="LKG & UKG">Early Years: LKG & UKG</option>
                  <option value="Std 1–4">Primary: Standard 1 to 4</option>
                  <option value="Std 5–8">Middle: Standard 5 to 8</option>
                  <option value="Std 9–12">Senior: Standard 9 to 12</option>
                </select>
              </div>

              {/* Optional Questions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider font-sans font-medium text-indigo-deep/80">
                  Questions or Notes (Optional)
                </label>
                <textarea
                  {...register("questions")}
                  rows={3}
                  placeholder="Tell us about your child's curiosities or any specific queries..."
                  className="w-full px-4 py-3 rounded-kbtn bg-white/90 border border-yellow-border text-indigo-deep placeholder:text-muted-text/50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-golden focus:border-transparent transition-all resize-none"
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-kbtn bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="mt-2">
                <MagneticButton
                  type="submit"
                  variant="primary"
                  isMagnetic
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 text-base"
                >
                  {isSubmitting ? "Submitting Enquiry..." : "Submit Enquiry"}
                </MagneticButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

