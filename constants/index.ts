import { Brain, Gauge, HelpCircle, Bolt } from "lucide-react";
import { Dataset } from "@/components/project-dashboard/dataset-table/columns";

// Menu items for the project sidebar
export const menuItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: Gauge,
    isActive: true,
  },
  {
    title: "Acme Support",
    url: "#",
    icon: Brain,
    isActive: false,
  },
  {
    title: "Acme Support",
    url: "#",
    icon: Brain,
    isActive: false,
  },
  {
    title: "Acme Support",
    url: "#",
    icon: Brain,
    isActive: false,
  },
  {
    title: "Acme Support",
    url: "#",
    icon: Brain,
    isActive: false,
  },
];

// Footer menu items
export const footerMenuItems = [
  {
    title: "Help Centre",
    url: "#",
    icon: HelpCircle,
    isActive: false,
  },
  {
    title: "Settings",
    url: "#",
    icon: Bolt,
    isActive: false,
  },
];

// Dummy data for the dataset table
export const dummyDatasetData: Dataset[] = [
  {
    id: "1",
    dataset: "Customer Support Dataset",
    size: "12MB",
    model: "Acme Support",
    date: "10 Jul 2025",
  },
  {
    id: "2",
    dataset: "Sales Training Data",
    size: "8.5MB",
    model: "Sales Assistant",
    date: "08 Jul 2025",
  },
  {
    id: "3",
    dataset: "Product Documentation",
    size: "24MB",
    model: "Help Bot",
    date: "05 Jul 2025",
  },
  {
    id: "4",
    dataset: "FAQ Knowledge Base",
    size: "6.2MB",
    model: "FAQ Assistant",
    date: "03 Jul 2025",
  },
  {
    id: "5",
    dataset: "Technical Support Logs",
    size: "18MB",
    model: "Tech Support",
    date: "01 Jul 2025",
  },
  {
    id: "6",
    dataset: "Technical Support Logs",
    size: "18MB",
    model: "Tech Support",
    date: "01 Jul 2025",
  },
  {
    id: "7",
    dataset: "Technical Support Logs",
    size: "18MB",
    model: "Tech Support",
    date: "01 Jul 2025",
  },
];
