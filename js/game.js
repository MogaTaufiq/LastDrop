/* ============================================
   LAST DROP: WATER SURVIVAL 0009
   Main Game Engine
   ============================================ */

'use strict';

// ============================================
// GAME STATE
// ============================================
const GameState = {
    waterQuality: 60,
    biodiversity: 50,
    tasksCompleted: [false, false, false, false],
    agriCompleted: false,
    indCompleted: false,
    coastalAlertShown: false,
    agriAlertShown: false,
    isMapOpen: false,
    mapPos: null,
    currentScene: 'landing',
    task4Choice: null, // 'burning' or 'chemical'
    ind3Choice: null, // 'filtration', 'chemical' or 'bacteria'
    phase: 'landing',
    instructionsShown: false,
    language: 'en',

    updateWater(delta) {
        this.waterQuality = Math.max(0, Math.min(100, this.waterQuality + delta));
        HUD.update();
        if (typeof document !== 'undefined') {
            updateWorldMapPollution();
        }
    },
    updateBio(delta) {
        this.biodiversity = Math.max(0, Math.min(100, this.biodiversity + delta));
        HUD.update();
        if (typeof document !== 'undefined') {
            updateWorldMapPollution();
        }
    },
    completeTask(index, isAgri = false) {
        if (!isAgri) {
            this.tasksCompleted[index] = true;
        }
        TodoPanel.checkTask(index);
        if (typeof document !== 'undefined') {
            updateWorldMapPollution();
        }
    },
    allTasksDone() {
        return this.tasksCompleted.every(t => t);
    }
};

// ============================================
// TRANSLATIONS DICTIONARY (EN / ID)
// ============================================
const TRANSLATIONS = {
    en: {},
    id: {
        // ---- Landing ----
        'tap_to_start': '⋆ ketuk di mana saja untuk memulai ⋆',

        // ---- Cinematic slides ----
        'Water is essential for life.': 'Air adalah kebutuhan pokok makhluk hidup.',
        'Yet today, it is under threat.': 'Namun kini, air terancam bahaya.',
        'Coastal ecosystems are increasingly polluted by human activities.': 'Ekosistem pesisir semakin tercemar oleh aktivitas manusia.',
        'Oil spills spread across oceans, destroying marine habitats.': 'Tumpahan minyak menyebar di lautan, menghancurkan habitat laut.',
        'Agricultural runoff carries fertilizers and chemicals into water…': 'Limpasan pertanian membawa pupuk dan bahan kimia ke perairan…',
        'Industrial waste releases toxic substances into rivers and seas.': 'Limbah industri melepaskan zat beracun ke sungai dan laut.',
        'The consequences are severe.': 'Dampaknya sangat parah.',
        'Marine life dies. Ecosystems collapse.': 'Kehidupan laut mati. Ekosistem runtuh.',
        'Water becomes unsafe for human use.': 'Air menjadi tidak aman untuk digunakan manusia.',
        'In a small coastal town, water quality continues to decline under constant pressure from pollution.': 'Di sebuah kota pesisir kecil, kualitas air terus menurun akibat tekanan polusi yang terus-menerus.',
        'As environmental conditions worsen, maintaining water quality becomes increasingly difficult.': 'Seiring memburuknya kondisi lingkungan, menjaga kualitas air menjadi semakin sulit.',
        'Your actions will determine whether the system can recover… or collapse.': 'Tindakanmu akan menentukan apakah sistem ini bisa pulih… atau runtuh.',

        // ---- Cinematic button ----
        'cinematic_next': 'Lanjut →',
        'Next →': 'Lanjut →',
        'Begin Mission →': 'Mulai Misi →',

        // ---- HUD labels ----
        'water_quality_label': 'Kualitas Air',
        'bio_label': 'Keanekaragaman Hayati',

        // ---- HUD / Controls panel ----
        'how_to_play_title': 'Cara Bermain & Kontrol',
        'desktop_controls_title': '💻 Desktop',
        'mobile_controls_title': '📱 Mobile',
        'landscape_recommendation': '🔄 Mode Lanskap sangat direkomendasikan untuk pemain mobile!',
        'btn_begin_mission': '▶ Mulai Misi',
        'desktop_controls_list': '<li>🏃 <strong>Gerak:</strong> WASD / Tombol Panah</li><li>🔧 <strong>Aksi:</strong> Seret & Jatuhkan / Klik</li><li>🚪 <strong>Masuk Area:</strong> Jalan ke area & tekan <strong>E</strong></li><li>🗺️ <strong>Fast Travel:</strong> Klik Minimap</li>',
        'mobile_controls_list': '<li>🕹️ <strong>Gerak:</strong> Joystick Virtual di Layar</li><li>👆 <strong>Aksi:</strong> Ketuk item / Ketuk untuk Menempatkan</li><li>🚪 <strong>Masuk Area:</strong> Jalan ke area & ketuk Prompt</li><li>🗺️ <strong>Fast Travel:</strong> Ketuk Minimap</li>',

        // ---- Map panel ----
        'map_title': 'PETA',
        'map_agricultural': 'Pertanian',
        'map_industrial': 'Industri',
        'map_residential': 'Pemukiman<br>(Respawn)',
        'map_coastal': 'Pesisir',
        'map_coastal_status': '🚨 KRISIS',

        // ---- Todo panel ----
        'todo_title': '🎯 Daftar Misi',
        'prompt_enter_text': 'Tekan <strong>E</strong> atau <strong>Ketuk di sini</strong> untuk masuk',

        // ---- Crisis modal ----
        'crisis_title': 'Krisis Terdeteksi!',
        'crisis_body': 'Krisis polusi terdeteksi di <strong>Area Pesisir</strong>!<br>Selesaikan semua tugas untuk memulihkan keseimbangan lingkungan.',
        'btn_start_mission': '▶ Mulai Misi',

        // ---- Rotate device ----
        'rotate_device_title': 'Putar Perangkat Anda',
        'rotate_device_desc': 'Harap putar perangkat Anda ke mode Lanskap untuk pengalaman gaming edukatif terbaik!',

        // ---- Task 4 method cards ----
        't4_method_a_title': '🔥 Pembakaran In-Situ',
        't4_method_a_stats': 'Air +25 | Hayati +5',
        't4_method_a_tag': 'Direkomendasikan',
        't4_method_b_title': '🧪 Dispersan Corexit',
        't4_method_b_stats': 'Air +20 | Hayati -15',
        't4_method_b_tag': '⚠ Dapat merusak kehidupan laut',
        'btn_t4_complete': 'Selesaikan Tugas ✓',

        // ---- Agri / Ind next buttons ----
        'btn_next_task': 'Tugas Berikutnya →',
        'btn_mission_complete': 'Misi Selesai ✓',

        // ---- Decision board ----
        'btn_back': 'Kembali',
        'btn_confirm': 'Konfirmasi Pilihan',

        // ---- Report card ----
        'report_card_title': 'Laporan Restorasi Ekosistem',
        'report_card_subtitle': 'Ringkasan Penilaian Proyek',
        'report_metrics_title': 'Metrik Ekosistem',
        'report_decisions_title': 'Keputusan Pengelolaan',
        'report_coastal_spill': 'Tumpahan Pesisir:',
        'report_agri_pollution': 'Polusi Pertanian:',
        'report_agri_choice_strips': 'Strip Penyangga Sungai',
        'report_industrial_effluent': 'Efluen Industri:',
        'btn_play_again': 'Main Lagi',
        'btn_exit': 'Keluar',

        // ---- Toast messages (common) ----
        'Coastal Area is already safe!': 'Area Pesisir sudah aman!',
        'Agricultural Area is already safe!': 'Area Pertanian sudah aman!',
        'Industrial Area is already safe!': 'Area Industri sudah aman!',
        'Solve Coastal Area first!': 'Selesaikan Area Pesisir terlebih dahulu!',
        '🚨 Crisis Detected! Walk to the Coastal Area to start your mission.': '🚨 Krisis Terdeteksi! Jalan ke Area Pesisir untuk memulai misi.',
        '🚨 New crisis zones detected! Check Agricultural & Industrial areas.': '🚨 Zona krisis baru terdeteksi! Periksa area Pertanian & Industri.',
        'Area is locked.': 'Area dikunci.',
        '✅ All areas resolved!': '✅ Semua area telah diselesaikan!',
        'All areas resolved! ✅': 'Semua area selesai! ✅',
        '1 area left to solve': '1 area tersisa',
        '2 areas left to solve': '2 area tersisa',
        'Area is already safe!': 'Area sudah aman!',

        // ---- Coastal tasks ----
        // Task 1
        'Task 1: Save Trapped Marine Animal': 'Tugas 1: Selamatkan Hewan Laut yang Terperangkap',
        'Help the trapped sea turtle by clicking on it.': 'Bantu penyu laut yang terperangkap dengan mengkliknya.',
        'Helping...': 'Membantu...',
        'Marine animal freed! 🐢': 'Hewan laut dibebaskan! 🐢',
        'Biodiversity: +10': 'Keanekaragaman Hayati: +10',
        'Great job! You freed the trapped sea turtle. Biodiversity has improved!': 'Kerja bagus! Kamu telah membebaskan penyu laut. Keanekaragaman hayati meningkat!',
        'Continue to Task 2 →': 'Lanjut ke Tugas 2 →',
        // Task 2
        'Task 2: Clean Plastic Waste': 'Tugas 2: Bersihkan Sampah Plastik',
        'Click on trash items to clean the beach!': 'Klik sampah untuk membersihkan pantai!',
        'Beach Cleaned! 🎉': 'Pantai Bersih! 🎉',
        'Water: +10, Biodiversity: +5': 'Air: +10, Keanekaragaman: +5',
        'Amazing! You have cleaned all the plastic waste from the beach.': 'Luar biasa! Kamu telah membersihkan semua sampah plastik dari pantai.',
        'Continue to Task 3 →': 'Lanjut ke Tugas 3 →',
        // Task 3
        'Task 3: Stop Oil Leak': 'Tugas 3: Hentikan Kebocoran Minyak',
        'Click on the pipe to stop the oil leak!': 'Klik pipa untuk menghentikan kebocoran minyak!',
        'Fixing...': 'Memperbaiki...',
        '✅ Pipe Sealed!': '✅ Pipa Tersegel!',
        'Pipe Fixed! 🔧': 'Pipa Diperbaiki! 🔧',
        'Pipe has been repaired! Water quality is improving.': 'Pipa telah diperbaiki! Kualitas air membaik.',
        'Continue to Task 4 →': 'Lanjut ke Tugas 4 →',
        // Task 4
        'Task 4: Clean Oil Spill - Choose Method': 'Tugas 4: Bersihkan Tumpahan Minyak - Pilih Metode',
        'Choose your oil spill cleanup method:': 'Pilih metode pembersihan tumpahan minyak:',
        'Task 4: Step 1/3': 'Tugas 4: Langkah 1/3',
        'Task 4: Step 2/3': 'Tugas 4: Langkah 2/3',
        'Task 4: Step 3/3': 'Tugas 4: Langkah 3/3',
        // Method A
        'Draw a containment boom around the oil spill to contain it.': 'Gambar boom penghalang di sekitar tumpahan minyak untuk menahannya.',
        'Boom closed! Now IGNITE the oil.': 'Boom tertutup! Sekarang BAKAR minyaknya.',
        'Oil is burning... Stand by.': 'Minyak sedang terbakar... Tunggu sebentar.',
        'Oil burned successfully. Boom deployed, fire extinguished.': 'Minyak berhasil dibakar. Boom telah dikerahkan, api padam.',
        // Method B
        'Drag the boat over the oil slick to apply dispersant.': 'Seret kapal di atas tumpahan minyak untuk menggunakan dispersan.',
        'Dispersant applied! Now inject chemical below the surface.': 'Dispersan telah diterapkan! Sekarang injeksikan bahan kimia di bawah permukaan.',
        'Click the injection point to inject Corexit into the oil column.': 'Klik titik injeksi untuk menyuntikkan Corexit ke dalam kolom minyak.',
        'Chemical treatment complete. Oil dispersed below the surface.': 'Perawatan kimia selesai. Minyak tersebar di bawah permukaan.',

        // ---- Agricultural tasks ----
        'Identify pollution source': 'Identifikasi sumber polusi',
        'Apply buffer strips': 'Terapkan strip penyangga',
        'Agricultural Area': 'Area Pertanian',
        'Pollution detected in the Agricultural Area. Excess nutrients are affecting water quality.': 'Polusi terdeteksi di Area Pertanian. Kelebihan nutrisi memengaruhi kualitas air.',

        // ---- Industrial tasks ----
        'Identify pollution source': 'Identifikasi sumber polusi',
        'Stop direct discharge': 'Hentikan pembuangan langsung',
        'Treat wastewater before release': 'Olah air limbah sebelum dibuang',
        'Industrial Area': 'Area Industri',
        'Pollution detected in the Industrial Area. Untreated wastewater is being released into the river.': 'Polusi terdeteksi di Area Industri. Air limbah yang tidak diolah dibuang ke sungai.',

        // ---- Mission intro ----
        'Coastal Area': 'Area Pesisir',
        'A pollution crisis has been detected in the Coastal Area! Complete all tasks to restore environmental balance.': 'Krisis polusi terdeteksi di Area Pesisir! Selesaikan semua tugas untuk memulihkan keseimbangan lingkungan.',
        'Start': 'Mulai',

        // ---- Report Card Outlook ----
        'Eco-Guardian 🌿': 'Penjaga Ekosistem 🌿',
        'Excellent 🌟': 'Sangat Baik 🌟',
        'Toxic Quick-Fix ⚠️': 'Solusi Cepat Beracun ⚠️',
        'High Risk ⚠️': 'Risiko Tinggi ⚠️',
        'Semi-Stable ⚖️': 'Semi-Stabil ⚖️',
        'Moderate ⚖️': 'Moderat ⚖️',
        'By prioritizing physical removal (In-Situ Burning) and natural bioremediation (Bacterial Treatment), you avoided introducing toxic chemical compounds. Ten years from now, the coastal ecosystem is thriving: coral reefs are recovering, fish stocks have rebounded, and chemical bioaccumulation is near zero. Your focus on natural cycles and ecological balance has built a resilient ecosystem.': 'Dengan memprioritaskan penghilangan fisik (Pembakaran In-Situ) dan bioremediasi alami (Perawatan Bakteri), kamu menghindari masuknya senyawa kimia beracun. Sepuluh tahun ke depan, ekosistem pesisir berkembang pesat: terumbu karang pulih, stok ikan meningkat, dan bioakumulasi kimia hampir nol. Fokusmu pada siklus alami dan keseimbangan ekologis telah membangun ekosistem yang tangguh.',
        'By choosing chemical dispersants (which hid the oil by sinking it) and chemical coagulation or filtration (which left toxic residue and dissolved heavy metals untreated), you prioritized immediate appearance over long-term health. Ten years later, a major biodiversity drop is evident. Dissolved toxins have bioaccumulated through the food chain, leading to reproductive failure in apex marine species and permanent coral bleaching. The water looks clear on the surface, but the underlying food web is severely degraded.': 'Dengan memilih dispersan kimia (yang menyembunyikan minyak dengan menenggelamkannya) dan koagulasi kimia atau filtrasi (yang meninggalkan residu beracun dan logam berat terlarut yang tidak diolah), kamu memprioritaskan penampilan langsung daripada kesehatan jangka panjang. Sepuluh tahun kemudian, penurunan keanekaragaman hayati yang signifikan terlihat jelas. Toksin terlarut telah terakumulasi melalui rantai makanan, menyebabkan kegagalan reproduksi pada spesies laut puncak dan pemutihan terumbu karang permanen. Air tampak jernih di permukaan, tetapi jaring makanan yang mendasarinya sangat terdegradasi.',
        'Your mixed approach of biological recovery and chemical or physical quick-fixes yields a partially stable ecosystem. While you successfully mitigated major visible crises, some lingering trade-offs remain. Over the next decade, dissolved pollutants (heavy metals or dispersed oil residues) continue to slowly accumulate in the food web. Shellfish fisheries remain closed in localized pockets, but the ecosystem manages to survive without total collapse.': 'Pendekatan campuranmu antara pemulihan biologis dan perbaikan cepat kimia atau fisik menghasilkan ekosistem yang sebagian stabil. Meskipun kamu berhasil memitigasi krisis besar yang terlihat, beberapa trade-off yang tersisa masih ada. Selama satu dekade ke depan, polutan terlarut (logam berat atau residu minyak yang tersebar) terus perlahan terakumulasi dalam jaring makanan. Perikanan kerang tetap ditutup di kantong-kantong tertentu, tetapi ekosistem berhasil bertahan tanpa keruntuhan total.',

        // ---- Coastal choice labels ----
        '🔥 In-Situ Burning': '🔥 Pembakaran In-Situ',
        '🧪 Corexit Dispersant': '🧪 Dispersan Corexit',
        'Not Solved': 'Belum Diselesaikan',

        // ---- Industrial choice labels ----
        '🪨 Mechanical Filtration': '🪨 Filtrasi Mekanis',
        '🧪 Chemical Coagulation': '🧪 Koagulasi Kimia',
        '🦠 Bacterial Treatment': '🦠 Perawatan Bakteri',

        // ---- Reflection lines ----
        'Protecting water resources is a shared responsibility.': 'Melindungi sumber daya air adalah tanggung jawab bersama.',
        'Every action has an impact on the environment.': 'Setiap tindakan berdampak pada lingkungan.',
        'The future of the ecosystem depends on the choices we make today.': 'Masa depan ekosistem bergantung pada pilihan yang kita buat hari ini.',

        // ---- Areas counter ----
        'All areas resolved! ✅': 'Semua area selesai! ✅',

        // ---- Task 1 ----
        'Click the turtle to free it from plastic entanglement': 'Klik penyu untuk membebaskannya dari jeratan plastik',
        'Helping... keep clicking!': 'Membantu... terus klik!',
        '🐢 Animal freed!': '🐢 Hewan dibebaskan!',
        'Good action! Biodiversity improved.': 'Tindakan bagus! Keanekaragaman hayati meningkat.',
        '🦋 Biodiversity +10': '🦋 Keanekaragaman Hayati +10',
        'Task 1 Completed': 'Tugas 1 Selesai',
        'Great! Marine animal saved. Continue to Task 2: Clean beach plastic.': 'Bagus! Hewan laut berhasil diselamatkan. Lanjut ke Tugas 2: Bersihkan plastik pantai.',
        'Next Task →': 'Tugas Berikutnya →',

        // ---- Task 2 ----
        'Click each trash item to collect it': 'Klik setiap sampah untuk mengumpulkannya',
        'cleaned': 'dibersihkan',
        'Beach cleaned successfully!': 'Pantai berhasil dibersihkan!',
        '💧 Water Quality +10  🦋 Biodiversity +5': '💧 Kualitas Air +10  🦋 Keanekaragaman +5',
        'Task 2 Completed': 'Tugas 2 Selesai',
        'Beach cleaned successfully. Continue to Task 3: Stop oil leak source.': 'Pantai berhasil dibersihkan. Lanjut ke Tugas 3: Hentikan sumber kebocoran minyak.',

        // ---- Task 3 ----
        'Apply glue on all 4 edges of the patch plate, then drag it to the crack!': 'Oleskan lem di keempat ujung pelat penambal, lalu seret ke retakan!',
        '✔ GLUED': '✔ TERTEMPEL',
        'Apply glue': 'Oleskan lem',
        'Now drag the patch plate to the crack on the pipe!': 'Sekarang seret pelat penambal ke retakan pada pipa!',
        'Leak successfully contained!': 'Kebocoran berhasil diatasi!',
        '🔧 Oil leak stopped': '🔧 Kebocoran minyak dihentikan',
        '✅ Pipe sealed successfully!': '✅ Pipa berhasil disegel!',
        'Task 3 Completed': 'Tugas 3 Selesai',
        'Great work! The oil leak has been patched. Continue to Task 4: Clean the oil spill.': 'Kerja bagus! Kebocoran minyak telah ditambal. Lanjut ke Tugas 4: Bersihkan tumpahan minyak.',

        // ---- Task 4 ----
        'Choose a method to clean up the oil spill': 'Pilih metode untuk membersihkan tumpahan minyak',
        'Task 4: Step 1/3 — Containment': 'Tugas 4: Langkah 1/3 — Penahanan',
        'Draw a containment boom around the oil spill!': 'Gambar boom penghalang di sekitar tumpahan minyak!',
        '✔ Boom Deployed!': '✔ Boom Dikerahkan!',
        '✔ Boom deployed! Oil contained.': '✔ Boom dikerahkan! Minyak tertahan.',
        'Loop not closed! Bring the line back to start. Try again!': 'Pola tidak tertutup! Kembalikan garis ke titik mulai. Coba lagi!',
        'Loop missed the oil spill! Draw around the dark blob. Try again!': 'Pola meleset dari tumpahan minyak! Gambar di sekitar gumpalan hitam. Coba lagi!',
        'Loop too small! Draw a bigger circle. Try again!': 'Pola terlalu kecil! Gambar lingkaran yang lebih besar. Coba lagi!',
        'Task 4: Step 2/3 — Ignition': 'Tugas 4: Langkah 2/3 — Pembakaran',
        'The oil is contained. Click IGNITE to start controlled burning!': 'Minyak telah tertahan. Klik IGNITE untuk memulai pembakaran terkendali!',
        '🔥 Burning in progress...': '🔥 Pembakaran sedang berlangsung...',
        'Task 4: Step 3/3 — Result': 'Tugas 4: Langkah 3/3 — Hasil',
        'Cleanup complete.': 'Pembersihan selesai.',
        'Oil successfully removed by combustion.': 'Minyak berhasil dihilangkan dengan pembakaran.',
        'In-situ burning physically removes oil from the water surface. Some air pollution occurs but marine ecosystem impact is minimal.': 'Pembakaran in-situ menghilangkan minyak secara fisik dari permukaan air. Polusi udara terjadi namun dampak ekosistem laut sangat minim.',
        'Coastal Area Saved': 'Area Pesisir Diselamatkan',
        'You have completed all tasks in the Coastal Area! Return to the Residential Area.': 'Kamu telah menyelesaikan semua tugas di Area Pesisir! Kembali ke Area Pemukiman.',
        'Return to World': 'Kembali ke Pemukiman',

        // ---- Task 4 Method B ----
        'Task 4: Step 1/3 — Surface Spraying': 'Tugas 4: Langkah 1/3 — Penyemprotan Permukaan',
        'Drag the boat across the oil spill to spray dispersant!': 'Seret kapal melintasi tumpahan minyak untuk menyemprotkan dispersan!',
        '✔ Surface spraying complete!': '✔ Penyemprotan permukaan selesai!',
        'Task 4: Step 2/3 — Submarine Injection': 'Tugas 4: Langkah 2/3 — Injeksi Bawah Laut',
        'Click the injection point 3 times to inject dispersant into the leak source!': 'Klik titik injeksi 3 kali untuk menyuntikkan dispersan ke sumber kebocoran!',
        'Injections: 0/3': 'Injeksi: 0/3',
        'Injections: ': 'Injeksi: ',
        '✔ Injection complete. Dispersant deployed!': '✔ Injeksi selesai. Dispersan dikerahkan!',
        'Oil dispersed — but not removed.': 'Minyak tersebar — namun tidak dihilangkan.',
        'Chemical dispersants break oil into tiny droplets that remain in the water column, making them more accessible to marine life. Toxic to fish, coral, and plankton.': 'Dispersan kimia memecah minyak menjadi tetesan kecil yang tertinggal di kolom air, membuatnya lebih mudah diakses oleh biota laut. Beracun bagi ikan, terumbu karang, dan plankton.',
        'Used in Deepwater Horizon (2010) — still debated by scientists.': 'Digunakan di Deepwater Horizon (2010) — masih diperdebatkan oleh para ilmuwan.',
        'Drag the bottle to the treatment pool!': 'Seret botol ke kolam pengolahan!',

        // ---- Agricultural Tasks ----
        'Scan the farm area to find the source of pollution.': 'Pindai area pertanian untuk menemukan sumber polusi.',
        'Source identified.': 'Sumber teridentifikasi.',
        'Fertilizers from farms are flowing into the water. These nutrients can pollute water and harm the ecosystem.': 'Pupuk dari pertanian mengalir ke air. Nutrisi ini dapat mencemari air dan merusak ekosistem.',
        'Plant vegetation along the river to filter runoff.': 'Tanam vegetasi di sepanjang sungai untuk menyaring limpasan.',
        'planted': 'ditanam',
        'Runoff successfully reduced.': 'Limpasan berhasil dikurangi.',
        'Mission Complete': 'Misi Selesai',
        'Runoff successfully reduced. Return to the residential area.': 'Limpasan berhasil dikurangi. Kembali ke area pemukiman.',

        // ---- Industrial Tasks ----
        'Locate the source of industrial wastewater.': 'Temukan sumber air limbah industri.',
        'Factories are releasing untreated waste into the water.': 'Pabrik-pabrik membuang limbah tanpa diolah ke dalam air.',
        ' Industrial waste may contain toxic chemicals and heavy metals.': ' Limbah industri mungkin mengandung bahan kimia beracun dan logam berat.',
        'Fix the leaking pipe joint. Drag missing bolts and tighten all.': 'Perbaiki sambungan pipa yang bocor. Seret baut yang hilang dan kencangkan semua.',
        'Discharge successfully stopped.': 'Pembuangan berhasil dihentikan.',
        'Choose a method to treat the remaining wastewater.': 'Pilih metode untuk mengolah sisa air limbah.',
        'Filtration': 'Filtrasi',
        'Chemical Coagulation': 'Koagulasi Kimia',
        'Bacterial Treatment': 'Perawatan Bakteri',
        'complete. Water quality restored.': 'selesai. Kualitas air dipulihkan.',
        ' Biodiversity improved!': ' Keanekaragaman hayati meningkat!',
        'All pollution sources have been successfully managed.': 'Semua sumber polusi telah berhasil dikelola.',
    }
};

