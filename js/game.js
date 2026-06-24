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
    endingTriggered: false,
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
    en: {
        // ---- Landing ----
        'tap_to_start': '⋆ tap anywhere to start ⋆',

        // ---- Cinematic button ----
        'cinematic_next': 'Next →',

        // ---- HUD labels ----
        'water_quality_label': 'Water Quality',
        'bio_label': 'Biodiversity',

        // ---- Controls modal ----
        'how_to_play_title': 'How to Play & Controls',
        'desktop_controls_title': '💻 Desktop',
        'mobile_controls_title': '📱 Mobile',
        'desktop_controls_list': '<li>🏃 <strong>Move:</strong> WASD / Arrow Keys</li><li>🔧 <strong>Actions:</strong> Drag & Drop / Click</li><li>🚪 <strong>Enter Areas:</strong> Walk to area & press <strong>E</strong></li><li>🗺️ <strong>Fast Travel:</strong> Click on Minimap</li>',
        'mobile_controls_list': '<li>🕹️ <strong>Move:</strong> Virtual On-screen Joystick</li><li>👆 <strong>Actions:</strong> Tap items / Tap-to-Place</li><li>🚪 <strong>Enter Areas:</strong> Walk to area & tap Prompt</li><li>🗺️ <strong>Fast Travel:</strong> Tap on Minimap</li>',
        'landscape_recommendation': '🔄 Landscape orientation is highly recommended for mobile players!',
        'btn_begin_mission': '▶ Begin Mission',

        // ---- Map panel ----
        'map_title': 'MAP',
        'map_agricultural': 'Agricultural',
        'map_industrial': 'Industrial',
        'map_residential': 'Residential<br>(Spawn)',
        'map_coastal': 'Coastal',
        'map_coastal_status': '🚨 CRISIS',

        // ---- Todo panel ----
        'todo_title': '🎯 Mission Checklist',

        // ---- Explore hint ----
        'explore_hint': 'Explore the area! Click on objects around you to learn how human activities affect water quality and biodiversity.',
        'explore_map_hint': 'Move your character (WASD / joystick) to the glowing Coastal area, then press E to enter · ESC to close',
        'scan_click_hint': 'Click here to scan',
        'ind1_click_hint': 'Click the discharge pipe',

        // ---- Prompt ----
        'prompt_enter_text': 'Press <strong>E</strong> or <strong>Tap</strong> to enter',

        // ---- Crisis modal ----
        'crisis_title': 'Crisis Detected!',
        'crisis_body': 'A pollution crisis has been detected in the <strong>Coastal Area</strong>!<br>Complete all tasks to restore environmental balance.',
        'btn_start_mission': '▶ Start Mission',

        // ---- Rotate device ----
        'rotate_device_title': 'Rotate Your Device',
        'rotate_device_desc': 'Please rotate your device to Landscape mode for the best educational gaming experience!',

        // ---- Task 4 method cards ----
        't4_method_a_title': '🔥 In-Situ Burning',
        't4_method_a_stats': 'Water +25 | Bio +5',
        't4_method_a_tag': 'Recommended',
        't4_method_b_title': '🧪 Corexit Dispersant',
        't4_method_b_stats': 'Water +20 | Bio -15',
        't4_method_b_tag': '⚠ May harm marine life',
        'btn_t4_complete': 'Complete Task ✓',

        // ---- Navigation buttons ----
        'btn_next_task': 'Next Task →',
        'btn_mission_complete': 'Mission Complete ✓',

        // ---- Decision board ----
        'btn_back': 'Go Back',
        'btn_confirm': 'Confirm Choice',

        // ---- Back navigation button ----
        'btn_back_nav': 'Back',

        // ---- Report card ----
        'report_card_title': 'Ecosystem Restoration Report Card',
        'report_card_subtitle': 'Project Assessment Summary',
        'report_metrics_title': 'Ecosystem Metrics',
        'report_decisions_title': 'Management Decisions',
        'report_coastal_spill': 'Coastal Spill:',
        'report_agri_pollution': 'Agri Pollution:',
        'report_agri_choice_strips': 'Riparian Buffer Strips',
        'report_industrial_effluent': 'Industrial Effluent:',
        'btn_play_again': 'Play Again',
        'btn_exit': 'Exit',

        // ---- Finish button ----
        'btn_finish': '✅ Finish — View Results',
    },
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
        'explore_hint': 'Jelajahi area ini! Klik objek di sekitarmu untuk mempelajari bagaimana aktivitas manusia memengaruhi kualitas air dan keanekaragaman hayati.',
        'explore_map_hint': 'Gerakkan karaktermu (WASD / joystick) ke area Pesisir yang menyala, lalu tekan E untuk masuk · ESC untuk menutup',
        'scan_click_hint': 'Klik di sini untuk memindai',
        'ind1_click_hint': 'Klik pipa pembuangan',
        'Click the glowing red zone on the discharge pipe to identify the wastewater source.': 'Klik zona merah yang menyala pada pipa pembuangan untuk mengidentifikasi sumber air limbah.',
        'Drag each missing bolt onto the pipe flange, then click the 🔧 wrench to tighten all the bolts.': 'Seret setiap baut yang hilang ke flensa pipa, lalu klik kunci 🔧 untuk mengencangkan semua baut.',
        'Take bolts from the toolbox and drag them onto the patch to seal the leak!': 'Ambil baut dari kotak perkakas dan seret ke penambal untuk menutup kebocoran!',
        'Drag the bolts onto the patch': 'Seret baut ke penambal',
        'All bolts secured! Sealing the leak...': 'Semua baut terpasang! Menutup kebocoran...',
        'Click the glowing red zone on the farm to scan and reveal the pollution source.': 'Klik zona merah yang menyala di ladang untuk memindai dan menemukan sumber polusi.',
        'Plant vegetation along the river by clicking each highlighted spot to filter runoff.': 'Tanam vegetasi di sepanjang sungai dengan mengklik setiap titik yang ditandai untuk menyaring limpasan.',
        'Water Quality': 'Kualitas Air',
        'Biodiversity': 'Keanekaragaman Hayati',
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

        // ---- Back navigation button + leave confirm ----
        'btn_back_nav': 'Kembali',
        'Leave this mission?': 'Tinggalkan misi ini?',
        'Your progress in this area will reset and you will return to the Residential Area.': 'Progres di area ini akan diatur ulang dan kamu akan kembali ke Area Pemukiman.',
        'Leave': 'Tinggalkan',
        'Stay': 'Tetap di Sini',

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
        'Agricultural Area is still safe. Resolve the Coastal Area crisis first!': 'Area Pertanian masih aman. Selesaikan dulu krisis di Area Pesisir!',
        'Industrial Area is still safe. Resolve the Coastal Area crisis first!': 'Area Industri masih aman. Selesaikan dulu krisis di Area Pesisir!',
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
        'Step 1: Drag the 4 missing bolts onto the flange.': 'Langkah 1: Seret 4 baut yang hilang ke flense pipa.',
        'All bolts placed! Step 2: tap the 🔧 wrench, then tap each bolt to tighten.': 'Semua baut terpasang! Langkah 2: ketuk kunci 🔧, lalu ketuk tiap baut untuk mengencangkan.',
        'Now tap each bolt one by one to tighten it.': 'Sekarang ketuk tiap baut satu per satu untuk mengencangkannya.',
        'Place all 4 bolts onto the flange first.': 'Pasang dulu keempat baut ke flense.',
        'Tap the 🔧 wrench first, then tap each bolt.': 'Ketuk kunci 🔧 dulu, lalu ketuk tiap baut.',
        'Bolts placed': 'Baut terpasang',
        'Bolts tightened': 'Baut dikencangkan',
        'Discharge successfully stopped.': 'Pembuangan berhasil dihentikan.',
        'Choose a method to treat the remaining wastewater.': 'Pilih metode untuk mengolah sisa air limbah.',
        'Filtration': 'Filtrasi',
        'Chemical Coagulation': 'Koagulasi Kimia',
        'Bacterial Treatment': 'Perawatan Bakteri',
        'complete. Water quality restored.': 'selesai. Kualitas air dipulihkan.',
        ' Biodiversity improved!': ' Keanekaragaman hayati meningkat!',
        'All pollution sources have been successfully managed.': 'Semua sumber polusi telah berhasil dikelola.',

        // ---- Finish button ----
        'btn_finish': '✅ Selesai — Lihat Hasil',

        // ---- Residential explore + crisis ----
        'One more area to restore! Click the minimap to explore.': 'Tinggal satu area lagi untuk dipulihkan! Klik minimap untuk menjelajah.',
        'Injections': 'Injeksi',
        '🚨 Crisis Detected! Click the minimap to explore and reach the Coastal Area.': '🚨 Krisis Terdeteksi! Klik minimap untuk menjelajah dan menuju Area Pesisir.',
        '🚨 New crisis zones detected! Click the minimap to explore.': '🚨 Zona krisis baru terdeteksi! Klik minimap untuk menjelajah.',

        // ---- Residential interactable hints ----
        '💡 Lighthouses guided sailors for centuries. Today, sustainable choices are the light that guides humanity toward a healthier ocean.': '💡 Mercusuar telah memandu pelaut selama berabad-abad. Kini, pilihan berkelanjutan adalah cahaya yang memandu manusia menuju laut yang lebih sehat.',
        '🏠 This is your home — and so is our ocean. Every sustainable choice ripples outward to protect our shared world.': '🏠 Ini rumahmu — begitu pula laut kita. Setiap pilihan berkelanjutan beriak ke luar untuk melindungi dunia bersama kita.',
        '🦋 Healthy pollinator populations signal a thriving ecosystem. Riparian buffer strips in agricultural areas protect vibrant habitats like this garden!': '🦋 Populasi penyerbuk yang sehat menandakan ekosistem yang subur. Jalur penyangga riparian di area pertanian melindungi habitat semarak seperti taman ini!',
        '🪑 Taking a moment... 2.2 billion people worldwide still lack access to safe drinking water. Our environmental choices today shape the ocean of tomorrow.': '🪑 Sejenak merenung... 2,2 miliar orang di dunia masih kekurangan akses air minum yang aman. Pilihan lingkungan kita hari ini membentuk laut di masa depan.',
        '🦪 Tide pools shelter hundreds of species in a single pool of water. Industrial and agricultural runoff devastates these fragile micro-ecosystems.': '🦪 Kolam pasang surut menampung ratusan spesies dalam satu genangan air. Limpasan industri dan pertanian menghancurkan mikro-ekosistem rapuh ini.',
        '⛵ Local fishing communities depend entirely on ocean health. Pollution destroys livelihoods and threatens food security for hundreds of millions of people worldwide.': '⛵ Komunitas nelayan lokal sepenuhnya bergantung pada kesehatan laut. Polusi menghancurkan mata pencaharian dan mengancam ketahanan pangan ratusan juta orang di dunia.',
        '🌲 Coastal forests are natural pollution barriers. Their root systems can reduce runoff entering the ocean by up to 85%, protecting marine habitats.': '🌲 Hutan pesisir adalah penghalang polusi alami. Sistem akarnya dapat mengurangi limpasan yang masuk ke laut hingga 85%, melindungi habitat laut.',

        // ---- Mailbox letter ----
        '📬 A Letter from Nature': '📬 Surat dari Alam',
        '<em style="line-height:1.9;color:#90e0ef;font-style:italic;">\"Dear Friend,<br><br>Thank you for caring about our waters. The rivers remember every kind act — every buffer strip planted, every waste pipe sealed, every spill cleaned up.<br><br>The ocean and I are watching, and we are deeply grateful.<br><br>— The Coastal Ecosystem\"</em>': '<em style="line-height:1.9;color:#90e0ef;font-style:italic;">\"Sahabat terkasih,<br><br>Terima kasih telah peduli pada perairan kita. Sungai mengingat setiap kebaikan — setiap jalur penyangga yang ditanam, setiap pipa limbah yang ditutup, setiap tumpahan yang dibersihkan.<br><br>Lautan dan aku menyaksikan, dan kami sangat bersyukur.<br><br>— Ekosistem Pesisir\"</em>',
        'Close Letter 💙': 'Tutup Surat 💙',

        // ---- Decision board: In-Situ Burning ----
        'In-Situ Burning involves containing the oil slick with a fire-resistant boom and igniting it to burn the oil directly off the water surface. This is a rapid physical removal technique.': 'Pembakaran In-Situ melibatkan pengurungan tumpahan minyak dengan boom tahan api lalu menyalakannya untuk membakar minyak langsung dari permukaan air. Ini teknik penghilangan fisik yang cepat.',
        'Removes up to 90% of surface oil very quickly, preventing it from reaching shorelines.': 'Menghilangkan hingga 90% minyak permukaan dengan sangat cepat, mencegahnya mencapai garis pantai.',
        'Eliminates the need for long-term waste storage and disposal of liquid oil.': 'Menghilangkan kebutuhan penyimpanan dan pembuangan minyak cair jangka panjang.',
        'Reduces the exposure of marine organisms on the surface to toxic oil slicks.': 'Mengurangi paparan organisme laut di permukaan terhadap tumpahan minyak beracun.',
        'Produces large plumes of toxic black smoke containing particulate matter and greenhouse gases.': 'Menghasilkan gumpalan asap hitam beracun yang mengandung partikel dan gas rumah kaca.',
        'A small fraction of heavy oil residues will sink to the seabed, potentially smothering benthic organisms.': 'Sebagian kecil residu minyak berat akan tenggelam ke dasar laut, berpotensi menutupi organisme bentik.',
        'Highly dependent on calm weather and thick oil patches to maintain combustion.': 'Sangat bergantung pada cuaca tenang dan lapisan minyak tebal untuk menjaga pembakaran.',
        'High immediate recovery. While it causes short-term air quality issues, it prevents catastrophic oiling of beaches and wetlands. Marine populations recovery time is faster (approx. 2-5 years).': 'Pemulihan langsung yang tinggi. Meski menimbulkan masalah kualitas udara jangka pendek, cara ini mencegah pencemaran parah di pantai dan lahan basah. Waktu pemulihan populasi laut lebih cepat (sekitar 2-5 tahun).',

        // ---- Decision board: Corexit Dispersant ----
        'Chemical dispersants are sprayed onto the slick to break the oil into tiny droplets. The droplets disperse into the water column, where they are diluted and degraded by microbes.': 'Dispersan kimia disemprotkan ke tumpahan untuk memecah minyak menjadi tetesan kecil. Tetesan menyebar ke kolom air, lalu diencerkan dan diuraikan oleh mikroba.',
        'Removes oil from the surface rapidly, protecting sea birds and mammals.': 'Menghilangkan minyak dari permukaan dengan cepat, melindungi burung dan mamalia laut.',
        'Allows microbial populations to degrade the oil droplets faster due to increased surface area.': 'Memungkinkan populasi mikroba menguraikan tetesan minyak lebih cepat karena luas permukaan bertambah.',
        'Effective in rougher seas where mechanical containment and burning are impossible.': 'Efektif di laut yang lebih berombak di mana pengurungan mekanis dan pembakaran mustahil dilakukan.',
        'Does not remove oil; it shifts it into the water column, making it highly toxic to marine life.': 'Tidak menghilangkan minyak; hanya memindahkannya ke kolom air, membuatnya sangat beracun bagi kehidupan laut.',
        'The dispersant (Corexit) combined with oil is more toxic to corals, fish, and zooplankton than oil alone.': 'Dispersan (Corexit) yang bercampur minyak lebih beracun bagi karang, ikan, dan zooplankton dibanding minyak saja.',
        'Creates a massive underwater plume of dissolved toxins that can persist for decades.': 'Menciptakan gumpalan racun terlarut bawah laut yang besar dan dapat bertahan selama puluhan tahun.',
        'Toxic persistence. The water looks clean on the surface, but underwater biodiversity drops significantly. Coral reefs and benthic fisheries suffer long-term damage, with recovery taking 15+ years.': 'Racun yang bertahan lama. Air tampak bersih di permukaan, tetapi keanekaragaman hayati bawah laut menurun drastis. Terumbu karang dan perikanan bentik mengalami kerusakan jangka panjang, dengan pemulihan 15+ tahun.',

        // ---- Decision board: Mechanical Filtration ----
        'Uses physical layers of gravel, sand, and activated carbon to trap particulate waste and filter out sediment. A clean, mechanical approach.': 'Menggunakan lapisan fisik kerikil, pasir, dan karbon aktif untuk menjebak limbah partikel dan menyaring sedimen. Pendekatan mekanis yang bersih.',
        'Safely removes large suspended particles, sand, and grit without adding chemicals.': 'Menghilangkan partikel tersuspensi besar, pasir, dan kerikil dengan aman tanpa menambahkan bahan kimia.',
        'Reliable, simple, and low-maintenance technology with minimal risk of chemical spills.': 'Teknologi yang andal, sederhana, dan minim perawatan dengan risiko tumpahan kimia yang kecil.',
        'Good pre-treatment to clear turbidity and debris.': 'Pra-pengolahan yang baik untuk menjernihkan kekeruhan dan kotoran.',
        'Does not remove dissolved chemical pollutants, heavy metals, or pathogens.': 'Tidak menghilangkan polutan kimia terlarut, logam berat, atau patogen.',
        'Filters clog regularly and create concentrated waste sediment that must be landfilled.': 'Filter sering tersumbat dan menghasilkan sedimen limbah pekat yang harus ditimbun.',
        'Provides no biological cleaning for organic matter.': 'Tidak menyediakan pembersihan biologis untuk bahan organik.',
        'Semi-stable outcome. Solid waste is successfully filtered out, but dissolved heavy metals continue to slowly accumulate in the coastal ecosystem, leading to gradual bioaccumulation.': 'Hasil semi-stabil. Limbah padat berhasil disaring, tetapi logam berat terlarut terus perlahan menumpuk di ekosistem pesisir, menyebabkan bioakumulasi bertahap.',

        // ---- Decision board: Chemical Coagulation ----
        'Adds chemical coagulants (like alum) to bind dissolved contaminants into heavy clumps that settle out of the water. High-volume chemical precipitation.': 'Menambahkan koagulan kimia (seperti tawas) untuk mengikat kontaminan terlarut menjadi gumpalan berat yang mengendap dari air. Pengendapan kimia volume tinggi.',
        'Highly effective at removing dissolved phosphorus, heavy metals, and organic pollutants.': 'Sangat efektif menghilangkan fosfor terlarut, logam berat, dan polutan organik.',
        'Fast processing time and high water clarity output.': 'Waktu proses cepat dan kejernihan air keluaran tinggi.',
        'Excellent for emergency high-pollution scenarios.': 'Sangat baik untuk skenario darurat dengan polusi tinggi.',
        'Creates massive amounts of toxic chemical sludge that is hazardous and difficult to dispose of.': 'Menghasilkan lumpur kimia beracun dalam jumlah besar yang berbahaya dan sulit dibuang.',
        'Excess chemicals can leach back into the river, harming aquatic life (pH shocks, aluminum toxicity).': 'Kelebihan bahan kimia dapat meresap kembali ke sungai, membahayakan kehidupan air (kejutan pH, toksisitas aluminium).',
        'High chemical dependency and operational costs.': 'Ketergantungan kimia dan biaya operasional yang tinggi.',
        'High cost, high risk. The effluent is clear, but toxic chemical sludge storage poses a permanent hazard. Runoff leaks can cause localized toxicity spikes in the aquatic food chain.': 'Biaya tinggi, risiko tinggi. Limbah cairnya jernih, tetapi penyimpanan lumpur kimia beracun menimbulkan bahaya permanen. Kebocoran limpasan dapat memicu lonjakan toksisitas lokal pada rantai makanan air.',

        // ---- Decision board: Bacterial Bioremediation ----
        'Uses active cultures of beneficial microbes to digest and break down organic pollutants and toxic ammonia into harmless byproducts. An eco-driven solution.': 'Menggunakan kultur aktif mikroba bermanfaat untuk mencerna dan menguraikan polutan organik serta amonia beracun menjadi produk sampingan yang tidak berbahaya. Solusi berbasis ekologi.',
        'Naturally breaks down organic compounds, nitrates, and ammonia into harmless nitrogen gas.': 'Secara alami menguraikan senyawa organik, nitrat, dan amonia menjadi gas nitrogen yang tidak berbahaya.',
        'No toxic chemical residues or hazardous sludge are produced; creates a natural cycle.': 'Tidak menghasilkan residu kimia beracun atau lumpur berbahaya; menciptakan siklus alami.',
        'Boosts long-term ecosystem resilience by introducing beneficial microbes.': 'Meningkatkan ketahanan ekosistem jangka panjang dengan memperkenalkan mikroba bermanfaat.',
        'Requires precise temperature, oxygen, and pH control; bacteria can die off if conditions change.': 'Membutuhkan kontrol suhu, oksigen, dan pH yang presisi; bakteri bisa mati jika kondisi berubah.',
        'Slower process compared to chemical treatment and filtration.': 'Proses lebih lambat dibandingkan pengolahan kimia dan filtrasi.',
        'Does not remove heavy metals (which must be pre-filtered).': 'Tidak menghilangkan logam berat (yang harus disaring terlebih dahulu).',
        'Sustainable recovery. The natural biological treatment restores ecological balance without toxic byproducts. Water and biodiversity metrics recover to optimal health over 5-10 years.': 'Pemulihan berkelanjutan. Pengolahan biologis alami memulihkan keseimbangan ekologi tanpa produk sampingan beracun. Metrik air dan keanekaragaman hayati pulih ke kesehatan optimal dalam 5-10 tahun.',
    }
};

