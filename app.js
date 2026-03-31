import { supabase } from './supabase.js'

// --- Utility: ฟังก์ชันจัดรูปแบบตัวเลข ---
const formatNum = (num) => Number(num).toLocaleString();

// --- 1. โหลดข้อมูลรถ ---
async function loadCars(searchTerm = '') {
    const tableBody = document.getElementById('carTableBody');
    if (!tableBody) return;

    let query = supabase.from('car2').select('*').order('id', { ascending: false });

    if (searchTerm) {
        query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
    }

    const { data: cars, error } = await query;
    
    if (error) {
        console.error("Error:", error.message);
        return;
    }

    // ถ้าไม่มีข้อมูล
    if (cars.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">ไม่พบข้อมูลรถที่ค้นหา</td></tr>`;
        return;
    }

    tableBody.innerHTML = cars.map(car => `
        <tr class="hover:bg-slate-700/20 transition-all group">
            <td class="p-5 w-40">
                <img src="${car.image_url || 'https://via.placeholder.com/150'}" 
                     class="w-full h-20 object-cover rounded-xl shadow-lg border border-slate-700 group-hover:scale-105 transition-transform">
            </td>
            <td class="p-5">
                <div class="flex flex-col">
                    <span class="text-blue-400 font-bold uppercase text-[10px] tracking-tighter">${car.brand}</span>
                    <span class="text-white text-lg font-bold">${car.model || '-'}</span>
                    <span class="text-slate-500 text-xs mt-1 italic">Model Year: ${car.year}</span>
                </div>
            </td>
            <td class="p-5 text-blue-300 font-mono font-black text-xl">฿${formatNum(car.price)}</td>
            <td class="p-5">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">พร้อมขาย</span>
            </td>
            <td class="p-5 text-right">
                <button onclick="fillCalculator(${car.price})" 
                    class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 shadow-blue-900/20">
                    เลือกดูงวดผ่อน
                </button>
            </td>
        </tr>
    `).join('');
}

// --- 2. คำนวณค่างวด (Flat Rate 72 งวด) ---
function updateCalculator() {
    const price = parseFloat(document.getElementById('calcPrice').value) || 0;
    const down = parseFloat(document.getElementById('calcDown').value) || 0;
    const rate = parseFloat(document.getElementById('calcRate').value) || 2.5; 
    const years = 6; 
    const resultElement = document.getElementById('resultMonthly');

    if (price > 0 && price > down) {
        const loan = price - down;
        const totalInterest = (loan * (rate / 100)) * years;
        const monthly = (loan + totalInterest) / (years * 12);
        
        resultElement.innerHTML = `
            <div class="absolute inset-0 bg-blue-600/5 opacity-100 transition-opacity"></div>
            <span class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Estimated Monthly Payment</span>
            <div class="text-3xl font-black text-blue-300 scale-105 transition-transform">
                ฿${Math.round(monthly).toLocaleString()} <span class="text-sm font-medium text-slate-600">/ เดือน</span>
            </div>
        `;
    } else {
        resultElement.innerHTML = `
            <span class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Estimated Monthly Payment</span>
            <div class="text-3xl font-black text-blue-400">฿0 <span class="text-sm font-medium text-slate-600">/ เดือน</span></div>
        `;
    }
}

// --- 3. ฟังก์ชันเติมเงินอัตโนมัติ (ส่งค่าไป Global) ---
window.fillCalculator = (price) => {
    const priceInput = document.getElementById('calcPrice');
    if (priceInput) {
        priceInput.value = price;
        updateCalculator();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const res = document.getElementById('resultMonthly');
        res.classList.add('animate-pulse');
        setTimeout(() => res.classList.remove('animate-pulse'), 1000);
    }
}

// --- 4. Event Setup ---
document.addEventListener('DOMContentLoaded', () => {
    loadCars();

    // ค้นหาแบบหน่วงเวลา
    let searchTimer;
    document.getElementById('userSearch')?.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadCars(e.target.value), 300);
    });

    // ผูก Event การพิมพ์ในเครื่องคำนวณ
    ['calcPrice', 'calcDown', 'calcRate'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateCalculator);
    });
});