// ============================================
// LOCALIZATION HELPERS
// ============================================
function getTranslation(key) {
    if (!key) return key;
    if (GameState.language === 'en') return key;
    const dict = TRANSLATIONS[GameState.language];
    if (!dict) return key;
    return dict[key] !== undefined ? dict[key] : key;
}

function updateLanguageUI() {
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-lang-key');
        const translated = getTranslation(key);
        // Use innerHTML for keys that may contain HTML tags
        const htmlKeys = [
            'prompt_enter_text', 'map_residential', 'crisis_body',
            'desktop_controls_list', 'mobile_controls_list'
        ];
        if (htmlKeys.indexOf(key) !== -1) {
            el.innerHTML = translated;
        } else {
            el.textContent = translated;
        }
    });

    // Update active lang button indicator
    const btnEn = document.getElementById('btn-lang-en');
    const btnId = document.getElementById('btn-lang-id');
    if (btnEn && btnId) {
        if (GameState.language === 'en') {
            btnEn.classList.add('active');
            btnId.classList.remove('active');
        } else {
            btnId.classList.add('active');
            btnEn.classList.remove('active');
        }
    }

    // Re-render the current cinematic slide text if in cinematic phase
    if (GameState.phase === 'cinematic' && typeof renderSlide === 'function') {
        renderSlide(currentSlide);
    }
}

function updateTodoPanelText() {
    if (typeof document === 'undefined') return;
    const area = GameState.currentArea;
    if (area === 'agricultural') {
        const t0 = document.getElementById('todo-0');
        const t1 = document.getElementById('todo-1');
        if (t0) t0.innerHTML = `<span class="todo-check"></span>${getTranslation('Identify pollution source')}`;
        if (t1) t1.innerHTML = `<span class="todo-check"></span>${getTranslation('Apply buffer strips')}`;
    } else if (area === 'industrial') {
        const t0 = document.getElementById('todo-0');
        const t1 = document.getElementById('todo-1');
        const t2 = document.getElementById('todo-2');
        if (t0) t0.innerHTML = `<span class="todo-check"></span>${getTranslation('Identify pollution source')}`;
        if (t1) t1.innerHTML = `<span class="todo-check"></span>${getTranslation('Stop direct discharge')}`;
        if (t2) t2.innerHTML = `<span class="todo-check"></span>${getTranslation('Treat wastewater before release')}`;
    }
}

function changeLanguage(lang) {
    GameState.language = lang;
    updateLanguageUI();
}

function initTogglePanels() {
    if (typeof document === 'undefined') return;

    const mapContainer = document.getElementById('mini-map-container');
    const mapToggleBtn = document.getElementById('btn-map-toggle');
    if (mapToggleBtn && mapContainer) {
        mapToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mapContainer.classList.contains('minimized')) {
                mapContainer.classList.remove('minimized');
                mapToggleBtn.textContent = '➖';
            } else {
                mapContainer.classList.add('minimized');
                mapToggleBtn.textContent = '🗺️';
            }
        });
    }

    const todoPanel = document.getElementById('todo-panel');
    const todoToggleBtn = document.getElementById('btn-todo-toggle');
    if (todoToggleBtn && todoPanel) {
        todoToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (todoPanel.classList.contains('minimized')) {
                todoPanel.classList.remove('minimized');
                todoToggleBtn.textContent = '➖';
            } else {
                todoPanel.classList.add('minimized');
                todoToggleBtn.textContent = '🎯';
            }
        });
    }
}

// ============================================
// SUSTAINABILITY DECISION DATA & ENGINE
// ============================================
const DecisionData = {
    'burning': {
        title: '🔥 In-Situ Burning',
        desc: 'In-Situ Burning involves containing the oil slick with a fire-resistant boom and igniting it to burn the oil directly off the water surface. This is a rapid physical removal technique.',
        benefits: [
            'Removes up to 90% of surface oil very quickly, preventing it from reaching shorelines.',
            'Eliminates the need for long-term waste storage and disposal of liquid oil.',
            'Reduces the exposure of marine organisms on the surface to toxic oil slicks.'
        ],
        risks: [
            'Produces large plumes of toxic black smoke containing particulate matter and greenhouse gases.',
            'A small fraction of heavy oil residues will sink to the seabed, potentially smothering benthic organisms.',
            'Highly dependent on calm weather and thick oil patches to maintain combustion.'
        ],
        outlook: 'High immediate recovery. While it causes short-term air quality issues, it prevents catastrophic oiling of beaches and wetlands. Marine populations recovery time is faster (approx. 2-5 years).'
    },
    'chemical_coastal': {
        title: '🧪 Corexit Dispersant',
        desc: 'Chemical dispersants are sprayed onto the slick to break the oil into tiny droplets. The droplets disperse into the water column, where they are diluted and degraded by microbes.',
        benefits: [
            'Removes oil from the surface rapidly, protecting sea birds and mammals.',
            'Allows microbial populations to degrade the oil droplets faster due to increased surface area.',
            'Effective in rougher seas where mechanical containment and burning are impossible.'
        ],
        risks: [
            'Does not remove oil; it shifts it into the water column, making it highly toxic to marine life.',
            'The dispersant (Corexit) combined with oil is more toxic to corals, fish, and zooplankton than oil alone.',
            'Creates a massive underwater plume of dissolved toxins that can persist for decades.'
        ],
        outlook: 'Toxic persistence. The water looks clean on the surface, but underwater biodiversity drops significantly. Coral reefs and benthic fisheries suffer long-term damage, with recovery taking 15+ years.'
    },
    'filtration': {
        title: '🪨 Mechanical Filtration',
        desc: 'Uses physical layers of gravel, sand, and activated carbon to trap particulate waste and filter out sediment. A clean, mechanical approach.',
        benefits: [
            'Safely removes large suspended particles, sand, and grit without adding chemicals.',
            'Reliable, simple, and low-maintenance technology with minimal risk of chemical spills.',
            'Good pre-treatment to clear turbidity and debris.'
        ],
        risks: [
            'Does not remove dissolved chemical pollutants, heavy metals, or pathogens.',
            'Filters clog regularly and create concentrated waste sediment that must be landfilled.',
            'Provides no biological cleaning for organic matter.'
        ],
        outlook: 'Semi-stable outcome. Solid waste is successfully filtered out, but dissolved heavy metals continue to slowly accumulate in the coastal ecosystem, leading to gradual bioaccumulation.'
    },
    'chemical_industrial': {
        title: '🧪 Chemical Coagulation',
        desc: 'Adds chemical coagulants (like alum) to bind dissolved contaminants into heavy clumps that settle out of the water. High-volume chemical precipitation.',
        benefits: [
            'Highly effective at removing dissolved phosphorus, heavy metals, and organic pollutants.',
            'Fast processing time and high water clarity output.',
            'Excellent for emergency high-pollution scenarios.'
        ],
        risks: [
            'Creates massive amounts of toxic chemical sludge that is hazardous and difficult to dispose of.',
            'Excess chemicals can leach back into the river, harming aquatic life (pH shocks, aluminum toxicity).',
            'High chemical dependency and operational costs.'
        ],
        outlook: 'High cost, high risk. The effluent is clear, but toxic chemical sludge storage poses a permanent hazard. Runoff leaks can cause localized toxicity spikes in the aquatic food chain.'
    },
    'bacteria': {
        title: '🦠 Bacterial Bioremediation',
        desc: 'Uses active cultures of beneficial microbes to digest and break down organic pollutants and toxic ammonia into harmless byproducts. An eco-driven solution.',
        benefits: [
            'Naturally breaks down organic compounds, nitrates, and ammonia into harmless nitrogen gas.',
            'No toxic chemical residues or hazardous sludge are produced; creates a natural cycle.',
            'Boosts long-term ecosystem resilience by introducing beneficial microbes.'
        ],
        risks: [
            'Requires precise temperature, oxygen, and pH control; bacteria can die off if conditions change.',
            'Slower process compared to chemical treatment and filtration.',
            'Does not remove heavy metals (which must be pre-filtered).'
        ],
        outlook: 'Sustainable recovery. The natural biological treatment restores ecological balance without toxic byproducts. Water and biodiversity metrics recover to optimal health over 5-10 years.'
    }
};

function showDecisionBoard(choiceId, onConfirm) {
    if (typeof document === 'undefined') {
        onConfirm();
        return;
    }
    const data = DecisionData[choiceId];
    if (!data) return;

    document.getElementById('decision-title').textContent = data.title;
    document.getElementById('decision-desc').textContent = data.desc;

    const benefitsList = document.getElementById('decision-benefits-list');
    if (benefitsList) {
        benefitsList.innerHTML = '';
        data.benefits.forEach(benefit => {
            const li = document.createElement('li');
            li.textContent = benefit;
            benefitsList.appendChild(li);
        });
    }

    const risksList = document.getElementById('decision-risks-list');
    if (risksList) {
        risksList.innerHTML = '';
        data.risks.forEach(risk => {
            const li = document.createElement('li');
            li.textContent = risk;
            risksList.appendChild(li);
        });
    }

    const outlookText = document.getElementById('decision-outlook-text');
    if (outlookText) outlookText.textContent = data.outlook;

    Modal.show('modal-sustainability-decision');

    const backBtn = document.getElementById('btn-decision-back');
    if (backBtn) {
        backBtn.onclick = () => {
            Modal.hide('modal-sustainability-decision');
        };
    }

    const confirmBtn = document.getElementById('btn-decision-confirm');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            Modal.hide('modal-sustainability-decision');
            onConfirm();
        };
    }
}

