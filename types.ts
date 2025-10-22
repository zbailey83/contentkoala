import type React from 'react';
import type { Id } from "./convex/_generated/dataModel";

export interface UploadedFile {
  base64: string;
  mimeType: string;
}

export type Platform = 'LinkedIn' | 'X' | 'Blog';
export type Status = 'Draft' | 'Scheduled' | 'Published';

export interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  platform: Platform;
  status: Status;
}

// FIX: Add a shared 'Tool' type to be used across components.
export type Tool = 'ad-generator' | 'social-posts' | 'dashboard' | 'gbp-optimizer' | 'content-calendar' | 'client-services' | 'payments' | 'profile';

// Types for Client Services Section
export interface ServiceSection {
    title: string;
    items: string[];
}

export interface ClientService {
    id: string;
    icon: React.ReactNode;
    colorScheme: 'purple' | 'blue' | 'green' | 'orange';
    title: string;
    shortDescription: string;
    fullDescription: string;
    sections: ServiceSection[];
    perfectFor?: string;
}

export interface PricingPackage {
    id: string;
    icon: React.ReactNode;
    colorScheme: 'purple' | 'blue' | 'green' | 'orange';
    title: string;
    packageTitle: string;
    subtitle: string;
    shortDescription: string;
    whatsIncluded: string[];
    investment: { setup?: string; monthly?: string; total: string; };
    bestFor: string;
}

export interface CustomSolutions {
    id: string;
    icon: React.ReactNode;
    colorScheme: 'purple' | 'blue' | 'green' | 'orange';
    title: string;
    shortDescription: string;
    description: string;
    items: string[];
}

export type ServiceModalData = ClientService | PricingPackage | CustomSolutions;

// Convex-specific types
export type Generation = {
  _id: Id<"userGenerations">;
  _creationTime: number;
  userId: Id<"users">;
  type: "image" | "video" | "text";
  prompt: string;
  status: "pending" | "completed" | "failed";
  storageId?: Id<"_storage">;
  text?: string;
  error?: string;
};