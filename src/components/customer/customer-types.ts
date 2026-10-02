export interface BookingRecord {
  id: number;
  lead_code: string;
  service_id: number;
  service_title: string;
  selling_price?: number;
  warranty_days?: number;
  brand_name?: string;
  city_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  problem_description: string;
  preferred_date?: string;
  preferred_time?: string;
  lead_fee?: number;
  status: string;
  assigned_partner_id?: number;
  partner_name?: string;
  partner_phone?: string;
  partner_rating?: number;
  partner_total_jobs?: number;
  job_id?: number;
  job_status?: string;
  completion_otp?: string;
  before_photo_url?: string;
  after_photo_url?: string;
  final_amount?: number;
  created_at: string;
  updated_at?: string;
}

export interface StatusConfigItem {
  label: string;
  badge: string;
  dot: string;
  step: number;
  desc: string;
}

export const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  NEW: {
    label: "Order Placed",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    step: 1,
    desc: "Your service request is received and logged in system",
  },
  MATCHING: {
    label: "Matching Technician",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500 animate-ping",
    step: 1,
    desc: "Locating nearest verified specialist in your locality",
  },
  ASSIGNED: {
    label: "Technician Dispatched",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    step: 2,
    desc: "Technician has accepted your booking and is preparing",
  },
  ACCEPTED: {
    label: "On The Way",
    badge: "bg-orange-50 text-orange-800 border-orange-200",
    dot: "bg-orange-500 animate-pulse",
    step: 2,
    desc: "Technician is travelling towards your doorstep location",
  },
  IN_PROGRESS: {
    label: "Repair in Progress",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500 animate-pulse",
    step: 3,
    desc: "Technician is diagnosing and repairing your appliance",
  },
  COMPLETED: {
    label: "Service Completed",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    step: 4,
    desc: "Repair tested, verified and completed successfully",
  },
  CANCELLED: {
    label: "Booking Cancelled",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    step: 0,
    desc: "This service booking was cancelled",
  },
};

export const getApplianceIcon = (title: string = "") => {
  const t = title.toLowerCase();
  if (t.includes("ac") || t.includes("air conditioner")) return "❄️";
  if (t.includes("washing") || t.includes("laundry")) return "🧺";
  if (t.includes("refrigerat") || t.includes("fridge")) return "🧊";
  if (t.includes("ro") || t.includes("purifier") || t.includes("water")) return "💧";
  if (t.includes("tv") || t.includes("television")) return "📺";
  if (t.includes("chimney") || t.includes("kitchen")) return "🍳";
  if (t.includes("microwave") || t.includes("oven")) return "♨️";
  if (t.includes("geyser") || t.includes("heater")) return "🚿";
  if (t.includes("inverter") || t.includes("battery")) return "⚡";
  if (t.includes("cctv") || t.includes("security")) return "📹";
  if (t.includes("computer") || t.includes("laptop")) return "💻";
  return "🛠️";
};