function updateWorldMapPollution() {
    if (typeof document === 'undefined') return;

    // Grass interpolation based on Biodiversity
    const grass = document.getElementById('world-island-grass');
    if (grass) {
        const factor = GameState.biodiversity / 100;
        grass.style.fill = interpolateColor('#8f9c6e', '#2d9e4f', factor);
        grass.style.stroke = interpolateColor('#7d8c5d', '#27ae60', factor);
    }

    // Agri runoff
    const runoff = document.getElementById('world-agri-runoff');
    const plume = document.getElementById('world-agri-ocean-plume');
    if (runoff && plume) {
        if (GameState.agriCompleted) {
            runoff.style.opacity = '0';
            plume.style.opacity = '0';
        } else if (GameState.allTasksDone()) {
            runoff.style.opacity = '0.85';
            plume.style.opacity = '0.85';
        } else {
            runoff.style.opacity = '0.5';
            plume.style.opacity = '0.3';
        }
    }

    // Coastal oil and trash
    const oilSlick = document.getElementById('world-oil-slick');
    const mapTrash = document.getElementById('world-map-trash');
    if (mapTrash) {
        mapTrash.style.opacity = GameState.tasksCompleted[1] ? '0' : '1';
    }
    if (oilSlick) {
        if (GameState.tasksCompleted[3]) {
            if (GameState.task4Choice === 'burning') {
                oilSlick.style.opacity = '0';
            } else if (GameState.task4Choice === 'chemical') {
                oilSlick.style.opacity = '0.7';
                oilSlick.style.fill = '#7c3aed'; // Purple chemical dispersant cloud
            }
        } else {
            oilSlick.style.opacity = '0.85';
            oilSlick.style.fill = '#14140b';
        }
    }

    // Industrial sludge and smoke
    const indSludge = document.getElementById('world-ind-sludge');
    const smokeDirty = document.getElementById('world-ind-smoke-dirty');
    const smokeClean = document.getElementById('world-ind-smoke-clean');

    if (indSludge && smokeDirty && smokeClean) {
        if (GameState.indCompleted) {
            indSludge.style.opacity = '0';
            smokeDirty.style.opacity = '0';
            smokeClean.style.opacity = '0.8';
        } else if (GameState.allTasksDone()) {
            indSludge.style.opacity = '0.85';
            smokeDirty.style.opacity = '1.0';
            smokeClean.style.opacity = '0';
        } else {
            indSludge.style.opacity = '0.4';
            smokeDirty.style.opacity = '0.6';
            smokeClean.style.opacity = '0';
        }
    }
}

function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgb(${r}, ${g}, ${b})`;
}

function generateEcosystemReportCard() {
    if (typeof document === 'undefined') return;

    // 1. Set Metrics
    const waterVal = GameState.waterQuality;
    const bioVal = GameState.biodiversity;

    const wText = document.getElementById('report-water-val');
    if (wText) wText.textContent = `${waterVal}%`;
    const waterFill = document.getElementById('report-water-fill');
    if (waterFill) {
        waterFill.style.width = `${waterVal}%`;
        if (waterVal < 30) {
            waterFill.style.background = 'var(--red)';
        } else if (waterVal < 60) {
            waterFill.style.background = 'var(--orange)';
        } else {
            waterFill.style.background = 'var(--teal)';
        }
    }

    const bText = document.getElementById('report-bio-val');
    if (bText) bText.textContent = `${bioVal}%`;
    const bioFill = document.getElementById('report-bio-fill');
    if (bioFill) {
        bioFill.style.width = `${bioVal}%`;
        if (bioVal < 30) {
            bioFill.style.background = 'var(--red)';
        } else {
            bioFill.style.background = 'var(--green)';
        }
    }

    // 2. Set Management Decisions
    const coastalChoice = GameState.task4Choice;
    const industrialChoice = GameState.ind3Choice;

    const coastalEl = document.getElementById('report-choice-coastal');
    if (coastalEl) {
        if (coastalChoice === 'burning') {
            coastalEl.textContent = getTranslation('🔥 In-Situ Burning');
        } else if (coastalChoice === 'chemical') {
            coastalEl.textContent = getTranslation('🧪 Corexit Dispersant');
        } else {
            coastalEl.textContent = getTranslation('Not Solved');
        }
    }

    const indEl = document.getElementById('report-choice-industrial');
    if (indEl) {
        if (industrialChoice === 'filtration') {
            indEl.textContent = getTranslation('🪨 Mechanical Filtration');
        } else if (industrialChoice === 'chemical') {
            indEl.textContent = getTranslation('🧪 Chemical Coagulation');
        } else if (industrialChoice === 'bacteria') {
            indEl.textContent = getTranslation('🦠 Bacterial Treatment');
        } else {
            indEl.textContent = getTranslation('Not Solved');
        }
    }

    // 3. Determine Long-Term Environmental Outlook
    const outlookCard = document.getElementById('report-outlook-card');
    const outlookTitle = document.getElementById('report-outlook-title');
    const outlookBadge = document.getElementById('report-outlook-badge');
    const outlookDesc = document.getElementById('report-outlook-desc');

    if (outlookCard) outlookCard.classList.remove('eco-guardian', 'semi-stable', 'toxic-quick-fix');

    if (coastalChoice === 'burning' && industrialChoice === 'bacteria') {
        // Eco-Guardian
        if (outlookCard) outlookCard.classList.add('eco-guardian');
        if (outlookTitle) outlookTitle.textContent = getTranslation('Eco-Guardian 🌿');
        if (outlookBadge) outlookBadge.textContent = getTranslation('Excellent 🌟');
        if (outlookDesc) outlookDesc.textContent = getTranslation('By prioritizing physical removal (In-Situ Burning) and natural bioremediation (Bacterial Treatment), you avoided introducing toxic chemical compounds. Ten years from now, the coastal ecosystem is thriving: coral reefs are recovering, fish stocks have rebounded, and chemical bioaccumulation is near zero. Your focus on natural cycles and ecological balance has built a resilient ecosystem.');
    } else if (coastalChoice === 'chemical' && (industrialChoice === 'filtration' || industrialChoice === 'chemical')) {
        // Toxic Quick-Fix
        if (outlookCard) outlookCard.classList.add('toxic-quick-fix');
        if (outlookTitle) outlookTitle.textContent = getTranslation('Toxic Quick-Fix ⚠️');
        if (outlookBadge) outlookBadge.textContent = getTranslation('High Risk ⚠️');
        if (outlookDesc) outlookDesc.textContent = getTranslation('By choosing chemical dispersants (which hid the oil by sinking it) and chemical coagulation or filtration (which left toxic residue and dissolved heavy metals untreated), you prioritized immediate appearance over long-term health. Ten years later, a major biodiversity drop is evident. Dissolved toxins have bioaccumulated through the food chain, leading to reproductive failure in apex marine species and permanent coral bleaching. The water looks clear on the surface, but the underlying food web is severely degraded.');
    } else {
        // Semi-Stable
        if (outlookCard) outlookCard.classList.add('semi-stable');
        if (outlookTitle) outlookTitle.textContent = getTranslation('Semi-Stable ⚖️');
        if (outlookBadge) outlookBadge.textContent = getTranslation('Moderate ⚖️');
        if (outlookDesc) outlookDesc.textContent = getTranslation('Your mixed approach of biological recovery and chemical or physical quick-fixes yields a partially stable ecosystem. While you successfully mitigated major visible crises, some lingering trade-offs remain. Over the next decade, dissolved pollutants (heavy metals or dispersed oil residues) continue to slowly accumulate in the food web. Shellfish fisheries remain closed in localized pockets, but the ecosystem manages to survive without total collapse.');
    }
}

// ============================================
// AUDIO MANAGER
// ============================================
const Audio = {
    sounds: {},
    offsets: {},
    bgMusic: null,
    muted: false,

    // Added startOffset (in seconds) to skip silence at the beginning of audio files
    load(id, src, startOffset = 0) {
        const audio = new window.Audio();
        audio.src = src;
        audio.preload = 'auto';
        this.sounds[id] = audio;
        this.offsets[id] = startOffset;
        return audio;
    },

    play(id, options = {}) {
        if (this.muted) return;
        const snd = this.sounds[id];
        if (!snd) return;
        try {
            const player = options.loop ? snd : snd.cloneNode();

            player.volume = options.volume !== undefined ? options.volume : 0.7;
            player.loop = options.loop || false;

            // We must call play() first to ensure it attaches to the user gesture.
            const playPromise = player.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    const offset = this.offsets[id] || 0;
                    if (offset > 0 && player.currentTime < offset) {
                        player.currentTime = offset;
                    }
                    if (options.loop) this.bgMusic = player;
                    // Auto-stop after maxDuration seconds
                    if (options.duration) {
                        setTimeout(() => {
                            player.pause();
                            player.currentTime = 0;
                        }, options.duration * 1000);
                    }
                }).catch(e => console.warn('Audio play error:', id, e));
            } else {
                const offset = this.offsets[id] || 0;
                if (offset > 0) player.currentTime = offset;
                if (options.loop) this.bgMusic = player;
                if (options.duration) {
                    setTimeout(() => { player.pause(); player.currentTime = 0; }, options.duration * 1000);
                }
            }

            return player;
        } catch (e) {
            console.error('Audio exception:', e);
        }
    },

    stopBg() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    },

    init() {
        // --- BACKGROUND MUSIC & AMBIENCE ---
        this.load('cinematic_bg', 'assets/audio/cinematic_bg.mp3', 120);
        this.load('ambient_ocean', 'assets/audio/ambient_ocean.mp3', 0);
        this.load('ambient_underwater', 'assets/audio/ambient_underwater.mp3', 0);
        this.load('ambient_factory', 'assets/audio/ambient_factory.mp3', 0);

        // --- UI & SYSTEM SOUNDS ---
        this.load('alarm', 'assets/audio/alarm.mp3', 2);
        // If "click_success.mp3" has 0.5s of silence at the start, change the 0 below to 0.5
        this.load('click_success', 'assets/audio/click_success.mp3', 3);
        this.load('click_error', 'assets/audio/click_error.mp3', 0);
        this.load('task_complete', 'assets/audio/task_complete.mp3', 0);

        // --- COASTAL SFX ---
        this.load('net_cut', 'assets/audio/net_cut.mp3', 2);
        this.load('trash_pickup', 'assets/audio/trash_pickup.mp3', 0);
        // Using "metap_snap.mp3" because of the typo in the downloaded file name
        this.load('metal_snap', 'assets/audio/metap_snap.mp3', 3);
        this.load('fire_burning', 'assets/audio/fire_burning.mp3', 0);
        this.load('chemical_spray', 'assets/audio/chemical_spray.mp3', 0);

        // --- AGRICULTURAL SFX ---
        this.load('shovel_dig', 'assets/audio/shovel_dig.mp3', 0);

        // --- INDUSTRIAL SFX ---
        this.load('metal_drag', 'assets/audio/metal_drag.mp3', 0);
        this.load('wrench_ratchet', 'assets/audio/wrench_ratchet.mp3', 0);
        this.load('stone_grind', 'assets/audio/stone_grind.mp3', 0);
        this.load('sand_pour', 'assets/audio/sand_pour.mp3', 0);
        this.load('liquid_splash', 'assets/audio/liquid_splash.mp3', 0);
        this.load('bacteria_bubble', 'assets/audio/bacteria_bubble.mp3', 0);
    }
};


// ============================================
// UTILITIES
// ============================================
function typeWriter(element, text, speed = 50, callback) {
    if (element.typewriterInterval) {
        clearInterval(element.typewriterInterval);
    }
    let i = 0;
    element.textContent = '';
    element.typewriterInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(element.typewriterInterval);
            element.typewriterInterval = null;
            if (callback) callback();
        }
    }, speed);
}

// ============================================
// SCENE MANAGER
// ============================================
const SceneManager = {
    current: null,

    show(sceneId, callback) {
        // Hide current
        if (this.current) {
            const prev = document.getElementById(this.current);
            if (prev) {
                prev.classList.remove('active');
            }
        }

        // Show new
        const next = document.getElementById(sceneId);
        if (next) {
            setTimeout(() => {
                next.classList.add('active');
                GameState.currentScene = sceneId;
                if (callback) callback();
            }, 100);
        }

        this.current = sceneId;
    },

    transition(fromId, toId, delay = 0, callback) {
        setTimeout(() => {
            this.show(toId, callback);
        }, delay);
    }
};

// ============================================
// HUD (Heads Up Display)
// ============================================
const HUD = {
    waterFill: null,
    bioFill: null,
    waterVal: null,
    bioVal: null,

    init() {
        this.waterFill = document.getElementById('hud-water-fill');
        this.bioFill = document.getElementById('hud-bio-fill');
        this.waterVal = document.getElementById('hud-water-val');
        this.bioVal = document.getElementById('hud-bio-val');
        this.update();
    },

    show() {
        document.getElementById('game-hud').classList.add('visible');
    },

    hide() {
        document.getElementById('game-hud').classList.remove('visible');
    },

    update() {
        if (!this.waterFill) return;
        const wq = GameState.waterQuality;
        const bio = GameState.biodiversity;

        this.waterFill.style.width = wq + '%';
        this.bioFill.style.width = bio + '%';
        this.waterVal.textContent = wq + '%';
        this.bioVal.textContent = bio + '%';

        // Color change based on value
        if (wq < 30) {
            this.waterFill.style.background = 'linear-gradient(90deg, #e63946, #ff6b6b)';
        } else if (wq < 60) {
            this.waterFill.style.background = 'linear-gradient(90deg, #f4a261, #ffd166)';
        } else {
            this.waterFill.style.background = 'linear-gradient(90deg, var(--teal), var(--teal-light))';
        }

        if (bio < 30) {
            this.bioFill.style.background = 'linear-gradient(90deg, #e63946, #ff6b6b)';
        } else {
            this.bioFill.style.background = 'linear-gradient(90deg, var(--green), var(--green-light))';
        }
    }
};

// ============================================
// TODO PANEL
// ============================================
const TodoPanel = {
    show() {
        document.getElementById('todo-panel').classList.add('visible');
    },
    hide() {
        document.getElementById('todo-panel').classList.remove('visible');
    },

    checkTask(index) {
        const items = document.querySelectorAll('.todo-item');
        if (items[index]) {
            items[index].classList.add('done');
            const check = items[index].querySelector('.todo-check');
            if (check) check.textContent = '✓';
        }
    }
};

// ============================================
// FEEDBACK TOAST
// ============================================
const Toast = {
    timer: null,

    show(text, stats = '', duration = 3000) {
        const toast = document.getElementById('feedback-toast');
        document.getElementById('toast-text').textContent = getTranslation(text);
        document.getElementById('toast-stats').textContent = getTranslation(stats);
        toast.classList.add('show');

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
};

// ============================================
// MODAL SYSTEM
// ============================================
const Modal = {
    show(id) {
        document.getElementById(id).classList.add('visible');
    },

    hide(id) {
        document.getElementById(id).classList.remove('visible');
    }
};

function showContinueModal(title, body, buttonText, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay visible';
    overlay.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon">✅</div>
            <div class="modal-title success">${getTranslation(title)}</div>
            <div class="modal-body">${getTranslation(body)}</div>
            <button class="modal-btn" id="dynamic-continue-btn">${getTranslation(buttonText)}</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#dynamic-continue-btn').addEventListener('click', () => {
        overlay.remove();
        onContinue();
    }, { once: true });
}

// ============================================
// PARTICLE EFFECTS
// ============================================
const Particles = {
    burst(x, y, count = 8, emojis = ['✨', '💧', '🌊']) {
        if (x === undefined || x === null || isNaN(x)) x = window.innerWidth / 2;
        if (y === undefined || y === null || isNaN(y)) y = window.innerHeight / 2;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.fontSize = (Math.random() * 16 + 12) + 'px';

            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = Math.random() * 80 + 40;
            p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }
    }
};

// ============================================
// ALARM EFFECT
// ============================================
function triggerAlarm() {
    Audio.play('alarm', { volume: 0.8 });
    const flash = document.createElement('div');
    flash.className = 'alarm-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 2500);
}

// ============================================
// SCENE: LANDING PAGE
// ============================================
function initLanding() {
    // Generate stars
    const starsContainer = document.querySelector('.landing-stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 3}s;
            animation-duration: ${Math.random() * 2 + 2}s;
        `;
        starsContainer.appendChild(star);
    }

    // Language selector buttons — must stop propagation so they don't trigger the scene start
    const btnLangEn = document.getElementById('btn-lang-en');
    const btnLangId = document.getElementById('btn-lang-id');
    if (btnLangEn) {
        btnLangEn.addEventListener('click', function(e) {
            e.stopPropagation();
            changeLanguage('en');
        });
    }
    if (btnLangId) {
        btnLangId.addEventListener('click', function(e) {
            e.stopPropagation();
            changeLanguage('id');
        });
    }

    // Click anywhere else to start
    document.getElementById('scene-landing').addEventListener('click', () => {
        Audio.play('cinematic_bg', { volume: 0.4, loop: true });
        SceneManager.show('scene-cinematic', () => {
            initCinematic();
        });
    }, { once: true });
}