// ============================================
// LOCALIZATION HELPERS
// ============================================
function getTranslation(key) {
    if (!key) return key;
    // Look the key up in the active dictionary for BOTH languages. Two key styles
    // coexist: slug keys (e.g. 'water_quality_label', used in data-lang-key) live in
    // both dicts, and English-sentence keys (used inline in code) live only in `id`.
    // For English-sentence keys the `en` lookup misses and we fall back to the key
    // itself, which IS the English text. This also makes switching ID→EN restore
    // slug-keyed UI correctly instead of showing the raw slug.
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

    // Update active lang button indicator across ALL language toggles
    // (landing selector + persistent global controls).
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === GameState.language);
    });

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

// Wire the persistent controls (sound toggle + every language button) once.
// Language buttons live both on the landing screen and in the always-on
// #global-controls cluster, so we bind them all by class here.
function initGlobalControls() {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // don't trigger "tap anywhere to start" on landing
            changeLanguage(btn.dataset.lang);
        });
    });

    const musicBtn = document.getElementById('btn-music-toggle');
    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const muted = Audio.toggleMute();
            musicBtn.textContent = muted ? '🔇' : '🔊';
            musicBtn.classList.toggle('muted', muted);
            musicBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
        });
    }
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

    document.getElementById('decision-title').textContent = getTranslation(data.title);
    document.getElementById('decision-desc').textContent = getTranslation(data.desc);

    const benefitsList = document.getElementById('decision-benefits-list');
    if (benefitsList) {
        benefitsList.innerHTML = '';
        data.benefits.forEach(benefit => {
            const li = document.createElement('li');
            li.textContent = getTranslation(benefit);
            benefitsList.appendChild(li);
        });
    }

    const risksList = document.getElementById('decision-risks-list');
    if (risksList) {
        risksList.innerHTML = '';
        data.risks.forEach(risk => {
            const li = document.createElement('li');
            li.textContent = getTranslation(risk);
            risksList.appendChild(li);
        });
    }

    const outlookText = document.getElementById('decision-outlook-text');
    if (outlookText) outlookText.textContent = getTranslation(data.outlook);

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
    // Remember the last-requested background loop so we can resume the correct
    // scene ambience when the player un-mutes mid-game.
    currentBgId: null,
    currentBgOpts: null,

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
        // Track the intended background loop even while muted, so un-muting can
        // resume the correct scene ambience (not a stale one).
        if (options.loop) {
            this.currentBgId = id;
            this.currentBgOpts = options;
        }
        if (this.muted) return;
        const snd = this.sounds[id];
        if (!snd) return;
        try {
            const player = options.loop ? snd : snd.cloneNode();

            player.volume = options.volume !== undefined ? options.volume : 0.7;
            player.loop = options.loop || false;

            // Track the background loop SYNCHRONOUSLY (not inside the async play()
            // promise) and stop any previously-playing loop first, so background
            // loops can never stack — e.g. factory ambience bleeding into an ocean
            // scene if a new loop starts before the old promise resolved.
            if (options.loop) {
                if (this.bgMusic && this.bgMusic !== player) {
                    this.bgMusic.pause();
                    try { this.bgMusic.currentTime = 0; } catch (e) {}
                }
                this.bgMusic = player;
            }

            // We must call play() first to ensure it attaches to the user gesture.
            const playPromise = player.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    const offset = this.offsets[id] || 0;
                    if (offset > 0 && player.currentTime < offset) {
                        player.currentTime = offset;
                    }
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

    // Total mute: silences every sound (background loops + SFX). SFX are gated by
    // the `muted` check in play(); the background loop is paused/resumed here.
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            if (this.bgMusic) this.bgMusic.pause();
        } else if (this.currentBgId) {
            // Resume the ambience that belongs to the current scene.
            this.play(this.currentBgId, this.currentBgOpts || { loop: true, volume: 0.3 });
        }
        return this.muted;
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
                updateBackButton(sceneId);
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

