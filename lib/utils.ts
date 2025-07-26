import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatRelativeTime(date: number | Date): string {
  const now = new Date();
  const targetDate = typeof date === "number" ? new Date(date) : date;
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
  } else if (diffInMonths > 0) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  } else if (diffInWeeks > 0) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  } else if (diffInDays > 0) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInMinutes > 0) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  } else {
    return "Just now";
  }
}

// Metric Card Utility Functions

// Map model status to pill type
export function getStatusPillType(
  status: string,
): "success" | "error" | "info" {
  switch (status) {
    case "ready":
      return "success";
    case "failed":
    case "none":
      return "error";
    case "pending":
    case "training":
    case "converting":
    default:
      return "info";
  }
}

// Map dataset title to pill type
export function getDatasetPillType(
  title: string,
): "success" | "error" | "info" {
  return title === "none" ? "error" : "info";
}

// Get training card title based on model status
export function getTrainingCardTitle(status: string | null): string {
  if (!status) return "No Model";
  if (status === "ready" || status === "failed") return "Trained";
  return "Currently Training";
}

// Check if model should show animation (not ready and not failed)
export function shouldShowAnimation(status: string | null): boolean {
  return status !== null && status !== "ready" && status !== "failed";
}

// Format status text for display
export function formatStatusText(status: string): string {
  if (status === "none") return "None";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Format dataset title for pill text
export function formatDatasetPillText(title: string): string {
  if (title === "none") return "None";
  return title.length > 15 ? title.substring(0, 15) + "..." : title;
}