// ============================================
// SCENE: CINEMATIC OPENING
// ============================================
const cinematicSlides = [
    // Scene 1: Cinematic Opening
    {
        text: 'Water is essential for life.',
        bg: 'oil-spill-sea',
        type: 'oil-sea'
    },
    {
        text: 'Yet today, it is under threat.',
        bg: 'industrial-pipe',
        type: 'pipe'
    },
    {
        text: 'Coastal ecosystems are increasingly polluted by human activities.',
        bg: 'algae-water',
        type: 'algae'
    },
    // Scene 2: Problem Escalation
    {
        text: 'Oil spills spread across oceans, destroying marine habitats.',
        bg: 'oil-spill-sea',
        type: 'oil-sea'
    },
    {
        text: 'Agricultural runoff carries fertilizers and chemicals into water…',
        bg: 'algae-water',
        type: 'algae'
    },
    {
        text: 'Industrial waste releases toxic substances into rivers and seas.',
        bg: 'industrial-pipe',
        type: 'pipe'
    },
    // Scene 3: Impact
    {
        text: 'The consequences are severe.',
        bg: 'dead-sea',
        type: 'dead'
    },
    {
        text: 'Marine life dies. Ecosystems collapse.',
        bg: 'dead-sea',
        type: 'dead'
    },
    {
        text: 'Water becomes unsafe for human use.',
        bg: 'dirty-water',
        type: 'dirty'
    },
    // Scene 4: Player Hook
    {
        text: 'In a small coastal town, water quality continues to decline under constant pressure from pollution.',
        bg: 'coastal-town',
        type: 'town'
    },
    {
        text: 'As environmental conditions worsen, maintaining water quality becomes increasingly difficult.',
        bg: 'coastal-town',
        type: 'town'
    },
    {
        text: 'Your actions will determine whether the system can recover… or collapse.',
        bg: 'coastal-town',
        type: 'town',
        isLast: true
    }
];

let currentSlide = 0;

function getCinematicBg(type) {
    const svgs = {
        'oil-sea': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <radialGradient id="skyGrad" cx="50%" cy="30%">
                        <stop offset="0%" stop-color="#1a1a2e"/>
                        <stop offset="100%" stop-color="#0a0a1a"/>
                    </radialGradient>
                    <radialGradient id="oilGrad" cx="50%" cy="50%">
                        <stop offset="0%" stop-color="#2d2d00" stop-opacity="0.9"/>
                        <stop offset="50%" stop-color="#1a1a0a" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#0a0a05" stop-opacity="0.6"/>
                    </radialGradient>
                </defs>
                <!-- Sky -->
                <rect width="800" height="500" fill="url(#skyGrad)"/>
                <!-- Stars -->
                <circle cx="100" cy="50" r="1.5" fill="white" opacity="0.6"/>
                <circle cx="250" cy="30" r="1" fill="white" opacity="0.5"/>
                <circle cx="400" cy="60" r="2" fill="white" opacity="0.7"/>
                <circle cx="600" cy="40" r="1.5" fill="white" opacity="0.6"/>
                <circle cx="700" cy="80" r="1" fill="white" opacity="0.4"/>
                <!-- Ocean base -->
                <rect x="0" y="220" width="800" height="280" fill="#041e2e"/>
                <!-- Ocean waves -->
                <path d="M0,240 C100,220 200,260 300,240 C400,220 500,260 600,240 C700,220 800,260 800,240 L800,500 L0,500 Z" fill="#0a3a5c" opacity="0.8"/>
                <path d="M0,260 C120,240 240,280 360,260 C480,240 600,280 720,260 L800,260 L800,500 L0,500 Z" fill="#0d4a6e" opacity="0.6"/>
                <!-- Oil spill -->
                <ellipse cx="400" cy="320" rx="280" ry="80" fill="url(#oilGrad)"/>
                <ellipse cx="300" cy="350" rx="180" ry="50" fill="#1a1a0a" opacity="0.7"/>
                <ellipse cx="500" cy="340" rx="150" ry="40" fill="#2d2d00" opacity="0.5"/>
                <!-- Oil sheen (rainbow effect) -->
                <ellipse cx="380" cy="310" rx="200" ry="55" fill="none" stroke="#4a3f00" stroke-width="3" opacity="0.4"/>
                <ellipse cx="380" cy="310" rx="180" ry="48" fill="none" stroke="#3d5a00" stroke-width="2" opacity="0.3"/>
                <!-- Dead bird silhouette -->
                <path d="M150,280 Q160,270 170,280 Q165,285 150,280Z" fill="#1a1a1a" opacity="0.6"/>
                <!-- Tanker silhouette -->
                <rect x="550" y="200" width="180" height="40" rx="5" fill="#1a1a1a" opacity="0.8"/>
                <rect x="580" y="175" width="60" height="30" rx="3" fill="#1a1a1a" opacity="0.8"/>
                <rect x="610" y="155" width="8" height="25" fill="#1a1a1a" opacity="0.8"/>
                <!-- Smoke from tanker -->
                <circle cx="614" cy="145" r="8" fill="#333" opacity="0.4"/>
                <circle cx="618" cy="130" r="10" fill="#333" opacity="0.3"/>
                <circle cx="612" cy="115" r="12" fill="#333" opacity="0.2"/>
            </svg>`,

        'pipe': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="skyPipe" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1a0a00"/>
                        <stop offset="100%" stop-color="#2d1a00"/>
                    </linearGradient>
                </defs>
                <!-- Dark industrial sky -->
                <rect width="800" height="500" fill="url(#skyPipe)"/>
                <!-- Factory silhouettes -->
                <rect x="50" y="150" width="120" height="250" fill="#0a0a0a"/>
                <rect x="80" y="100" width="30" height="60" fill="#0a0a0a"/>
                <rect x="200" y="180" width="100" height="220" fill="#0a0a0a"/>
                <rect x="220" y="130" width="25" height="55" fill="#0a0a0a"/>
                <rect x="500" y="120" width="150" height="280" fill="#0a0a0a"/>
                <rect x="530" y="70" width="35" height="60" fill="#0a0a0a"/>
                <rect x="580" y="90" width="30" height="40" fill="#0a0a0a"/>
                <!-- Smoke clouds -->
                <circle cx="95" cy="85" r="20" fill="#2a2a2a" opacity="0.7"/>
                <circle cx="110" cy="70" r="25" fill="#2a2a2a" opacity="0.6"/>
                <circle cx="125" cy="55" r="18" fill="#2a2a2a" opacity="0.5"/>
                <circle cx="235" cy="115" r="18" fill="#2a2a2a" opacity="0.7"/>
                <circle cx="248" cy="100" r="22" fill="#2a2a2a" opacity="0.6"/>
                <circle cx="547" cy="55" r="22" fill="#2a2a2a" opacity="0.7"/>
                <circle cx="562" cy="38" r="28" fill="#2a2a2a" opacity="0.6"/>
                <!-- Pipe discharging waste -->
                <rect x="320" y="300" width="160" height="25" rx="12" fill="#4a4a4a"/>
                <rect x="460" y="305" width="80" height="15" rx="7" fill="#3a3a3a"/>
                <!-- Toxic waste flow -->
                <path d="M540,312 Q580,320 620,340 Q660,360 680,380 Q700,400 720,420" stroke="#4a7c00" stroke-width="12" fill="none" opacity="0.8" stroke-linecap="round"/>
                <path d="M540,312 Q580,325 615,348 Q650,370 670,395" stroke="#2d5a00" stroke-width="8" fill="none" opacity="0.6" stroke-linecap="round"/>
                <!-- River/water receiving waste -->
                <path d="M0,400 C200,380 400,420 600,400 C700,390 750,410 800,400 L800,500 L0,500 Z" fill="#1a3a00" opacity="0.8"/>
                <path d="M0,430 C150,415 350,445 550,430 C680,420 750,440 800,430 L800,500 L0,500 Z" fill="#0d2a00" opacity="0.9"/>
                <!-- Warning signs -->
                <polygon points="350,240 370,270 330,270" fill="#ff6600" opacity="0.8"/>
                <text x="350" y="265" text-anchor="middle" fill="black" font-size="14" font-weight="bold">!</text>
            </svg>`,

        'algae': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="algaeSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0a1a0a"/>
                        <stop offset="100%" stop-color="#1a2a0a"/>
                    </linearGradient>
                    <radialGradient id="algaeWater" cx="50%" cy="60%">
                        <stop offset="0%" stop-color="#1a4a00"/>
                        <stop offset="100%" stop-color="#0a2a00"/>
                    </radialGradient>
                </defs>
                <rect width="800" height="500" fill="url(#algaeSky)"/>
                <!-- Murky green water -->
                <rect x="0" y="200" width="800" height="300" fill="url(#algaeWater)"/>
                <!-- Algae bloom patches -->
                <ellipse cx="200" cy="280" rx="150" ry="60" fill="#2d6a00" opacity="0.8"/>
                <ellipse cx="500" cy="300" rx="200" ry="70" fill="#3a7a00" opacity="0.7"/>
                <ellipse cx="350" cy="350" rx="180" ry="55" fill="#1a5a00" opacity="0.9"/>
                <ellipse cx="650" cy="270" rx="120" ry="45" fill="#2d6a00" opacity="0.6"/>
                <!-- Algae texture -->
                <path d="M100,260 Q150,240 200,260 Q250,280 300,260" stroke="#4a8a00" stroke-width="3" fill="none" opacity="0.5"/>
                <path d="M350,290 Q400,270 450,290 Q500,310 550,290" stroke="#4a8a00" stroke-width="3" fill="none" opacity="0.5"/>
                <!-- Dead fish floating -->
                <ellipse cx="300" cy="230" rx="25" ry="10" fill="#8a8a6a" opacity="0.7"/>
                <path d="M325,230 L340,220 L340,240 Z" fill="#8a8a6a" opacity="0.7"/>
                <ellipse cx="550" cy="215" rx="20" ry="8" fill="#8a8a6a" opacity="0.6"/>
                <path d="M570,215 L582,207 L582,223 Z" fill="#8a8a6a" opacity="0.6"/>
                <!-- Farm in background -->
                <rect x="600" y="100" width="150" height="100" fill="#2a1a00" opacity="0.6"/>
                <polygon points="600,100 675,50 750,100" fill="#1a0a00" opacity="0.6"/>
                <!-- Runoff stream -->
                <path d="M650,200 Q680,220 700,250 Q720,280 730,320" stroke="#4a7c00" stroke-width="8" fill="none" opacity="0.7"/>
            </svg>`,

        'dead': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="deadSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1a0a0a"/>
                        <stop offset="100%" stop-color="#2a0a0a"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="500" fill="url(#deadSky)"/>
                <!-- Dark polluted water -->
                <rect x="0" y="220" width="800" height="280" fill="#1a0a0a"/>
                <path d="M0,240 C200,220 400,260 600,240 C700,230 750,250 800,240 L800,500 L0,500 Z" fill="#2a0a0a" opacity="0.8"/>
                <!-- Dead fish 1 -->
                <ellipse cx="150" cy="280" rx="50" ry="18" fill="#6a5a4a" opacity="0.8"/>
                <path d="M200,280 L225,265 L225,295 Z" fill="#6a5a4a" opacity="0.8"/>
                <circle cx="135" cy="275" r="5" fill="#1a1a1a"/>
                <line x1="130" y1="270" x2="140" y2="280" stroke="#1a1a1a" stroke-width="2"/>
                <line x1="140" y1="270" x2="130" y2="280" stroke="#1a1a1a" stroke-width="2"/>
                <!-- Dead fish 2 -->
                <ellipse cx="400" cy="260" rx="40" ry="14" fill="#6a5a4a" opacity="0.7" transform="rotate(-15, 400, 260)"/>
                <path d="M440,255 L460,243 L460,267 Z" fill="#6a5a4a" opacity="0.7" transform="rotate(-15, 440, 255)"/>
                <!-- Dead turtle -->
                <ellipse cx="600" cy="290" rx="45" ry="30" fill="#4a5a3a" opacity="0.8"/>
                <circle cx="645" cy="285" r="12" fill="#3a4a2a" opacity="0.8"/>
                <!-- Coral bleached -->
                <path d="M200,400 L200,350 M190,370 L210,370 M185,355 L215,355" stroke="#d4d4d4" stroke-width="4" opacity="0.6"/>
                <path d="M350,420 L350,360 M340,380 L360,380 M335,365 L365,365" stroke="#d4d4d4" stroke-width="4" opacity="0.5"/>
                <!-- Oil on surface -->
                <ellipse cx="400" cy="240" rx="300" ry="30" fill="#1a1a0a" opacity="0.5"/>
            </svg>`,

        'dirty': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="dirtySky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1a1a0a"/>
                        <stop offset="100%" stop-color="#2a1a00"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="500" fill="url(#dirtySky)"/>
                <!-- Dirty water tap/faucet -->
                <rect x="340" y="80" width="120" height="20" rx="10" fill="#5a5a5a"/>
                <rect x="390" y="100" width="20" height="80" rx="5" fill="#5a5a5a"/>
                <path d="M390,180 Q400,200 410,180" fill="#5a5a5a"/>
                <!-- Dirty water dripping -->
                <path d="M400,185 Q398,220 400,250 Q402,280 400,310" stroke="#6a5a00" stroke-width="8" fill="none" opacity="0.8" stroke-linecap="round"/>
                <!-- Dirty water in glass -->
                <rect x="350" y="300" width="100" height="130" rx="5" fill="none" stroke="#8a8a8a" stroke-width="3"/>
                <rect x="353" y="350" width="94" height="77" rx="3" fill="#4a3a00" opacity="0.7"/>
                <!-- Contamination particles in water -->
                <circle cx="370" cy="380" r="4" fill="#2a1a00" opacity="0.8"/>
                <circle cx="400" cy="370" r="3" fill="#3a2a00" opacity="0.7"/>
                <circle cx="420" cy="390" r="5" fill="#2a1a00" opacity="0.8"/>
                <circle cx="385" cy="400" r="3" fill="#4a3a00" opacity="0.6"/>
                <!-- Warning symbol -->
                <circle cx="400" cy="250" r="30" fill="none" stroke="#ff4444" stroke-width="3" opacity="0.8"/>
                <line x1="400" y1="230" x2="400" y2="260" stroke="#ff4444" stroke-width="4" opacity="0.8"/>
                <circle cx="400" cy="268" r="3" fill="#ff4444" opacity="0.8"/>
                <!-- People silhouettes (sick) -->
                <circle cx="150" cy="200" r="20" fill="#2a2a2a" opacity="0.6"/>
                <rect x="140" y="220" width="20" height="50" rx="5" fill="#2a2a2a" opacity="0.6"/>
                <path d="M140,240 L120,260 M160,240 L180,260" stroke="#2a2a2a" stroke-width="4" opacity="0.6"/>
                <path d="M140,270 L130,300 M160,270 L170,300" stroke="#2a2a2a" stroke-width="4" opacity="0.6"/>
                <!-- X over water symbol -->
                <circle cx="650" cy="200" r="50" fill="none" stroke="#ff4444" stroke-width="4" opacity="0.6"/>
                <line x1="615" y1="165" x2="685" y2="235" stroke="#ff4444" stroke-width="4" opacity="0.6"/>
                <path d="M620,200 Q650,185 680,200 Q650,215 620,200Z" fill="#0077b6" opacity="0.4"/>
            </svg>`,

        'town': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="townSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0a1a2e"/>
                        <stop offset="100%" stop-color="#1a3a5c"/>
                    </linearGradient>
                    <linearGradient id="townSea" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0a4f7a"/>
                        <stop offset="100%" stop-color="#041e2e"/>
                    </linearGradient>
                </defs>
                <!-- Sky -->
                <rect width="800" height="500" fill="url(#townSky)"/>
                <!-- Moon -->
                <circle cx="680" cy="80" r="35" fill="#f0e68c" opacity="0.8"/>
                <circle cx="695" cy="70" r="30" fill="#1a3a5c" opacity="0.9"/>
                <!-- Stars -->
                <circle cx="100" cy="60" r="2" fill="white" opacity="0.7"/>
                <circle cx="200" cy="40" r="1.5" fill="white" opacity="0.6"/>
                <circle cx="350" cy="70" r="2" fill="white" opacity="0.8"/>
                <circle cx="450" cy="30" r="1.5" fill="white" opacity="0.5"/>
                <circle cx="550" cy="55" r="2" fill="white" opacity="0.7"/>
                <!-- Hills/land -->
                <path d="M0,300 Q100,250 200,280 Q300,310 400,270 Q500,230 600,260 Q700,290 800,270 L800,500 L0,500 Z" fill="#1a3a1a"/>
                <!-- Houses -->
                <rect x="80" y="260" width="60" height="50" fill="#2a2a3a"/>
                <polygon points="80,260 110,235 140,260" fill="#3a2a2a"/>
                <rect x="95" y="280" width="15" height="30" fill="#4a3a2a"/>
                <rect x="115" y="270" width="20" height="15" fill="#5a6a7a" opacity="0.6"/>
                
                <rect x="180" y="255" width="70" height="55" fill="#2a2a3a"/>
                <polygon points="180,255 215,225 250,255" fill="#3a2a2a"/>
                <rect x="200" y="275" width="18" height="35" fill="#4a3a2a"/>
                <rect x="225" y="265" width="22" height="18" fill="#5a6a7a" opacity="0.6"/>
                
                <rect x="300" y="248" width="65" height="60" fill="#2a2a3a"/>
                <polygon points="300,248 332,218 365,248" fill="#3a2a2a"/>
                <rect x="318" y="270" width="16" height="38" fill="#4a3a2a"/>
                
                <rect x="420" y="252" width="55" height="56" fill="#2a2a3a"/>
                <polygon points="420,252 447,225 475,252" fill="#3a2a2a"/>
                
                <rect x="530" y="245" width="75" height="63" fill="#2a2a3a"/>
                <polygon points="530,245 567,210 605,245" fill="#3a2a2a"/>
                <!-- Lighthouse -->
                <rect x="700" y="200" width="25" height="80" fill="#d4d4d4" opacity="0.8"/>
                <polygon points="700,200 712,180 725,200" fill="#cc4444" opacity="0.8"/>
                <circle cx="712" cy="195" r="8" fill="#ffff00" opacity="0.9"/>
                <!-- Sea -->
                <path d="M0,360 C200,340 400,380 600,360 C700,350 750,370 800,360 L800,500 L0,500 Z" fill="url(#townSea)"/>
                <!-- Pollution in water (subtle) -->
                <ellipse cx="400" cy="400" rx="200" ry="30" fill="#1a1a0a" opacity="0.3"/>
                <!-- Boat -->
                <path d="M200,370 Q250,360 300,370 L290,385 L210,385 Z" fill="#4a3a2a" opacity="0.8"/>
                <rect x="245" y="355" width="5" height="20" fill="#4a3a2a" opacity="0.8"/>
            </svg>`
    };
    return svgs[type] || svgs['oil-sea'];
}

