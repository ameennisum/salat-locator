export interface JamaatTimings {
  fajr: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  juma: string;
}

export interface Masjid {
  id: string;
  name: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  timings: JamaatTimings;
}

export const masjidData: Masjid[] = [
  {
    id: "1",
    name: "Masjid-e-Tooba",
    area: "Defence",
    address: "Block 9, Clifton, Defence Housing Authority, Karachi",
    lat: 24.8210,
    lng: 67.0324,
    timings: { fajr: "05:30", zuhr: "13:00", asr: "16:30", maghrib: "18:15", isha: "19:45", juma: "13:15" },
  },
  {
    id: "2",
    name: "Memon Masjid",
    area: "Saddar",
    address: "M.A. Jinnah Road, Saddar, Karachi",
    lat: 24.8556,
    lng: 67.0200,
    timings: { fajr: "05:25", zuhr: "13:00", asr: "16:30", maghrib: "18:10", isha: "19:40", juma: "13:00" },
  },
  {
    id: "3",
    name: "Masjid-e-Ibrahim",
    area: "North Nazimabad",
    address: "Block H, North Nazimabad, Karachi",
    lat: 24.9370,
    lng: 67.0350,
    timings: { fajr: "05:30", zuhr: "13:15", asr: "16:45", maghrib: "18:15", isha: "19:45", juma: "13:15" },
  },
  {
    id: "4",
    name: "Jamia Masjid Baitul Mukarram",
    area: "Gulshan-e-Iqbal",
    address: "Block 13-D/2, Gulshan-e-Iqbal, Karachi",
    lat: 24.9256,
    lng: 67.0867,
    timings: { fajr: "05:30", zuhr: "13:00", asr: "16:30", maghrib: "18:10", isha: "19:40", juma: "13:00" },
  },
  {
    id: "5",
    name: "Masjid Ayesha",
    area: "PECHS",
    address: "Block 2, PECHS, Karachi",
    lat: 24.8700,
    lng: 67.0500,
    timings: { fajr: "05:25", zuhr: "13:00", asr: "16:30", maghrib: "18:15", isha: "19:45", juma: "13:15" },
  },
  {
    id: "6",
    name: "Masjid Bilal",
    area: "Korangi",
    address: "Korangi Industrial Area, Karachi",
    lat: 24.8400,
    lng: 67.1300,
    timings: { fajr: "05:30", zuhr: "13:15", asr: "16:45", maghrib: "18:15", isha: "19:50", juma: "13:15" },
  },
  {
    id: "7",
    name: "Masjid-e-Quba",
    area: "Clifton",
    address: "Block 5, Clifton, Karachi",
    lat: 24.8150,
    lng: 67.0250,
    timings: { fajr: "05:25", zuhr: "13:00", asr: "16:30", maghrib: "18:10", isha: "19:40", juma: "13:00" },
  },
  {
    id: "8",
    name: "Darul Uloom Korangi Masjid",
    area: "Korangi",
    address: "Korangi No. 5, Karachi",
    lat: 24.8330,
    lng: 67.1280,
    timings: { fajr: "05:30", zuhr: "13:00", asr: "16:30", maghrib: "18:10", isha: "19:45", juma: "13:00" },
  },
  {
    id: "9",
    name: "Masjid-e-Noor",
    area: "Bahadurabad",
    address: "Bahadurabad, Karachi",
    lat: 24.8800,
    lng: 67.0600,
    timings: { fajr: "05:25", zuhr: "13:00", asr: "16:30", maghrib: "18:15", isha: "19:45", juma: "13:15" },
  },
  {
    id: "10",
    name: "Faizan-e-Madina",
    area: "Gulistan-e-Jauhar",
    address: "Block 12, Gulistan-e-Jauhar, Karachi",
    lat: 24.9170,
    lng: 67.1100,
    timings: { fajr: "05:30", zuhr: "13:15", asr: "16:45", maghrib: "18:15", isha: "19:50", juma: "13:15" },
  },
  {
    id: "11",
    name: "Masjid Al-Haram",
    area: "Tariq Road",
    address: "Tariq Road, PECHS Block 6, Karachi",
    lat: 24.8680,
    lng: 67.0560,
    timings: { fajr: "05:25", zuhr: "13:00", asr: "16:30", maghrib: "18:10", isha: "19:40", juma: "13:00" },
  },
  {
    id: "12",
    name: "Masjid Usman-e-Ghani",
    area: "Nazimabad",
    address: "Block 3, Nazimabad, Karachi",
    lat: 24.9200,
    lng: 67.0300,
    timings: { fajr: "05:30", zuhr: "13:15", asr: "16:45", maghrib: "18:15", isha: "19:45", juma: "13:15" },
  },
];
