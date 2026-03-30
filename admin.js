import { supabase } from './supabase.js'

const carForm = document.getElementById('carForm');
const tableBody = document.getElementById('adminTableBody');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEdit');
const formTitle = document.getElementById('formTitle');
const editIdInput = document.getElementById('editId');

// --- 1. แสดงผลแยก ยี่ห้อ และ รุ่น ---
async function fetchStock() {
    const { data: cars, error } = await supabase
        .from('car2')
        .select('*')
        .order('id', { ascending: false });

    if (error) return console.error("Error:", error.message);

    tableBody.innerHTML = cars.map(car => `
        <tr class="border-t border-slate-700 hover:bg-slate-700/30 transition text-sm">
            <td class="p-4 font-medium">
                <div class="flex flex-col">
                    <span class="text-blue-400 font-bold uppercase text-xs">BRAND: ${car.brand}</span>
                    <span class="text-white text-base">${car.model || 'ไม่ได้ระบุรุ่น'}</span>
                    <span class="text-slate-500 text-xs">ปี ${car.year}</span>
                </div>
            </td>
            <td class="p-4 text-blue-400 font-mono">
                ฿${Number(car.price).toLocaleString()}
            </td>
            <td class="p-4 text-right flex justify-end gap-3">
                <button onclick="prepareEdit('${car.id}')" class="text-blue-400 font-bold px-2">แก้ไข</button>
                <button onclick="removeCar('${car.id}')" class="text-red-500 font-bold px-2">ลบ</button>
            </td>
        </tr>
    `).join('');
}

// --- 2. เตรียมข้อมูล (รวมยี่ห้อ+รุ่น กลับเข้าช่องกรอก) ---
window.prepareEdit = async (id) => {
    const { data: car } = await supabase.from('car2').select('*').eq('id', id).single();
    if (car) {
        editIdInput.value = car.id; 
        // นำ brand และ model มาต่อกันให้คุณแก้ไขในช่องเดียว
        document.getElementById('brand').value = `${car.brand} ${car.model || ''}`.trim();
        document.getElementById('year').value = car.year;
        document.getElementById('price').value = car.price;
        document.getElementById('image_url').value = car.image_url || '';

        formTitle.innerHTML = "📝 แก้ไขข้อมูลรถ";
        submitBtn.innerText = "อัปเดตข้อมูลรถ";
        cancelEditBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// --- 3. บันทึกข้อมูล (แยกคำแรกเป็นยี่ห้อ คำที่เหลือเป็นรุ่น) ---
carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentId = editIdInput.value; 
    const fullInput = document.getElementById('brand').value.trim();
    
    // 💡 ตรรกะการแยก: "Toyota Corolla Altis" -> Brand: Toyota, Model: Corolla Altis
    const words = fullInput.split(' ');
    const brandName = words[0]; 
    const modelName = words.slice(1).join(' '); 

    const carData = {
        brand: brandName,
        model: modelName,
        year: parseInt(document.getElementById('year').value),
        price: parseInt(document.getElementById('price').value),
        image_url: document.getElementById('image_url').value.trim()
    };

    if (currentId) {
        // อัปเดต
        const { error } = await supabase.from('car2').update(carData).eq('id', currentId);
        if (error) alert("ล้มเหลว: " + error.message);
        else {
            alert("อัปเดตเรียบร้อย! ✨");
            finalizeAction();
        }
    } else {
        // เพิ่มใหม่
        const { error } = await supabase.from('car2').insert([carData]);
        if (!error) {
            alert("เพิ่มสำเร็จ!");
            finalizeAction();
        }
    }
});

function finalizeAction() {
    carForm.reset();
    editIdInput.value = '';
    formTitle.innerHTML = "➕ เพิ่มรถเข้าสต็อก";
    submitBtn.innerText = "บันทึกสต็อก";
    cancelEditBtn.classList.add('hidden');
    fetchStock();
}

window.removeCar = async (id) => {
    if (confirm('ลบคันนี้?')) {
        await supabase.from('car2').delete().eq('id', id);
        fetchStock();
    }
}

fetchStock();   