function initCinematic() {
    currentSlide = 0;
    renderSlide(0);
    updateDots();
    GameState.phase = 'cinematic';

    document.getElementById('cin-next-btn').onclick = nextSlide;
    document.getElementById('scene-cinematic').onclick = (e) => {
        if (e.target.id !== 'cin-next-btn') nextSlide();
    };
}

function renderSlide(index) {
    const container = document.getElementById('cinematic-slides-container');
    container.innerHTML = '';

    const slide = cinematicSlides[index];
    const div = document.createElement('div');
    div.className = 'cinematic-slide active';
    div.innerHTML = `
        <div class="cin-illustration">${getCinematicBg(slide.type)}</div>
        <div class="cinematic-overlay"></div>
        <div class="cinematic-text">
            <h2 id="slide-text"></h2>
        </div>
    `;
    container.appendChild(div);

    typeWriter(document.getElementById('slide-text'), getTranslation(slide.text), 50);

    // Update next button
    const btn = document.getElementById('cin-next-btn');
    btn.textContent = slide.isLast ? getTranslation('Begin Mission →') : getTranslation('Next →');
}

function updateDots() {
    const dots = document.querySelectorAll('.cinematic-dot');
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });
}

function nextSlide() {
    if (GameState.phase !== 'cinematic') return;

    if (currentSlide < cinematicSlides.length - 1) {
        currentSlide++;
        renderSlide(currentSlide);
        updateDots();
    } else {
        GameState.phase = 'residential';
        // fully disable cinematic click handlers once mission starts
        const cinBtn = document.getElementById('cin-next-btn');
        const cinScene = document.getElementById('scene-cinematic');
        if (cinBtn) cinBtn.onclick = null;
        if (cinScene) cinScene.onclick = null;

        // Go to residential world
        Audio.stopBg();
        Audio.play('ambient_ocean', { volume: 0.3, loop: true });
        SceneManager.show('scene-residential', () => {
            initResidential();
        });
    }
}

// ============================================
// SCENE: RESIDENTIAL WORLD & MINIMAP
// ============================================
let worldLoopActive = false;
let worldX = 800;
let worldY = 480;
let worldNearArea = null;

let joystickDir = { x: 0, y: 0 };
let joystickActive = false;
let joystickInitialized = false;

function initJoystick() {
    const joystick = document.getElementById('mobile-joystick');
    if (!joystick) return;
    const base = joystick.querySelector('.joystick-base');
    const knob = joystick.querySelector('.joystick-knob');
    if (!base || !knob) return;

    let baseRect = null;
    const maxRadius = 40; // Max displacement in pixels

    joystick.addEventListener('touchstart', (e) => {
        joystickActive = true;
        baseRect = base.getBoundingClientRect();
        handleTouch(e);
        e.preventDefault();
    }, { passive: false });

    joystick.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        handleTouch(e);
        e.preventDefault();
    }, { passive: false });

    const stopJoystick = () => {
        joystickActive = false;
        joystickDir = { x: 0, y: 0 };
        knob.style.transform = 'translate(-50%, -50%)'; // Reset to center
    };

    joystick.addEventListener('touchend', stopJoystick);
    joystick.addEventListener('touchcancel', stopJoystick);

    function handleTouch(e) {
        if (!baseRect) return;
        const touch = e.touches[0];
        const centerX = baseRect.left + baseRect.width / 2;
        const centerY = baseRect.top + baseRect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            if (distance > maxRadius) {
                dx = (dx / distance) * maxRadius;
                dy = (dy / distance) * maxRadius;
            }
            joystickDir.x = dx / maxRadius;
            joystickDir.y = dy / maxRadius;
        } else {
            joystickDir.x = 0;
            joystickDir.y = 0;
        }

        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
}

const ISLAND_POLY = [
    [120,600],[80,420],[130,220],[280,140],[460,55],[700,40],
    [900,55],[1100,70],[1320,140],[1430,280],[1530,410],
    [1510,600],[1400,710],[1280,820],[1050,880],[820,890],
    [590,900],[330,870],[200,780],[130,730]
];

const WORLD_AREAS = [
    { id: 'coastal',      x: 270,  y: 710, radius: 110, name: 'Coastal Area' },
    { id: 'agricultural', x: 360,  y: 190, radius: 110, name: 'Agricultural Area' },
    { id: 'industrial',   x: 1310, y: 245, radius: 110, name: 'Industrial Area' },
    { id: 'residential',  x: 800,  y: 480, radius: 80,  name: 'Residential Base' }
];

function isOnIsland(px, py) {
    let inside = false;
    for (let i = 0, j = ISLAND_POLY.length - 1; i < ISLAND_POLY.length; j = i++) {
        const [xi, yi] = ISLAND_POLY[i], [xj, yj] = ISLAND_POLY[j];
        if (((yi > py) !== (yj > py)) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}
function showMiniMap() {
    const mapContainer = document.getElementById('mini-map-container');
    if (mapContainer) mapContainer.classList.add('visible');
    initMap(); // ensure listeners are bound
}

function hideMiniMap() {
    const mapContainer = document.getElementById('mini-map-container');
    if (mapContainer) mapContainer.classList.remove('visible');
}

// ============================================
// MAP CRISIS INDICATOR — updates the red pulse
// dot on the minimap based on current game state
// ============================================
function updateMapCrisis() {
    const coastal    = document.getElementById('map-coastal');
    const agri       = document.getElementById('map-agricultural');
    const industrial = document.getElementById('map-industrial');

    if (!coastal) return;

    const coastalStatus = document.getElementById('map-coastal-status');
    const agriStatus    = document.getElementById('map-agri-status');
    const indStatus     = document.getElementById('map-ind-status');

    // Helper: set area state
    function setAreaState(el, statusEl, state, label) {
        el.classList.remove('crisis', 'done');
        const dot = el.querySelector('.map-alert-dot');
        if (dot) dot.style.display = 'none';
        if (state === 'crisis') {
            el.classList.add('crisis');
            if (dot) dot.style.display = '';
            if (statusEl) statusEl.textContent = label || '🚨 CRISIS';
        } else if (state === 'done') {
            el.classList.add('done');
            if (statusEl) statusEl.textContent = label || '✅ SAFE';
        } else {
            // neutral / locked
            if (statusEl) statusEl.textContent = label || '';
        }
    }

    // --- Coastal ---
    if (GameState.allTasksDone()) {
        setAreaState(coastal, coastalStatus, 'done', '✅ SAFE');
    } else {
        setAreaState(coastal, coastalStatus, 'crisis', '🚨 CRISIS');
    }

    // --- Agricultural (only active after Coastal done) ---
    if (GameState.agriCompleted) {
        setAreaState(agri, agriStatus, 'done', '✅ SAFE');
    } else if (GameState.allTasksDone()) {
        setAreaState(agri, agriStatus, 'crisis', '🚨 CRISIS');
    } else {
        setAreaState(agri, agriStatus, 'neutral', '🔒 LOCKED');
    }

    // --- Industrial (only active after Coastal done) ---
    if (GameState.indCompleted) {
        setAreaState(industrial, indStatus, 'done', '✅ SAFE');
    } else if (GameState.allTasksDone()) {
        setAreaState(industrial, indStatus, 'crisis', '🚨 CRISIS');
    } else {
        setAreaState(industrial, indStatus, 'neutral', '🔒 LOCKED');
    }
}


function initResidential() {
    if (GameState.phase !== 'residential') return;
    HUD.show();
    HUD.update();
    updateWorldMapPollution();
    // Hide minimap until the player dismisses the crisis alert on first visit
    // After that, always show it
    if (!GameState.coastalAlertShown) {
        hideMiniMap();
    } else {
        showMiniMap();
    }
    initMap(); // Ensure listeners are bound for E-key navigation
    TodoPanel.hide();
    Audio.stopBg();

    updateMapCrisis();

    if (!joystickInitialized) {
        initJoystick();
        joystickInitialized = true;
    }

    if (GameState.allTasksDone()) {
        const counter = document.getElementById('areas-counter');
        counter.classList.remove('hidden');
        if (GameState.agriCompleted && GameState.indCompleted) {
            counter.textContent = getTranslation('All areas resolved! ✅');
        } else if (GameState.agriCompleted || GameState.indCompleted) {
            counter.textContent = getTranslation('1 area left to solve');
        } else {
            counter.textContent = getTranslation('2 areas left to solve');
        }
    }

    // Update Building States visually
    const bldgCoastal = document.getElementById('world-bldg-coastal');
    const bldgAgri = document.getElementById('world-bldg-agricultural');
    const bldgInd = document.getElementById('world-bldg-industrial');

    function updateWorldBuilding(bldg, state) {
        if (!bldg) return;
        bldg.classList.remove('crisis-glow', 'done-glow', 'locked-glow');
        if (state === 'crisis') bldg.classList.add('crisis-glow');
        else if (state === 'done') bldg.classList.add('done-glow');
        else bldg.classList.add('locked-glow');
    }

    updateWorldBuilding(bldgCoastal, GameState.allTasksDone() ? 'done' : 'crisis');
    updateWorldBuilding(bldgAgri, GameState.agriCompleted ? 'done' : (GameState.allTasksDone() ? 'crisis' : 'locked'));
    updateWorldBuilding(bldgInd, GameState.indCompleted ? 'done' : (GameState.allTasksDone() ? 'crisis' : 'locked'));

    const player = document.getElementById('world-player');
    const prompt = document.getElementById('world-enter-prompt');
    const promptName = document.getElementById('world-enter-area-name');
    const speed = 4;
    let bobPhase = 0;

    prompt.onclick = () => {
        if (GameState.phase === 'residential' && worldNearArea && worldNearArea.id !== 'residential') {
            const mapBtn = document.getElementById(`map-${worldNearArea.id}`);
            if (mapBtn) mapBtn.click();
        }
    };

    function updatePlayer() {
        player.setAttribute('transform', `translate(${worldX}, ${worldY})`);
    }
    updatePlayer();

    if (!worldLoopActive) {
        worldLoopActive = true;
        if (!window.keys) window.keys = { w: false, a: false, s: false, d: false, e: false };

        window.addEventListener('keydown', (e) => {
            if (GameState.phase !== 'residential') return;
            const key = e.key.toLowerCase();
            if (window.keys.hasOwnProperty(key)) {
                window.keys[key] = true;
                if (key === 'e' && worldNearArea && worldNearArea.id !== 'residential') {
                    // Start mission by forcing click on minimap area
                    const mapBtn = document.getElementById(`map-${worldNearArea.id}`);
                    if (mapBtn) mapBtn.click();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (GameState.phase !== 'residential') return;
            const key = e.key.toLowerCase();
            if (window.keys.hasOwnProperty(key)) window.keys[key] = false;
        });

        function checkWorldProximity() {
            let closest = null;
            let minDist = Infinity;
            for (const area of WORLD_AREAS) {
                const dx = worldX - area.x;
                const dy = worldY - area.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < area.radius && dist < minDist) {
                    closest = area;
                    minDist = dist;
                }
            }
            
            if (closest && closest.id !== 'residential') {
                if (worldNearArea !== closest) {
                    worldNearArea = closest;
                    promptName.textContent = closest.name;
                    prompt.classList.remove('hidden');
                }
            } else {
                if (worldNearArea !== null) {
                    worldNearArea = null;
                    prompt.classList.add('hidden');
                }
            }
        }

        function worldLoop() {
            if (GameState.phase === 'residential') {
                // Ignore input when instructions modal or map alert modal is visible
                const isHowToPlayVisible = document.getElementById('modal-how-to-play').classList.contains('visible');
                const isMapAlertVisible = document.getElementById('modal-map-alert').classList.contains('visible');
                if (isHowToPlayVisible || isMapAlertVisible) {
                    requestAnimationFrame(worldLoop);
                    return;
                }

                let dx = 0; let dy = 0;
                if (window.keys.w) dy -= speed;
                if (window.keys.s) dy += speed;
                if (window.keys.a) dx -= speed;
                if (window.keys.d) dx += speed;

                if (joystickActive) {
                    dx = joystickDir.x * speed;
                    dy = joystickDir.y * speed;
                }

                if (dx !== 0 || dy !== 0) {
                    // Normalize diagonal
                    if (!joystickActive && dx !== 0 && dy !== 0) {
                        const len = Math.sqrt(dx*dx + dy*dy);
                        dx = (dx/len) * speed;
                        dy = (dy/len) * speed;
                    }
                    
                    const newX = worldX + dx;
                    const newY = worldY + dy;

                    // Basic bounds check to prevent walking off ocean
                    if (isOnIsland(newX, newY)) {
                        worldX = newX;
                        worldY = newY;
                    } else if (isOnIsland(newX, worldY)) { // slide X
                        worldX = newX;
                    } else if (isOnIsland(worldX, newY)) { // slide Y
                        worldY = newY;
                    }

                    // simple bobbing animation while walking
                    bobPhase += 0.2;
                    const bobY = Math.sin(bobPhase) * 4;
                    player.setAttribute('transform', `translate(${worldX}, ${worldY + bobY})`);
                    
                    checkWorldProximity();
                } else {
                    bobPhase = 0;
                    updatePlayer();
                }
            }
            requestAnimationFrame(worldLoop);
        }
        requestAnimationFrame(worldLoop);
    }

function triggerFirstCrisis() {
    if (GameState.coastalAlertShown) return;
    GameState.coastalAlertShown = true;
    triggerAlarm();
    Modal.show('modal-map-alert');
    document.getElementById('btn-start-mission').onclick = () => {
        Modal.hide('modal-map-alert');
        Toast.show('🚨 Crisis Detected! Walk to the Coastal Area to start your mission.', '', 6000);

        // Reveal minimap and guide player to it
        showMiniMap();
        const mapContainer = document.getElementById('mini-map-container');
        const mapToggleBtn = document.getElementById('btn-map-toggle');
        if (mapContainer) {
            mapContainer.classList.remove('minimized');
            if (mapToggleBtn) mapToggleBtn.textContent = '➖';
            mapContainer.classList.add('map-highlight-pulse');
            setTimeout(() => {
                mapContainer.classList.remove('map-highlight-pulse');
            }, 4000);
        }
    };
}

    // Instructions flow followed by crisis alarm
    if (!GameState.instructionsShown) {
        Modal.show('modal-how-to-play');
        document.getElementById('btn-start-briefing').onclick = () => {
            Modal.hide('modal-how-to-play');
            GameState.instructionsShown = true;
            setTimeout(() => {
                if (GameState.phase === 'residential') {
                    triggerFirstCrisis();
                }
            }, 800);
        };
    } else if (!GameState.coastalAlertShown && !GameState.allTasksDone()) {
        triggerFirstCrisis();
    } else if (GameState.allTasksDone() && !GameState.agriAlertShown && (!GameState.agriCompleted || !GameState.indCompleted)) {
        GameState.agriAlertShown = true;
        setTimeout(() => {
            if (GameState.phase === 'residential') {
                Toast.show('🚨 New crisis zones detected! Check Agricultural & Industrial areas.', '', 5000);
            }
        }, 1200);
    }
}

let mapControllerActive = false;

function initMap() {
    if (mapControllerActive) return;
    mapControllerActive = true;

    const areas = document.querySelectorAll('.mini-map-content .map-area');
    areas.forEach(area => {
        area.onclick = () => {
            enterArea(area.dataset.area);
        };
    });

    function enterArea(areaName) {
        if (areaName === 'coastal') {
            if (!GameState.allTasksDone()) {
                showMissionIntro('Coastal Area',
                    'A pollution crisis has been detected in the Coastal Area! Complete all tasks to restore environmental balance.',
                    () => {
                        GameState.currentArea = areaName;
                        TodoPanel.show();
                        GameState.phase = 'task1';
                        SceneManager.show('scene-task1', () => initTask1());
                    }
                );
            } else {
                Toast.show('Coastal Area is already safe!', '✅', 2000);
            }
        } else if (areaName === 'agricultural') {
            if (GameState.allTasksDone() && !GameState.agriCompleted) {
                showMissionIntro('Agricultural Area',
                    'Pollution detected in the Agricultural Area. Excess nutrients are affecting water quality.',
                    () => {
                        GameState.currentArea = areaName;
                        TodoPanel.show();
                        document.getElementById('todo-0').innerHTML = `<span class="todo-check"></span>${getTranslation('Identify pollution source')}`;
                        document.getElementById('todo-1').innerHTML = `<span class="todo-check"></span>${getTranslation('Apply buffer strips')}`;
                        document.getElementById('todo-2').style.display = 'none';
                        document.getElementById('todo-3').style.display = 'none';
                        document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('done'));
                        document.querySelectorAll('.todo-check').forEach(el => el.textContent = '');

                        GameState.phase = 'agri1';
                        SceneManager.show('scene-agri-task1', () => initAgriTask1());
                    }
                );
            } else if (GameState.agriCompleted) {
                Toast.show('Agricultural Area is already safe!', '✅', 2000);
            } else {
                Toast.show('Solve Coastal Area first!', '🔒', 2000);
            }
        } else if (areaName === 'industrial') {
            if (GameState.allTasksDone() && !GameState.indCompleted) {
                showMissionIntro('Industrial Area',
                    'Pollution detected in the Industrial Area. Untreated wastewater is being released into the river.',
                    () => {
                        GameState.currentArea = areaName;
                        // Switch to factory ambience for Industrial area
                        Audio.stopBg();
                        Audio.play('ambient_factory', { volume: 0.3, loop: true });
                        TodoPanel.show();
                        document.getElementById('todo-0').innerHTML = `<span class="todo-check"></span>${getTranslation('Identify pollution source')}`;
                        document.getElementById('todo-1').innerHTML = `<span class="todo-check"></span>${getTranslation('Stop direct discharge')}`;
                        document.getElementById('todo-2').innerHTML = `<span class="todo-check"></span>${getTranslation('Treat wastewater before release')}`;
                        document.getElementById('todo-2').style.display = 'flex';
                        document.getElementById('todo-3').style.display = 'none';
                        document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('done'));
                        document.querySelectorAll('.todo-check').forEach(el => el.textContent = '');

                        GameState.phase = 'ind1';
                        SceneManager.show('scene-ind-task1', () => initIndTask1());
                    }
                );
            } else if (GameState.indCompleted) {
                Toast.show('Industrial Area is already safe!', '✅', 2000);
            } else {
                Toast.show('Solve Coastal Area first!', '🔒', 2000);
            }
        } else if (areaName === 'residential') {
            GameState.phase = 'residential';
            SceneManager.show('scene-residential', () => {
                initResidential();
                checkAllAreasDone();
            });
        } else {
            Toast.show('Area is locked.', '🔒', 2000);
        }
    }

    function showMissionIntro(title, body, onStart) {
        document.getElementById('mission-intro-title').textContent = getTranslation(title);
        document.getElementById('mission-intro-body').innerHTML = getTranslation(body);
        Modal.show('modal-mission-intro');
        const btn = document.getElementById('btn-mission-start');
        btn.onclick = () => {
            Modal.hide('modal-mission-intro');
            onStart();
        };
    }
}

// ============================================
// SCENE: TASK 1 — SAVE TRAPPED ANIMAL
// ============================================
function initTask1() {
    if (GameState.phase !== 'task1') return;
    const instructionEl = document.getElementById('t1-instruction');
    if (instructionEl) typeWriter(instructionEl, getTranslation('Click the turtle to free it from plastic entanglement'), 40);
    let isHelping = false;
    let progressInterval = null;

    const turtleContainer = document.getElementById('turtle-container');
    const progressBar = document.getElementById('help-progress');
    const progressFill = document.getElementById('help-progress-fill');
    const helpLabel = document.getElementById('help-label');

    turtleContainer.onclick = (e) => {
        if (isHelping) return;
        isHelping = true;

        progressBar.style.display = 'block';
        helpLabel.style.display = 'block';
        helpLabel.textContent = getTranslation('Helping... keep clicking!');

        // Particle effect
        Particles.burst(e.clientX, e.clientY, 6, ['🤲', '💚', '✨']);
        // Play net cutting SFX
        Audio.play('net_cut', { volume: 0.7 });

        let progress = 0;
        progressInterval = setInterval(() => {
            progress += 20;
            progressFill.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(progressInterval);
                completeTask1();
            }
        }, 300);
    };

    function completeTask1() {
        // Animate turtle freed
        const turtleSvg = document.getElementById('turtle-svg-main');
        const net = document.getElementById('plastic-net-overlay');
        const eyesSad = document.getElementById('turtle-eyes-sad');
        const eyesHappy = document.getElementById('turtle-eyes-happy');

        if (turtleSvg) {
            turtleSvg.classList.add('turtle-free');
            turtleSvg.style.transition = 'transform 1.5s ease, filter 1.5s ease';
            turtleSvg.style.transform = 'translateY(-40px) scale(1.1)';
            turtleSvg.style.filter = 'drop-shadow(0 15px 30px rgba(82, 201, 122, 0.8))';
        }

        if (net) {
            net.style.opacity = '0';
            net.style.transform = 'translateY(50px) rotate(20deg)';
        }

        if (eyesSad && eyesHappy) {
            eyesSad.classList.add('hidden');
            eyesHappy.classList.remove('hidden');
        }

        document.getElementById('help-label').textContent = getTranslation('🐢 Animal freed!');

        setTimeout(() => {
            GameState.updateBio(10);
            GameState.completeTask(0);
            Audio.play('task_complete', { volume: 0.8 });
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 12, ['🐢', '💚', '✨', '🌊']);
            Toast.show(getTranslation('Good action! Biodiversity improved.'), getTranslation('🦋 Biodiversity +10'), 3000);

            showContinueModal(
                getTranslation('Task 1 Completed'),
                getTranslation('Great! Marine animal saved. Continue to Task 2: Clean beach plastic.'),
                getTranslation('Next Task →'),
                goToTask2
            );
        }, 1000);
    }

    function goToTask2() {
        GameState.phase = 'task2';
        SceneManager.show('scene-task2', () => {
            initTask2();
        });
    }
}