// Prominent, animated Water/Biodiversity gain popup shown on task completion.
// stats: array of { icon, label, delta }
function showStatGain(stats) {
    if (typeof document === 'undefined' || !stats || !stats.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'stat-gain-popup';
    wrap.innerHTML = stats.map(s => {
        const cls = s.delta >= 0 ? 'gain-pos' : 'gain-neg';
        const sign = s.delta > 0 ? '+' : '';
        return `<div class="stat-gain-chip ${cls}">
            <span class="stat-gain-icon">${s.icon}</span>
            <span class="stat-gain-label">${getTranslation(s.label)}</span>
            <span class="stat-gain-delta">${sign}${s.delta}</span>
        </div>`;
    }).join('');
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
    setTimeout(() => {
        wrap.classList.remove('show');
        setTimeout(() => wrap.remove(), 450);
    }, 2800);
}

// ============================================
// EDUCATIONAL PANELS (shown after specific missions)
// Water-pollution learning content tied to each mission. Stored bilingually so
// the panel renders in the player's current language without bloating the main
// translation dictionary.
// ============================================
const EDU_CONTENT = {
    marine_rescue: {
        en: {
            title: '🐢 Mission Complete: Marine Rescue!',
            sections: [
                ['🔬 What Just Happened?', 'The animal was trapped by plastic waste. In real life, plastic pollution can injure marine animals, make it harder for them to find food, and even lead to death.'],
                ['🔬 Science Fact', 'Over time, larger plastic items break down into tiny pieces called microplastics, which can enter the food chain and affect many aquatic organisms.'],
                ['🌱 Why It Matters', 'Every piece of plastic removed from the environment helps protect marine biodiversity and supports healthier ecosystems.']
            ],
            impact: '💡 Your Impact: You helped save wildlife from one of the biggest threats in aquatic environments.'
        },
        id: {
            title: '🐢 Misi Selesai: Penyelamatan Laut!',
            sections: [
                ['🔬 Apa yang Baru Saja Terjadi?', 'Hewan itu terjerat sampah plastik. Di dunia nyata, polusi plastik dapat melukai hewan laut, menyulitkan mereka mencari makan, bahkan menyebabkan kematian.'],
                ['🔬 Fakta Sains', 'Seiring waktu, sampah plastik besar terurai menjadi potongan kecil bernama mikroplastik, yang dapat masuk ke rantai makanan dan memengaruhi banyak organisme air.'],
                ['🌱 Mengapa Ini Penting', 'Setiap plastik yang dibersihkan dari lingkungan membantu melindungi keanekaragaman hayati laut dan mendukung ekosistem yang lebih sehat.']
            ],
            impact: '💡 Dampakmu: Kamu membantu menyelamatkan satwa liar dari salah satu ancaman terbesar di lingkungan perairan.'
        }
    },
    shoreline_cleanup: {
        en: {
            title: '🗑️ Mission Complete: Shoreline Cleanup!',
            sections: [
                ['🔬 What Just Happened?', 'Plastic left on beaches can be washed into rivers and oceans. Over time, it breaks down into tiny particles called microplastics that can enter food chains.'],
                ['🔬 Science Fact', 'Plastic waste can be carried by wind and rain into rivers and oceans. Once there, it can persist for hundreds of years and harm aquatic organisms.'],
                ['🌱 Why It Matters', 'Reducing litter prevents pollution from spreading and helps keep ecosystems healthy for future generations.']
            ],
            impact: '💡 Your Impact: Small cleanup actions can create a big positive change for the environment.'
        },
        id: {
            title: '🗑️ Misi Selesai: Bersih-Bersih Pantai!',
            sections: [
                ['🔬 Apa yang Baru Saja Terjadi?', 'Plastik yang tertinggal di pantai bisa terbawa ke sungai dan laut. Seiring waktu, plastik terurai menjadi partikel kecil bernama mikroplastik yang dapat masuk ke rantai makanan.'],
                ['🔬 Fakta Sains', 'Sampah plastik dapat terbawa angin dan hujan ke sungai dan laut. Begitu sampai di sana, plastik bisa bertahan ratusan tahun dan membahayakan organisme air.'],
                ['🌱 Mengapa Ini Penting', 'Mengurangi sampah mencegah polusi menyebar dan membantu menjaga ekosistem tetap sehat untuk generasi mendatang.']
            ],
            impact: '💡 Dampakmu: Tindakan kecil membersihkan sampah dapat menciptakan perubahan positif yang besar bagi lingkungan.'
        }
    },
    oil_leak_stopped: {
        en: {
            title: '🛢️ Mission Complete: Oil Leak Stopped!',
            sections: [
                ['🌊 What Just Happened?', 'You stopped oil from spreading through the water.'],
                ['🔬 Science Fact', 'Oil forms a layer on the water surface, reducing oxygen exchange and blocking sunlight needed by aquatic plants.'],
                ['🌱 Why It Matters', 'Preventing pollution before it spreads is one of the most effective ways to protect ecosystems.']
            ],
            impact: '💡 Your Impact: You helped prevent damage to aquatic habitats and biodiversity.'
        },
        id: {
            title: '🛢️ Misi Selesai: Kebocoran Minyak Dihentikan!',
            sections: [
                ['🌊 Apa yang Baru Saja Terjadi?', 'Kamu menghentikan minyak agar tidak menyebar ke seluruh perairan.'],
                ['🔬 Fakta Sains', 'Minyak membentuk lapisan di permukaan air, mengurangi pertukaran oksigen dan menghalangi sinar matahari yang dibutuhkan tumbuhan air.'],
                ['🌱 Mengapa Ini Penting', 'Mencegah polusi sebelum menyebar adalah salah satu cara paling efektif untuk melindungi ekosistem.']
            ],
            impact: '💡 Dampakmu: Kamu membantu mencegah kerusakan pada habitat air dan keanekaragaman hayati.'
        }
    },
    direct_discharge: {
        en: {
            title: '🚫 Mission Complete: Direct Discharge Prevented!',
            sections: [
                ['🌊 What Just Happened?', 'Untreated waste can no longer flow directly into the water.'],
                ['🔬 Science Fact', 'Wastewater may contain harmful chemicals, bacteria, and excess nutrients that reduce water quality and threaten aquatic life.'],
                ['🌱 Why It Matters', 'Clean water is essential for healthy ecosystems and sustainable communities.']
            ],
            impact: '💡 Your Impact: You helped protect a valuable freshwater resource.'
        },
        id: {
            title: '🚫 Misi Selesai: Pembuangan Langsung Dicegah!',
            sections: [
                ['🌊 Apa yang Baru Saja Terjadi?', 'Limbah yang tidak diolah kini tidak bisa lagi mengalir langsung ke air.'],
                ['🔬 Fakta Sains', 'Air limbah dapat mengandung bahan kimia berbahaya, bakteri, dan kelebihan nutrisi yang menurunkan kualitas air dan mengancam kehidupan air.'],
                ['🌱 Mengapa Ini Penting', 'Air bersih sangat penting bagi ekosistem yang sehat dan masyarakat yang berkelanjutan.']
            ],
            impact: '💡 Dampakmu: Kamu membantu melindungi sumber air tawar yang berharga.'
        }
    },
    buffer_strip: {
        en: {
            title: '🌿 Mission Complete: Buffer Strip Established!',
            sections: [
                ['🌊 What Just Happened?', 'A protective vegetation zone now helps filter pollutants before they reach the water.'],
                ['🔬 Science Fact', 'Plants in buffer strips trap sediments and absorb excess nutrients, reducing water pollution from runoff.'],
                ['🌱 Why It Matters', 'Nature-based solutions can improve water quality while supporting biodiversity.']
            ],
            impact: '💡 Your Impact: You used the power of nature to protect the ecosystem.'
        },
        id: {
            title: '🌿 Misi Selesai: Jalur Penyangga Terbentuk!',
            sections: [
                ['🌊 Apa yang Baru Saja Terjadi?', 'Zona vegetasi pelindung kini membantu menyaring polutan sebelum mencapai air.'],
                ['🔬 Fakta Sains', 'Tanaman pada jalur penyangga menjebak sedimen dan menyerap kelebihan nutrisi, mengurangi pencemaran air akibat limpasan.'],
                ['🌱 Mengapa Ini Penting', 'Solusi berbasis alam dapat meningkatkan kualitas air sekaligus mendukung keanekaragaman hayati.']
            ],
            impact: '💡 Dampakmu: Kamu memanfaatkan kekuatan alam untuk melindungi ekosistem.'
        }
    }
};

// Shows a post-mission educational panel, then runs onContinue (the normal flow).
function showEduPanel(key, buttonLabel, onContinue) {
    const data = EDU_CONTENT[key];
    if (!data) { if (onContinue) onContinue(); return; }
    const content = data[GameState.language] || data.en;

    const sectionsHtml = content.sections.map(([heading, body]) =>
        `<div class="edu-section"><div class="edu-heading">${heading}</div><div class="edu-body">${body}</div></div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay visible edu-overlay';
    overlay.innerHTML = `
        <div class="modal-box edu-box">
            <div class="edu-title">${content.title}</div>
            <div class="edu-sections">${sectionsHtml}</div>
            <div class="edu-impact">${content.impact}</div>
            <button class="modal-btn" id="edu-continue-btn">${getTranslation(buttonLabel)}</button>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#edu-continue-btn').addEventListener('click', () => {
        overlay.remove();
        if (onContinue) onContinue();
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

    // Language selector buttons are wired globally in initGlobalControls()
    // (they live both here and in the persistent #global-controls cluster).

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
        type: 'oil-sea',
        image: 'assets/images/opening/scene_1.jpg'
    },
    {
        text: 'Yet today, it is under threat.',
        bg: 'industrial-pipe',
        type: 'pipe',
        image: 'assets/images/opening/scene_2.jpg'
    },
    {
        text: 'Coastal ecosystems are increasingly polluted by human activities.',
        bg: 'algae-water',
        type: 'algae',
        image: 'assets/images/opening/scene_3.jpg'
    },
    // Scene 2: Problem Escalation
    {
        text: 'Oil spills spread across oceans, destroying marine habitats.',
        bg: 'oil-spill-sea',
        type: 'oil-sea',
        image: 'assets/images/opening/scene_4.webp'
    },
    {
        text: 'Agricultural runoff carries fertilizers and chemicals into water…',
        bg: 'algae-water',
        type: 'algae',
        image: 'assets/images/opening/scene_5.jpg'
    },
    {
        text: 'Industrial waste releases toxic substances into rivers and seas.',
        bg: 'industrial-pipe',
        type: 'pipe',
        image: 'assets/images/opening/scene_6.jpeg'
    },
    // Scene 3: Impact
    {
        text: 'The consequences are severe.',
        bg: 'dead-sea',
        type: 'dead',
        image: 'assets/images/opening/scene_7.jpg'
    },
    {
        text: 'Marine life dies. Ecosystems collapse.',
        bg: 'dead-sea',
        type: 'dead',
        image: 'assets/images/opening/scene_8.webp'
    },
    {
        text: 'Water becomes unsafe for human use.',
        bg: 'dirty-water',
        type: 'dirty',
        image: 'assets/images/opening/scene_9.webp'
    },
    // Scene 4: Player Hook
    {
        text: 'In a small coastal town, water quality continues to decline under constant pressure from pollution.',
        bg: 'coastal-town',
        type: 'town',
        image: 'assets/images/opening/scene_10_11.jpg'
    },
    {
        text: 'As environmental conditions worsen, maintaining water quality becomes increasingly difficult.',
        bg: 'coastal-town',
        type: 'town',
        image: 'assets/images/opening/scene_10_11.jpg'
    },
    {
        text: 'Your actions will determine whether the system can recover… or collapse.',
        bg: 'coastal-town',
        type: 'town',
        image: 'assets/images/opening/scene_10_11.jpg',
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
        <img src="${slide.image}" class="cinematic-bg" alt="illustration">
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

    // Back button is hidden on the very first slide (nothing to go back to)
    updateBackButton('scene-cinematic');
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

function prevSlide() {
    if (GameState.phase !== 'cinematic') return;
    if (currentSlide > 0) {
        currentSlide--;
        renderSlide(currentSlide);
        updateDots();
    }
}

// ============================================
// GLOBAL BACK BUTTON (per-scene navigation)
// ============================================
const BACK_VISIBLE_SCENES = [
    'scene-cinematic', 'scene-explore-map',
    'scene-task1', 'scene-task2', 'scene-task3', 'scene-task4',
    'scene-agri-task1', 'scene-agri-task2',
    'scene-ind-task1', 'scene-ind-task2', 'scene-ind-task3'
];

function updateBackButton(sceneId) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('btn-back');
    if (!btn) return;
    let show = BACK_VISIBLE_SCENES.indexOf(sceneId) !== -1;
    // Nothing to go back to on the very first cinematic slide.
    if (sceneId === 'scene-cinematic' && currentSlide === 0) show = false;
    btn.classList.toggle('hidden', !show);
}

function goBack() {
    const phase = GameState.phase;
    if (phase === 'cinematic') { prevSlide(); return; }
    if (phase === 'explore-map') { closeExploreMap(); return; }
    const taskPhases = ['task1','task2','task3','task4','agri1','agri2','ind1','ind2','ind3'];
    if (taskPhases.indexOf(phase) !== -1) { showBackConfirm(); }
}

function showBackConfirm() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay visible';
    overlay.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon">↩️</div>
            <div class="modal-title">${getTranslation('Leave this mission?')}</div>
            <div class="modal-body">${getTranslation('Your progress in this area will reset and you will return to the Residential Area.')}</div>
            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:8px;">
                <button class="modal-btn danger" id="back-confirm-leave">${getTranslation('Leave')}</button>
                <button class="modal-btn" id="back-confirm-stay">${getTranslation('Stay')}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#back-confirm-stay').onclick = () => overlay.remove();
    overlay.querySelector('#back-confirm-leave').onclick = () => {
        overlay.remove();
        exitCurrentAreaToResidential();
    };
}

function exitCurrentAreaToResidential() {
    const phase = GameState.phase;
    // Coastal tasks store progress in tasksCompleted and always replay from task 1,
    // so reset that progress (and choice) for a clean re-entry.
    if (['task1','task2','task3','task4'].indexOf(phase) !== -1) {
        GameState.tasksCompleted = [false, false, false, false];
        GameState.task4Choice = null;
        document.querySelectorAll('#todo-panel .todo-item').forEach(el => el.classList.remove('done'));
        document.querySelectorAll('#todo-panel .todo-check').forEach(el => { el.textContent = ''; });
    }
    if (phase === 'ind3') { GameState.ind3Choice = null; }
    // Agri/Industrial progress isn't persisted mid-area (only final flags), and their
    // todo panels are rebuilt by enterArea() on re-entry — nothing else to reset.
    Audio.stopBg();
    GameState.phase = 'residential';
    SceneManager.show('scene-residential', () => initResidential());
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

// Residential scene state
let resLoopActive = false;
let exploreMapActive = false;
let resX = 800, resY = 560;
let resNearInteractable = null;
let resInteractCooldown = false;
let inputInitialized = false;

// Crisis gating: the first crisis alert only appears AFTER the player has actually
// explored the residential base (>=3 distinct objects) or a fallback timer elapses.
let exploredResObjects = new Set();
let crisisFallbackTimer = null;

// ============================================
// RESIDENTIAL INTERACTABLE OBJECTS
// ============================================
const RES_INTERACTABLES = [
    { id: 'lighthouse', x: 1283, y: 380, radius: 105, icon: '\uD83D\uDD26', action: () => interactLighthouse() },
    { id: 'house',      x: 610,  y: 458, radius: 90,  icon: '\uD83C\uDFE0', action: () => interactHouse() },
    { id: 'mailbox',    x: 763,  y: 510, radius: 62,  icon: '\uD83D\uDCEC', action: () => interactMailbox() },
    { id: 'flowers',    x: 440,  y: 490, radius: 68,  icon: '\uD83C\uDF38', action: () => interactFlowers() },
    { id: 'bench',      x: 855,  y: 510, radius: 68,  icon: '\uD83E\uDE91', action: () => interactBench() },
    { id: 'tidepool',   x: 168,  y: 640, radius: 88,  icon: '\uD83E\uDDAA', action: () => interactTidepool() },
    { id: 'boat',       x: 338,  y: 678, radius: 88,  icon: '\u26F5',       action: () => interactBoat() },
    { id: 'tree',       x: 220,  y: 400, radius: 82,  icon: '\uD83C\uDF32', action: () => interactTree() }
];

function interactLighthouse() {
    const beacon = document.getElementById('res-beacon-light');
    const glow   = document.getElementById('res-beacon-glow-outer');
    if (beacon) { beacon.style.transition='all 0.3s'; beacon.setAttribute('r','38'); beacon.setAttribute('fill','#fff8d0'); setTimeout(() => { beacon.setAttribute('r','26'); beacon.setAttribute('fill','#ffd166'); beacon.style.transition=''; }, 550); }
    if (glow)   { glow.setAttribute('r','90'); setTimeout(() => glow.setAttribute('r','55'), 600); }
    Particles.burst(1283*window.innerWidth/1600, 108*window.innerHeight/900, 10, ['\u2728','\uD83D\uDCAB','\u2B50','\uD83D\uDD06']);
    Toast.show(getTranslation('\uD83D\uDCA1 Lighthouses guided sailors for centuries. Today, sustainable choices are the light that guides humanity toward a healthier ocean.'), '', 5500);
}
function interactHouse() {
    const knob = document.getElementById('res-door-knob');
    if (knob) { knob.setAttribute('r','8'); knob.setAttribute('fill','#fff'); setTimeout(() => { knob.setAttribute('r','5'); knob.setAttribute('fill','#ffd166'); }, 450); }
    Particles.burst(610*window.innerWidth/1600, 458*window.innerHeight/900, 8, ['\uD83D\uDC9A','\uD83C\uDFE0','\u2764\uFE0F','\u2728']);
    Toast.show(getTranslation('\uD83C\uDFE0 This is your home \u2014 and so is our ocean. Every sustainable choice ripples outward to protect our shared world.'), '', 5500);
}
function interactMailbox() {
    Particles.burst(763*window.innerWidth/1600, 510*window.innerHeight/900, 8, ['\uD83D\uDC8C','\u2709\uFE0F','\uD83D\uDC99']);
    showContinueModal('\uD83D\uDCEC A Letter from Nature',
        '<em style="line-height:1.9;color:#90e0ef;font-style:italic;">\"Dear Friend,<br><br>Thank you for caring about our waters. The rivers remember every kind act \u2014 every buffer strip planted, every waste pipe sealed, every spill cleaned up.<br><br>The ocean and I are watching, and we are deeply grateful.<br><br>\u2014 The Coastal Ecosystem\"</em>',
        'Close Letter \uD83D\uDC99', () => {});
}
function interactFlowers() {
    Particles.burst(440*window.innerWidth/1600, 490*window.innerHeight/900, 16, ['\uD83E\uDD8B','\uD83C\uDF38','\uD83C\uDF3A','\uD83C\uDF3C','\uD83D\uDC90','\uD83C\uDF3B']);
    Toast.show(getTranslation('\uD83E\uDD8B Healthy pollinator populations signal a thriving ecosystem. Riparian buffer strips in agricultural areas protect vibrant habitats like this garden!'), '', 5500);
}
function interactBench() {
    Particles.burst(855*window.innerWidth/1600, 510*window.innerHeight/900, 8, ['\u2B50','\uD83C\uDF19','\uD83D\uDCAD','\uD83C\uDF0A','\uD83C\uDF3F']);
    Toast.show(getTranslation('\uD83E\uDE91 Taking a moment... 2.2 billion people worldwide still lack access to safe drinking water. Our environmental choices today shape the ocean of tomorrow.'), '', 5500);
}
function interactTidepool() {
    const crab = document.getElementById('res-crab-svg');
    if (crab) {
        let p = 0;
        const iv = setInterval(() => {
            p++;
            crab.setAttribute('transform', `translate(${-8 + Math.sin(p * 0.85) * 15}, -4)`);
            if (p > 14) { clearInterval(iv); crab.setAttribute('transform', 'translate(-8,-4)'); }
        }, 75);
    }
    Particles.burst(168*window.innerWidth/1600, 640*window.innerHeight/900, 10, ['\uD83E\uDDAA','\uD83D\uDC1A','\uD83C\uDF0A','\uD83D\uDCA7','\uD83D\uDC20','\u2B50']);
    Toast.show(getTranslation('\uD83E\uDDAA Tide pools shelter hundreds of species in a single pool of water. Industrial and agricultural runoff devastates these fragile micro-ecosystems.'), '', 5500);
}
function interactBoat() {
    const boat = document.getElementById('res-boat-group');
    if (boat) {
        let angle = 0, dir = 1, frames = 0;
        const iv = setInterval(() => {
            frames++; angle += dir * 1.2;
            if (Math.abs(angle) > 5) dir *= -1;
            boat.setAttribute('transform', `translate(338,662) rotate(${angle},338,700)`);
            if (frames > 20) { clearInterval(iv); boat.setAttribute('transform', 'translate(338,662)'); }
        }, 60);
    }
    Particles.burst(338*window.innerWidth/1600, 678*window.innerHeight/900, 8, ['\u26F5','\uD83D\uDC1F','\uD83C\uDF0A','\uD83C\uDFA3']);
    Toast.show(getTranslation('\u26F5 Local fishing communities depend entirely on ocean health. Pollution destroys livelihoods and threatens food security for hundreds of millions of people worldwide.'), '', 5500);
}
function interactTree() {
    Particles.burst(220*window.innerWidth/1600, 390*window.innerHeight/900, 12, ['\uD83D\uDC26','\uD83C\uDF43','\uD83C\uDF32','\uD83C\uDF3F','\u2728']);
    Toast.show(getTranslation('\uD83C\uDF32 Coastal forests are natural pollution barriers. Their root systems can reduce runoff entering the ocean by up to 85%, protecting marine habitats.'), '', 5500);
}

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
    function setAreaState(el, statusEl, state, label) {
        el.classList.remove('crisis', 'done');
        const dot = el.querySelector('.map-alert-dot');
        if (dot) dot.style.display = 'none';
        if (state === 'crisis') {
            el.classList.add('crisis');
            if (dot) dot.style.display = '';
            if (statusEl) statusEl.textContent = label || '\uD83D\uDEA8 CRISIS';
        } else if (state === 'done') {
            el.classList.add('done');
            if (statusEl) statusEl.textContent = label || '\u2705 SAFE';
        } else {
            if (statusEl) statusEl.textContent = label || '';
        }
    }
    if (GameState.allTasksDone()) {
        setAreaState(coastal, coastalStatus, 'done', '\u2705 SAFE');
    } else {
        setAreaState(coastal, coastalStatus, 'crisis', '\uD83D\uDEA8 CRISIS');
    }
    if (GameState.agriCompleted) {
        setAreaState(agri, agriStatus, 'done', '\u2705 SAFE');
    } else if (GameState.allTasksDone()) {
        setAreaState(agri, agriStatus, 'crisis', '\uD83D\uDEA8 CRISIS');
    } else {
        // Coastal is still the active crisis \u2014 Agricultural stays safe for now.
        setAreaState(agri, agriStatus, 'done', '\u2705 SAFE');
    }
    if (GameState.indCompleted) {
        setAreaState(industrial, indStatus, 'done', '\u2705 SAFE');
    } else if (GameState.allTasksDone()) {
        setAreaState(industrial, indStatus, 'crisis', '\uD83D\uDEA8 CRISIS');
    } else {
        // Coastal is still the active crisis \u2014 Industrial stays safe for now.
        setAreaState(industrial, indStatus, 'done', '\u2705 SAFE');
    }
    // Minimap blinking
    const allDone = GameState.allTasksDone() && GameState.agriCompleted && GameState.indCompleted;
    const mc = document.getElementById('mini-map-container');
    if (mc) {
        if (!allDone && GameState.coastalAlertShown) { mc.classList.add('map-crisis-blink'); }
        else { mc.classList.remove('map-crisis-blink'); }
    }
}


function setupResInteractables() {
    RES_INTERACTABLES.forEach(obj => {
        const el = document.getElementById(`res-${obj.id}-group`) || document.getElementById(`res-${obj.id}-svg`);
        if (el) {
            el.style.cursor = 'pointer';
            el.onclick = () => {
                const dist = Math.sqrt(Math.pow(resX - obj.x, 2) + Math.pow(resY - obj.y, 2));
                if (dist < obj.radius * 1.7 && !resInteractCooldown) {
                    resInteractCooldown = true;
                    doResInteract(obj);
                    setTimeout(() => { resInteractCooldown = false; }, 2500);
                }
            };
        }
    });
    const prompt = document.getElementById('res-enter-prompt');
    if (prompt) {
        prompt.onclick = () => {
            if (resNearInteractable && !resInteractCooldown) {
                resInteractCooldown = true;
                doResInteract(resNearInteractable);
                setTimeout(() => { resInteractCooldown = false; }, 2500);
            }
        };
    }
}

function resLoop() {
    if (!resLoopActive || GameState.phase !== 'residential' || exploreMapActive) {
        resLoopActive = false; return;
    }
    const howToPlay = document.getElementById('modal-how-to-play');
    const mapAlert  = document.getElementById('modal-map-alert');
    const blocked = (howToPlay && howToPlay.classList.contains('visible')) ||
                    (mapAlert  && mapAlert.classList.contains('visible'));
    if (!blocked) {
        const speed = 4; let dx = 0, dy = 0;
        if (window.keys) {
            if (window.keys.w) dy -= speed; if (window.keys.s) dy += speed;
            if (window.keys.a) dx -= speed; if (window.keys.d) dx += speed;
        }
        if (joystickActive) { dx = joystickDir.x * speed; dy = joystickDir.y * speed; }
        if (dx !== 0 || dy !== 0) {
            if (!joystickActive && dx !== 0 && dy !== 0) { const l = Math.sqrt(dx*dx+dy*dy); dx=(dx/l)*speed; dy=(dy/l)*speed; }
            resX = Math.max(80, Math.min(1520, resX + dx));
            resY = Math.max(462, Math.min(778, resY + dy));
            const player = document.getElementById('res-player');
            if (player) player.setAttribute('transform', `translate(${resX},${resY})`);
        }
        checkResProximity();
    }
    requestAnimationFrame(resLoop);
}

function checkResProximity() {
    let closest = null, minDist = Infinity;
    for (const obj of RES_INTERACTABLES) {
        const dist = Math.sqrt(Math.pow(resX - obj.x, 2) + Math.pow(resY - obj.y, 2));
        if (dist < obj.radius && dist < minDist) { closest = obj; minDist = dist; }
    }
    const prompt = document.getElementById('res-enter-prompt');
    const icon   = document.getElementById('res-prompt-icon');
    const ring   = document.getElementById('res-interact-ring');
    if (closest && !resInteractCooldown) {
        resNearInteractable = closest;
        if (prompt) prompt.classList.remove('hidden');
        if (icon) icon.textContent = closest.icon;
        if (ring) { ring.setAttribute('cx', closest.x); ring.setAttribute('cy', closest.y); ring.setAttribute('opacity', '0.4'); }
    } else {
        resNearInteractable = null;
        if (prompt) prompt.classList.add('hidden');
        if (ring) ring.setAttribute('opacity', '0');
    }
}

// Central interaction entry point — every way of triggering an object (direct click,
// prompt click, "E" key) routes through here so exploration is tracked consistently.
function doResInteract(obj) {
    if (!obj) return;
    obj.action();
    recordExploration(obj.id);
}

function recordExploration(id) {
    if (!id || GameState.coastalAlertShown) return;
    exploredResObjects.add(id);
    // Hide the explore hint once the player has tried at least one object.
    const hint = document.getElementById('res-explore-hint');
    if (hint && !hint.classList.contains('hidden') && !hint.classList.contains('fading-out')) {
        hint.classList.add('fading-out');
        setTimeout(() => { hint.classList.add('hidden'); hint.classList.remove('fading-out'); }, 550);
    }
    // Crisis surfaces only after genuine exploration (3 distinct objects).
    if (exploredResObjects.size >= 3) {
        triggerFirstCrisis();
    }
}

function beginExplorationPhase() {
    if (GameState.coastalAlertShown) return;
    const hint = document.getElementById('res-explore-hint');
    if (hint) { hint.classList.remove('fading-out'); hint.classList.remove('hidden'); }
    // Fallback: if the player doesn't explore enough, surface the crisis after 30s.
    if (crisisFallbackTimer) clearTimeout(crisisFallbackTimer);
    crisisFallbackTimer = setTimeout(() => {
        if (GameState.phase === 'residential' && !GameState.coastalAlertShown) triggerFirstCrisis();
    }, 30000);
}

function triggerFirstCrisis() {
    if (GameState.coastalAlertShown) return;
    GameState.coastalAlertShown = true;
    if (crisisFallbackTimer) { clearTimeout(crisisFallbackTimer); crisisFallbackTimer = null; }
    const hint = document.getElementById('res-explore-hint');
    if (hint) hint.classList.add('hidden');
    triggerAlarm();
    Modal.show('modal-map-alert');
    document.getElementById('btn-start-mission').onclick = () => {
        Modal.hide('modal-map-alert');
        Toast.show(getTranslation('\uD83D\uDEA8 Crisis Detected! Click the minimap to explore and reach the Coastal Area.'), '', 6000);
        showMiniMap();
        const mc = document.getElementById('mini-map-container');
        if (mc) {
            mc.classList.remove('minimized');
            const tog = document.getElementById('btn-map-toggle');
            if (tog) tog.textContent = '\u2796';
            mc.classList.add('map-highlight-pulse');
            setTimeout(() => mc.classList.remove('map-highlight-pulse'), 4000);
        }
        updateMapCrisis();
    };
}

function openExploreMap() {
    if (exploreMapActive) return;
    exploreMapActive = true;
    resLoopActive = false;
    joystickActive = false; // Prevent stuck drift
    hideFinishButton(); // re-shown by checkAllAreasDone() when back in residential
    
    GameState.phase = 'explore-map';
    SceneManager.show('scene-explore-map', () => {
        const player = document.getElementById('world-player');
        if (player) player.setAttribute('transform', `translate(${worldX},${worldY})`);
        updateMapCrisis();
        if (!worldLoopActive) { worldLoopActive = true; requestAnimationFrame(worldLoop); }
    });
    hideMiniMap();
    Audio.play('click_success', { volume: 0.2 });
}

function closeExploreMap() {
    if (!exploreMapActive) return;
    exploreMapActive = false;
    worldLoopActive = false;
    const prompt = document.getElementById('world-enter-prompt');
    if (prompt) prompt.classList.add('hidden');
    worldNearArea = null;
    
    GameState.phase = 'residential';
    SceneManager.show('scene-residential', () => {
        initResidential();
    });
}

let _worldBobPhase = 0;
function worldLoop() {
    if (!worldLoopActive || !exploreMapActive) { worldLoopActive = false; return; }
    const speed = 4; let dx = 0, dy = 0;
    if (window.keys) {
        if (window.keys.w) dy -= speed; if (window.keys.s) dy += speed;
        if (window.keys.a) dx -= speed; if (window.keys.d) dx += speed;
    }
    if (joystickActive) { dx = joystickDir.x * speed; dy = joystickDir.y * speed; }
    if (dx !== 0 || dy !== 0) {
        if (!joystickActive && dx !== 0 && dy !== 0) { const l=Math.sqrt(dx*dx+dy*dy); dx=(dx/l)*speed; dy=(dy/l)*speed; }
        const newX = worldX+dx, newY = worldY+dy;
        if (isOnIsland(newX,newY)) { worldX=newX; worldY=newY; }
        else if (isOnIsland(newX,worldY)) { worldX=newX; }
        else if (isOnIsland(worldX,newY)) { worldY=newY; }
        _worldBobPhase += 0.2;
        const player = document.getElementById('world-player');
        if (player) player.setAttribute('transform', `translate(${worldX},${worldY + Math.sin(_worldBobPhase)*4})`);
        checkWorldProximity();
    }
    requestAnimationFrame(worldLoop);
}

function checkWorldProximity() {
    let closest = null, minDist = Infinity;
    for (const area of WORLD_AREAS) {
        const dx=worldX-area.x, dy=worldY-area.y, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist < area.radius && dist < minDist) { closest=area; minDist=dist; }
    }
    const prompt = document.getElementById('world-enter-prompt');
    const pName  = document.getElementById('world-enter-area-name');
    if (closest && closest.id !== 'residential') {
        worldNearArea = closest;
        if (pName) pName.textContent = getTranslation(closest.name);
        if (prompt) prompt.classList.remove('hidden');
    } else {
        worldNearArea = null;
        if (prompt) prompt.classList.add('hidden');
    }
}

