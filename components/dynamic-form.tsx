"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ArrowRight, ArrowLeft, Send, Edit, Loader2, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { submitForm } from "@/actions/form-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Define the question types
type QuestionType = "radio" | "text" | "textarea" | "select" | "checkbox" | "date" | "number"

// Define the question structure
interface Question {
  id: string
  type: QuestionType
  question: string
  required?: boolean
  options?: {
    value: string
    label: string
    nextQuestion: string | null
  }[]
  nextQuestion?: string | null
  section?: string
}

// Define the form structure
interface FormStructure {
  questions: Record<string, Question>
  startQuestion: string
  finalQuestion: string
  sections: {
    id: string
    title: string
    questions: string[]
  }[]
}

// At the top of the file, export the form structure
export const formStructure: FormStructure = {
  startQuestion: "purpose",
  finalQuestion: "additional_info", // This is the last question in the flow
  sections: [
    {
      id: "intro",
      title: "Introduction",
      questions: ["purpose"],
    },
    {
      id: "details",
      title: "Project Details",
      questions: [
        "business_type",
        "startup_stage",
        "funding_status",
        "enterprise_industry",
        "tech_focus",
        "ai_application",
        "healthcare_focus",
        "finance_focus",
        "retail_focus",
        "other_industry",
        "agency_specialization",
        "marketing_services",
        "development_focus",
        "frontend_tech",
        "backend_tech",
        "mobile_platforms",
        "cross_platform_tech",
        "design_focus",
        "nonprofit_mission",
        "business_other",
        "personal_type",
        "website_purpose",
        "website_features",
        "ecommerce_products",
        "website_other_purpose",
        "website_timeline",
        "app_platform",
        "app_purpose",
        "app_features",
        "portfolio_purpose",
        "portfolio_field",
        "portfolio_other_purpose",
        "blog_topic",
        "blog_audience",
        "personal_other",
        "feedback_type",
        "product_feedback",
        "product_positive",
        "product_improvement",
        "service_feedback",
        "service_positive",
        "service_improvement",
        "website_feedback",
        "website_design_feedback",
        "website_content_feedback",
        "website_usability_feedback",
        "website_performance_feedback",
        "suggestion_details",
        "feedback_other",
        "feedback_details",
        "contact_permission",
        "research_purpose",
        "research_industry",
        "research_other_industry",
        "academic_field",
        "research_timeline",
        "research_goals",
        "partnership_type",
        "partnership_other",
        "partnership_goals",
        "partnership_timeline",
      ],
    },
    {
      id: "business",
      title: "Business Information",
      questions: [
        "company_size",
        "business_goals",
        "growth_areas",
        "efficiency_areas",
        "launch_timeline",
        "funding_amount",
        "other_goals",
        "budget",
        "timeline",
        "decision_makers",
        "personal_budget",
        "personal_timeline",
      ],
    },
    {
      id: "contact",
      title: "Contact Information",
      questions: ["contact_info", "name", "phone", "additional_info"],
    },
  ],
  questions: {
    purpose: {
      id: "purpose",
      type: "radio",
      question: "What brings you here today?",
      required: true,
      section: "intro",
      options: [
        { value: "business", label: "Business inquiry", nextQuestion: "business_type" },
        { value: "personal", label: "Personal project", nextQuestion: "personal_type" },
        { value: "feedback", label: "Providing feedback", nextQuestion: "feedback_type" },
        { value: "research", label: "Market research", nextQuestion: "research_purpose" },
        { value: "partnership", label: "Partnership opportunity", nextQuestion: "partnership_type" },
      ],
    },
    business_type: {
      id: "business_type",
      type: "select",
      question: "What type of business do you have?",
      section: "details",
      options: [
        { value: "startup", label: "Startup", nextQuestion: "startup_stage" },
        { value: "enterprise", label: "Enterprise", nextQuestion: "enterprise_industry" },
        { value: "agency", label: "Agency", nextQuestion: "agency_specialization" },
        { value: "nonprofit", label: "Non-profit", nextQuestion: "nonprofit_mission" },
        { value: "other", label: "Other", nextQuestion: "business_other" },
      ],
    },
    startup_stage: {
      id: "startup_stage",
      type: "radio",
      question: "What stage is your startup in?",
      section: "details",
      options: [
        { value: "idea", label: "Idea/Concept", nextQuestion: "funding_status" },
        { value: "mvp", label: "MVP/Prototype", nextQuestion: "funding_status" },
        { value: "early_traction", label: "Early Traction", nextQuestion: "funding_status" },
        { value: "scaling", label: "Scaling", nextQuestion: "funding_status" },
      ],
    },
    funding_status: {
      id: "funding_status",
      type: "radio",
      question: "What's your current funding status?",
      section: "details",
      options: [
        { value: "bootstrapped", label: "Bootstrapped", nextQuestion: "company_size" },
        { value: "pre_seed", label: "Pre-seed", nextQuestion: "company_size" },
        { value: "seed", label: "Seed", nextQuestion: "company_size" },
        { value: "series_a_plus", label: "Series A or beyond", nextQuestion: "company_size" },
      ],
    },
    enterprise_industry: {
      id: "enterprise_industry",
      type: "select",
      question: "Which industry is your enterprise in?",
      section: "details",
      options: [
        { value: "technology", label: "Technology", nextQuestion: "tech_focus" },
        { value: "healthcare", label: "Healthcare", nextQuestion: "healthcare_focus" },
        { value: "finance", label: "Finance", nextQuestion: "finance_focus" },
        { value: "retail", label: "Retail", nextQuestion: "retail_focus" },
        { value: "manufacturing", label: "Manufacturing", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "other_industry" },
      ],
    },
    tech_focus: {
      id: "tech_focus",
      type: "radio",
      question: "What's your primary technology focus?",
      section: "details",
      options: [
        { value: "saas", label: "SaaS", nextQuestion: "company_size" },
        { value: "ai_ml", label: "AI/Machine Learning", nextQuestion: "ai_application" },
        { value: "blockchain", label: "Blockchain", nextQuestion: "company_size" },
        { value: "iot", label: "IoT", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    ai_application: {
      id: "ai_application",
      type: "textarea",
      question: "Please describe your AI/ML application or use case:",
      section: "details",
      nextQuestion: "company_size",
    },
    healthcare_focus: {
      id: "healthcare_focus",
      type: "radio",
      question: "What's your focus in healthcare?",
      section: "details",
      options: [
        { value: "telemedicine", label: "Telemedicine", nextQuestion: "company_size" },
        { value: "medical_devices", label: "Medical Devices", nextQuestion: "company_size" },
        { value: "health_it", label: "Health IT", nextQuestion: "company_size" },
        { value: "pharmaceuticals", label: "Pharmaceuticals", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    finance_focus: {
      id: "finance_focus",
      type: "radio",
      question: "What's your focus in finance?",
      section: "details",
      options: [
        { value: "banking", label: "Banking", nextQuestion: "company_size" },
        { value: "insurance", label: "Insurance", nextQuestion: "company_size" },
        { value: "investments", label: "Investments", nextQuestion: "company_size" },
        { value: "fintech", label: "Fintech", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    retail_focus: {
      id: "retail_focus",
      type: "radio",
      question: "What's your focus in retail?",
      section: "details",
      options: [
        { value: "ecommerce", label: "E-commerce", nextQuestion: "company_size" },
        { value: "brick_mortar", label: "Brick & Mortar", nextQuestion: "company_size" },
        { value: "omnichannel", label: "Omnichannel", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    other_industry: {
      id: "other_industry",
      type: "text",
      question: "Please specify your industry:",
      section: "details",
      nextQuestion: "company_size",
    },
    agency_specialization: {
      id: "agency_specialization",
      type: "radio",
      question: "What does your agency specialize in?",
      section: "details",
      options: [
        { value: "digital_marketing", label: "Digital Marketing", nextQuestion: "marketing_services" },
        { value: "web_development", label: "Web Development", nextQuestion: "development_focus" },
        { value: "design", label: "Design", nextQuestion: "design_focus" },
        { value: "pr", label: "PR & Communications", nextQuestion: "company_size" },
        { value: "full_service", label: "Full Service", nextQuestion: "company_size" },
      ],
    },
    marketing_services: {
      id: "marketing_services",
      type: "radio",
      question: "Which marketing services do you primarily offer?",
      section: "details",
      options: [
        { value: "seo", label: "SEO", nextQuestion: "company_size" },
        { value: "ppc", label: "PPC/Paid Advertising", nextQuestion: "company_size" },
        { value: "social_media", label: "Social Media", nextQuestion: "company_size" },
        { value: "content", label: "Content Marketing", nextQuestion: "company_size" },
        { value: "email", label: "Email Marketing", nextQuestion: "company_size" },
      ],
    },
    development_focus: {
      id: "development_focus",
      type: "radio",
      question: "What's your development focus?",
      section: "details",
      options: [
        { value: "frontend", label: "Frontend", nextQuestion: "frontend_tech" },
        { value: "backend", label: "Backend", nextQuestion: "backend_tech" },
        { value: "fullstack", label: "Full Stack", nextQuestion: "company_size" },
        { value: "mobile", label: "Mobile", nextQuestion: "mobile_platforms" },
      ],
    },
    frontend_tech: {
      id: "frontend_tech",
      type: "radio",
      question: "Which frontend technologies do you specialize in?",
      section: "details",
      options: [
        { value: "react", label: "React", nextQuestion: "company_size" },
        { value: "vue", label: "Vue", nextQuestion: "company_size" },
        { value: "angular", label: "Angular", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    backend_tech: {
      id: "backend_tech",
      type: "radio",
      question: "Which backend technologies do you specialize in?",
      section: "details",
      options: [
        { value: "node", label: "Node.js", nextQuestion: "company_size" },
        { value: "python", label: "Python", nextQuestion: "company_size" },
        { value: "php", label: "PHP", nextQuestion: "company_size" },
        { value: "java", label: "Java", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    mobile_platforms: {
      id: "mobile_platforms",
      type: "radio",
      question: "Which mobile platforms do you develop for?",
      section: "details",
      options: [
        { value: "ios", label: "iOS", nextQuestion: "company_size" },
        { value: "android", label: "Android", nextQuestion: "company_size" },
        { value: "cross_platform", label: "Cross-platform", nextQuestion: "cross_platform_tech" },
      ],
    },
    cross_platform_tech: {
      id: "cross_platform_tech",
      type: "radio",
      question: "Which cross-platform technology do you use?",
      section: "details",
      options: [
        { value: "react_native", label: "React Native", nextQuestion: "company_size" },
        { value: "flutter", label: "Flutter", nextQuestion: "company_size" },
        { value: "xamarin", label: "Xamarin", nextQuestion: "company_size" },
        { value: "other", label: "Other", nextQuestion: "company_size" },
      ],
    },
    design_focus: {
      id: "design_focus",
      type: "radio",
      question: "What's your design focus?",
      section: "details",
      options: [
        { value: "ui", label: "UI Design", nextQuestion: "company_size" },
        { value: "ux", label: "UX Design", nextQuestion: "company_size" },
        { value: "graphic", label: "Graphic Design", nextQuestion: "company_size" },
        { value: "branding", label: "Branding", nextQuestion: "company_size" },
      ],
    },
    nonprofit_mission: {
      id: "nonprofit_mission",
      type: "textarea",
      question: "What is your organization's mission?",
      section: "details",
      nextQuestion: "company_size",
    },
    business_other: {
      id: "business_other",
      type: "text",
      question: "Please describe your business:",
      section: "details",
      nextQuestion: "company_size",
    },
    company_size: {
      id: "company_size",
      type: "radio",
      question: "How many employees does your company have?",
      section: "business",
      options: [
        { value: "solo", label: "Just me", nextQuestion: "business_goals" },
        { value: "2-10", label: "2-10", nextQuestion: "business_goals" },
        { value: "11-50", label: "11-50", nextQuestion: "business_goals" },
        { value: "51-200", label: "51-200", nextQuestion: "business_goals" },
        { value: "201-1000", label: "201-1000", nextQuestion: "business_goals" },
        { value: "1000+", label: "1000+", nextQuestion: "business_goals" },
      ],
    },
    business_goals: {
      id: "business_goals",
      type: "radio",
      question: "What's your primary goal right now?",
      section: "business",
      options: [
        { value: "growth", label: "Business Growth", nextQuestion: "growth_areas" },
        { value: "efficiency", label: "Operational Efficiency", nextQuestion: "efficiency_areas" },
        { value: "launch", label: "Product Launch", nextQuestion: "launch_timeline" },
        { value: "funding", label: "Securing Funding", nextQuestion: "funding_amount" },
        { value: "other", label: "Other", nextQuestion: "other_goals" },
      ],
    },
    growth_areas: {
      id: "growth_areas",
      type: "radio",
      question: "Which area are you focusing on for growth?",
      section: "business",
      options: [
        { value: "customer_acquisition", label: "Customer Acquisition", nextQuestion: "budget" },
        { value: "market_expansion", label: "Market Expansion", nextQuestion: "budget" },
        { value: "product_development", label: "Product Development", nextQuestion: "budget" },
        { value: "team_growth", label: "Team Growth", nextQuestion: "budget" },
      ],
    },
    efficiency_areas: {
      id: "efficiency_areas",
      type: "radio",
      question: "Which area are you focusing on for efficiency?",
      section: "business",
      options: [
        { value: "automation", label: "Process Automation", nextQuestion: "budget" },
        { value: "cost_reduction", label: "Cost Reduction", nextQuestion: "budget" },
        { value: "productivity", label: "Team Productivity", nextQuestion: "budget" },
        { value: "quality", label: "Quality Improvement", nextQuestion: "budget" },
      ],
    },
    launch_timeline: {
      id: "launch_timeline",
      type: "radio",
      question: "What's your timeline for launch?",
      section: "business",
      options: [
        { value: "1_month", label: "Within 1 month", nextQuestion: "budget" },
        { value: "3_months", label: "Within 3 months", nextQuestion: "budget" },
        { value: "6_months", label: "Within 6 months", nextQuestion: "budget" },
        { value: "1_year", label: "Within 1 year", nextQuestion: "budget" },
      ],
    },
    funding_amount: {
      id: "funding_amount",
      type: "radio",
      question: "How much funding are you looking to secure?",
      section: "business",
      options: [
        { value: "under_500k", label: "Under $500K", nextQuestion: "budget" },
        { value: "500k_1m", label: "$500K - $1M", nextQuestion: "budget" },
        { value: "1m_5m", label: "$1M - $5M", nextQuestion: "budget" },
        { value: "5m_plus", label: "$5M+", nextQuestion: "budget" },
      ],
    },
    other_goals: {
      id: "other_goals",
      type: "textarea",
      question: "Please describe your primary business goal:",
      section: "business",
      nextQuestion: "budget",
    },
    budget: {
      id: "budget",
      type: "radio",
      question: "What's your budget range for this project?",
      section: "business",
      options: [
        { value: "under_10k", label: "Under $10K", nextQuestion: "timeline" },
        { value: "10k_50k", label: "$10K - $50K", nextQuestion: "timeline" },
        { value: "50k_100k", label: "$50K - $100K", nextQuestion: "timeline" },
        { value: "100k_plus", label: "$100K+", nextQuestion: "timeline" },
        { value: "undecided", label: "Not yet decided", nextQuestion: "timeline" },
      ],
    },
    timeline: {
      id: "timeline",
      type: "radio",
      question: "What's your expected timeline?",
      section: "business",
      options: [
        { value: "asap", label: "As soon as possible", nextQuestion: "decision_makers" },
        { value: "1_3_months", label: "1-3 months", nextQuestion: "decision_makers" },
        { value: "3_6_months", label: "3-6 months", nextQuestion: "decision_makers" },
        { value: "6_plus_months", label: "6+ months", nextQuestion: "decision_makers" },
        { value: "flexible", label: "Flexible", nextQuestion: "decision_makers" },
      ],
    },
    decision_makers: {
      id: "decision_makers",
      type: "radio",
      question: "Who will be involved in the decision-making process?",
      section: "business",
      options: [
        { value: "just_me", label: "Just me", nextQuestion: "contact_info" },
        { value: "team", label: "My team", nextQuestion: "contact_info" },
        { value: "executives", label: "Executive leadership", nextQuestion: "contact_info" },
        { value: "board", label: "Board of directors", nextQuestion: "contact_info" },
      ],
    },
    personal_type: {
      id: "personal_type",
      type: "radio",
      question: "What kind of personal project are you working on?",
      section: "details",
      options: [
        { value: "website", label: "Website", nextQuestion: "website_purpose" },
        { value: "mobile_app", label: "Mobile App", nextQuestion: "app_platform" },
        { value: "portfolio", label: "Portfolio", nextQuestion: "portfolio_purpose" },
        { value: "blog", label: "Blog", nextQuestion: "blog_topic" },
        { value: "other", label: "Other", nextQuestion: "personal_other" },
      ],
    },
    website_purpose: {
      id: "website_purpose",
      type: "radio",
      question: "What's the main purpose of your website?",
      section: "details",
      options: [
        { value: "personal_brand", label: "Personal Branding", nextQuestion: "website_features" },
        { value: "business", label: "Small Business", nextQuestion: "website_features" },
        { value: "ecommerce", label: "E-commerce", nextQuestion: "ecommerce_products" },
        { value: "portfolio", label: "Portfolio", nextQuestion: "website_features" },
        { value: "other", label: "Other", nextQuestion: "website_other_purpose" },
      ],
    },
    website_features: {
      id: "website_features",
      type: "radio",
      question: "Which features are most important for your website?",
      section: "details",
      options: [
        { value: "design", label: "Beautiful Design", nextQuestion: "website_timeline" },
        { value: "functionality", label: "Specific Functionality", nextQuestion: "website_timeline" },
        { value: "seo", label: "SEO & Discoverability", nextQuestion: "website_timeline" },
        { value: "content", label: "Content Management", nextQuestion: "website_timeline" },
      ],
    },
    ecommerce_products: {
      id: "ecommerce_products",
      type: "text",
      question: "What kind of products will you be selling?",
      section: "details",
      nextQuestion: "website_timeline",
    },
    website_other_purpose: {
      id: "website_other_purpose",
      type: "textarea",
      question: "Please describe the purpose of your website:",
      section: "details",
      nextQuestion: "website_timeline",
    },
    website_timeline: {
      id: "website_timeline",
      type: "radio",
      question: "When do you need your website completed?",
      section: "details",
      options: [
        { value: "1_month", label: "Within 1 month", nextQuestion: "personal_budget" },
        { value: "3_months", label: "Within 3 months", nextQuestion: "personal_budget" },
        { value: "6_months", label: "Within 6 months", nextQuestion: "personal_budget" },
        { value: "no_rush", label: "No rush", nextQuestion: "personal_budget" },
      ],
    },
    app_platform: {
      id: "app_platform",
      type: "radio",
      question: "Which platform are you developing for?",
      section: "details",
      options: [
        { value: "ios", label: "iOS", nextQuestion: "app_purpose" },
        { value: "android", label: "Android", nextQuestion: "app_purpose" },
        { value: "both", label: "Both", nextQuestion: "app_purpose" },
        { value: "web_app", label: "Web App", nextQuestion: "app_purpose" },
      ],
    },
    app_purpose: {
      id: "app_purpose",
      type: "textarea",
      question: "What's the main purpose of your app?",
      section: "details",
      nextQuestion: "app_features",
    },
    app_features: {
      id: "app_features",
      type: "textarea",
      question: "What are the key features you want in your app?",
      section: "details",
      nextQuestion: "personal_budget",
    },
    portfolio_purpose: {
      id: "portfolio_purpose",
      type: "radio",
      question: "What's the main purpose of your portfolio?",
      section: "details",
      options: [
        { value: "job_hunting", label: "Job Hunting", nextQuestion: "portfolio_field" },
        { value: "freelance", label: "Attracting Freelance Work", nextQuestion: "portfolio_field" },
        { value: "showcase", label: "Showcasing Work", nextQuestion: "portfolio_field" },
        { value: "other", label: "Other", nextQuestion: "portfolio_other_purpose" },
      ],
    },
    portfolio_field: {
      id: "portfolio_field",
      type: "radio",
      question: "What field is your portfolio for?",
      section: "details",
      options: [
        { value: "design", label: "Design", nextQuestion: "personal_budget" },
        { value: "development", label: "Development", nextQuestion: "personal_budget" },
        { value: "photography", label: "Photography", nextQuestion: "personal_budget" },
        { value: "writing", label: "Writing", nextQuestion: "personal_budget" },
        { value: "other", label: "Other", nextQuestion: "personal_budget" },
      ],
    },
    portfolio_other_purpose: {
      id: "portfolio_other_purpose",
      type: "textarea",
      question: "Please describe the purpose of your portfolio:",
      section: "details",
      nextQuestion: "personal_budget",
    },
    blog_topic: {
      id: "blog_topic",
      type: "text",
      question: "What will your blog be about?",
      section: "details",
      nextQuestion: "blog_audience",
    },
    blog_audience: {
      id: "blog_audience",
      type: "textarea",
      question: "Who is your target audience?",
      section: "details",
      nextQuestion: "personal_budget",
    },
    personal_other: {
      id: "personal_other",
      type: "textarea",
      question: "Please describe your project:",
      section: "details",
      nextQuestion: "personal_budget",
    },
    personal_budget: {
      id: "personal_budget",
      type: "radio",
      question: "What's your budget for this project?",
      section: "business",
      options: [
        { value: "under_1k", label: "Under $1K", nextQuestion: "personal_timeline" },
        { value: "1k_5k", label: "$1K - $5K", nextQuestion: "personal_timeline" },
        { value: "5k_10k", label: "$5K - $10K", nextQuestion: "personal_timeline" },
        { value: "10k_plus", label: "$10K+", nextQuestion: "personal_timeline" },
        { value: "undecided", label: "Not yet decided", nextQuestion: "personal_timeline" },
      ],
    },
    personal_timeline: {
      id: "personal_timeline",
      type: "radio",
      question: "What's your timeline for this project?",
      section: "business",
      options: [
        { value: "asap", label: "As soon as possible", nextQuestion: "contact_info" },
        { value: "1_3_months", label: "1-3 months", nextQuestion: "contact_info" },
        { value: "3_6_months", label: "3-6 months", nextQuestion: "contact_info" },
        { value: "flexible", label: "Flexible", nextQuestion: "contact_info" },
      ],
    },
    feedback_type: {
      id: "feedback_type",
      type: "radio",
      question: "What type of feedback would you like to provide?",
      section: "details",
      options: [
        { value: "product", label: "Product feedback", nextQuestion: "product_feedback" },
        { value: "service", label: "Service feedback", nextQuestion: "service_feedback" },
        { value: "website", label: "Website feedback", nextQuestion: "website_feedback" },
        { value: "suggestion", label: "Suggestion", nextQuestion: "suggestion_details" },
        { value: "other", label: "Other", nextQuestion: "feedback_other" },
      ],
    },
    product_feedback: {
      id: "product_feedback",
      type: "radio",
      question: "How would you rate our product?",
      section: "details",
      options: [
        { value: "excellent", label: "Excellent", nextQuestion: "product_positive" },
        { value: "good", label: "Good", nextQuestion: "product_positive" },
        { value: "average", label: "Average", nextQuestion: "product_improvement" },
        { value: "poor", label: "Poor", nextQuestion: "product_improvement" },
        { value: "very_poor", label: "Very Poor", nextQuestion: "product_improvement" },
      ],
    },
    product_positive: {
      id: "product_positive",
      type: "textarea",
      question: "What do you like most about our product?",
      section: "details",
      nextQuestion: "product_improvement",
    },
    product_improvement: {
      id: "product_improvement",
      type: "textarea",
      question: "How could we improve our product?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    service_feedback: {
      id: "service_feedback",
      type: "radio",
      question: "How would you rate our service?",
      section: "details",
      options: [
        { value: "excellent", label: "Excellent", nextQuestion: "service_positive" },
        { value: "good", label: "Good", nextQuestion: "service_positive" },
        { value: "average", label: "Average", nextQuestion: "service_improvement" },
        { value: "poor", label: "Poor", nextQuestion: "service_improvement" },
        { value: "very_poor", label: "Very Poor", nextQuestion: "service_improvement" },
      ],
    },
    service_positive: {
      id: "service_positive",
      type: "textarea",
      question: "What do you like most about our service?",
      section: "details",
      nextQuestion: "service_improvement",
    },
    service_improvement: {
      id: "service_improvement",
      type: "textarea",
      question: "How could we improve our service?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    website_feedback: {
      id: "website_feedback",
      type: "radio",
      question: "What aspect of our website would you like to provide feedback on?",
      section: "details",
      options: [
        { value: "design", label: "Design & User Interface", nextQuestion: "website_design_feedback" },
        { value: "content", label: "Content & Information", nextQuestion: "website_content_feedback" },
        { value: "usability", label: "Usability & Navigation", nextQuestion: "website_usability_feedback" },
        { value: "performance", label: "Performance & Speed", nextQuestion: "website_performance_feedback" },
      ],
    },
    website_design_feedback: {
      id: "website_design_feedback",
      type: "textarea",
      question: "What feedback do you have about our website design?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    website_content_feedback: {
      id: "website_content_feedback",
      type: "textarea",
      question: "What feedback do you have about our website content?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    website_usability_feedback: {
      id: "website_usability_feedback",
      type: "textarea",
      question: "What feedback do you have about our website usability?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    website_performance_feedback: {
      id: "website_performance_feedback",
      type: "textarea",
      question: "What feedback do you have about our website performance?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    suggestion_details: {
      id: "suggestion_details",
      type: "textarea",
      question: "What suggestion would you like to share with us?",
      section: "details",
      nextQuestion: "contact_permission",
    },
    feedback_other: {
      id: "feedback_other",
      type: "textarea",
      question: "What would you like to provide feedback about?",
      section: "details",
      nextQuestion: "feedback_details",
    },
    feedback_details: {
      id: "feedback_details",
      type: "textarea",
      question: "Please share your feedback with us:",
      section: "details",
      nextQuestion: "contact_permission",
    },
    contact_permission: {
      id: "contact_permission",
      type: "radio",
      question: "May we contact you about your feedback?",
      section: "details",
      options: [
        { value: "yes", label: "Yes", nextQuestion: "contact_info" },
        { value: "no", label: "No", nextQuestion: null },
      ],
    },
    research_purpose: {
      id: "research_purpose",
      type: "radio",
      question: "What's the purpose of your research?",
      section: "details",
      options: [
        { value: "market_analysis", label: "Market Analysis", nextQuestion: "research_industry" },
        { value: "competitor_analysis", label: "Competitor Analysis", nextQuestion: "research_industry" },
        { value: "academic", label: "Academic Research", nextQuestion: "academic_field" },
        { value: "product_development", label: "Product Development", nextQuestion: "research_industry" },
      ],
    },
    research_industry: {
      id: "research_industry",
      type: "select",
      question: "Which industry are you researching?",
      section: "details",
      options: [
        { value: "technology", label: "Technology", nextQuestion: "research_timeline" },
        { value: "healthcare", label: "Healthcare", nextQuestion: "research_timeline" },
        { value: "finance", label: "Finance", nextQuestion: "research_timeline" },
        { value: "education", label: "Education", nextQuestion: "research_timeline" },
        { value: "retail", label: "Retail", nextQuestion: "research_timeline" },
        { value: "other", label: "Other", nextQuestion: "research_other_industry" },
      ],
    },
    research_other_industry: {
      id: "research_other_industry",
      type: "text",
      question: "Please specify the industry you're researching:",
      section: "details",
      nextQuestion: "research_timeline",
    },
    academic_field: {
      id: "academic_field",
      type: "text",
      question: "What academic field is your research in?",
      section: "details",
      nextQuestion: "research_timeline",
    },
    research_timeline: {
      id: "research_timeline",
      type: "radio",
      question: "What's your research timeline?",
      section: "details",
      options: [
        { value: "1_month", label: "Within 1 month", nextQuestion: "research_goals" },
        { value: "3_months", label: "Within 3 months", nextQuestion: "research_goals" },
        { value: "6_months", label: "Within 6 months", nextQuestion: "research_goals" },
        { value: "ongoing", label: "Ongoing project", nextQuestion: "research_goals" },
      ],
    },
    research_goals: {
      id: "research_goals",
      type: "textarea",
      question: "What are the specific goals of your research?",
      section: "details",
      nextQuestion: "contact_info",
    },
    partnership_type: {
      id: "partnership_type",
      type: "radio",
      question: "What type of partnership are you interested in?",
      section: "details",
      options: [
        { value: "strategic", label: "Strategic Alliance", nextQuestion: "partnership_goals" },
        { value: "channel", label: "Channel Partnership", nextQuestion: "partnership_goals" },
        { value: "integration", label: "Product Integration", nextQuestion: "partnership_goals" },
        { value: "joint_venture", label: "Joint Venture", nextQuestion: "partnership_goals" },
        { value: "other", label: "Other", nextQuestion: "partnership_other" },
      ],
    },
    partnership_other: {
      id: "partnership_other",
      type: "text",
      question: "Please describe the type of partnership you're interested in:",
      section: "details",
      nextQuestion: "partnership_goals",
    },
    partnership_goals: {
      id: "partnership_goals",
      type: "textarea",
      question: "What are your goals for this partnership?",
      section: "details",
      nextQuestion: "partnership_timeline",
    },
    partnership_timeline: {
      id: "partnership_timeline",
      type: "radio",
      question: "What's your timeline for establishing this partnership?",
      section: "details",
      options: [
        { value: "immediate", label: "Immediate", nextQuestion: "contact_info" },
        { value: "3_months", label: "Within 3 months", nextQuestion: "contact_info" },
        { value: "6_months", label: "Within 6 months", nextQuestion: "contact_info" },
        { value: "long_term", label: "Long-term planning", nextQuestion: "contact_info" },
      ],
    },
    contact_info: {
      id: "contact_info",
      type: "text",
      question: "What's your email address?",
      required: true,
      section: "contact",
      nextQuestion: "name",
    },
    name: {
      id: "name",
      type: "text",
      question: "What's your name?",
      required: true,
      section: "contact",
      nextQuestion: "phone",
    },
    phone: {
      id: "phone",
      type: "text",
      question: "What's your phone number? (optional)",
      section: "contact",
      nextQuestion: "additional_info",
    },
    additional_info: {
      id: "additional_info",
      type: "textarea",
      question: "Is there anything else you'd like to share with us?",
      section: "contact",
      nextQuestion: null,
    },
  },
}

export default function DynamicForm() {
  // State to track current question
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(formStructure.startQuestion)

  // State to store all answers
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // State to track form completion
  const [isComplete, setIsComplete] = useState<boolean>(false)

  // State to track question history for back navigation
  const [questionHistory, setQuestionHistory] = useState<string[]>([formStructure.startQuestion])

  // State to track if we're in summary view
  const [showingSummary, setShowingSummary] = useState<boolean>(false)

  // State for loading indicators
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // State to track if the form is ready to submit
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false)

  // State to track if we're on the final question
  const [isOnFinalQuestion, setIsOnFinalQuestion] = useState<boolean>(false)

  // State to track the next question
  const [nextQuestionId, setNextQuestionId] = useState<string | null>(null)

  const { toast } = useToast()

  // Get current question
  const currentQuestion = formStructure.questions[currentQuestionId]

  // Calculate the current section
  const currentSection = useMemo(() => {
    const sectionId = currentQuestion.section || ""
    return formStructure.sections.find((section) => section.id === sectionId)
  }, [currentQuestion])

  // Calculate the next question based on the current answer
  useEffect(() => {
    if (currentQuestion.type === "radio" || currentQuestion.type === "select") {
      const answer = answers[currentQuestionId]
      if (answer) {
        const option = currentQuestion.options?.find((opt) => opt.value === answer)
        setNextQuestionId(option?.nextQuestion || null)
      } else {
        setNextQuestionId(null)
      }
    } else {
      setNextQuestionId(currentQuestion.nextQuestion || null)
    }
  }, [currentQuestionId, answers, currentQuestion])

  // Check if we've reached the final question
  useEffect(() => {
    if (currentQuestionId === formStructure.finalQuestion) {
      setIsOnFinalQuestion(true)
      setReadyToSubmit(true)
    } else {
      setIsOnFinalQuestion(false)

      // Only set readyToSubmit to false if we're not on the final question
      // and we haven't already completed the form
      if (!isComplete) {
        setReadyToSubmit(false)
      }
    }
  }, [currentQuestionId, isComplete])

  // Calculate the remaining questions count
  const remainingQuestionsCount = useMemo(() => {
    if (nextQuestionId === null) return 0

    let count = 0
    let nextId = nextQuestionId

    // Count questions until we reach the end or a null nextQuestion
    while (nextId) {
      count++
      const question = formStructure.questions[nextId]

      // If we've reached the final question, break
      if (nextId === formStructure.finalQuestion) {
        break
      }

      // Determine the next question based on the current answer
      if (question.type === "radio" || question.type === "select") {
        const answer = answers[nextId]
        if (answer) {
          const option = question.options?.find((opt) => opt.value === answer)
          nextId = option?.nextQuestion || null
        } else {
          // If no answer, assume the first option's next question
          nextId = question.options?.[0]?.nextQuestion || null
        }
      } else {
        nextId = question.nextQuestion || null
      }
    }

    return count
  }, [nextQuestionId, answers])

  // Function to handle answer selection
  const handleAnswer = (questionId: string, answer: string) => {
    // Update answers
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))

    // Find the next question based on the answer
    if (currentQuestion.type === "radio" || currentQuestion.type === "select") {
      const option = currentQuestion.options?.find((opt) => opt.value === answer)
      const nextQuestionId = option?.nextQuestion

      if (nextQuestionId) {
        // Add the next question to history
        setQuestionHistory((prev) => [...prev, nextQuestionId])
        setCurrentQuestionId(nextQuestionId)
      } else {
        setIsComplete(true)
        // Don't automatically show summary
      }
    } else {
      // For text and textarea, use the nextQuestion property
      if (currentQuestion.nextQuestion) {
        // Add the next question to history
        setQuestionHistory((prev) => [...prev, currentQuestion.nextQuestion!])
        setCurrentQuestionId(currentQuestion.nextQuestion)
      } else {
        setIsComplete(true)
        // Don't automatically show summary
      }
    }
  }

  // Function to go back to the previous question
  const handleBack = () => {
    if (questionHistory.length > 1) {
      // Remove the current question from history
      const newHistory = [...questionHistory]
      newHistory.pop()

      // Set the previous question as current
      setCurrentQuestionId(newHistory[newHistory.length - 1])
      setQuestionHistory(newHistory)

      // If we're in summary view, exit it
      if (showingSummary) {
        setShowingSummary(false)
        setIsComplete(false)
      }
    }
  }

  // Function to show the summary view
  const handleShowSummary = () => {
    setShowingSummary(true)
  }

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const missingRequiredFields = Object.entries(formStructure.questions)
      .filter(([_, question]) => question.required && !answers[question.id])
      .map(([_, question]) => question.id)

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitForm(answers)

      if (result.success) {
        toast({
          title: "Form submitted",
          description: "Your form has been submitted successfully",
        })

        // Clear form after submission
        setAnswers({})
        setCurrentQuestionId(formStructure.startQuestion)
        setQuestionHistory([formStructure.startQuestion])
        setIsComplete(false)
        setShowingSummary(false)
        setReadyToSubmit(false)

        // Show thank you message
        toast({
          title: "Thank you!",
          description: "We've received your submission and will be in touch soon.",
        })
      } else {
        throw new Error(result.error || "Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to submit your form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to edit a specific answer
  const handleEditAnswer = (questionId: string) => {
    // Find the index of the question in history
    const index = questionHistory.indexOf(questionId)

    if (index !== -1) {
      // Truncate history to that question
      const newHistory = questionHistory.slice(0, index + 1)
      setQuestionHistory(newHistory)
      setCurrentQuestionId(questionId)
      setShowingSummary(false)
      setIsComplete(false)
    }
  }

  // Function to render the appropriate question component
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "radio":
        return (
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all",
                  answers[question.id] === option.value
                    ? "border-primary bg-primary/5"
                    : "hover:border-gray-300 dark:hover:border-gray-600",
                )}
                onClick={() => handleAnswer(question.id, option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="text-base cursor-pointer">
                    {option.label}
                  </Label>
                </div>
                {answers[question.id] === option.value && <Check className="h-5 w-5 text-primary" />}
              </div>
            ))}
          </RadioGroup>
        )

      case "text":
        return (
          <div className="space-y-2">
            <Input
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="text-lg p-6"
            />
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => handleAnswer(question.id, answers[question.id] || "")}
                disabled={question.required && !answers[question.id]}
                className="flex items-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="min-h-[150px] text-lg p-6"
            />
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => handleAnswer(question.id, answers[question.id] || "")}
                disabled={question.required && !answers[question.id]}
                className="flex items-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "select":
        return (
          <div className="space-y-4">
            <Select value={answers[question.id] || ""} onValueChange={(value) => handleAnswer(question.id, value)}>
              <SelectTrigger className="w-full text-lg p-6">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all",
                  answers[question.id]?.includes(option.value)
                    ? "border-primary bg-primary/5"
                    : "hover:border-gray-300 dark:hover:border-gray-600",
                )}
                onClick={() => {
                  const currentValues = answers[question.id] ? [...answers[question.id].split(",")] : []
                  const valueIndex = currentValues.indexOf(option.value)

                  if (valueIndex === -1) {
                    currentValues.push(option.value)
                  } else {
                    currentValues.splice(valueIndex, 1)
                  }

                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: currentValues.join(","),
                  }))
                }}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    answers[question.id]?.includes(option.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gray-300 dark:border-gray-600",
                  )}
                >
                  {answers[question.id]?.includes(option.value) && <Check className="h-3 w-3" />}
                </div>
                <Label className="text-base cursor-pointer">{option.label}</Label>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => {
                  if (answers[question.id]) {
                    const selectedOptions = answers[question.id].split(",").filter(Boolean)
                    if (selectedOptions.length > 0) {
                      // Find the next question based on a priority order of selected options
                      const nextQuestions = selectedOptions
                        .map((value) => {
                          const option = question.options?.find((opt) => opt.value === value)
                          return option?.nextQuestion
                        })
                        .filter(Boolean)

                      if (nextQuestions.length > 0 && nextQuestions[0]) {
                        setQuestionHistory((prev) => [...prev, nextQuestions[0] as string])
                        setCurrentQuestionId(nextQuestions[0] as string)
                      } else {
                        setIsComplete(true)
                        // Don't automatically show summary
                      }
                    }
                  }
                }}
                disabled={question.required && !answers[question.id]}
                className="flex items-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Input
              type="date"
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              className="text-lg p-6"
            />
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => handleAnswer(question.id, answers[question.id] || "")}
                disabled={question.required && !answers[question.id]}
                className="flex items-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "number":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Enter a number..."
              className="text-lg p-6"
            />
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => handleAnswer(question.id, answers[question.id] || "")}
                disabled={question.required && !answers[question.id]}
                className="flex items-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Function to render the summary view
  const renderSummary = () => {
    // Get all questions that have been answered
    const answeredQuestionIds = Object.keys(answers)

    // Group questions by their section (first part of the ID before underscore)
    const sections: Record<string, string[]> = {}

    answeredQuestionIds.forEach((id) => {
      const sectionName = id.split("_")[0]
      if (!sections[sectionName]) {
        sections[sectionName] = []
      }
      sections[sectionName].push(id)
    })

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Review Your Responses</h2>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-8">
            {Object.entries(sections).map(([sectionName, questionIds]) => (
              <div key={sectionName} className="space-y-4">
                <h3 className="text-lg font-medium capitalize">{sectionName.replace("_", " ")}</h3>

                <div className="space-y-3">
                  {questionIds.map((questionId) => {
                    const question = formStructure.questions[questionId]
                    if (!question) return null

                    let answerDisplay = answers[questionId]

                    // Format the answer display based on question type
                    if (question.type === "radio" || question.type === "select") {
                      const option = question.options?.find((opt) => opt.value === answers[questionId])
                      answerDisplay = option?.label || answers[questionId]
                    } else if (question.type === "checkbox" && answers[questionId]) {
                      const selectedValues = answers[questionId].split(",").filter(Boolean)
                      const selectedLabels = selectedValues.map((value) => {
                        const option = question.options?.find((opt) => opt.value === value)
                        return option?.label || value
                      })
                      answerDisplay = selectedLabels.join(", ")
                    }

                    return (
                      <div key={questionId} className="border rounded-lg p-4 relative">
                        <div className="pr-8">
                          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">{question.question}</h4>
                          <p className="mt-1">{answerDisplay}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleEditAnswer(questionId)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            className="flex-1 py-6 text-lg flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Form
              </>
            )}
          </Button>
        </div>
      </motion.div>
    )
  }

  // Render the form tracker
  const renderFormTracker = () => {
    // Find the current section
    const currentSectionId = currentQuestion.section || ""
    const sectionIndex = formStructure.sections.findIndex((section) => section.id === currentSectionId)

    return (
      <div className="mb-6">
        {/* Section progress */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Section {sectionIndex + 1} of {formStructure.sections.length}:
            </span>
            <span className="text-sm font-bold">{currentSection?.title || ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Question {questionHistory.length} of {questionHistory.length + remainingQuestionsCount}
            </span>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex mb-4 overflow-x-auto pb-2 gap-1">
          {formStructure.sections.map((section, index) => (
            <Badge
              key={section.id}
              variant={currentSectionId === section.id ? "default" : "outline"}
              className={cn(
                "rounded-full px-3 py-1 text-xs cursor-default",
                index < sectionIndex ? "bg-green-100 text-green-800 border-green-200" : "",
                currentSectionId === section.id ? "bg-primary" : "",
              )}
            >
              {section.title}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  // Progress calculation
  const totalQuestions = Object.keys(formStructure.questions).length
  const answeredQuestions = Object.keys(answers).length
  const progress = Math.min((answeredQuestions / totalQuestions) * 100, 100)

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
        <div className="h-2 bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Form tracker */}
      {!showingSummary && renderFormTracker()}

      <Card className="border shadow-lg">
        <CardHeader className="pb-0">
          {!showingSummary && (
            <>
              <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
              {isOnFinalQuestion && (
                <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                  <Flag className="h-3 w-3 mr-1" /> Final Question
                </Badge>
              )}
            </>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {showingSummary ? (
              renderSummary()
            ) : (
              <motion.div
                key={currentQuestionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {renderQuestion(currentQuestion)}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div>
            {questionHistory.length > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isComplete && !showingSummary && (
              <>
                <Button type="button" variant="outline" onClick={handleShowSummary}>
                  Review Answers
                </Button>
                <Button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Complete Form <Send className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      {isOnFinalQuestion && !showingSummary && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <AlertDescription className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            This is the final question! After answering, you'll be able to review and submit your form.
          </AlertDescription>
        </Alert>
      )}

      {isComplete && !isOnFinalQuestion && !showingSummary && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <AlertDescription className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            You've completed all the questions! Please review your answers or click "Complete Form" to submit.
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}