// ============================================
// SCENE: TASK 2 — CLEAN BEACH PLASTIC
// ============================================
function initTask2() {
    if (GameState.phase !== 'task2') return;
    const instructionEl = document.getElementById('t2-instruction');
    if (instructionEl) typeWriter(instructionEl, getTranslation('Click each trash item to collect it'), 40);
    const trashItems = [
        { emoji: '🧴', x: 6, y: 52 },
        { emoji: '🥤', x: 18, y: 75 },
        { emoji: '🛍️', x: 30, y: 58 },
        { emoji: '🧃', x: 46, y: 82 },
        { emoji: '🍶', x: 60, y: 55 },
        { emoji: '🥡', x: 72, y: 70 },
        { emoji: '🧴', x: 84, y: 62 },
        { emoji: '🪣', x: 38, y: 68 }
    ];

    let collected = 0;
    const total = trashItems.length;
    const scene = document.getElementById('beach-scene-content');
    if (!scene) {
        console.error('Task2 init failed: #beach-scene-content not found');
        return;
    }

    // Clean stale trash items if task re-initialized
    scene.querySelectorAll('.trash-item').forEach((el) => el.remove());

    // Create trash items
    trashItems.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'trash-item';
        el.id = `trash-${index}`;
        el.textContent = item.emoji;
        el.style.left = item.x + '%';
        el.style.top = item.y + '%';
        el.style.animationDelay = (index * 0.3) + 's';
        el.addEventListener('click', () => collectTrash(el, index));
        scene.appendChild(el);
    });

    updateCounter();

    function collectTrash(el, index) {
        if (el.classList.contains('collected')) return;
        el.classList.add('collected');
        // Trash pickup SFX instead of generic click_success
        Audio.play('trash_pickup', { volume: 0.7 });
        Particles.burst(
            el.getBoundingClientRect().left + 20,
            el.getBoundingClientRect().top + 20,
            4, ['✨', '💚']
        );

        collected++;
        updateCounter();

        if (collected >= total) {
            setTimeout(completeTask2, 800);
        }
    }

    function updateCounter() {
        const counter = document.getElementById('beach-counter');
        if (counter) counter.textContent = `🗑️ ${collected} / ${total} ${getTranslation('cleaned')}`;
    }

    function completeTask2() {
        GameState.updateWater(10);
        GameState.updateBio(5);
        GameState.completeTask(1);
        Audio.play('task_complete', { volume: 0.8 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🌊', '✨', '💧', '🌿']);
        Toast.show(getTranslation('Beach cleaned successfully!'), getTranslation('💧 Water Quality +10  🦋 Biodiversity +5'), 3500);

        // Shake trash bin
        const bin = document.getElementById('trash-bin');
        if (bin) bin.classList.add('shake');

        showContinueModal(
            getTranslation('Task 2 Completed'),
            getTranslation('Beach cleaned successfully. Continue to Task 3: Stop oil leak source.'),
            getTranslation('Next Task →'),
            () => {
                GameState.phase = 'task3';
                SceneManager.show('scene-task3', () => {
                    initTask3();
                });
            }
        );
    }
}

// ============================================
// SCENE: TASK 3 — STOP OIL LEAK
// ============================================
function initTask3() {
    if (GameState.phase !== 'task3') return;

    // Start underwater ambience for this scene
    Audio.stopBg();
    Audio.play('ambient_underwater', { volume: 0.5, loop: true });

    const instructionEl = document.getElementById('t3-instruction');
    if (instructionEl) typeWriter(instructionEl, getTranslation('Apply glue on all 4 edges of the patch plate, then drag it to the crack!'), 35);

    // ── STEP 1: Glue all 4 edges ──────────────────────────────────────
    const edges = ['top', 'right', 'bottom', 'left'];
    const glued = new Set();
    const hintEl = document.getElementById('t3-glue-hint');

    edges.forEach(edgeName => {
        const el = document.getElementById(`t3-edge-${edgeName}`);
        if (!el) return;
        el.addEventListener('click', () => {
            if (glued.has(edgeName)) return;
            glued.add(edgeName);
            el.classList.add('glued');
            el.textContent = getTranslation('✔ GLUED');
            // Glue squish SFX would be ideal; use metal_snap as close alternative since no glue_squish in assets
            Audio.play('click_success', { volume: 0.5 });
            Particles.burst(el.getBoundingClientRect().left + 12, el.getBoundingClientRect().top + 12, 4, ['✨', '🟡']);

            if (hintEl) hintEl.textContent = `${getTranslation('Apply glue')} (${glued.size}/4)`;

            if (glued.size === 4) {
                setTimeout(startStep2, 600);
            }
        });
    });

    // ── STEP 2: Drag glued plate to crack ────────────────────────────
    function startStep2() {
        const gluePanel = document.getElementById('t3-glue-panel');
        if (gluePanel) gluePanel.classList.add('hidden');

        const plate = document.getElementById('t3-draggable-plate');
        if (!plate) return;
        plate.classList.remove('hidden');

        if (instructionEl) typeWriter(instructionEl, getTranslation('Now drag the patch plate to the crack on the pipe!'), 40);

        // Drag logic
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        plate.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = plate.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            plate.style.transition = 'none';
            plate.style.right = 'unset';
            plate.style.transform = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Touch support
        plate.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = plate.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            plate.style.transition = 'none';
            plate.style.right = 'unset';
            plate.style.transform = 'none';
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);

        function movePlateTo(clientX, clientY) {
            if (!isDragging) return;
            plate.style.left = (clientX - offsetX) + 'px';
            plate.style.top = (clientY - offsetY) + 'px';
        }

        function onMouseMove(e) { movePlateTo(e.clientX, e.clientY); }
        function onTouchMove(e) {
            e.preventDefault();
            movePlateTo(e.touches[0].clientX, e.touches[0].clientY);
        }

        function checkDrop(clientX, clientY) {
            isDragging = false;
            const dropzone = document.getElementById('t3-dropzone');
            if (!dropzone) return;
            const dz = dropzone.getBoundingClientRect();
            const px = clientX;
            const py = clientY;
            // Did the plate's center land inside/near the dropzone?
            if (px > dz.left - 30 && px < dz.right + 30 && py > dz.top - 30 && py < dz.bottom + 30) {
                // Snap plate to dropzone
                plate.style.transition = 'all 0.4s ease';
                plate.style.left = dz.left + 'px';
                plate.style.top = dz.top + 'px';
                plate.style.width = dz.width + 'px';
                plate.style.height = dz.height + 'px';
                cleanup();
                setTimeout(sealPipe, 500);
            }
        }

        function onMouseUp(e) { checkDrop(e.clientX, e.clientY); }
        function onTouchEnd(e) {
            const touch = e.changedTouches[0];
            checkDrop(touch.clientX, touch.clientY);
        }

        function cleanup() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            plate.onmousedown = null;
            plate.ontouchstart = null;
        }
    }

    // ── Seal pipe animation & complete ───────────────────────────────
    function sealPipe() {
        // Stop oil plume
        const plume = document.getElementById('oil-drop-anim');
        if (plume) plume.style.display = 'none';

        // Hide dropzone
        const dz = document.getElementById('t3-dropzone');
        if (dz) dz.style.display = 'none';

        // Show fixed indicator
        const fixed = document.getElementById('pipe-fixed-indicator');
        if (fixed) fixed.classList.remove('hidden');

        // Progress bar animation
        const bar = document.getElementById('fix-progress');
        const fill = document.getElementById('fix-progress-fill');
        if (bar && fill) {
            bar.classList.remove('hidden');
            let p = 0;
            const iv = setInterval(() => {
                p += 20;
                fill.style.width = p + '%';
                if (p >= 100) {
                    clearInterval(iv);
                    completeTask3();
                }
            }, 180);
        } else {
            completeTask3();
        }
    }

    function completeTask3() {
        // Stop underwater ambience when leaving this scene
        Audio.stopBg();
        GameState.completeTask(2);
        Audio.play('task_complete', { volume: 0.8 });
        // Play metal_snap for the satisfying pipe-sealed moment
        Audio.play('metal_snap', { volume: 0.7 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 12, ['🔧', '✅', '✨', '🌊']);
        showContinueModal(
            getTranslation('Task 3 Completed'),
            getTranslation('Great work! The oil leak has been patched. Continue to Task 4: Clean the oil spill.'),
            getTranslation('Next Task →'),
            () => {
                GameState.phase = 'task4';
                SceneManager.show('scene-task4', () => { initTask4(); });
            }
        );
    }
}