function enterArea(areaName) {
    if (areaName === 'residential') {
        closeExploreMap();
        return;
    }

    // Only tear the explore map down when we actually commit to entering a mission.
    // Doing it unconditionally (the old behaviour) left the player frozen in a dead
    // explore map whenever they tapped an area that isn't enterable yet.
    function leaveExploreMap() {
        if (!exploreMapActive) return;
        exploreMapActive = false;
        worldLoopActive = false;
        const prompt = document.getElementById('world-enter-prompt');
        if (prompt) prompt.classList.add('hidden');
        worldNearArea = null;
    }

    // Story gating: only the Coastal area is in crisis at first. Agricultural and
    // Industrial stay "safe" until Coastal is resolved \u2014 tapping them just nudges
    // the player back to the active crisis instead of locking up the game.
    const coastalDone = GameState.allTasksDone();

    if (areaName === 'coastal') {
        if (!coastalDone) {
            leaveExploreMap();
            showMissionIntro('Coastal Area', 'A pollution crisis has been detected in the Coastal Area! Complete all tasks to restore environmental balance.', () => {
                GameState.currentArea = areaName; TodoPanel.show();
                GameState.phase = 'task1'; SceneManager.show('scene-task1', () => initTask1());
            });
        } else { Toast.show(getTranslation('Coastal Area is already safe!'), '\u2705', 2000); }
    } else if (areaName === 'agricultural') {
        if (coastalDone && !GameState.agriCompleted) {
            leaveExploreMap();
            showMissionIntro('Agricultural Area', 'Pollution detected in the Agricultural Area. Excess nutrients are affecting water quality.', () => {
                GameState.currentArea = areaName; TodoPanel.show();
                document.getElementById('todo-0').innerHTML = `<span class="todo-check"></span>${getTranslation('Identify pollution source')}`;
                document.getElementById('todo-1').innerHTML = `<span class="todo-check"></span>${getTranslation('Apply buffer strips')}`;
                document.getElementById('todo-2').style.display = 'none';
                document.getElementById('todo-3').style.display = 'none';
                document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('done'));
                document.querySelectorAll('.todo-check').forEach(el => el.textContent = '');
                GameState.phase = 'agri1'; SceneManager.show('scene-agri-task1', () => initAgriTask1());
            });
        } else if (GameState.agriCompleted) { Toast.show(getTranslation('Agricultural Area is already safe!'), '\u2705', 2000); }
        else { Toast.show(getTranslation('Agricultural Area is still safe. Resolve the Coastal Area crisis first!'), '\u2705', 2800); }
    } else if (areaName === 'industrial') {
        if (coastalDone && !GameState.indCompleted) {
            leaveExploreMap();
            showMissionIntro('Industrial Area', 'Pollution detected in the Industrial Area. Untreated wastewater is being released into the river.', () => {
                GameState.currentArea = areaName; Audio.stopBg(); Audio.play('ambient_factory', { volume: 0.3, loop: true }); TodoPanel.show();
                document.getElementById('todo-0').innerHTML = `<span class="todo-check"></span>${getTranslation('Identify pollution source')}`;
                document.getElementById('todo-1').innerHTML = `<span class="todo-check"></span>${getTranslation('Stop direct discharge')}`;
                document.getElementById('todo-2').innerHTML = `<span class="todo-check"></span>${getTranslation('Treat wastewater before release')}`;
                document.getElementById('todo-2').style.display = 'flex';
                document.getElementById('todo-3').style.display = 'none';
                document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('done'));
                document.querySelectorAll('.todo-check').forEach(el => el.textContent = '');
                GameState.phase = 'ind1'; SceneManager.show('scene-ind-task1', () => initIndTask1());
            });
        } else if (GameState.indCompleted) { Toast.show(getTranslation('Industrial Area is already safe!'), '\u2705', 2000); }
        else { Toast.show(getTranslation('Industrial Area is still safe. Resolve the Coastal Area crisis first!'), '\u2705', 2800); }
    }
}

