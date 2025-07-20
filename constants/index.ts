import { Brain, Gauge, HelpCircle, Bolt } from "lucide-react";
import { Dataset } from "@/components/project-dashboard/dataset-table/columns";
import { TModelDetail } from "@/lib/validations/model.schema";

// Import provider icons
import MicrosoftIcon from "@/public/icons/microsoft-icon.svg";
import MetaIcon from "@/public/icons/meta-icon.svg";
import BlackForestLabsIcon from "@/public/icons/black-forest-labs-flux.png";

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

// The availble models to show in the model selection node
export const availableModels: Record<string, TModelDetail> = {
  "phi-2": {
    display_name: "Phi-2",
    model_id: "microsoft/phi-2",
    description:
      "2.7B parameter model optimized for reasoning and code generation",
    parameters: "2.7B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["reasoning", "code", "chat"],
  },
  "phi-3-mini": {
    display_name: "Phi-3 Mini",
    model_id: "microsoft/Phi-3-mini-4k-instruct",
    description: "4B parameter lightweight model with 4k context window",
    parameters: "4B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["instruction-following", "chat", "efficient"],
  },
  "flux-kontext": {
    display_name: "FLUX.1 Kontext Dev",
    model_id: "black-forest-labs/FLUX.1-Kontext-dev",
    description:
      "Advanced text-to-image generation model with context understanding",
    parameters: "12B",
    provider: "Black Forest Labs",
    providerIcon: BlackForestLabsIcon,
    tags: ["text-to-image", "multimodal", "creative"],
  },
  "llama-3-8b": {
    display_name: "Llama 3 8B",
    model_id: "meta-llama/Llama-3-8B-Instruct",
    description:
      "8B parameter instruction-tuned model with strong reasoning capabilities",
    parameters: "8B",
    provider: "Meta",
    providerIcon: MetaIcon,
    tags: ["instruction-following", "reasoning", "chat"],
  },
  "DialoGPT-small": {
    display_name: "DialoGPT Small",
    model_id: "microsoft/DialoGPT-small",
    description: "Small model for chatbot conversations",
    parameters: "1.3B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["chatbot", "conversational"],
  },
};

// The available quantisations
export const availableQuantisations = {
  int4: {
    display_name: "int4",
    value: "int4",
  },
  int8: {
    display_name: "int8",
    value: "int8",
  },
};
