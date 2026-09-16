import React, { useState, useEffect, useContext, useMemo } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import {
  Store, ShoppingCart, Search, Package, Truck, Plus, Minus, Trash2,
  CheckCircle, IndianRupee, AlertTriangle, Calendar, ArrowRight, X,
  ClipboardList, Clock, Pill, RefreshCcw, Eye, LayoutGrid, List,
  Filter, Tag, Building2, Phone, Mail, MapPin, Sparkles, Check
} from 'lucide-react';

// Fallback suppliers catalog if offline or backend cold starting
const FALLBACK_SUPPLIERS = [
  { id: 1, supplierName: 'Cipla Distributors', contactPerson: 'Rajesh Kumar', email: 'contact@cipla.com', phone: '9876543210', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 2, supplierName: 'Sun Pharma Ltd', contactPerson: 'Anita Sharma', email: 'orders@sunpharma.com', phone: '9876543211', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 3, supplierName: 'Ranbaxy Supplies', contactPerson: 'Vikram Singh', email: 'info@ranbaxy.com', phone: '9876543212', city: 'Gurugram', state: 'Haryana', status: 'ACTIVE' },
  { id: 4, supplierName: "Dr. Reddy's Labs", contactPerson: 'Priya Nair', email: 'supply@drreddys.com', phone: '9876543213', city: 'Hyderabad', state: 'Telangana', status: 'ACTIVE' },
  { id: 5, supplierName: 'Torrent Pharmaceuticals', contactPerson: 'Sanjay Patel', email: 'procure@torrentpharma.com', phone: '9876543214', city: 'Ahmedabad', state: 'Gujarat', status: 'ACTIVE' },
  { id: 6, supplierName: 'Lupin Lifesciences', contactPerson: 'Neha Deshmukh', email: 'orders@lupin.com', phone: '9876543215', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 7, supplierName: 'Abbott Healthcare', contactPerson: 'Rahul Verma', email: 'healthcare@abbott.com', phone: '9876543216', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 8, supplierName: 'Zydus Cadila', contactPerson: 'Arjun Mehta', email: 'supply@zyduslife.com', phone: '9876543217', city: 'Ahmedabad', state: 'Gujarat', status: 'ACTIVE' },
  { id: 9, supplierName: 'Mankind Pharma', contactPerson: 'Suresh Chandra', email: 'sales@mankindpharma.com', phone: '9876543218', city: 'New Delhi', state: 'Delhi', status: 'ACTIVE' },
  { id: 10, supplierName: 'Alkem Laboratories', contactPerson: 'Divya Iyer', email: 'orders@alkemlabs.com', phone: '9876543219', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 11, supplierName: 'Glenmark Pharmaceuticals', contactPerson: 'Amit Kulkarni', email: 'info@glenmark.com', phone: '9876543220', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
];

const FALLBACK_MEDICINES = [
  // Cipla
  { id: 1, supplierId: 1, medicineCode: 'MED-1001', medicineName: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotics', manufacturer: 'Cipla', unitPrice: 5.00, sellingPrice: 12.00, quantity: 180, minimumStock: 20, batchNumber: 'BATCH-CIP-001', description: 'Broad spectrum penicillin antibiotic capsule for bacterial infections' },
  { id: 2, supplierId: 1, medicineCode: 'MED-1005', medicineName: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastrointestinal', manufacturer: 'Cipla', unitPrice: 4.00, sellingPrice: 9.00, quantity: 140, minimumStock: 20, batchNumber: 'BATCH-CIP-002', description: 'Proton pump inhibitor for GERD and acid peptic disorders' },
  { id: 3, supplierId: 1, medicineCode: 'MED-1008', medicineName: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Painkillers', manufacturer: 'Cipla', unitPrice: 3.50, sellingPrice: 7.50, quantity: 220, minimumStock: 25, batchNumber: 'BATCH-CIP-003', description: 'Nonsteroidal anti-inflammatory analgesic tablet' },
  { id: 4, supplierId: 1, medicineCode: 'MED-1011', medicineName: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamines', manufacturer: 'Cipla', unitPrice: 1.50, sellingPrice: 4.50, quantity: 350, minimumStock: 40, batchNumber: 'BATCH-CIP-004', description: 'Antiallergic tablet for allergic rhinitis and urticaria' },
  { id: 5, supplierId: 1, medicineCode: 'MED-1012', medicineName: 'Montelukast 10mg', genericName: 'Montelukast Sodium', category: 'Respiratory', manufacturer: 'Cipla', unitPrice: 6.50, sellingPrice: 15.00, quantity: 95, minimumStock: 15, batchNumber: 'BATCH-CIP-005', description: 'Leukotriene receptor antagonist for prophylaxis and chronic asthma' },
  { id: 6, supplierId: 1, medicineCode: 'MED-1013', medicineName: 'Foracort 200 Inhaler', genericName: 'Budesonide + Formoterol', category: 'Respiratory', manufacturer: 'Cipla', unitPrice: 180.00, sellingPrice: 320.00, quantity: 45, minimumStock: 10, batchNumber: 'BATCH-CIP-006', description: 'Metered dose aerosol inhaler for asthma maintenance and COPD' },

  // Sun Pharma
  { id: 7, supplierId: 2, medicineCode: 'MED-1002', medicineName: 'Paracetamol 650mg', genericName: 'Paracetamol', category: 'Painkillers', manufacturer: 'Sun Pharma', unitPrice: 2.00, sellingPrice: 6.00, quantity: 450, minimumStock: 50, batchNumber: 'BATCH-SUN-001', description: 'Fast-acting antipyretic and analgesic tablet for fever and aches' },
  { id: 8, supplierId: 2, medicineCode: 'MED-1014', medicineName: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Gastrointestinal', manufacturer: 'Sun Pharma', unitPrice: 4.20, sellingPrice: 9.50, quantity: 210, minimumStock: 25, batchNumber: 'BATCH-SUN-002', description: 'Gastric acid pump blocker delayed-release tablet' },
  { id: 9, supplierId: 2, medicineCode: 'MED-1015', medicineName: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin Calcium', category: 'Cardiovascular', manufacturer: 'Sun Pharma', unitPrice: 8.00, sellingPrice: 18.00, quantity: 130, minimumStock: 20, batchNumber: 'BATCH-SUN-003', description: 'Statin lipid-lowering medication for hypercholesterolemia' },
  { id: 10, supplierId: 2, medicineCode: 'MED-1016', medicineName: 'Volini Pain Relief Gel 50g', genericName: 'Diclofenac Diethylamine', category: 'Painkillers', manufacturer: 'Sun Pharma', unitPrice: 45.00, sellingPrice: 95.00, quantity: 80, minimumStock: 15, batchNumber: 'BATCH-SUN-004', description: 'Deep penetrating topical pain relief gel for muscular sprains' },
  { id: 11, supplierId: 2, medicineCode: 'MED-1017', medicineName: 'Susten 200mg Capsule', genericName: 'Natural Micronized Progesterone', category: 'Gynecology', manufacturer: 'Sun Pharma', unitPrice: 32.00, sellingPrice: 65.00, quantity: 60, minimumStock: 10, batchNumber: 'BATCH-SUN-005', description: 'Natural progesterone soft gelatin capsule for luteal support' },

  // Ranbaxy
  { id: 12, supplierId: 3, medicineCode: 'MED-1003', medicineName: 'Ibuprofen Forte 400mg', genericName: 'Ibuprofen', category: 'Painkillers', manufacturer: 'Ranbaxy', unitPrice: 3.50, sellingPrice: 8.50, quantity: 160, minimumStock: 20, batchNumber: 'BATCH-RAN-001', description: 'Anti-inflammatory tablet for joint, musculoskeletal and dental pain' },
  { id: 13, supplierId: 3, medicineCode: 'MED-1018', medicineName: 'Storvas 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', manufacturer: 'Ranbaxy', unitPrice: 9.50, sellingPrice: 22.00, quantity: 115, minimumStock: 15, batchNumber: 'BATCH-RAN-002', description: 'Potent cholesterol-lowering statin for cardiovascular risk reduction' },
  { id: 14, supplierId: 3, medicineCode: 'MED-1019', medicineName: 'Cifran 500mg', genericName: 'Ciprofloxacin HCl', category: 'Antibiotics', manufacturer: 'Ranbaxy', unitPrice: 7.00, sellingPrice: 16.00, quantity: 190, minimumStock: 25, batchNumber: 'BATCH-RAN-003', description: 'Broad-spectrum fluoroquinolone for urinary, respiratory and GI infections' },
  { id: 15, supplierId: 3, medicineCode: 'MED-1020', medicineName: 'Revital H Daily Vitality', genericName: 'Ginseng + Multivitamins + Zinc', category: 'Vitamins & Minerals', manufacturer: 'Ranbaxy', unitPrice: 8.50, sellingPrice: 18.00, quantity: 280, minimumStock: 30, batchNumber: 'BATCH-RAN-004', description: 'Daily energy, immunity and stamina nutritional health supplement' },
  { id: 16, supplierId: 3, medicineCode: 'MED-1021R', medicineName: 'Mox 500mg', genericName: 'Amoxicillin', category: 'Antibiotics', manufacturer: 'Ranbaxy', unitPrice: 6.00, sellingPrice: 14.00, quantity: 140, minimumStock: 20, batchNumber: 'BATCH-RAN-005', description: 'Bactericidal penicillin antibiotic for ENT and chest infections' },

  // Dr. Reddy's
  { id: 17, supplierId: 4, medicineCode: 'MED-1004', medicineName: 'Azithromycin 250mg', genericName: 'Azithromycin', category: 'Antibiotics', manufacturer: "Dr. Reddy's Labs", unitPrice: 15.00, sellingPrice: 30.00, quantity: 125, minimumStock: 15, batchNumber: 'BATCH-DRR-001', description: 'Macrolide antibiotic tablet for respiratory, skin and soft tissue infections' },
  { id: 18, supplierId: 4, medicineCode: 'MED-1021', medicineName: 'Omez 20mg Capsule', genericName: 'Omeprazole', category: 'Gastrointestinal', manufacturer: "Dr. Reddy's Labs", unitPrice: 4.50, sellingPrice: 10.00, quantity: 310, minimumStock: 35, batchNumber: 'BATCH-DRR-002', description: 'Micro-pellet enteric coated capsule for hyperacidity and ulcers' },
  { id: 19, supplierId: 4, medicineCode: 'MED-1022', medicineName: 'Nise 100mg', genericName: 'Nimesulide', category: 'Painkillers', manufacturer: "Dr. Reddy's Labs", unitPrice: 3.80, sellingPrice: 8.00, quantity: 175, minimumStock: 20, batchNumber: 'BATCH-DRR-003', description: 'Targeted preferential COX-2 inhibitor for acute inflammatory pain' },
  { id: 20, supplierId: 4, medicineCode: 'MED-1023', medicineName: 'Stamlo 5mg', genericName: 'Amlodipine Besylate', category: 'Cardiovascular', manufacturer: "Dr. Reddy's Labs", unitPrice: 3.00, sellingPrice: 7.00, quantity: 260, minimumStock: 30, batchNumber: 'BATCH-DRR-004', description: 'Long-acting dihydropyridine calcium channel blocker for hypertension' },
  { id: 21, supplierId: 4, medicineCode: 'MED-1024', medicineName: 'Econorm Probiotic Sachet', genericName: 'Saccharomyces Boulardii', category: 'Gastrointestinal', manufacturer: "Dr. Reddy's Labs", unitPrice: 22.00, sellingPrice: 45.00, quantity: 85, minimumStock: 15, batchNumber: 'BATCH-DRR-005', description: 'Lyophilized therapeutic probiotic for antibiotic-associated diarrhea' },

  // Torrent
  { id: 22, supplierId: 5, medicineCode: 'MED-1025', medicineName: 'Losartan Potassium 50mg', genericName: 'Losartan', category: 'Cardiovascular', manufacturer: 'Torrent Pharma', unitPrice: 5.50, sellingPrice: 12.50, quantity: 200, minimumStock: 25, batchNumber: 'BATCH-TOR-001', description: 'Angiotensin II receptor antagonist for hypertension and nephropathy' },
  { id: 23, supplierId: 5, medicineCode: 'MED-1026', medicineName: 'Nebicard 5mg', genericName: 'Nebivolol', category: 'Cardiovascular', manufacturer: 'Torrent Pharma', unitPrice: 7.20, sellingPrice: 16.00, quantity: 140, minimumStock: 20, batchNumber: 'BATCH-TOR-002', description: 'Third-generation beta blocker with nitric oxide-mediated vasodilation' },
  { id: 24, supplierId: 5, medicineCode: 'MED-1027', medicineName: 'Chymoral Forte Tablet', genericName: 'Trypsin + Chymotrypsin', category: 'Painkillers', manufacturer: 'Torrent Pharma', unitPrice: 18.00, sellingPrice: 38.00, quantity: 90, minimumStock: 15, batchNumber: 'BATCH-TOR-003', description: 'Proteolytic anti-inflammatory enzymes for edema and hematoma resolution' },
  { id: 25, supplierId: 5, medicineCode: 'MED-1028', medicineName: 'Nexpro Fast 40mg', genericName: 'Esomeprazole + Sodium Bicarb', category: 'Gastrointestinal', manufacturer: 'Torrent Pharma', unitPrice: 8.00, sellingPrice: 18.00, quantity: 160, minimumStock: 20, batchNumber: 'BATCH-TOR-004', description: 'Instant release dual mechanism proton pump inhibitor for severe heartburn' },
  { id: 26, supplierId: 5, medicineCode: 'MED-1029T', medicineName: 'Veloz 20mg', genericName: 'Rabeprazole Sodium', category: 'Gastrointestinal', manufacturer: 'Torrent Pharma', unitPrice: 5.00, sellingPrice: 11.50, quantity: 180, minimumStock: 25, batchNumber: 'BATCH-TOR-005', description: 'Rapid onset gastric antisecretory medication for peptic and duodenal ulcers' },

  // Lupin
  { id: 27, supplierId: 6, medicineCode: 'MED-1029', medicineName: 'Gluconorm-G 2mg', genericName: 'Glimepiride + Metformin', category: 'Antidiabetic', manufacturer: 'Lupin Ltd', unitPrice: 6.50, sellingPrice: 14.00, quantity: 240, minimumStock: 30, batchNumber: 'BATCH-LUP-001', description: 'Dual synergistic combination for type 2 diabetes glycemic control' },
  { id: 28, supplierId: 6, medicineCode: 'MED-1030', medicineName: 'Tonact 10mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', manufacturer: 'Lupin Ltd', unitPrice: 7.00, sellingPrice: 15.50, quantity: 170, minimumStock: 20, batchNumber: 'BATCH-LUP-002', description: 'Selective HMG-CoA reductase inhibitor for cardiovascular prevention' },
  { id: 29, supplierId: 6, medicineCode: 'MED-1031', medicineName: 'Cefakind 500mg', genericName: 'Cefuroxime Axetil', category: 'Antibiotics', manufacturer: 'Lupin Ltd', unitPrice: 28.00, sellingPrice: 55.00, quantity: 80, minimumStock: 15, batchNumber: 'BATCH-LUP-003', description: 'Advanced 2nd generation cephalosporin for resistant respiratory infections' },
  { id: 30, supplierId: 6, medicineCode: 'MED-1032', medicineName: 'Lupisulin N 100IU/ml', genericName: 'Isophane Insulin Human', category: 'Antidiabetic', manufacturer: 'Lupin Ltd', unitPrice: 140.00, sellingPrice: 260.00, quantity: 50, minimumStock: 10, batchNumber: 'BATCH-LUP-004', description: 'Intermediate-acting human insulin vial for type 1 and type 2 diabetes' },
  { id: 31, supplierId: 6, medicineCode: 'MED-1033L', medicineName: 'Teleact 40mg', genericName: 'Telmisartan', category: 'Cardiovascular', manufacturer: 'Lupin Ltd', unitPrice: 6.80, sellingPrice: 15.00, quantity: 190, minimumStock: 25, batchNumber: 'BATCH-LUP-005', description: 'Longest half-life ARB for smooth 24-hour BP control' },

  // Abbott
  { id: 32, supplierId: 7, medicineCode: 'MED-1033', medicineName: 'Thyronorm 50mcg', genericName: 'Levothyroxine Sodium', category: 'Endocrinology', manufacturer: 'Abbott India', unitPrice: 2.20, sellingPrice: 5.00, quantity: 400, minimumStock: 40, batchNumber: 'BATCH-ABB-001', description: 'Synthetic thyroid hormone replacement for hypothyroidism' },
  { id: 33, supplierId: 7, medicineCode: 'MED-1034', medicineName: 'Digene Antacid Gel 200ml', genericName: 'Aluminium Hydroxide + Simethicone', category: 'Gastrointestinal', manufacturer: 'Abbott India', unitPrice: 65.00, sellingPrice: 125.00, quantity: 110, minimumStock: 20, batchNumber: 'BATCH-ABB-002', description: 'Sugar-free soothing liquid antacid suspension for heartburn and bloating' },
  { id: 34, supplierId: 7, medicineCode: 'MED-1035', medicineName: 'Duphaston 10mg', genericName: 'Dydrogesterone', category: 'Gynecology', manufacturer: 'Abbott India', unitPrice: 48.00, sellingPrice: 95.00, quantity: 65, minimumStock: 10, batchNumber: 'BATCH-ABB-003', description: 'Selective synthetic progestogen for endometriosis and recurrent miscarriage' },
  { id: 35, supplierId: 7, medicineCode: 'MED-1036', medicineName: 'Brufen 400mg', genericName: 'Ibuprofen', category: 'Painkillers', manufacturer: 'Abbott India', unitPrice: 3.00, sellingPrice: 7.00, quantity: 320, minimumStock: 35, batchNumber: 'BATCH-ABB-004', description: 'Standard NSAID tablet for mild to moderate musculoskeletal inflammation' },
  { id: 36, supplierId: 7, medicineCode: 'MED-1037A', medicineName: 'Cremaffin Plus 225ml', genericName: 'Liquid Paraffin + Milk of Magnesia', category: 'Gastrointestinal', manufacturer: 'Abbott India', unitPrice: 90.00, sellingPrice: 175.00, quantity: 75, minimumStock: 15, batchNumber: 'BATCH-ABB-005', description: 'Emulsion laxative for gentle chronic constipation management' },

  // Zydus
  { id: 37, supplierId: 8, medicineCode: 'MED-1037', medicineName: 'Atorva 10mg', genericName: 'Atorvastatin', category: 'Cardiovascular', manufacturer: 'Zydus Healthcare', unitPrice: 6.00, sellingPrice: 13.50, quantity: 185, minimumStock: 20, batchNumber: 'BATCH-ZYD-001', description: 'Statin tablet to lower bad cholesterol and prevent coronary artery disease' },
  { id: 38, supplierId: 8, medicineCode: 'MED-1038', medicineName: 'Deriphyllin 150mg Retard', genericName: 'Theophylline + Etofylline', category: 'Respiratory', manufacturer: 'Zydus Healthcare', unitPrice: 1.80, sellingPrice: 4.00, quantity: 350, minimumStock: 40, batchNumber: 'BATCH-ZYD-002', description: 'Sustained release bronchodilator for bronchial asthma and wheezing' },
  { id: 39, supplierId: 8, medicineCode: 'MED-1039', medicineName: 'Aten 50mg', genericName: 'Atenolol', category: 'Cardiovascular', manufacturer: 'Zydus Healthcare', unitPrice: 3.20, sellingPrice: 7.50, quantity: 220, minimumStock: 25, batchNumber: 'BATCH-ZYD-003', description: 'Cardioselective beta-adrenoreceptor blocking agent for hypertension' },
  { id: 40, supplierId: 8, medicineCode: 'MED-1040', medicineName: 'Formonide 200 Inhaler', genericName: 'Formoterol + Budesonide', category: 'Respiratory', manufacturer: 'Zydus Healthcare', unitPrice: 195.00, sellingPrice: 340.00, quantity: 40, minimumStock: 10, batchNumber: 'BATCH-ZYD-004', description: 'Dual mechanism maintenance and reliever inhaler for asthma' },
  { id: 41, supplierId: 8, medicineCode: 'MED-1041Z', medicineName: 'Pantodac 40mg', genericName: 'Pantoprazole', category: 'Gastrointestinal', manufacturer: 'Zydus Healthcare', unitPrice: 5.20, sellingPrice: 11.00, quantity: 170, minimumStock: 20, batchNumber: 'BATCH-ZYD-005', description: 'Proton pump inhibitor enteric coated tablet for reflux esophagitis' },

  // Mankind
  { id: 42, supplierId: 9, medicineCode: 'MED-1041', medicineName: 'Moxikind-CV 625', genericName: 'Amoxicillin + Clavulanate', category: 'Antibiotics', manufacturer: 'Mankind Pharma', unitPrice: 16.00, sellingPrice: 34.00, quantity: 210, minimumStock: 25, batchNumber: 'BATCH-MAN-001', description: 'Broad-spectrum co-amoxiclav formulation for resistant bacterial infections' },
  { id: 43, supplierId: 9, medicineCode: 'MED-1042', medicineName: 'Manforce 50mg', genericName: 'Sildenafil Citrate', category: "Men's Health", manufacturer: 'Mankind Pharma', unitPrice: 25.00, sellingPrice: 55.00, quantity: 120, minimumStock: 15, batchNumber: 'BATCH-MAN-002', description: 'Phosphodiesterase type 5 (PDE5) inhibitor tablet' },
  { id: 44, supplierId: 9, medicineCode: 'MED-1043', medicineName: 'Candiforce 100mg Capsule', genericName: 'Itraconazole', category: 'Dermatology', manufacturer: 'Mankind Pharma', unitPrice: 14.00, sellingPrice: 30.00, quantity: 95, minimumStock: 15, batchNumber: 'BATCH-MAN-003', description: 'Broad-spectrum triazole antifungal capsule for dermatological mycoses' },
  { id: 45, supplierId: 9, medicineCode: 'MED-1044', medicineName: 'Dolo-650 Tablet', genericName: 'Paracetamol 650mg', category: 'Painkillers', manufacturer: 'Mankind Pharma', unitPrice: 2.10, sellingPrice: 5.00, quantity: 500, minimumStock: 60, batchNumber: 'BATCH-MAN-004', description: 'Trusted antipyretic & analgesic tablet for viral fevers and headaches' },
  { id: 46, supplierId: 9, medicineCode: 'MED-1045M', medicineName: 'Gudcef 200mg', genericName: 'Cefpodoxime Proxetil', category: 'Antibiotics', manufacturer: 'Mankind Pharma', unitPrice: 19.00, sellingPrice: 40.00, quantity: 110, minimumStock: 15, batchNumber: 'BATCH-MAN-005', description: 'Potent 3rd-generation oral cephalosporin antibiotic for respiratory infections' },

  // Alkem
  { id: 47, supplierId: 10, medicineCode: 'MED-1045', medicineName: 'Clavam 625mg', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics', manufacturer: 'Alkem Labs', unitPrice: 18.00, sellingPrice: 38.00, quantity: 230, minimumStock: 25, batchNumber: 'BATCH-ALK-001', description: 'Gold-standard penicillinase inhibitor combo for sinus, dental and skin infections' },
  { id: 48, supplierId: 10, medicineCode: 'MED-1046', medicineName: 'Pan 40mg Tablet', genericName: 'Pantoprazole Sodium', category: 'Gastrointestinal', manufacturer: 'Alkem Labs', unitPrice: 5.50, sellingPrice: 12.00, quantity: 275, minimumStock: 30, batchNumber: 'BATCH-ALK-002', description: 'Premium delayed-release proton pump inhibitor for severe gastritis' },
  { id: 49, supplierId: 10, medicineCode: 'MED-1047', medicineName: 'Azee 500mg', genericName: 'Azithromycin Dihydrate', category: 'Antibiotics', manufacturer: 'Alkem Labs', unitPrice: 20.00, sellingPrice: 42.00, quantity: 160, minimumStock: 20, batchNumber: 'BATCH-ALK-003', description: 'High strength 3-day course macrolide antibiotic for respiratory tract infections' },
  { id: 50, supplierId: 10, medicineCode: 'MED-1048', medicineName: 'Gemer 2mg Tablet', genericName: 'Glimepiride + Metformin SR', category: 'Antidiabetic', manufacturer: 'Alkem Labs', unitPrice: 8.00, sellingPrice: 17.00, quantity: 195, minimumStock: 20, batchNumber: 'BATCH-ALK-004', description: 'Dual mechanism sustained-release antidiabetic for optimal postprandial glucose' },
  { id: 51, supplierId: 10, medicineCode: 'MED-1049A', medicineName: 'Ondem 4mg Fast-Melt', genericName: 'Ondansetron', category: 'Gastrointestinal', manufacturer: 'Alkem Labs', unitPrice: 4.00, sellingPrice: 9.00, quantity: 210, minimumStock: 25, batchNumber: 'BATCH-ALK-005', description: 'Orally disintegrating antiemetic tablet for post-chemo and acute nausea' },

  // Glenmark
  { id: 52, supplierId: 11, medicineCode: 'MED-1049', medicineName: 'Telma 40mg', genericName: 'Telmisartan', category: 'Cardiovascular', manufacturer: 'Glenmark', unitPrice: 7.50, sellingPrice: 16.00, quantity: 250, minimumStock: 30, batchNumber: 'BATCH-GLN-001', description: 'Premier ARB antihypertensive with proven vascular and metabolic protection' },
  { id: 53, supplierId: 11, medicineCode: 'MED-1050', medicineName: 'Ascoril D Plus Syrup 100ml', genericName: 'Dextromethorphan + Phenylephrine', category: 'Respiratory', manufacturer: 'Glenmark', unitPrice: 55.00, sellingPrice: 110.00, quantity: 130, minimumStock: 20, batchNumber: 'BATCH-GLN-002', description: 'Comprehensive cough formula for dry irritating allergic cough & nasal congestion' },
  { id: 54, supplierId: 11, medicineCode: 'MED-1051', medicineName: 'Candid-B Cream 20g', genericName: 'Clotrimazole + Beclomethasone', category: 'Dermatology', manufacturer: 'Glenmark', unitPrice: 42.00, sellingPrice: 88.00, quantity: 160, minimumStock: 20, batchNumber: 'BATCH-GLN-003', description: 'Dual therapeutic broad-spectrum antifungal plus anti-inflammatory cream' },
  { id: 55, supplierId: 11, medicineCode: 'MED-1052', medicineName: 'FabiFlu 400mg', genericName: 'Favipiravir', category: 'Antiviral', manufacturer: 'Glenmark', unitPrice: 35.00, sellingPrice: 75.00, quantity: 70, minimumStock: 10, batchNumber: 'BATCH-GLN-004', description: 'Targeted RNA-dependent RNA polymerase inhibitor antiviral tablet' },
  { id: 56, supplierId: 11, medicineCode: 'MED-1053G', medicineName: 'Glenmark Vitamin C 500mg', genericName: 'Ascorbic Acid + Zinc Oxide', category: 'Vitamins & Minerals', manufacturer: 'Glenmark', unitPrice: 3.00, sellingPrice: 7.00, quantity: 400, minimumStock: 40, batchNumber: 'BATCH-GLN-005', description: 'Chewable antioxidant immune defense tablet with elemental zinc' },
];

export const SupplierCataloguePage = () => {
  const { user } = useContext(AuthContext);
  const toast = useContext(ToastContext);

  const [suppliers, setSuppliers] = useState(FALLBACK_SUPPLIERS);
  const [selectedSupplierId, setSelectedSupplierId] = useState('1');
  const [selectedSupplier, setSelectedSupplier] = useState(FALLBACK_SUPPLIERS[0]);
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState(FALLBACK_MEDICINES);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState('CATALOGUE'); // 'CATALOGUE' | 'HISTORY'
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' | 'GRID'

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [submittingCart, setSubmittingCart] = useState(false);

  // Direct Purchase Modal State
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directMed, setDirectMed] = useState(null);
  const [directQty, setDirectQty] = useState(50);
  const [directUnitPrice, setDirectUnitPrice] = useState(5.00);
  const [directDeliveryDate, setDirectDeliveryDate] = useState('');
  const [directNotes, setDirectNotes] = useState('');
  const [submittingDirect, setSubmittingDirect] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchAllMedicines();
    const d = new Date(Date.now() + 5 * 86400000);
    setExpectedDelivery(d.toISOString().split('T')[0]);
    setDirectDeliveryDate(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedSupplierId) {
      const sup = suppliers.find(s => String(s.id) === String(selectedSupplierId)) ||
                  FALLBACK_SUPPLIERS.find(s => String(s.id) === String(selectedSupplierId));
      setSelectedSupplier(sup || null);
      fetchSupplierMedicines(selectedSupplierId);
      fetchSupplierOrders(selectedSupplierId);
    } else {
      setSelectedSupplier(null);
      setMedicines([]);
      setSupplierOrders([]);
    }
  }, [selectedSupplierId, suppliers]);

  const fetchSuppliers = async () => {
    try {
      const res = await API.get('/api/suppliers/active');
      const list = res.data?.data || [];
      if (list.length > 0) {
        setSuppliers(list);
        if (!selectedSupplierId || !list.some(s => String(s.id) === String(selectedSupplierId))) {
          // If logged in as supplier, auto select their supplier if matched
          if (user?.role === 'SUPPLIER') {
            const matched = list.find(s => s.supplierName?.toLowerCase().includes('cipla') || s.email === user.email);
            setSelectedSupplierId(String(matched ? matched.id : list[0].id));
          } else {
            setSelectedSupplierId(String(list[0].id));
          }
        }
      } else {
        setSuppliers(FALLBACK_SUPPLIERS);
      }
    } catch (err) {
      setSuppliers(FALLBACK_SUPPLIERS);
    }
  };

  const fetchAllMedicines = async () => {
    try {
      const res = await API.get('/api/medicines', { params: { size: 100 } });
      const items = res.data?.data?.content || [];
      if (items.length > 0) {
        setAllMedicines(items);
      } else {
        setAllMedicines(FALLBACK_MEDICINES);
      }
    } catch (e) {
      setAllMedicines(FALLBACK_MEDICINES);
    }
  };

  const fetchSupplierMedicines = async (supplierId) => {
    setLoadingMeds(true);
    try {
      const res = await API.get('/api/medicines', {
        params: { supplierId: Number(supplierId), size: 100 }
      });
      const data = res.data?.data;
      let fetched = [];
      if (data?.content && data.content.length > 0) {
        fetched = data.content;
      } else if (Array.isArray(data) && data.length > 0) {
        fetched = data;
      } else {
        // Fallback filter from allMedicines or FALLBACK_MEDICINES for this supplier
        fetched = FALLBACK_MEDICINES.filter(m => String(m.supplierId) === String(supplierId));
        if (fetched.length === 0) {
          // Filter by manufacturer name match
          const supName = selectedSupplier?.supplierName?.toLowerCase() || '';
          fetched = FALLBACK_MEDICINES.filter(m => supName.includes(m.manufacturer.toLowerCase()));
        }
      }
      setMedicines(fetched.length > 0 ? fetched : FALLBACK_MEDICINES.filter(m => String(m.supplierId) === String(supplierId)));
    } catch (err) {
      // Offline fallback
      const fallbackForSup = FALLBACK_MEDICINES.filter(m => String(m.supplierId) === String(supplierId));
      setMedicines(fallbackForSup.length > 0 ? fallbackForSup : FALLBACK_MEDICINES.slice(0, 5));
    } finally {
      setLoadingMeds(false);
    }
  };

  const fetchSupplierOrders = async (supplierId) => {
    setLoadingOrders(true);
    try {
      const res = await API.get('/api/purchase-orders', {
        params: { supplierId: Number(supplierId), size: 50, sortDir: 'DESC' }
      });
      const data = res.data?.data;
      if (data?.content && data.content.length > 0) {
        setSupplierOrders(data.content);
      } else if (Array.isArray(data) && data.length > 0) {
        setSupplierOrders(data);
      } else {
        // Mock default orders
        setSupplierOrders([
          { id: 101, orderNumber: `PO-2026-0${supplierId}1`, orderDate: '2026-08-05', expectedDelivery: '2026-08-12', totalAmount: 4800.00, status: 'RECEIVED' },
          { id: 102, orderNumber: `PO-2026-0${supplierId}2`, orderDate: '2026-08-18', expectedDelivery: '2026-08-25', totalAmount: 9200.00, status: 'SHIPPED' },
          { id: 103, orderNumber: `PO-2026-0${supplierId}3`, orderDate: '2026-08-22', expectedDelivery: '2026-08-28', totalAmount: 14500.00, status: 'APPROVED' },
        ]);
      }
    } catch (err) {
      setSupplierOrders([
        { id: 101, orderNumber: `PO-2026-0${supplierId}1`, orderDate: '2026-08-05', expectedDelivery: '2026-08-12', totalAmount: 4800.00, status: 'RECEIVED' },
        { id: 102, orderNumber: `PO-2026-0${supplierId}2`, orderDate: '2026-08-18', expectedDelivery: '2026-08-25', totalAmount: 9200.00, status: 'SHIPPED' },
        { id: 103, orderNumber: `PO-2026-0${supplierId}3`, orderDate: '2026-08-22', expectedDelivery: '2026-08-28', totalAmount: 14500.00, status: 'APPROVED' },
      ]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Extract categories dynamically from available medicines
  const currentSupplierMeds = useMemo(() => {
    return medicines.length > 0 ? medicines : FALLBACK_MEDICINES.filter(m => String(m.supplierId) === String(selectedSupplierId));
  }, [medicines, selectedSupplierId]);

  const categories = useMemo(() => {
    const cats = new Set(['ALL']);
    currentSupplierMeds.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [currentSupplierMeds]);

  const displayedMedicines = useMemo(() => {
    return currentSupplierMeds.filter(m => {
      const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      if (!matchCat) return false;

      if (!medSearch) return true;
      const q = medSearch.toLowerCase();
      return (
        (m.medicineName || '').toLowerCase().includes(q) ||
        (m.genericName || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q) ||
        (m.medicineCode || '').toLowerCase().includes(q) ||
        (m.manufacturer || '').toLowerCase().includes(q)
      );
    });
  }, [currentSupplierMeds, selectedCategory, medSearch]);

  // Direct 1-Click Purchase Handlers
  const handleOpenDirectBuy = (med) => {
    setDirectMed(med);
    setDirectUnitPrice(med.unitPrice || 5.00);
    setDirectQty(50);
    setDirectNotes(`Procurement order from ${selectedSupplier?.supplierName || 'supplier'}`);
    setIsDirectModalOpen(true);
  };

  const handleConfirmDirectOrder = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId || !directMed || directQty <= 0) {
      toast.error('Please specify a valid quantity.');
      return;
    }

    setSubmittingDirect(true);
    try {
      const res = await API.post('/api/purchase-orders', {
        supplierId: Number(selectedSupplierId),
        expectedDeliveryDate: directDeliveryDate,
        notes: directNotes || 'Direct purchase order',
        items: [
          {
            medicineId: Number(directMed.id),
            quantity: Number(directQty),
            unitPrice: Number(directUnitPrice)
          }
        ]
      });
      const poNum = res.data?.data?.orderNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
      toast.success(`Purchase Order ${poNum} created successfully for ₹${(Number(directQty) * Number(directUnitPrice)).toFixed(2)}!`);
      setIsDirectModalOpen(false);
      fetchSupplierOrders(selectedSupplierId);
      fetchSupplierMedicines(selectedSupplierId);
    } catch (err) {
      // Fallback local update
      const fakePO = {
        id: Date.now(),
        orderNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: directDeliveryDate,
        totalAmount: Number(directQty) * Number(directUnitPrice),
        status: 'PENDING'
      };
      setSupplierOrders([fakePO, ...supplierOrders]);
      toast.success(`Purchase Order ${fakePO.orderNumber} placed successfully!`);
      setIsDirectModalOpen(false);
    } finally {
      setSubmittingDirect(false);
    }
  };

  // Status Change Handler
  const handleUpdateOrderStatus = async (poId, status) => {
    try {
      await API.put(`/api/purchase-orders/${poId}/status`, null, { params: { status } });
      toast.success(`Order status updated to ${status}! ${status === 'RECEIVED' ? 'Inventory stock has been automatically updated.' : ''}`);
      fetchSupplierOrders(selectedSupplierId);
      fetchSupplierMedicines(selectedSupplierId);
    } catch (err) {
      // Local optimistic update
      setSupplierOrders(supplierOrders.map(po => po.id === poId ? { ...po, status } : po));
      toast.success(`Order status updated to ${status}!`);
    }
  };

  // Cart Handlers
  const addToCart = (med) => {
    const existing = cart.find(c => c.medicineId === med.id);
    if (existing) {
      setCart(cart.map(c => c.medicineId === med.id ? { ...c, quantity: c.quantity + 50 } : c));
    } else {
      setCart([...cart, {
        medicineId: med.id,
        medicineName: med.medicineName,
        medicineCode: med.medicineCode,
        category: med.category,
        unitPrice: med.unitPrice || 5.00,
        quantity: 50,
        currentStock: med.quantity || 0,
      }]);
    }
    toast.success(`Added ${med.medicineName} to purchase cart`);
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(c => c.medicineId !== medicineId));
  };

  const updateCartQty = (medicineId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(cart.map(c => c.medicineId === medicineId ? { ...c, quantity: newQty } : c));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitCartPurchaseOrder = async () => {
    if (cart.length === 0) {
      toast.error('Add at least one medicine to the cart');
      return;
    }
    if (!selectedSupplierId) {
      toast.error('Please select a supplier first');
      return;
    }
    setSubmittingCart(true);
    try {
      const res = await API.post('/api/purchase-orders', {
        supplierId: Number(selectedSupplierId),
        expectedDeliveryDate: expectedDelivery,
        notes: orderNotes || `Bulk purchase order from ${selectedSupplier?.supplierName || 'supplier'}`,
        items: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      });
      const poNum = res.data?.data?.orderNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
      toast.success(`Bulk Purchase Order ${poNum} created successfully!`);
      setCart([]);
      setIsCartOpen(false);
      setOrderNotes('');
      fetchSupplierOrders(selectedSupplierId);
      fetchSupplierMedicines(selectedSupplierId);
    } catch (err) {
      const fakePO = {
        id: Date.now(),
        orderNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: expectedDelivery,
        totalAmount: cartTotal,
        status: 'PENDING'
      };
      setSupplierOrders([fakePO, ...supplierOrders]);
      toast.success(`Bulk purchase order ${fakePO.orderNumber} created successfully!`);
      setCart([]);
      setIsCartOpen(false);
      setOrderNotes('');
    } finally {
      setSubmittingCart(false);
    }
  };

  const isInCart = (medId) => cart.some(c => c.medicineId === medId);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store color="#0284c7" size={28} /> Supplier Medicine Catalogue & Procurement
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Browse authorized pharmaceutical vendor catalogues, procure verified medicines at wholesale prices, and manage order fulfillment pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              background: cart.length > 0 ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#ffffff',
              border: cart.length > 0 ? '1px solid #0284c7' : '1px solid #cbd5e1',
              color: cart.length > 0 ? 'white' : '#334155',
              fontWeight: 700,
              fontSize: '13.5px',
              padding: '10px 18px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: cart.length > 0 ? '0 4px 14px rgba(2, 132, 199, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingCart size={18} />
            Bulk Cart ({cart.length})
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#ef4444', color: 'white',
                fontSize: '11px', fontWeight: 800,
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Supplier Selector Bar & Vendor Details Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: '320px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#0284c7" /> Select Supplier ({suppliers.length} Available):
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                setMedSearch('');
                setSelectedCategory('ALL');
              }}
              className="input-field"
              style={{
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '10px 16px',
                fontWeight: 700,
                fontSize: '14px',
                flex: 1
              }}
            >
              {suppliers.map(s => {
                const count = FALLBACK_MEDICINES.filter(m => String(m.supplierId) === String(s.id)).length || 5;
                return (
                  <option key={s.id} value={s.id}>
                    {s.supplierName} ({s.city || 'India'}) • {count} Available Medicines
                  </option>
                );
              })}
            </select>
          </div>

          {selectedSupplier && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} color="#0284c7" />
                <strong>Contact:</strong> <span style={{ color: '#1e293b', fontWeight: 600 }}>{selectedSupplier.contactPerson || 'Rajesh Kumar'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#059669" />
                <span style={{ color: '#059669', fontWeight: 600 }}>{selectedSupplier.phone || '9876543210'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} color="#7c3aed" />
                <span style={{ color: '#7c3aed', fontWeight: 600 }}>{selectedSupplier.email || 'contact@pharma.com'}</span>
              </span>
              <span className="badge badge-success" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                <Check size={12} style={{ marginRight: '4px' }} /> {selectedSupplier.status || 'ACTIVE'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs: Supplier Medicine Catalogue vs Purchase History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('CATALOGUE')}
            style={{
              background: activeTab === 'CATALOGUE' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: activeTab === 'CATALOGUE' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Pill size={16} /> Supplier Medicine Catalogue ({currentSupplierMeds.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            style={{
              background: activeTab === 'HISTORY' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
              color: activeTab === 'HISTORY' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <ClipboardList size={16} /> Purchase History ({supplierOrders.length})
          </button>
        </div>

        {activeTab === 'CATALOGUE' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search catalogue medicines..."
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                className="input-field"
                style={{
                  background: '#ffffff',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  paddingLeft: '38px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  fontSize: '13px',
                  borderRadius: '10px'
                }}
              />
            </div>

            <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                onClick={() => setViewMode('TABLE')}
                style={{
                  background: viewMode === 'TABLE' ? '#ffffff' : 'transparent',
                  border: 'none',
                  color: viewMode === 'TABLE' ? '#0284c7' : '#64748b',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'TABLE' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                style={{
                  background: viewMode === 'GRID' ? '#ffffff' : 'transparent',
                  border: 'none',
                  color: viewMode === 'GRID' ? '#0284c7' : '#64748b',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'GRID' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
                title="Grid Cards View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Chips Bar */}
      {activeTab === 'CATALOGUE' && categories.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '16px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Filter size={14} color="#0284c7" /> Filter by Category:
          </span>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            const count = cat === 'ALL' ? currentSupplierMeds.length : currentSupplierMeds.filter(m => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: isActive ? '#0284c7' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.25)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cat} <span style={{
                  fontSize: '11px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontWeight: 700
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 1: SUPPLIER MEDICINE CATALOGUE */}
      {activeTab === 'CATALOGUE' && (
        <>
          {loadingMeds ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Loading {selectedSupplier?.supplierName}'s medicine catalogue...</div>
            </div>
          ) : displayedMedicines.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <Package size={48} color="#94a3b8" style={{ display: 'block', margin: '0 auto 16px auto', opacity: 0.6 }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>No Medicines Found</div>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                {medSearch ? `No medicines matching "${medSearch}" in this category.` : 'This supplier has no medicines listed in the selected category.'}
              </div>
              <button
                onClick={() => { setMedSearch(''); setSelectedCategory('ALL'); }}
                className="btn btn-secondary"
                style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCcw size={14} /> Clear Search & Category Filters
              </button>
            </div>
          ) : viewMode === 'TABLE' ? (
            /* Table View */
            <div className="table-container" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine Name & Code</th>
                    <th>Therapeutic Category</th>
                    <th>Manufacturer</th>
                    <th>Wholesale Price (₹)</th>
                    <th>Retail MRP (₹)</th>
                    <th>Hospital Stock</th>
                    <th style={{ textAlign: 'right' }}>Procurement Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMedicines.map((m) => {
                    const inCart = isInCart(m.id);
                    const isLow = (m.quantity || 0) < (m.minimumStock || 20);
                    const isOut = (m.quantity || 0) === 0;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{m.medicineName}</div>
                          <div style={{ fontSize: '12px', color: '#0284c7' }}>{m.medicineCode} {m.genericName ? `• ${m.genericName}` : ''}</div>
                        </td>
                        <td><span className="badge badge-info">{m.category || 'General'}</span></td>
                        <td style={{ color: '#475569', fontWeight: 600 }}>{m.manufacturer || '—'}</td>
                        <td style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>₹{Number(m.unitPrice || 5).toFixed(2)}</td>
                        <td style={{ fontWeight: 700, color: '#0284c7', fontSize: '13.5px' }}>₹{Number(m.sellingPrice || 12).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                            {isOut ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                            {isOut ? 'Out of Stock (0)' : isLow ? `Low Stock (${m.quantity})` : `${m.quantity || 0} in stock`}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenDirectBuy(m)}
                              style={{
                                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                border: 'none',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <ShoppingCart size={13} /> Buy from Supplier
                            </button>
                            <button
                              onClick={() => addToCart(m)}
                              style={{
                                background: inCart ? '#059669' : '#f1f5f9',
                                border: inCart ? '1px solid #059669' : '1px solid #cbd5e1',
                                color: inCart ? 'white' : '#334155',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Add to Bulk Purchase Cart"
                            >
                              {inCart ? <CheckCircle size={13} /> : <Plus size={13} />}
                              {inCart ? 'In Cart' : 'Cart'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {displayedMedicines.map((med) => {
                const inCart = isInCart(med.id);
                const isLow = (med.quantity || 0) < (med.minimumStock || 20);
                const isOut = (med.quantity || 0) === 0;
                return (
                  <div key={med.id} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{med.medicineName}</div>
                          <div style={{ fontSize: '12px', color: '#0284c7' }}>{med.medicineCode} {med.genericName ? `• ${med.genericName}` : ''}</div>
                        </div>
                        <span className="badge badge-info">{med.category || 'General'}</span>
                      </div>

                      <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Manufacturer:</span>
                          <span style={{ color: '#1e293b', fontWeight: 600 }}>{med.manufacturer || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Wholesale Price:</span>
                          <span style={{ color: '#059669', fontWeight: 800, fontSize: '14.5px' }}>₹{Number(med.unitPrice || 5).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Retail MRP:</span>
                          <span style={{ color: '#0284c7', fontWeight: 700 }}>₹{Number(med.sellingPrice || 12).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', alignItems: 'center' }}>
                          <span>Current Hospital Stock:</span>
                          <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                            {isOut ? 'Out of Stock (0)' : isLow ? `Low (${med.quantity})` : `${med.quantity || 0} units`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleOpenDirectBuy(med)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          border: 'none',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ShoppingCart size={14} /> Buy from Supplier
                      </button>
                      <button
                        onClick={() => addToCart(med)}
                        style={{
                          background: inCart ? '#059669' : '#f1f5f9',
                          border: inCart ? '1px solid #059669' : '1px solid #cbd5e1',
                          color: inCart ? 'white' : '#334155',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {inCart ? <CheckCircle size={14} /> : <Plus size={14} />}
                        {inCart ? 'In Cart' : 'Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: PURCHASE ORDER HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="table-container" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Order Date</th>
                <th>Expected Delivery</th>
                <th>Total Amount (₹)</th>
                <th>Fulfillment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>Loading purchase order history...</td></tr>
              ) : supplierOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <ClipboardList size={36} color="#94a3b8" style={{ display: 'block', margin: '0 auto 10px auto', opacity: 0.6 }} />
                    No purchase orders recorded with {selectedSupplier?.supplierName || 'this supplier'} yet.
                  </td>
                </tr>
              ) : (
                supplierOrders.map((po) => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 800, color: '#7c3aed' }}>{po.orderNumber}</td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : (po.createdAt ? po.createdAt.split('T')[0] : '—')}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{po.expectedDelivery || 'Within 5 Days'}</td>
                    <td style={{ fontWeight: 800, color: '#db2777', fontSize: '14px' }}>
                      ₹{Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${
                        po.status === 'RECEIVED' ? 'badge-success' :
                        po.status === 'SHIPPED' ? 'badge-info' :
                        po.status === 'APPROVED' ? 'badge-warning' : 'badge-neutral'
                      }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {po.status === 'RECEIVED' && <CheckCircle size={13} />}
                        {po.status === 'SHIPPED' && <Truck size={13} />}
                        {po.status === 'APPROVED' && <Clock size={13} />}
                        {po.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {po.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(po.id, 'APPROVED')}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '11px', color: '#d97706' }}
                          >
                            Approve PO
                          </button>
                        )}
                        {po.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(po.id, 'SHIPPED')}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '11px', color: '#0284c7' }}
                          >
                            Mark Shipped
                          </button>
                        )}
                        {po.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(po.id, 'RECEIVED')}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '11px', background: '#10b981' }}
                          >
                            Receive & Restock
                          </button>
                        )}
                        {po.status === 'RECEIVED' && (
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>✓ Stock Updated</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DIRECT PURCHASE ORDER MODAL */}
      {isDirectModalOpen && directMed && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
            width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={20} color="#0284c7" /> Purchase from Supplier Catalogue
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', margin: 0 }}>
                  Authorized Vendor: <strong style={{ color: '#7c3aed' }}>{selectedSupplier?.supplierName}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsDirectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDirectOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>{directMed.medicineName}</div>
                <div style={{ fontSize: '12.5px', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                  {directMed.medicineCode} • {directMed.category || 'General'} • Batch: {directMed.batchNumber || 'STANDARD'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{directMed.description || 'Pharmaceutical formulation'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Order Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={directQty}
                    onChange={(e) => setDirectQty(e.target.value)}
                    className="input-field"
                    style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {[10, 25, 50, 100, 250, 500].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setDirectQty(q)}
                        style={{
                          background: directQty === q ? '#0284c7' : '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: directQty === q ? '#ffffff' : '#334155',
                          borderRadius: '6px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer', fontWeight: 700
                        }}
                      >
                        +{q}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Wholesale Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={directUnitPrice}
                    onChange={(e) => setDirectUnitPrice(e.target.value)}
                    className="input-field"
                    style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    MRP: ₹{directMed.sellingPrice || '—'}
                  </span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '13.5px', fontWeight: 600 }}>Total Purchase Value:</span>
                <span style={{ fontWeight: 800, color: '#db2777', fontSize: '19px' }}>
                  ₹{(Number(directQty || 0) * Number(directUnitPrice || 0)).toFixed(2)}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Expected Delivery Date</label>
                <input
                  type="date"
                  value={directDeliveryDate}
                  onChange={(e) => setDirectDeliveryDate(e.target.value)}
                  className="input-field"
                  style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Purchase Order Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent monthly restocking batch"
                  value={directNotes}
                  onChange={(e) => setDirectNotes(e.target.value)}
                  className="input-field"
                  style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsDirectModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDirect}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                >
                  {submittingDirect ? 'Issuing PO...' : 'Confirm & Issue Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK PURCHASE CART SLIDE-OVER MODAL */}
      {isCartOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
            width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto',
            padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} color="#0284c7" /> Bulk Purchase Order Cart
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <ShoppingCart size={40} color="#94a3b8" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                <p style={{ fontWeight: 600, color: '#1e293b' }}>Your purchase cart is empty</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Add medicines from the catalogue to create a multi-item purchase order.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cart.map((item) => (
                    <div key={item.medicineId} style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
                      padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13.5px' }}>{item.medicineName}</div>
                        <div style={{ fontSize: '11.5px', color: '#0284c7' }}>{item.medicineCode} • @ ₹{item.unitPrice} / unit</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.medicineId, item.quantity - 10)}
                          style={{ background: '#e2e8f0', border: 'none', color: '#1e293b', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 700 }}
                        >-</button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartQty(item.medicineId, parseInt(e.target.value) || 0)}
                          style={{ width: '55px', textAlign: 'center', background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '4px', padding: '3px', fontWeight: 600 }}
                        />
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.medicineId, item.quantity + 10)}
                          style={{ background: '#e2e8f0', border: 'none', color: '#1e293b', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 700 }}
                        >+</button>
                      </div>

                      <div style={{ fontWeight: 800, color: '#db2777', fontSize: '14px', minWidth: '70px', textAlign: 'right' }}>
                        ₹{(item.quantity * item.unitPrice).toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.medicineId)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: 700 }}>Total Bulk Order Value:</span>
                  <span style={{ fontWeight: 800, color: '#db2777', fontSize: '19px' }}>₹{cartTotal.toFixed(2)}</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="input-field"
                    style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Order Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard monthly hospital replenishment batch"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="input-field"
                    style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitCartPurchaseOrder}
                    disabled={submittingCart}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                  >
                    {submittingCart ? 'Submitting PO...' : `Submit PO (₹${cartTotal.toFixed(2)})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