function showMissionIntro(title, body, onStart) {
    document.getElementById('mission-intro-title').textContent = getTranslation(title);
    document.getElementById('mission-intro-body').innerHTML = getTranslation(body);
    Modal.show('modal-mission-intro');
    document.getElementById('btn-mission-start').onclick = () => { Modal.hide('modal-mission-intro'); onStart(); };
}

function initResidential() {
    if (GameState.phase !== 'residential') return;
    // Stop explore map if open
    exploreMapActive = false; worldLoopActive = false;
    HUD.show(); HUD.update();
    updateWorldMapPollution();
    if (!GameState.coastalAlertShown) { hideMiniMap(); } else { showMiniMap(); }
    initMap();
    TodoPanel.hide();
    // Base world (and the explore map it leads into) is a coastal/ocean setting —
    // play ocean ambience, which also replaces any lingering loop (e.g. factory).
    Audio.play('ambient_ocean', { volume: 0.3, loop: true });
    // Reset residential player position
    resX = 800; resY = 560;
    const resPlayer = document.getElementById('res-player');
    if (resPlayer) resPlayer.setAttribute('transform', `translate(${resX},${resY})`);
    setupResInteractables();
    if (!resLoopActive) { resLoopActive = true; requestAnimationFrame(resLoop); }
    // Setup keyboard input once
    if (!inputInitialized) {
        inputInitialized = true;
        if (!window.keys) window.keys = { w:false, a:false, s:false, d:false };
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'e') {
                if (exploreMapActive && worldNearArea && worldNearArea.id !== 'residential') {
                    const aid = worldNearArea.id; enterArea(aid); return;
                }
                if (!exploreMapActive && GameState.phase === 'residential' && resNearInteractable && !resInteractCooldown) {
                    resInteractCooldown = true; doResInteract(resNearInteractable);
                    setTimeout(() => { resInteractCooldown = false; }, 2500); return;
                }
            }
            if (key === 'escape' && exploreMapActive) { closeExploreMap(); return; }
            if (window.keys.hasOwnProperty(key)) window.keys[key] = true;
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (window.keys && window.keys.hasOwnProperty(key)) window.keys[key] = false;
        });
    }
    updateMapCrisis();

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

    // Update Building States visually (in explore map SVG)
    const bldgCoastal = document.getElementById('world-bldg-coastal');
    const bldgAgri = document.getElementById('world-bldg-agricultural');
    const bldgInd = document.getElementById('world-bldg-industrial');

    function updateWorldBuilding(bldg, state) {
        if (!bldg) return;
        bldg.classList.remove('crisis-glow', 'done-glow', 'locked-glow');
        if (state === 'crisis') bldg.classList.add('crisis-glow');
        else if (state === 'done') bldg.classList.add('done-glow');
        if (GameState.agriCompleted && GameState.indCompleted) counter.textContent = getTranslation('All areas resolved! ✅');
        else if (GameState.agriCompleted || GameState.indCompleted) counter.textContent = getTranslation('1 area left to solve');
        else counter.textContent = getTranslation('2 areas left to solve');
    }
    
    if (!GameState.instructionsShown) {
        Modal.show('modal-how-to-play');
        document.getElementById('btn-start-briefing').onclick = () => {
            Modal.hide('modal-how-to-play');
            GameState.instructionsShown = true;
            // Let the player explore the base first; crisis is gated in beginExplorationPhase().
            setTimeout(() => { if (GameState.phase === 'residential') beginExplorationPhase(); }, 600);
        };
    } else if (!GameState.coastalAlertShown && !GameState.allTasksDone()) {
        beginExplorationPhase();
    } else if (GameState.allTasksDone() && !GameState.agriAlertShown && (!GameState.agriCompleted || !GameState.indCompleted)) {
        GameState.agriAlertShown = true;
        setTimeout(() => {
            if (GameState.phase === 'residential') Toast.show(getTranslation('\uD83D\uDEA8 New crisis zones detected! Click the minimap to explore.'), '', 5000);
        }, 1200);
    } else if (GameState.allTasksDone() && (GameState.agriCompleted || GameState.indCompleted) && (!GameState.agriCompleted || !GameState.indCompleted)) {
        setTimeout(() => {
            if (GameState.phase === 'residential') Toast.show(getTranslation('One more area to restore! Click the minimap to explore.'), '\uD83D\uDDFA\uFE0F', 3000);
        }, 1500);
    }

    // All areas done — trigger ending regardless of which area was finished last.
    checkAllAreasDone();
}