// ============================================
// SCENE: TASK 4 — CLEAN OIL SPILL (DECISION)
// ============================================
function initTask4() {
    if (GameState.phase !== 'task4') return;
    const instructionEl = document.getElementById('t4-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Choose a method to clean up the oil spill', 40);

    const stepIndicator = document.getElementById('t4-step-indicator');
    const instruction = document.getElementById('t4-instruction');
    const methodSelection = document.getElementById('t4-method-selection');
    const btnMethodA = document.getElementById('btn-method-a');
    const btnMethodB = document.getElementById('btn-method-b');
    const oilBlob = document.getElementById('t4-oil-blob');
    const oceanContainer = document.getElementById('t4-ocean-container');
    const resultCard = document.getElementById('t4-result-card');

    btnMethodA.onclick = () => {
        showDecisionBoard('burning', () => startMethodA());
    };
    btnMethodB.onclick = () => {
        showDecisionBoard('chemical_coastal', () => startMethodB());
    };

    // ==========================================
    // METHOD A: IN-SITU BURNING
    // ==========================================
    function startMethodA() {
        methodSelection.classList.add('hidden');
        GameState.task4Choice = 'burning';

        // Step 1: Localize
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 1/3 — Containment';
        typeWriter(instruction, 'Draw a containment boom around the oil spill!', 30);

        const canvas = document.getElementById('t4-boom-canvas');
        canvas.classList.remove('hidden');
        // Use getBoundingClientRect for accurate sizing after layout
        const rect = oceanContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        let isDrawing = false;
        let points = [];

        canvas.onmousedown = (e) => {
            e.preventDefault();
            isDrawing = true;
            const cr = canvas.getBoundingClientRect();
            points = [{ x: e.clientX - cr.left, y: e.clientY - cr.top }];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        canvas.onmousemove = (e) => {
            if (!isDrawing) return;
            const cr = canvas.getBoundingClientRect();
            points.push({ x: e.clientX - cr.left, y: e.clientY - cr.top });
            drawPath(ctx, points, true);
        };

        canvas.onmouseup = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            checkBoomSuccess(ctx, points);
        };

        // Also handle mouse leaving canvas while drawing
        canvas.onmouseleave = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            checkBoomSuccess(ctx, points);
        };

        // For touch support
        canvas.ontouchstart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const cr = canvas.getBoundingClientRect();
            isDrawing = true;
            points = [{ x: touch.clientX - cr.left, y: touch.clientY - cr.top }];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        canvas.ontouchmove = (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const touch = e.touches[0];
            const cr = canvas.getBoundingClientRect();
            points.push({ x: touch.clientX - cr.left, y: touch.clientY - cr.top });
            drawPath(ctx, points, true);
        };
        canvas.ontouchend = (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            isDrawing = false;
            checkBoomSuccess(ctx, points);
        };
    }

    function drawPath(ctx, points, isDashed) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 4;
        ctx.setLineDash(isDashed ? [10, 10] : []);
        ctx.stroke();
    }

    function checkBoomSuccess(ctx, points) {
        if (points.length < 8) return;
        const first = points[0];
        const last = points[points.length - 1];
        const dist = Math.hypot(last.x - first.x, last.y - first.y);

        // Bounding box of drawn path
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        // Oil blob center is at 50%,50% of ocean container
        const cx = cw / 2;
        const cy = ch / 2;
        // Loop must: be closed (start~end within 80px), span must enclose blob center
        const spanX = maxX - minX;
        const spanY = maxY - minY;
        const closed = dist < 80;
        const enclosesOil = minX < cx && maxX > cx && minY < cy && maxY > cy;
        const bigEnough = spanX > 60 && spanY > 40;

        if (closed && enclosesOil && bigEnough) {
            // Success — draw solid boom
            drawPath(ctx, points, false);
            // Draw success checkmark text
            ctx.fillStyle = '#ff9800';
            ctx.font = 'bold 18px Exo 2, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✔ Boom Deployed!', cx, cy - 90);

            const canvas = document.getElementById('t4-boom-canvas');
            canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = canvas.onmouseleave = null;
            canvas.ontouchstart = canvas.ontouchmove = canvas.ontouchend = null;

            typeWriter(instruction, '✔ Boom deployed! Oil contained.', 30);
            setTimeout(() => methodA_Step2(), 1200);
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (!closed) {
                typeWriter(instruction, 'Loop not closed! Bring the line back to start. Try again!', 30);
            } else if (!enclosesOil) {
                typeWriter(instruction, 'Loop missed the oil spill! Draw around the dark blob. Try again!', 30);
            } else {
                typeWriter(instruction, 'Loop too small! Draw a bigger circle. Try again!', 30);
            }
        }
    }

    function methodA_Step2() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 2/3 — Ignition';
        typeWriter(instruction, 'The oil is contained. Click IGNITE to start controlled burning!', 30);

        const igniteBtn = document.getElementById('btn-t4-ignite');
        igniteBtn.classList.remove('hidden');

        igniteBtn.onclick = () => {
            igniteBtn.classList.add('hidden');
            typeWriter(instruction, '🔥 Burning in progress...', 30);

            // Get viewport coords of ocean container center for particles
            const rect = oceanContainer.getBoundingClientRect();
            const vcx = rect.left + rect.width / 2;
            const vcy = rect.top + rect.height / 2;

            // Fire particles at correct viewport coordinates
            Particles.burst(vcx, vcy, 20, ['🔥', '💨', '🔥']);
            // Start fire burning sound and keep reference to stop it later
            const fireSfx = Audio.play('fire_burning', { volume: 0.6, loop: true });

            // Stop CSS animation then shrink oil blob
            oilBlob.style.animation = 'none';
            oilBlob.style.transition = 'transform 2.5s ease-out, opacity 2.5s ease-out';
            // Small delay so transition kicks in after animation:none
            setTimeout(() => {
                oilBlob.style.transform = 'translate(-50%, -50%) scale(0.05)';
                oilBlob.style.opacity = '0';
            }, 30);

            // Progress Bar
            const progContainer = document.getElementById('t4-action-progress-container');
            const progBar = document.getElementById('t4-action-progress-bar');
            progBar.style.width = '0%';
            progBar.style.background = 'linear-gradient(90deg, #ff9800, #ffeb3b)';
            progContainer.classList.remove('hidden');

            let prog = 0;
            const interval = setInterval(() => {
                prog += 4;
                progBar.style.width = prog + '%';

                // Random fire/smoke bursts at viewport coords
                if (Math.random() > 0.6) {
                    const offsetX = (Math.random() * 80) - 40;
                    const offsetY = (Math.random() * 40) - 60;
                    Particles.burst(vcx + offsetX, vcy + offsetY, 2, ['🔥', '💨']);
                }

                if (prog >= 100) {
                    clearInterval(interval);
                    // Stop fire looping sound when burning is done
                    if (fireSfx) { fireSfx.pause(); fireSfx.currentTime = 0; }
                    progContainer.classList.add('hidden');
                    methodA_Step3();
                }
            }, 100);
        };
    }

    function methodA_Step3() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 3/3 — Result';
        typeWriter(instruction, 'Cleanup complete.', 30);
        oceanContainer.style.background = 'linear-gradient(180deg, #0a4f7a 0%, #0d3a5c 100%)';

        resultCard.classList.remove('hidden');
        document.getElementById('t4-result-icon').textContent = '✅';
        document.getElementById('t4-result-title').textContent = 'Oil successfully removed by combustion.';
        document.getElementById('t4-r-water').textContent = '+25';
        document.getElementById('t4-r-bio').textContent = '+5';
        document.getElementById('t4-result-info').textContent = 'In-situ burning physically removes oil from the water surface. Some air pollution occurs but marine ecosystem impact is minimal.';

        document.getElementById('btn-t4-complete').onclick = () => finishTask4('burning');
    }

    // ==========================================
    // METHOD B: COREXIT DISPERSANT
    // ==========================================
    function startMethodB() {
        methodSelection.classList.add('hidden');
        GameState.task4Choice = 'chemical';

        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 1/3 — Surface Spraying';
        typeWriter(instruction, 'Drag the boat across the oil spill to spray dispersant!', 30);

        const boat = document.getElementById('t4-boat');
        const canvas = document.getElementById('t4-spray-canvas');
        boat.classList.remove('hidden');
        canvas.classList.remove('hidden');

        // Use getBoundingClientRect for accurate sizing
        const rect = oceanContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        // Reset boat pos — use left/top without transform offset
        // Boat CSS has transform: translate(-50%,-50%) so left/top is its center
        let boatX = canvas.width / 2;
        let boatY = canvas.height * 0.7;
        boat.style.left = boatX + 'px';
        boat.style.top = boatY + 'px';

        let isDragging = false;
        let coverage = 0;
        let done = false;

        const progContainer = document.getElementById('t4-action-progress-container');
        const progBar = document.getElementById('t4-action-progress-bar');
        progBar.style.width = '0%';
        progBar.style.background = 'linear-gradient(90deg, #9c27b0, #ce93d8)';
        progContainer.classList.remove('hidden');

        function stopB1() {
            done = true;
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            boat.ontouchstart = boat.ontouchmove = boat.ontouchend = null;
            boat.onmousedown = null;
            typeWriter(instruction, '✔ Surface spraying complete!', 30);
            progContainer.classList.add('hidden');
            setTimeout(() => methodB_Step2(), 1000);
        }

        function updateCoverage(bx, by) {
            // Draw spray circle on canvas
            ctx.fillStyle = 'rgba(156, 39, 176, 0.18)';
            ctx.beginPath();
            ctx.arc(bx, by, 25, 0, Math.PI * 2);
            ctx.fill();
            // Add a bright center dot
            ctx.fillStyle = 'rgba(206, 147, 216, 0.4)';
            ctx.beginPath();
            ctx.arc(bx, by, 8, 0, Math.PI * 2);
            ctx.fill();

            // Coverage increases when dragging near the oil (center area)
            const distFromCenter = Math.hypot(bx - canvas.width / 2, by - canvas.height / 2);
            if (distFromCenter < 130) {
                coverage += 0.8;
                progBar.style.width = Math.min(coverage, 100) + '%';
                if (coverage >= 100 && !done) stopB1();
            }
        }

        function onMouseMove(e) {
            if (!isDragging || done) return;
            const r = oceanContainer.getBoundingClientRect();
            boatX = e.clientX - r.left;
            boatY = e.clientY - r.top;
            // Clamp inside container
            boatX = Math.max(0, Math.min(canvas.width, boatX));
            boatY = Math.max(0, Math.min(canvas.height, boatY));
            boat.style.left = boatX + 'px';
            boat.style.top = boatY + 'px';
            updateCoverage(boatX, boatY);
        }
        function onMouseUp() { isDragging = false; }

        boat.onmousedown = (e) => { e.preventDefault(); isDragging = true; };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Touch support
        boat.ontouchstart = (e) => { e.preventDefault(); isDragging = true; };
        boat.ontouchmove = (e) => {
            e.preventDefault();
            if (!isDragging || done) return;
            const touch = e.touches[0];
            const r = oceanContainer.getBoundingClientRect();
            boatX = Math.max(0, Math.min(canvas.width, touch.clientX - r.left));
            boatY = Math.max(0, Math.min(canvas.height, touch.clientY - r.top));
            boat.style.left = boatX + 'px';
            boat.style.top = boatY + 'px';
            updateCoverage(boatX, boatY);
        };
        boat.ontouchend = () => { isDragging = false; };
    }

    function methodB_Step2() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 2/3 — Submarine Injection';
        typeWriter(instruction, 'Click the injection point 3 times to inject dispersant into the leak source!', 30);

        document.getElementById('t4-boat').classList.add('hidden');
        document.getElementById('t4-spray-canvas').classList.add('hidden');
        // Hide surface oil blob — transitioning to underwater view
        oilBlob.classList.add('hidden');

        // Hide & reset progress bar from step 1
        const progContainer = document.getElementById('t4-action-progress-container');
        const progBar = document.getElementById('t4-action-progress-bar');
        progContainer.classList.add('hidden');
        progBar.style.width = '0%';

        const uwScene = document.getElementById('t4-underwater-scene');
        uwScene.classList.remove('hidden');

        const injectTarget = document.getElementById('t4-inject-target');
        const counter = document.getElementById('t4-inject-counter');
        counter.textContent = 'Injections: 0/3';

        let clicks = 0;
        injectTarget.onclick = () => {
            clicks++;
            counter.textContent = `Injections: ${clicks}/3`;

            // Animate inject target briefly
            injectTarget.style.background = 'rgba(156,39,176,0.4)';
            setTimeout(() => { injectTarget.style.background = ''; }, 300);

            // Particles at viewport coords of the inject target
            const r = injectTarget.getBoundingClientRect();
            const vx = r.left + r.width / 2;
            const vy = r.top + r.height / 2;
            Particles.burst(vx, vy, 6, ['🫧', '💧', '🟣']);
            Audio.play('chemical_spray', { volume: 0.5 });

            if (clicks >= 3) {
                injectTarget.onclick = null;
                injectTarget.style.animation = 'none';
                injectTarget.style.borderColor = '#4caf50';
                typeWriter(instruction, '✔ Injection complete. Dispersant deployed!', 30);
                setTimeout(() => methodB_Step3(), 1200);
            }
        };
    }

    function methodB_Step3() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 3/3 — Result';
        typeWriter(instruction, 'Cleanup complete.', 30);

        // Show sick fish
        const fishContainer = document.getElementById('t4-fish-container');
        fishContainer.classList.remove('hidden');
        fishContainer.innerHTML = `
            <div class="fish-sick" style="top: 30%; left: 30%;">🐟</div>
            <div class="fish-sick" style="top: 50%; left: 70%; animation-delay: 0.5s;">🐠</div>
            <div class="fish-sick" style="top: 70%; left: 40%; animation-delay: 1s;">🐡</div>
        `;

        resultCard.classList.remove('hidden');
        document.getElementById('t4-result-icon').textContent = '⚠️';
        document.getElementById('t4-result-title').textContent = 'Oil dispersed — but not removed.';

        document.getElementById('t4-r-water').textContent = '+20';

        const bioSpan = document.getElementById('t4-r-bio');
        bioSpan.textContent = '−15';
        bioSpan.classList.add('negative');

        const warning = document.getElementById('t4-result-warning');
        warning.classList.remove('hidden');
        warning.innerHTML = 'Chemical dispersants break oil into tiny droplets that remain in the water column, making them more accessible to marine life. Toxic to fish, coral, and plankton.';

        document.getElementById('t4-result-info').textContent = 'Used in Deepwater Horizon (2010) — still debated by scientists.';

        document.getElementById('btn-t4-complete').onclick = () => finishTask4('chemical');
    }

    function finishTask4(method) {
        if (method === 'burning') {
            GameState.updateWater(25);
            GameState.updateBio(5);
            Audio.play('task_complete', { volume: 0.8 });
        } else {
            GameState.updateWater(20);
            GameState.updateBio(-15);
            Audio.play('task_complete', { volume: 0.8 });
        }

        GameState.completeTask(3);

        showContinueModal(
            'Coastal Area Saved',
            'You have completed all tasks in the Coastal Area! Return to the Residential Area.',
            'Return to World',
            () => {
                GameState.phase = 'residential';
                SceneManager.show('scene-residential', () => initResidential());
            }
        );
    }
}

// ============================================
// SCENE: AGRICULTURAL TASK 1
// ============================================
function initAgriTask1() {
    if (GameState.phase !== 'agri1') return;
    const instructionEl = document.getElementById('agri1-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Scan the farm area to find the source of pollution.', 40);

    const scanArea = document.getElementById('farm-scan-area');
    const progBar = document.getElementById('scan-progress');
    const progFill = document.getElementById('scan-progress-fill');
    const typingText = document.getElementById('agri-typing-text');
    const nextBtn = document.getElementById('btn-agri1-next');
    const runoffAnim = document.getElementById('runoff-anim-layer');

    let isScanning = false;
    let scanProgress = 0;

    scanArea.onclick = (e) => {
        if (isScanning) return;
        isScanning = true;
        scanArea.classList.remove('alert-pulse');
        scanArea.style.borderColor = 'var(--teal)';

        progBar.style.display = 'block';
        Particles.burst(e.clientX, e.clientY, 5, ['🔎', '✨']);
        Audio.play('click_success', { volume: 0.5 });

        runoffAnim.classList.remove('hidden');

        const interval = setInterval(() => {
            scanProgress += 20;
            progFill.style.width = scanProgress + '%';

            if (scanProgress >= 100) {
                clearInterval(interval);
                completeAgri1();
            }
        }, 400);
    };

    function completeAgri1() {
        progBar.style.display = 'none';
        scanArea.style.display = 'none';

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';
        const msg = "Fertilizers from farms are flowing into the water. These nutrients can pollute water and harm the ecosystem.";

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    Toast.show('Source identified.', '☑', 3000);
                    Audio.play('task_complete', { volume: 0.8 });
                    GameState.completeTask(0, true);
                    nextBtn.classList.remove('hidden');
                }, 1000);
            }
        }, 50);
    }

    nextBtn.onclick = () => {
        GameState.phase = 'agri2';
        SceneManager.show('scene-agri-task2', () => initAgriTask2());
    };
}

// ============================================
// SCENE: AGRICULTURAL TASK 2
// ============================================
function initAgriTask2() {
    if (GameState.phase !== 'agri2') return;
    const instructionEl = document.getElementById('agri2-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Plant vegetation along the river to filter runoff.', 40);

    const slotsContainer = document.getElementById('plant-slots-container');
    const riverDirty = document.getElementById('agri2-river-dirty');
    const counter = document.getElementById('plant-counter');

    slotsContainer.innerHTML = '';
    const totalSlots = 8;
    let plantedCount = 0;

    const positions = [
        { x: 350, y: 150, type: '🌱' }, { x: 380, y: 220, type: '🌱' }, { x: 320, y: 280, type: '🌱' },
        { x: 420, y: 350, type: '🌿' }, { x: 390, y: 420, type: '🌿' }, { x: 450, y: 480, type: '🌿' },
        { x: 480, y: 550, type: '🌳' }, { x: 520, y: 580, type: '🌳' }
    ];

    positions.forEach((pos, idx) => {
        const slot = document.createElement('div');
        slot.className = 'plant-slot';
        slot.style.left = pos.x + 'px';
        slot.style.top = pos.y + 'px';

        slot.onclick = (e) => {
            if (slot.classList.contains('planted')) return;
            slot.classList.add('planted');
            slot.textContent = pos.type;

            Particles.burst(e.clientX, e.clientY, 4, ['✨', '💚', pos.type]);
            Audio.play('shovel_dig', { volume: 0.6, duration: 2 });

            plantedCount++;
            counter.textContent = `🌱 ${plantedCount} / ${totalSlots} planted`;

            const opacity = 0.8 - (plantedCount / totalSlots) * 0.8;
            riverDirty.style.opacity = opacity;

            if (plantedCount >= totalSlots) {
                setTimeout(completeAgri2, 800);
            }
        };
        slotsContainer.appendChild(slot);
    });

    function completeAgri2() {
        GameState.updateWater(15);
        GameState.updateBio(10);
        GameState.agriCompleted = true;
        GameState.completeTask(1, true);

        Audio.play('task_complete', { volume: 0.8 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🌱', '🌊', '🦋']);
        Toast.show('Runoff successfully reduced.', '💧+15 🦋+10', 3500);

        showContinueModal(
            'Mission Complete',
            'Runoff successfully reduced. Return to the residential area.',
            'Return to World',
            () => {
                GameState.phase = 'residential';
                SceneManager.show('scene-residential', () => initResidential());
            }
        );
    }
}

// ============================================
// SCENE: INDUSTRIAL TASK 1
// ============================================
function initIndTask1() {
    if (GameState.phase !== 'ind1') return;
    const instructionEl = document.getElementById('ind1-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Locate the source of industrial wastewater.', 40);
    // ambient_factory is already playing (started by enterArea())

    const pipeArea = document.getElementById('ind-pipe-area');
    const typingText = document.getElementById('ind1-typing-text');
    const nextBtn = document.getElementById('btn-ind1-next');

    let isIdentified = false;

    pipeArea.onclick = (e) => {
        if (isIdentified) return;
        isIdentified = true;
        pipeArea.classList.remove('alert-pulse');
        pipeArea.style.borderColor = 'var(--teal)';

        Particles.burst(e.clientX, e.clientY, 5, ['🔎', '✨']);
        Audio.play('click_success', { volume: 0.5 });

        Toast.show('Source identified.', '☑', 3000);
        GameState.completeTask(0, true);

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';

        const msg1 = "Factories are releasing untreated waste into the water.";
        const msg2 = " Industrial waste may contain toxic chemicals and heavy metals.";
        const fullMsg = msg1 + msg2;

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += fullMsg.charAt(i);
            i++;
            if (i >= fullMsg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    nextBtn.classList.remove('hidden');
                }, 500);
            }
        }, 40);
    };

    nextBtn.onclick = () => {
        GameState.phase = 'ind2';
        SceneManager.show('scene-ind-task2', () => initIndTask2());
    };
}

