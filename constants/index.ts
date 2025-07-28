import { Brain, Gauge, HelpCircle, Bolt } from "lucide-react";
import { Dataset } from "@/components/project-dashboard/dataset-table/columns";
import { TModelDetail } from "@/lib/validations/model.schema";
import { TQuantizationSchema } from "@/lib/validations/training.schema";

// Import provider icons
import MicrosoftIcon from "@/public/icons/microsoft-icon.svg";
import MetaIcon from "@/public/icons/meta-icon.svg";

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
      "2.7 B-parameter model optimised for compact reasoning and code tasks.",
    parameters: "2.7B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["reasoning", "code", "chat"],
  },
  "phi-3-mini": {
    display_name: "Phi-3 Mini 4K",
    model_id: "microsoft/Phi-3-mini-4k-instruct",
    description:
      "3.8 B-parameter lightweight model with a 4 K token context window.",
    parameters: "3.8B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["instruction-following", "chat", "efficient"],
  },
  "phi-3_5-mini": {
    display_name: "Phi-3.5 Mini",
    model_id: "microsoft/Phi-3.5-mini-instruct",
    description:
      "3.8 B-parameter Phi-3.5 model (128 K context) for high-quality reasoning. *Requires Transformers ≥ 4.43*.",
    parameters: "3.8B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["reasoning", "long-context", "chat"],
  },
  "llama-3.2-3b": {
    display_name: "Llama-3.2 3B Instruct",
    model_id: "meta-llama/Llama-3.2-3B-Instruct",
    description:
      "3 B-parameter multilingual instruction-tuned model with 128 K context.",
    parameters: "3B",
    provider: "Meta",
    providerIcon: MetaIcon,
    tags: ["multilingual", "chat", "long-context"],
  },
  "llama-3.2-1b": {
    display_name: "Llama-3.2 1B Instruct",
    model_id: "meta-llama/Llama-3.2-1B-Instruct",
    description:
      "1 B-parameter miniature Llama-3.2 model for edge or mobile use.",
    parameters: "1B",
    provider: "Meta",
    providerIcon: MetaIcon,
    tags: ["efficient", "multilingual", "chat"],
  },
  "DialoGPT-small": {
    display_name: "DialoGPT Small",
    model_id: "microsoft/DialoGPT-small",
    description:
      "1.3 B-parameter baseline model for conversational fine-tuning.",
    parameters: "1.3B",
    provider: "Microsoft",
    providerIcon: MicrosoftIcon,
    tags: ["chatbot", "conversational"],
  },
};

// The available quantisations
export const availableQuantisations: TQuantizationSchema[] = ["int4", "int8"];