let mapControllerActive = false;

function initMap() {
    if (mapControllerActive) return;
    mapControllerActive = true;

    // Minimap area clicks → open explore map (not direct enterArea)
    const areas = document.querySelectorAll('.mini-map-content .map-area');
    areas.forEach(area => {
        area.onclick = () => {
            if (area.dataset.area === 'residential') return; // already home
            openExploreMap();
        };
    });

    // Close button for explore map
    const closeBtn = document.getElementById('btn-close-explore');
    if (closeBtn) closeBtn.onclick = () => closeExploreMap();

    // Building shortcut clicks in explore map SVG (mobile-friendly direct entry)
    [['world-bldg-coastal','coastal'],['world-bldg-agricultural','agricultural'],['world-bldg-industrial','industrial'],['world-bldg-residential','residential']].forEach(([elId, area]) => {
        const el = document.getElementById(elId);
        if (el) {
            el.style.cursor = 'pointer';
            el.onclick = () => {
                if (exploreMapActive) {
                    // Snap world player near the area, then enter
                    const targetArea = WORLD_AREAS.find(a => a.id === area);
                    if (targetArea) { worldX = targetArea.x; worldY = targetArea.y; }
                    enterArea(area);
                }
            };
        }
    });

    // World-enter-prompt tap (in explore map) → enter nearest area
    const worldPrompt = document.getElementById('world-enter-prompt');
    if (worldPrompt) {
        worldPrompt.onclick = () => {
            if (exploreMapActive && worldNearArea && worldNearArea.id !== 'residential') {
                const aid = worldNearArea.id;
                enterArea(aid);
            }
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
            showStatGain([{ icon: '🦋', label: 'Biodiversity', delta: 10 }]);

            showEduPanel('marine_rescue', 'Next Task →', goToTask2);
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
    // Positions kept clear of the bottom-right corner where the mission checklist
    // sits (which is large on laptop/phone) so no trash is hidden behind it.
    const trashItems = [
        { emoji: '🧴', x: 8,  y: 56 },
        { emoji: '🥤', x: 20, y: 76 },
        { emoji: '🛍️', x: 32, y: 60 },
        { emoji: '🧃', x: 44, y: 82 },
        { emoji: '🍶', x: 56, y: 66 },
        { emoji: '🥡', x: 58, y: 48 },
        { emoji: '🧴', x: 70, y: 44 },
        { emoji: '🪣', x: 30, y: 47 }
    ];

    let collected = 0;
    const total = trashItems.length;
    const scene = document.getElementById('beach-scene-content');
    if (!scene) {
        console.error('Task2 init failed: #beach-scene-content not found');
        return;
    }

    // Sand gradually brightens from dirty/muddy to clean/golden as trash is removed.
    const sandEl = scene.querySelector('.b-sand');
    function brightenSand() {
        if (!sandEl) return;
        const f = total > 0 ? collected / total : 0; // 0 = dirty, 1 = fully clean
        const c1 = interpolateColor('#e09848', '#f7e6b4', f);
        const c2 = interpolateColor('#cc8030', '#eed493', f);
        const c3 = interpolateColor('#c07828', '#e7cb82', f);
        sandEl.style.background = `linear-gradient(180deg, ${c1} 0%, ${c2} 60%, ${c3} 100%)`;
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
        brightenSand();

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
        showStatGain([{ icon: '💧', label: 'Water Quality', delta: 10 }, { icon: '🦋', label: 'Biodiversity', delta: 5 }]);
        GameState.completeTask(1);
        Audio.play('task_complete', { volume: 0.8 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🌊', '✨', '💧', '🌿']);
        Toast.show(getTranslation('Beach cleaned successfully!'), getTranslation('💧 Water Quality +10  🦋 Biodiversity +5'), 3500);

        // Shake trash bin
        const bin = document.getElementById('trash-bin');
        if (bin) bin.classList.add('shake');

        showEduPanel('shoreline_cleanup', 'Next Task →', () => {
            GameState.phase = 'task3';
            SceneManager.show('scene-task3', () => {
                initTask3();
            });
        });
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
    if (instructionEl) typeWriter(instructionEl, getTranslation('Take bolts from the toolbox and drag them onto the patch to seal the leak!'), 35);

    // ── Bolt the patch over the crack (drag screws from the toolbox, like the discharge fix) ──
    const dz = document.getElementById('t3-dropzone');
    if (dz) dz.style.display = 'none';   // old plate drop-target is unused by the bolt mechanic

    const patch = document.getElementById('t3-patch');
    const toolbox = document.getElementById('t3-toolbox');
    const hintEl = document.getElementById('t3-toolbox-hint');
    const slots = patch ? patch.querySelectorAll('.t3-bolt-slot') : [];
    const TOTAL_BOLTS = 4;
    let boltsPlaced = 0;
    let selectedBolt = null;

    if (patch) patch.classList.remove('hidden');

    function refreshT3Hint() {
        if (hintEl) hintEl.textContent = `${getTranslation('Drag the bolts onto the patch')} (${boltsPlaced}/${TOTAL_BOLTS})`;
    }
    refreshT3Hint();

    // Build draggable bolts in the toolbox
    if (toolbox) {
        toolbox.innerHTML = '';
        for (let i = 0; i < TOTAL_BOLTS; i++) {
            const bolt = document.createElement('div');
            bolt.className = 't3-tool-bolt';
            bolt.textContent = '🔩';
            bolt.draggable = true;
            bolt.ondragstart = (e) => { e.dataTransfer.setData('text/plain', 'bolt'); setTimeout(() => { bolt.style.opacity = '0.4'; }, 0); };
            bolt.ondragend = () => { bolt.style.opacity = '1'; };
            bolt.onclick = () => {
                if (selectedBolt && selectedBolt !== bolt) selectedBolt.classList.remove('t3-tool-bolt-selected');
                if (selectedBolt === bolt) { bolt.classList.remove('t3-tool-bolt-selected'); selectedBolt = null; }
                else { selectedBolt = bolt; bolt.classList.add('t3-tool-bolt-selected'); }
            };
            toolbox.appendChild(bolt);
        }
    }

    function placeT3Bolt(slot) {
        if (!slot || slot.classList.contains('filled')) return;
        const tool = selectedBolt || (toolbox && toolbox.querySelector('.t3-tool-bolt'));
        if (!tool) return;
        if (selectedBolt) { selectedBolt.classList.remove('t3-tool-bolt-selected'); selectedBolt = null; }
        tool.remove();
        slot.classList.add('filled');
        slot.textContent = '🔩';
        // scraping / ratcheting SFX as the bolt is driven in
        Audio.play('metal_drag', { volume: 0.6 });
        Audio.play('wrench_ratchet', { volume: 0.5 });
        const r = slot.getBoundingClientRect();
        Particles.burst(r.left + r.width / 2, r.top + r.height / 2, 4, ['✨', '🔩']);
        boltsPlaced++;
        refreshT3Hint();
        if (boltsPlaced >= TOTAL_BOLTS) {
            if (instructionEl) typeWriter(instructionEl, getTranslation('All bolts secured! Sealing the leak...'), 35);
            const tp = document.getElementById('t3-toolbox-panel');
            if (tp) tp.classList.add('hidden');
            setTimeout(sealPipe, 700);
        }
    }

    // Drag-and-drop + click-to-place fallback (touch friendly)
    slots.forEach(slot => {
        slot.ondragover = (e) => { e.preventDefault(); };
        slot.ondrop = (e) => { e.preventDefault(); if (e.dataTransfer.getData('text/plain') === 'bolt') placeT3Bolt(slot); };
        slot.onclick = () => { if (selectedBolt) placeT3Bolt(slot); };
    });

    // (Old glue-then-drag-plate flow removed — Task 3 now uses the bolt-drag mechanic above.)

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
        showEduPanel('oil_leak_stopped', 'Next Task →', () => {
            GameState.phase = 'task4';
            SceneManager.show('scene-task4', () => { initTask4(); });
        });
    }
}



// ============================================
// SCENE: TASK 4 — CLEAN OIL SPILL (DECISION)
// ============================================
function initTask4() {
    if (GameState.phase !== 'task4') return;
    const instructionEl = document.getElementById('t4-instruction');
    if (instructionEl) typeWriter(instructionEl, getTranslation('Choose a method to clean up the oil spill'), 40);

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
        if (stepIndicator) stepIndicator.textContent = getTranslation('Task 4: Step 1/3 — Containment');
        typeWriter(instruction, getTranslation('Draw a containment boom around the oil spill!'), 30);

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

            typeWriter(instruction, getTranslation('✔ Boom deployed! Oil contained.'), 30);
            setTimeout(() => methodA_Step2(), 1200);
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (!closed) {
                typeWriter(instruction, getTranslation('Loop not closed! Bring the line back to start. Try again!'), 30);
            } else if (!enclosesOil) {
                typeWriter(instruction, getTranslation('Loop missed the oil spill! Draw around the dark blob. Try again!'), 30);
            } else {
                typeWriter(instruction, getTranslation('Loop too small! Draw a bigger circle. Try again!'), 30);
            }
        }
    }

    function methodA_Step2() {
        if (stepIndicator) stepIndicator.textContent = getTranslation('Task 4: Step 2/3 — Ignition');
        typeWriter(instruction, getTranslation('The oil is contained. Click IGNITE to start controlled burning!'), 30);

        const igniteBtn = document.getElementById('btn-t4-ignite');
        igniteBtn.classList.remove('hidden');

        igniteBtn.onclick = () => {
            igniteBtn.classList.add('hidden');
            typeWriter(instruction, getTranslation('🔥 Burning in progress...'), 30);

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
        if (stepIndicator) stepIndicator.textContent = getTranslation('Task 4: Step 3/3 — Result');
        typeWriter(instruction, getTranslation('Cleanup complete.'), 30);
        oceanContainer.style.background = 'linear-gradient(180deg, #0a4f7a 0%, #0d3a5c 100%)';

        resultCard.classList.remove('hidden');
        document.getElementById('t4-result-icon').textContent = '✅';
        document.getElementById('t4-result-title').textContent = getTranslation('Oil successfully removed by combustion.');
        document.getElementById('t4-r-water').textContent = '+25';
        document.getElementById('t4-r-bio').textContent = '+5';
        document.getElementById('t4-result-info').textContent = getTranslation('In-situ burning physically removes oil from the water surface. Some air pollution occurs but marine ecosystem impact is minimal.');

        document.getElementById('btn-t4-complete').onclick = () => finishTask4('burning');
    }

    // ==========================================
    // METHOD B: COREXIT DISPERSANT
    // ==========================================
    function startMethodB() {
        methodSelection.classList.add('hidden');
        GameState.task4Choice = 'chemical';

        if (stepIndicator) stepIndicator.textContent = getTranslation('Task 4: Step 1/3 — Surface Spraying');
        typeWriter(instruction, getTranslation('Drag the boat across the oil spill to spray dispersant!'), 30);

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
            typeWriter(instruction, getTranslation('✔ Surface spraying complete!'), 30);
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
        if (stepIndicator) stepIndicator.textContent = getTranslation('Task 4: Step 2/3 — Submarine Injection');
        typeWriter(instruction, getTranslation('Click the injection point 3 times to inject dispersant into the leak source!'), 30);

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
        counter.textContent = `${getTranslation('Injections')}: 0/3`;

        let clicks = 0;
        injectTarget.onclick = () => {
            clicks++;
            counter.textContent = `${getTranslation('Injections')}: ${clicks}/3`;

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
                typeWriter(instruction, getTranslation('✔ Injection complete. Dispersant deployed!'), 30);
                setTimeout(() => methodB_Step3(), 1200);
            }
        };
    }

    function methodB_Step3() {
        if (stepIndicator) stepIndicator.textContent = getTranslation('Task 4: Step 3/3 — Result');
        typeWriter(instruction, getTranslation('Cleanup complete.'), 30);

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
        document.getElementById('t4-result-title').textContent = getTranslation('Oil dispersed — but not removed.');

        document.getElementById('t4-r-water').textContent = '+20';

        const bioSpan = document.getElementById('t4-r-bio');
        bioSpan.textContent = '−15';
        bioSpan.classList.add('negative');

        const warning = document.getElementById('t4-result-warning');
        warning.classList.remove('hidden');
        warning.innerHTML = getTranslation('Chemical dispersants break oil into tiny droplets that remain in the water column, making them more accessible to marine life. Toxic to fish, coral, and plankton.');

        document.getElementById('t4-result-info').textContent = getTranslation('Used in Deepwater Horizon (2010) — still debated by scientists.');

        document.getElementById('btn-t4-complete').onclick = () => finishTask4('chemical');
    }

    function finishTask4(method) {
        if (method === 'burning') {
            GameState.updateWater(25);
            GameState.updateBio(5);
            Audio.play('task_complete', { volume: 0.8 });
            showStatGain([{ icon: '💧', label: 'Water Quality', delta: 25 }, { icon: '🦋', label: 'Biodiversity', delta: 5 }]);
        } else {
            GameState.updateWater(20);
            GameState.updateBio(-15);
            Audio.play('task_complete', { volume: 0.8 });
            showStatGain([{ icon: '💧', label: 'Water Quality', delta: 20 }, { icon: '🦋', label: 'Biodiversity', delta: -15 }]);
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
    if (instructionEl) typeWriter(instructionEl, getTranslation('Click the glowing red zone on the farm to scan and reveal the pollution source.'), 40);

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
        const msg = getTranslation("Fertilizers from farms are flowing into the water. These nutrients can pollute water and harm the ecosystem.");

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    Toast.show(getTranslation('Source identified.'), '☑', 3000);
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
    if (instructionEl) typeWriter(instructionEl, getTranslation('Plant vegetation along the river by clicking each highlighted spot to filter runoff.'), 40);

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
        slot.className = 'plant-slot plant-slot-empty';
        slot.style.left = pos.x + 'px';
        slot.style.top = pos.y + 'px';
        slot.innerHTML = '<span class="plant-slot-hint">+</span>';

        slot.onclick = (e) => {
            if (slot.classList.contains('planted')) return;
            slot.classList.add('planted');
            slot.classList.remove('plant-slot-empty');
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
        showStatGain([{ icon: '💧', label: 'Water Quality', delta: 15 }, { icon: '🦋', label: 'Biodiversity', delta: 10 }]);
        GameState.agriCompleted = true;
        GameState.completeTask(1, true);

        Audio.play('task_complete', { volume: 0.8 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🌱', '🌊', '🦋']);
        Toast.show(getTranslation('Runoff successfully reduced.'), '💧+15 🦋+10', 3500);

        showEduPanel('buffer_strip', 'Return to World', () => {
            GameState.phase = 'residential';
            SceneManager.show('scene-residential', () => initResidential());
        });
    }
}

// ============================================
// SCENE: INDUSTRIAL TASK 1
// ============================================
function initIndTask1() {
    if (GameState.phase !== 'ind1') return;
    const instructionEl = document.getElementById('ind1-instruction');
    if (instructionEl) typeWriter(instructionEl, getTranslation('Click the glowing red zone on the discharge pipe to identify the wastewater source.'), 40);
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

        Toast.show(getTranslation('Source identified.'), '☑', 3000);
        GameState.completeTask(0, true);

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';

        const msg1 = getTranslation("Factories are releasing untreated waste into the water.");
        const msg2 = getTranslation(" Industrial waste may contain toxic chemicals and heavy metals.");
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
    if (instructionEl) typeWriter(instructionEl, getTranslation('Step 1: Drag the 4 missing bolts onto the flange.'), 40);

    const container = document.getElementById('ind2-bolts-container');
    const toolbox = document.getElementById('ind2-toolbox');
    const wrench = document.getElementById('ind2-wrench');
    const successMsg = document.getElementById('ind2-success-msg');
    const leakAnim = document.getElementById('ind2-leak-anim');

    container.innerHTML = '';
    toolbox.innerHTML = '';
    successMsg.classList.add('hidden');

    // Step/progress badge so the player always knows what to do next.
    const pipeScene = document.querySelector('#scene-ind-task2 .ind-pipe-scene');
    let badge = document.getElementById('ind2-progress-badge');
    if (!badge && pipeScene) {
        badge = document.createElement('div');
        badge.id = 'ind2-progress-badge';
        badge.className = 'ind2-progress-badge';
        pipeScene.appendChild(badge);
    }

    // Sets the instruction text directly (no typewriter) for snappy stage changes.
    function setInd2Instruction(text) {
        if (!instructionEl) return;
        if (instructionEl.typewriterInterval) {
            clearInterval(instructionEl.typewriterInterval);
            instructionEl.typewriterInterval = null;
        }
        instructionEl.textContent = text;
    }

    // Keeps instruction + badge + wrench affordance in sync with progress.
    function updateInd2Stage() {
        const allPlaced = boltsPlaced >= 4;
        if (badge) {
            badge.textContent = allPlaced
                ? `🔧 ${getTranslation('Bolts tightened')}: ${boltsTightened}/8`
                : `🔩 ${getTranslation('Bolts placed')}: ${boltsPlaced}/4`;
        }
        if (!allPlaced) {
            wrench.classList.remove('wrench-ready');
        } else if (!selectedWrench && boltsTightened < 8) {
            // All bolts seated — spotlight the wrench and explain step 2.
            wrench.classList.add('wrench-ready');
            setInd2Instruction(getTranslation('All bolts placed! Step 2: tap the 🔧 wrench, then tap each bolt to tighten.'));
        }
    }

    // Coordinates are relative to the #ind2-joint flange plate (180x240) so the
    // bolts visibly sit on the two flange columns of the pipe joint.
    const slotPositions = [
        { x: 30,  y: 45,  hasBolt: true },  { x: 150, y: 45,  hasBolt: false },
        { x: 30,  y: 100, hasBolt: false }, { x: 150, y: 100, hasBolt: true },
        { x: 30,  y: 155, hasBolt: true },  { x: 150, y: 155, hasBolt: false },
        { x: 30,  y: 210, hasBolt: false }, { x: 150, y: 210, hasBolt: true }
    ];

    let boltsTightened = 0;
    let boltsPlaced = 0;
    let selectedWrench = false;
    let selectedBoltElement = null;

    // Called after each missing bolt is seated into a slot.
    function afterPlace() {
        boltsPlaced++;
        updateInd2Stage();
    }

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
                    afterPlace();
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
                afterPlace();
            }
        };

        container.appendChild(slot);
    });

    wrench.onclick = () => {
        // Guide the player: bolts must be seated before the wrench does anything.
        if (boltsPlaced < 4) {
            Toast.show(getTranslation('Place all 4 bolts onto the flange first.'), '🔩', 2200);
            return;
        }
        selectedWrench = !selectedWrench;
        wrench.style.background = selectedWrench ? '#2980b9' : '#222';
        wrench.classList.toggle('wrench-active', selectedWrench);
        if (selectedWrench) {
            wrench.classList.remove('wrench-ready');
            setInd2Instruction(getTranslation('Now tap each bolt one by one to tighten it.'));
            // Pulse every bolt that still needs tightening so the target is obvious.
            container.querySelectorAll('.ind-bolt:not(.tightened)').forEach(b => b.classList.add('needs-tighten'));
        } else {
            container.querySelectorAll('.ind-bolt').forEach(b => b.classList.remove('needs-tighten'));
        }
        updateInd2Stage();
    };

    container.onclick = (e) => {
        if (!selectedWrench) {
            if (boltsPlaced >= 4) Toast.show(getTranslation('Tap the 🔧 wrench first, then tap each bolt.'), '🔧', 2200);
            return;
        }
        const target = e.target;
        if (target.classList.contains('ind-bolt') && !target.classList.contains('tightened')) {
            target.classList.add('tightened');
            target.classList.remove('needs-tighten');
            target.textContent = '✅';
            Audio.play('wrench_ratchet', { volume: 0.7 });
            Particles.burst(e.clientX, e.clientY, 4, ['🔧', '✨']);

            boltsTightened++;
            updateInd2Stage();
            if (boltsTightened === 8) {
                completeInd2();
            }
        }
    };

    // Initialise the badge/instruction for the starting (placing) stage.
    updateInd2Stage();

    function completeInd2() {
        leakAnim.style.display = 'none';
        GameState.completeTask(1, true);
        Audio.play('task_complete', { volume: 0.8 });

        successMsg.classList.remove('hidden');
        successMsg.innerHTML = '';

        const msg = getTranslation('Discharge successfully stopped.');
        let i = 0;
        const typeInterval = setInterval(() => {
            successMsg.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    showEduPanel('direct_discharge', 'Next Task →', () => {
                        GameState.phase = 'ind3';
                        SceneManager.show('scene-ind-task3', () => initIndTask3());
                    });
                }, 1200);
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
    if (instructionEl) typeWriter(instructionEl, getTranslation('Choose a method to treat the remaining wastewater.'), 40);

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

        // Reset layer state (important when re-entering via the Back button):
        // only the first layer is visible; the rest are hidden until clicked in order.
        layers.forEach((layer, idx) => {
            layer.classList.remove('completed');
            layer.style.opacity = '1';
            if (idx === 0) {
                layer.classList.remove('hidden');
                layer.style.display = 'flex';
            } else {
                layer.classList.add('hidden');
            }
        });

        layers.forEach((layer, idx) => {
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
                        // .hidden uses display:none !important, so inline display can't
                        // override it — must remove the class to reveal the next layer.
                        layers[idx + 1].classList.remove('hidden');
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
                Toast.show(getTranslation('Drag the bottle to the treatment pool!'), '🧪', 2000);
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
        const _statGains = [];
        if (waterVal) _statGains.push({ icon: '💧', label: 'Water Quality', delta: waterVal });
        if (bioVal) _statGains.push({ icon: '🦋', label: 'Biodiversity', delta: bioVal });
        showStatGain(_statGains);

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

// Called whenever the player returns to the residential base. Instead of auto-
// triggering the ending, it reveals a manual "Finish" button once every area is
// restored — the player decides when to view the results. This also makes the
// ending reliable regardless of which area was completed last.
function checkAllAreasDone() {
    if (GameState.endingTriggered) return;
    if (GameState.allTasksDone() && GameState.agriCompleted && GameState.indCompleted) {
        showFinishButton();
    } else {
        hideFinishButton();
    }
}

function showFinishButton() {
    const btn = document.getElementById('btn-finish-game');
    if (!btn) return;
    btn.classList.remove('hidden');
    btn.onclick = () => {
        if (GameState.endingTriggered) return;
        GameState.endingTriggered = true;
        hideFinishButton();
        runEndingSequence();
    };
}

function hideFinishButton() {
    const btn = document.getElementById('btn-finish-game');
    if (btn) btn.classList.add('hidden');
}

function runEndingSequence() {
    const resSvg = document.querySelector('.residential-bg-svg');
    if (resSvg) {
        const grass = resSvg.querySelector('path[fill="#2d9e4f"]');
        if (grass) grass.setAttribute('fill', '#2ecc71');
        const sky = resSvg.querySelector('rect[fill="#8ecae6"]');
        if (sky) sky.setAttribute('fill', '#3498db');
    }

    Toast.show(getTranslation('All pollution sources have been successfully managed.'), '✅', 4000);

    setTimeout(() => {
        GameState.phase = 'reflection';
        SceneManager.show('scene-reflection', () => initReflection());
    }, 2500);
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

    // Wire persistent sound + language controls (visible on every scene)
    initGlobalControls();

    // Global Back button (per-scene navigation)
    const backBtn = document.getElementById('btn-back');
    if (backBtn) backBtn.onclick = (e) => { e.stopPropagation(); goBack(); };

    HUD.init();
    SceneManager.show('scene-landing', () => {
        initLanding();
    });
});