// ============================================
// SCENE: INDUSTRIAL TASK 2
// ============================================
function initIndTask2() {
    if (GameState.phase !== 'ind2') return;
    const instructionEl = document.getElementById('ind2-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Fix the leaking pipe joint. Drag missing bolts and tighten all.', 40);

    const container = document.getElementById('ind2-bolts-container');
    const toolbox = document.getElementById('ind2-toolbox');
    const wrench = document.getElementById('ind2-wrench');
    const successMsg = document.getElementById('ind2-success-msg');
    const leakAnim = document.getElementById('ind2-leak-anim');

    container.innerHTML = '';
    toolbox.innerHTML = '';
    successMsg.classList.add('hidden');

    const slotPositions = [
        { x: 370, y: 240, hasBolt: true }, { x: 430, y: 240, hasBolt: false },
        { x: 370, y: 280, hasBolt: false }, { x: 430, y: 280, hasBolt: true },
        { x: 370, y: 320, hasBolt: true }, { x: 430, y: 320, hasBolt: false },
        { x: 370, y: 360, hasBolt: false }, { x: 430, y: 360, hasBolt: true }
    ];

    let boltsTightened = 0;
    let selectedBoltElement = null;

    // Create missing bolts in toolbox
    for (let i = 0; i < 4; i++) {
        const toolBolt = document.createElement('div');
        toolBolt.className = 'ind-bolt';
        toolBolt.textContent = '🔩';
        toolBolt.draggable = true;
        toolBolt.dataset.tool = 'true';

        toolBolt.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', 'bolt');
            setTimeout(() => toolBolt.style.opacity = '0.5', 0);
        };
        toolBolt.ondragend = () => {
            toolBolt.style.opacity = '1';
        };
        toolBolt.onclick = () => {
            if (selectedBoltElement) {
                selectedBoltElement.classList.remove('selected-bolt');
            }
            if (selectedBoltElement === toolBolt) {
                selectedBoltElement = null;
            } else {
                selectedBoltElement = toolBolt;
                toolBolt.classList.add('selected-bolt');
            }
        };
        toolbox.appendChild(toolBolt);
    }

    // Create slots and pre-existing bolts
    slotPositions.forEach((pos, idx) => {
        const slot = document.createElement('div');
        slot.className = 'bolt-slot' + (pos.hasBolt ? ' filled' : '');
        slot.style.left = pos.x + 'px';
        slot.style.top = pos.y + 'px';

        if (pos.hasBolt) {
            const bolt = document.createElement('div');
            bolt.className = 'ind-bolt';
            bolt.textContent = '🔩';
            slot.appendChild(bolt);
        }

        slot.ondragover = (e) => {
            e.preventDefault();
        };
        slot.ondrop = (e) => {
            e.preventDefault();
            if (slot.children.length > 0) return;
            const data = e.dataTransfer.getData('text/plain');
            if (data === 'bolt') {
                const availableBolts = toolbox.querySelectorAll('.ind-bolt');
                if (availableBolts.length > 0) {
                    availableBolts[0].remove();
                    const bolt = document.createElement('div');
                    bolt.className = 'ind-bolt';
                    bolt.textContent = '🔩';
                    slot.appendChild(bolt);
                    slot.classList.add('filled');
                    Audio.play('click_success', { volume: 0.5 });
                }
            }
        };

        slot.onclick = () => {
            if (slot.classList.contains('filled') || slot.children.length > 0) return;
            if (selectedBoltElement) {
                selectedBoltElement.remove();
                selectedBoltElement = null;

                const bolt = document.createElement('div');
                bolt.className = 'ind-bolt';
                bolt.textContent = '🔩';
                slot.appendChild(bolt);
                slot.classList.add('filled');
                Audio.play('click_success', { volume: 0.5 });
            }
        };

        container.appendChild(slot);
    });

    let selectedWrench = false;
    wrench.onclick = () => {
        selectedWrench = !selectedWrench;
        wrench.style.background = selectedWrench ? '#2980b9' : '#222';
    };

    container.onclick = (e) => {
        if (!selectedWrench) return;
        const target = e.target;
        if (target.classList.contains('ind-bolt') && !target.classList.contains('tightened')) {
            target.classList.add('tightened');
            target.textContent = '✅';
            Audio.play('wrench_ratchet', { volume: 0.7 });
            Particles.burst(e.clientX, e.clientY, 4, ['🔧', '✨']);

            boltsTightened++;
            if (boltsTightened === 8) {
                completeInd2();
            }
        }
    };

    function completeInd2() {
        leakAnim.style.display = 'none';
        GameState.completeTask(1, true);
        Audio.play('task_complete', { volume: 0.8 });

        successMsg.classList.remove('hidden');
        successMsg.innerHTML = '';

        const msg = "Discharge successfully stopped.";
        let i = 0;
        const typeInterval = setInterval(() => {
            successMsg.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    GameState.phase = 'ind3';
                    SceneManager.show('scene-ind-task3', () => initIndTask3());
                }, 2000);
            }
        }, 50);
    }
}

// ============================================
// SCENE: INDUSTRIAL TASK 3 - WASTEWATER TREATMENT WITH INTERACTIVE MECHANICS
// ============================================
function initIndTask3() {
    if (GameState.phase !== 'ind3') return;
    const instructionEl = document.getElementById('ind3-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Choose a method to treat the remaining wastewater.', 40);

    const btn1 = document.getElementById('btn-ind-method1');
    const btn2 = document.getElementById('btn-ind-method2');
    const btn3 = document.getElementById('btn-ind-method3');
    const methodSelection = document.getElementById('ind3-method-selection');
    const gameplayArea = document.getElementById('ind3-gameplay-area');
    const typingText = document.getElementById('ind3-typing-text');
    const nextBtn = document.getElementById('btn-ind3-next');
    const poolMain = document.getElementById('ind3-pool-main');
    const poolClean = document.getElementById('ind3-pool-clean');

    let methodChosen = false;

    function showGameplay(method) {
        if (methodChosen) return;
        methodChosen = true;
        methodSelection.style.display = 'none';
        gameplayArea.classList.remove('hidden');
        gameplayArea.style.display = 'flex';

        if (method === 'filtration') initFiltrationGame();
        else if (method === 'chemical') initChemicalGame();
        else if (method === 'bacteria') initBacteriaGame();
    }

    // -------- FILTRATION MECHANIC --------
    function initFiltrationGame() {
        const filtrationArea = document.getElementById('ind3-filtration-area');
        filtrationArea.classList.remove('hidden');
        filtrationArea.style.display = 'flex';

        const layers = document.querySelectorAll('#ind3-filtration-area .ind-filter-layer');
        let clickedLayers = 0;

        layers.forEach((layer, idx) => {
            if (idx === 0) {
                layer.style.display = 'flex';
            }
            layer.onclick = () => {
                if (layer.classList.contains('completed')) return;
                layer.classList.add('completed');
                layer.style.opacity = '0.5';
                clickedLayers++;

                // Layer 1 = gravel (stone_grind), layer 2 = sand (sand_pour), layer 3 = charcoal (stone_grind)
                if (idx === 0 || idx === 2) {
                    Audio.play('stone_grind', { volume: 0.6 });
                } else {
                    Audio.play('sand_pour', { volume: 0.6 });
                }
                Particles.burst(layer.getBoundingClientRect().left + 35, layer.getBoundingClientRect().top + 45, 8, ['✨', '💧']);

                if (idx < layers.length - 1) {
                    setTimeout(() => {
                        layers[idx + 1].style.display = 'flex';
                    }, 600);
                }

                // Update pool color gradually
                const progress = clickedLayers / 3;
                poolMain.style.fill = `rgb(${Math.round(139 - (139 - 46) * progress)}, ${Math.round(69 - (69 - 180) * progress)}, ${Math.round(19 + (180 - 19) * progress)})`;

                if (clickedLayers === 3) {
                    setTimeout(() => {
                        poolClean.style.fill = '#2ecc71';
                        completeTreatment('filtration', 15, 0);
                    }, 1000);
                }
            };
        });
    }

    // -------- CHEMICAL MECHANIC --------
    function initChemicalGame() {
        const chemicalArea = document.getElementById('ind3-chemical-area');
        chemicalArea.classList.remove('hidden');
        chemicalArea.style.display = 'flex';

        const bottle = document.getElementById('ind3-chemical-bottle');
        const poolMainRect = poolMain.getBoundingClientRect();
        const poolMainCenterX = poolMainRect.left + poolMainRect.width / 2;
        const poolMainCenterY = poolMainRect.top + poolMainRect.height / 2;

        let isDragging = false;
        let isDropped = false;
        let isBottleSelected = false;

        bottle.onclick = () => {
            if (isDropped) return;
            isBottleSelected = !isBottleSelected;
            bottle.classList.toggle('selected-bottle', isBottleSelected);
        };

        poolMain.onclick = (e) => {
            if (isBottleSelected && !isDropped) {
                isDropped = true;
                isBottleSelected = false;
                bottle.classList.remove('selected-bottle');

                Audio.play('chemical_spray', { volume: 0.7 });
                Audio.play('liquid_splash', { volume: 0.6 });
                Particles.burst(poolMainCenterX, poolMainCenterY, 20, ['🧪', '✨', '💧']);

                // Animate pool clearing
                poolMain.style.fill = '#2ecc71';
                setTimeout(() => {
                    poolClean.style.fill = '#2ecc71';
                    completeTreatment('chemical', 20, 0);
                }, 1000);
            }
        };

        bottle.ondragstart = (e) => {
            isDragging = true;
            e.dataTransfer.effectAllowed = 'move';
            bottle.style.opacity = '0.6';
        };

        bottle.ondragend = () => {
            isDragging = false;
            bottle.style.opacity = '1';
        };

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            if (!isDragging || isDropped) return;
            isDropped = true;

            const dropX = e.clientX;
            const dropY = e.clientY;
            const distance = Math.sqrt(
                Math.pow(dropX - poolMainCenterX, 2) +
                Math.pow(dropY - poolMainCenterY, 2)
            );

            if (distance < 120) {
                Audio.play('chemical_spray', { volume: 0.7 });
                // Liquid splash SFX when chemical hits pool
                Audio.play('liquid_splash', { volume: 0.6 });
                Particles.burst(poolMainCenterX, poolMainCenterY, 20, ['🧪', '✨', '💧']);

                // Animate pool clearing
                poolMain.style.fill = '#2ecc71';
                setTimeout(() => {
                    poolClean.style.fill = '#2ecc71';
                    completeTreatment('chemical', 20, 0);
                }, 1000);
            } else {
                isDropped = false;
                Toast.show('Drag the bottle to the treatment pool!', '🧪', 2000);
            }
        });
    }

    // -------- BACTERIA MECHANIC --------
    function initBacteriaGame() {
        const bacteriaArea = document.getElementById('ind3-bacteria-area');
        bacteriaArea.classList.remove('hidden');
        bacteriaArea.style.display = 'flex';

        const feedBtn = document.getElementById('ind3-bacteria-feed-btn');
        const bacteriaDisplay = document.getElementById('ind3-bacteria-display');
        const countSpan = document.getElementById('bacteria-feed-count');

        let feedCount = 0;
        const maxFeeds = 3;
        let feedInProgress = false;

        feedBtn.onclick = () => {
            if (feedInProgress || feedCount >= maxFeeds) return;
            feedInProgress = true;
            feedCount++;
            countSpan.textContent = maxFeeds - feedCount;

            // Bacteria bubble SFX when releasing cultures
            Audio.play('bacteria_bubble', { volume: 0.7 });

            // Add bacteria emoji
            bacteriaDisplay.innerHTML += '🦠';
            Particles.burst(bacteriaDisplay.getBoundingClientRect().left + 50, bacteriaDisplay.getBoundingClientRect().top + 40, 5, ['🦠', '✨']);

            // Update pool color
            const progress = feedCount / maxFeeds;
            poolMain.style.fill = `rgb(${Math.round(74 - (74 - 46) * progress)}, ${Math.round(124 - (124 - 180) * progress)}, ${Math.round(89 + (180 - 89) * progress)})`;

            setTimeout(() => {
                feedInProgress = false;
                if (feedCount === maxFeeds) {
                    feedBtn.disabled = true;
                    feedBtn.style.opacity = '0.5';

                    setTimeout(() => {
                        poolClean.style.fill = '#2ecc71';
                        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🦠', '✨', '🌿']);
                        completeTreatment('bacteria', 15, 15);
                    }, 1500);
                }
            }, 800);
        };
    }

    function completeTreatment(method, waterVal, bioVal) {
        gameplayArea.classList.add('hidden');
        GameState.updateWater(waterVal);
        GameState.updateBio(bioVal);

        if (bioVal > 0) {
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 25, ['🦠', '✨', '💧', '🌿', '🌱']);
        } else {
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['✨', '💧', '💙']);
        }

        const resultCard = document.getElementById('ind3-result-card');
        if (resultCard) resultCard.classList.remove('hidden');

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';

        const methodNames = { 'filtration': 'Filtration', 'chemical': 'Chemical Coagulation', 'bacteria': 'Bacterial Treatment' };
        const msg1 = `${methodNames[method]} complete. Water quality restored.`;
        const msg2 = bioVal > 0 ? ' Biodiversity improved!' : '';
        const fullMsg = msg1 + msg2;

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += fullMsg.charAt(i);
            i++;
            if (i >= fullMsg.length) {
                clearInterval(typeInterval);
                GameState.indCompleted = true;
                GameState.completeTask(2, true);
                nextBtn.classList.remove('hidden');
            }
        }, 40);
    }

    btn1.onclick = () => {
        showDecisionBoard('filtration', () => {
            GameState.ind3Choice = 'filtration';
            showGameplay('filtration');
        });
    };
    btn2.onclick = () => {
        showDecisionBoard('chemical_industrial', () => {
            GameState.ind3Choice = 'chemical';
            showGameplay('chemical');
        });
    };
    btn3.onclick = () => {
        showDecisionBoard('bacteria', () => {
            GameState.ind3Choice = 'bacteria';
            showGameplay('bacteria');
        });
    };

    nextBtn.onclick = () => {
        GameState.phase = 'residential';
        SceneManager.show('scene-residential', () => {
            initResidential();
            checkAllAreasDone();
        });
    };
}

function checkAllAreasDone() {
    if (GameState.allTasksDone() && GameState.agriCompleted && GameState.indCompleted) {
        setTimeout(() => {
            const resSvg = document.querySelector('.residential-bg-svg');
            if (resSvg) {
                const grass = resSvg.querySelector('path[fill="#2d9e4f"]');
                if (grass) grass.setAttribute('fill', '#2ecc71');
                const sky = resSvg.querySelector('rect[fill="#8ecae6"]');
                if (sky) sky.setAttribute('fill', '#3498db');
            }

            Toast.show('All pollution sources have been successfully managed.', '✅', 4000);

            setTimeout(() => {
                GameState.phase = 'reflection';
                SceneManager.show('scene-reflection', () => initReflection());
            }, 4000);
        }, 1000);
    }
}

// ============================================
// SCENE: REFLECTION
// ============================================
function initReflection() {
    if (GameState.phase !== 'reflection') return;

    Audio.stopBg();
    Audio.play('ambient_ocean', { volume: 0.6, loop: true });

    const bgSvg = document.querySelector('.reflection-bg-svg');
    bgSvg.style.transform = 'scale(1.2)';

    const textContainer = document.getElementById('reflection-text-container');

    const lines = [
        getTranslation("Protecting water resources is a shared responsibility."),
        getTranslation("Every action has an impact on the environment."),
        getTranslation("The future of the ecosystem depends on the choices we make today.")
    ];

    let currentLine = 0;

    function typeLine() {
        if (currentLine >= lines.length) {
            setTimeout(() => {
                generateEcosystemReportCard();
                Modal.show('modal-you-survived');

                document.getElementById('btn-final-play-again').onclick = () => {
                    location.reload();
                };
                document.getElementById('btn-final-exit').onclick = () => {
                    location.href = 'about:blank';
                };
            }, 2000);
            return;
        }

        textContainer.innerHTML = '';
        const msg = lines[currentLine];
        let i = 0;

        const typeInterval = setInterval(() => {
            textContainer.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                currentLine++;
                if (currentLine === 1) bgSvg.style.transform = 'scale(1.05) translate(-20px, 10px)';
                if (currentLine === 2) bgSvg.style.transform = 'scale(1.1) translate(20px, -10px)';

                setTimeout(typeLine, 3000);
            }
        }, 50);
    }

    typeLine();
}

// ============================================
// INIT GAME
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio system immediately so browser can preload metadata
    Audio.init();

    // Initialize toggle panel buttons for minimap and todo
    initTogglePanels();

    HUD.init();
    SceneManager.show('scene-landing', () => {
        initLanding();
    });
});
