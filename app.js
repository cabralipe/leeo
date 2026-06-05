/**
 * LEEO - Laboratory Management System
 * Core SPA JavaScript Logic with User Authentication & Supabase Sync
 */

// ==========================================================================
// SAFE LOCAL STORAGE WRAPPER (Prevents crashes in restrictive file:// sandboxes)
// ==========================================================================
const safeLocalStorage = {
    getItem(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorage.getItem is blocked or unavailable:", e);
            return null;
        }
    },
    setItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            console.warn("localStorage.setItem is blocked or unavailable:", e);
        }
    },
    removeItem(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
            console.warn("localStorage.removeItem is blocked or unavailable:", e);
        }
    }
};

// ==========================================================================
// SUPABASE DATABASE INTEGRATION (OPCIONAL)
// ==========================================================================
const SUPABASE_URL = "https://wlojxqzhsxprjdfuywbg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsb2p4cXpoc3hwcmpkZnV5d2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzczODcsImV4cCI6MjA5NjI1MzM4N30.jBRnd03x_cwYeZOWxGeTI6hypcLdP5X9pkZL_YBwunI";

let supabaseClient = null;

if (SUPABASE_URL !== "SUA_SUPABASE_URL_AQUI" && SUPABASE_ANON_KEY !== "SUA_SUPABASE_ANON_KEY_AQUI") {
    try {
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase inicializado com sucesso!");
        } else {
            console.warn("Script do Supabase não foi carregado.");
        }
    } catch (error) {
        console.error("Erro de inicialização do Supabase:", error);
    }
}

// ==========================================================================
// 1. Initial Seed Data & State Initialization
// ==========================================================================

const DEFAULT_USERS = [
    { id: "u-1", name: "Super Administrador", username: "admin", password: "admin", role: "superadmin" },
    { id: "u-2", name: "Dra. Mariana Silva", username: "mariana", password: "123", role: "admin" },
    { id: "u-3", name: "Téc. Lucas Santos", username: "lucas", password: "123", role: "user" },
    { id: "u-4", name: "Prof. Carlos Souza", username: "carlos", password: "123", role: "admin" },
    { id: "u-5", name: "Bio. Aline Costa", username: "aline", password: "123", role: "user" }
];

const DEFAULT_REAGENTS = [
    { id: "r-1", code: "R001", name: "Metanol P.A.", cas: "67-56-1", quantity: "2.5 Litros", location: "Armário A", expiry: "2026-04-10", unlabeled: false },
    { id: "r-2", code: "R002", name: "Acetonitrila Grau HPLC", cas: "75-05-8", quantity: "4 Litros", location: "Armário B", expiry: "2027-08-15", unlabeled: false },
    { id: "r-3", code: "R003", name: "Ácido Clorídrico Concentrado", cas: "7647-01-0", quantity: "1 Litro", location: "Armário A", expiry: "2026-03-01", unlabeled: false },
    { id: "r-4", code: "R004", name: "Solvente Desconhecido (Sem Identificação)", cas: "N/A", quantity: "500 mL", location: "Geladeira 1", expiry: "2026-11-30", unlabeled: true },
    { id: "r-5", code: "R005", name: "Cloreto de Sódio P.A.", cas: "7647-14-5", quantity: "500 g", location: "Prateleira C", expiry: "2028-12-01", unlabeled: false },
    { id: "r-6", code: "R006", name: "Padrão de Cafeína", cas: "58-08-2", quantity: "10 g", location: "Freezer 2", expiry: "2026-05-20", unlabeled: false }
];

const DEFAULT_CHECKLIST = {
    bancada_1: false,
    bancada_2: false,
    bancada_3: false,
    ponteira_1: false,
    ponteira_2: false,
    ponteira_3: false,
    residuo_1: false,
    residuo_2: false,
    residuo_3: false,
    equip_1: false,
    equip_2: false,
    equip_3: false,
    epi_1: false,
    epi_2: false,
    epi_3: false
};

const DEFAULT_MUTIRAO = [
    {
        day: "Segunda-feira",
        responsible: "Dr. Felipe Cabral",
        team: "Lucas, Aline",
        tasks: [
            { id: "mon_1", text: "Catalogar reagentes das geladeiras", checked: false },
            { id: "mon_2", text: "Descartar materiais vencidos com autorização do responsável", checked: false },
            { id: "mon_3", text: "Identificar frascos sem rótulo", checked: false },
            { id: "mon_4", text: "Nomear Geladeiras", checked: false }
        ]
    },
    {
        day: "Terça-feira",
        responsible: "Dra. Mariana Silva",
        team: "Felipe",
        tasks: [
            { id: "tue_1", text: "Catalogar reagentes dos freezers", checked: false },
            { id: "tue_2", text: "Descartar materiais vencidos com autorização do responsável", checked: false },
            { id: "tue_3", text: "Identificar frascos sem rótulo", checked: false },
            { id: "tue_4", text: "Nomear Freezers", checked: false }
        ]
    },
    {
        day: "Quarta-feira",
        responsible: "Téc. Lucas Santos",
        team: "Aline",
        tasks: [
            { id: "wed_1", text: "Catalogar reagentes dos armários ou gavetas", checked: false },
            { id: "wed_2", text: "Reorganizar os reagentes", checked: false },
            { id: "wed_3", text: "Nomear Armários", checked: false },
            { id: "wed_4", text: "Organizar vidrarias", checked: false }
        ]
    },
    {
        day: "Quinta-feira",
        responsible: "Prof. Carlos Souza",
        team: "Todos",
        tasks: [
            { id: "thu_1", text: "Organização das capelas", checked: false },
            { id: "thu_2", text: "Organização dos descartes", checked: false }
        ]
    },
    {
        day: "Sexta-feira",
        responsible: "Bio. Aline Costa",
        team: "Lucas",
        tasks: [
            { id: "fri_1", text: "Organização dos vídeos de treinamento", checked: false }
        ]
    }
];

const DEFAULT_EQUIPMENTS = [];

const DEFAULT_WATER_LOGS = [];

const DEFAULT_RESERVATIONS = [
    { id: "res-1", lab: "Laboratório de HPLC", user: "Dra. Mariana Silva", start: "2026-06-08T09:00", end: "2026-06-08T12:00", notes: "Corrida de cafeína no HPLC" },
    { id: "res-2", lab: "Laboratório de Eletroquímica", user: "Téc. Lucas Santos", start: "2026-06-09T14:00", end: "2026-06-09T18:00", notes: "Experimentos de voltametria cíclica" }
];

const DEFAULT_INVENTORY_LOGS = [
    { id: "il-1", time: "05/06/2026 08:00", type: "info", text: "Sistema inicializado com sucesso localmente." }
];

const LAB_MEMBERS = [
    "Dr. Felipe Cabral",
    "Dra. Mariana Silva",
    "Téc. Lucas Santos",
    "Prof. Carlos Souza",
    "Bio. Aline Costa"
];

// Initialize State Object
let state = {
    users: JSON.parse(safeLocalStorage.getItem("leeo_users")) || DEFAULT_USERS,
    currentUser: JSON.parse(safeLocalStorage.getItem("leeo_currentUser")) || null,
    reagents: JSON.parse(safeLocalStorage.getItem("leeo_reagents")) || DEFAULT_REAGENTS,
    checklist: JSON.parse(safeLocalStorage.getItem("leeo_checklist")) || DEFAULT_CHECKLIST,
    mutirao: JSON.parse(safeLocalStorage.getItem("leeo_mutirao")) || DEFAULT_MUTIRAO,
    reservations: JSON.parse(safeLocalStorage.getItem("leeo_reservations")) || DEFAULT_RESERVATIONS,
    equipments: JSON.parse(safeLocalStorage.getItem("leeo_equipments")) || DEFAULT_EQUIPMENTS,
    waterLogs: JSON.parse(safeLocalStorage.getItem("leeo_waterLogs")) || DEFAULT_WATER_LOGS,
    inventoryLogs: JSON.parse(safeLocalStorage.getItem("leeo_inventoryLogs")) || DEFAULT_INVENTORY_LOGS,
    weeklyResponsible: safeLocalStorage.getItem("leeo_weeklyResponsible") || null,
    startingDeionizada: parseFloat(safeLocalStorage.getItem("leeo_start_deionizada")) || 100,
    startingDestilada: parseFloat(safeLocalStorage.getItem("leeo_start_destilada")) || 100
};

if (!state.weeklyResponsible && state.users.length > 0) {
    state.weeklyResponsible = state.users[0].name;
}

// ==========================================================================
// Supabase Data Synchronization Logic
// ==========================================================================

async function syncFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        console.log("Iniciando sincronização com o Supabase...");
        
        // 0. Fetch Users
        const { data: dbUsers, error: err0 } = await supabaseClient.from("leeo_users").select("*");
        if (!err0 && dbUsers && dbUsers.length > 0) state.users = dbUsers;
        
        // 1. Fetch Reagents
        const { data: dbReagents, error: err1 } = await supabaseClient.from("leeo_reagents").select("*");
        if (!err1 && dbReagents) state.reagents = dbReagents;
        
        // 2. Fetch Checklist
        const { data: dbChecklist, error: err2 } = await supabaseClient.from("leeo_checklist").select("*");
        if (!err2 && dbChecklist) {
            dbChecklist.forEach(item => {
                state.checklist[item.id] = item.checked;
            });
        }
        
        // 3. Fetch Mutirão Geral
        const { data: dbMutirao, error: errMutirao } = await supabaseClient.from("leeo_mutirao").select("*");
        if (!errMutirao && dbMutirao && dbMutirao.length > 0) {
            dbMutirao.forEach(item => {
                const dayObj = state.mutirao.find(d => d.day === item.day);
                if (dayObj) {
                    dayObj.responsible = item.responsible;
                    dayObj.team = item.team;
                    if (item.tasks_json) {
                        try {
                            dayObj.tasks = JSON.parse(item.tasks_json);
                        } catch (e) {
                            console.error("Erro parsing tasks_json", e);
                        }
                    }
                }
            });
        }

        // 3.5 Fetch Reservations
        const { data: dbReservations, error: errRes } = await supabaseClient.from("leeo_reservations").select("*");
        if (!errRes && dbReservations) state.reservations = dbReservations;
        
        // 4. Fetch Equipments
        const { data: dbEquip, error: err3 } = await supabaseClient.from("leeo_equipments").select("*");
        if (!err3 && dbEquip) {
            state.equipments = dbEquip.map(eq => {
                let steps = [];
                if (eq.procedures_json) {
                    try {
                        steps = JSON.parse(eq.procedures_json);
                    } catch (e) {
                        console.error("Error parsing procedures_json for equipment " + eq.id, e);
                    }
                }
                return {
                    id: eq.id,
                    name: eq.name,
                    responsible: eq.responsible,
                    status: eq.status,
                    icon: eq.icon || "cpu",
                    procedures: {
                        video: eq.video || "",
                        videoTitle: eq.video_title || "",
                        steps: steps
                    }
                };
            });
        }
        
        // 5. Fetch Water Logs
        const { data: dbWater, error: err4 } = await supabaseClient.from("leeo_water_logs").select("*");
        if (!err4 && dbWater) state.waterLogs = dbWater;
        
        // 6. Fetch Activity Logs
        const { data: dbLogs, error: err5 } = await supabaseClient.from("leeo_inventory_logs").select("*");
        if (!err5 && dbLogs) state.inventoryLogs = dbLogs;
        
        // 7. Fetch settings
        const { data: dbSets, error: err6 } = await supabaseClient.from("leeo_settings").select("*");
        if (!err6 && dbSets) {
            dbSets.forEach(set => {
                if (set.key === "weekly_responsible") state.weeklyResponsible = set.value;
                if (set.key === "start_deionizada") state.startingDeionizada = parseFloat(set.value) || 100;
                if (set.key === "start_destilada") state.startingDestilada = parseFloat(set.value) || 100;
            });
        }
        
        saveStateLocal();
        showToast("Dados atualizados com o banco Supabase!", "success");
        refreshActiveTab();
    } catch (error) {
        console.error("Falha ao ler do Supabase:", error);
    }
}

async function supabaseUpsert(table, records) {
    if (!supabaseClient) return;
    try {
        await supabaseClient.from(table).upsert(records);
    } catch (e) {
        console.error(`Erro ao salvar na tabela ${table} no Supabase:`, e);
    }
}

async function supabaseDelete(table, idValue) {
    if (!supabaseClient) return;
    try {
        await supabaseClient.from(table).delete().eq("id", idValue);
    } catch (e) {
        console.error(`Erro ao apagar registro na tabela ${table} no Supabase:`, e);
    }
}

function saveStateLocal() {
    safeLocalStorage.setItem("leeo_users", JSON.stringify(state.users));
    safeLocalStorage.setItem("leeo_currentUser", JSON.stringify(state.currentUser));
    safeLocalStorage.setItem("leeo_reagents", JSON.stringify(state.reagents));
    safeLocalStorage.setItem("leeo_checklist", JSON.stringify(state.checklist));
    safeLocalStorage.setItem("leeo_mutirao", JSON.stringify(state.mutirao));
    safeLocalStorage.setItem("leeo_reservations", JSON.stringify(state.reservations));
    safeLocalStorage.setItem("leeo_equipments", JSON.stringify(state.equipments));
    safeLocalStorage.setItem("leeo_waterLogs", JSON.stringify(state.waterLogs));
    safeLocalStorage.setItem("leeo_inventoryLogs", JSON.stringify(state.inventoryLogs));
    safeLocalStorage.setItem("leeo_weeklyResponsible", state.weeklyResponsible);
    safeLocalStorage.setItem("leeo_start_deionizada", state.startingDeionizada);
    safeLocalStorage.setItem("leeo_start_destilada", state.startingDestilada);
    
    updateGlobalCounters();
}

function saveState() {
    saveStateLocal();
}

function refreshActiveTab() {
    updateGlobalCounters();
    const activeBtn = document.querySelector(".nav-btn.active");
    if (!activeBtn) return;
    const tabId = activeBtn.getAttribute("data-tab");
    
    if (tabId === "inventario") {
        renderReagentsTable();
        renderInventoryLogs();
    } else if (tabId === "organizacao") {
        renderChecklist();
        setupResponsibleSelector();
    } else if (tabId === "mutirao") {
        renderMutiraoGrid();
    } else if (tabId === "agendamento") {
        renderReservations();
        updateReservationInputMin();
    } else if (tabId === "equipamentos") {
        renderEquipmentsGrid();
    } else if (tabId === "agua") {
        renderWaterLogs();
    } else if (tabId === "usuarios") {
        renderUsersTable();
    }
}

// ==========================================================================
// 2. Authentication UI & Logic (Login / Register / Logout)
// ==========================================================================

const authScreen = document.getElementById("auth-screen");
const mainApp = document.getElementById("main-app");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const toggleToRegister = document.getElementById("toggle-to-register");
const toggleToLogin = document.getElementById("toggle-to-login");
const btnLogout = document.getElementById("btn-logout");

toggleToRegister.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    document.getElementById("auth-subtitle-text").textContent = "Criar nova conta de acesso";
});

toggleToLogin.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "flex";
    document.getElementById("auth-subtitle-text").textContent = "Gestão e Organização de Laboratório";
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("login-username").value.trim().toLowerCase();
    const passwordInput = document.getElementById("login-password").value;
    
    const user = state.users.find(u => u.username === usernameInput && u.password === passwordInput);
    
    if (user) {
        state.currentUser = user;
        saveState();
        showToast(`Bem-vindo, ${user.name}!`, "success");
        checkAuth();
        
        if (supabaseClient) {
            syncFromSupabase();
        }
    } else {
        showToast("Usuário ou senha incorretos.", "danger");
    }
});

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-fullname").value.trim();
    const username = document.getElementById("reg-username").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    const role = "user";
    
    if (state.users.some(u => u.username === username)) {
        showToast("Este nome de usuário já está cadastrado.", "danger");
        return;
    }
    
    const newUser = {
        id: "u-" + Date.now(),
        name,
        username,
        password,
        role
    };
    
    state.users.push(newUser);
    state.currentUser = newUser;
    saveState();
    
    showToast("Conta criada e login efetuado com sucesso!", "success");
    registerForm.reset();
    
    if (supabaseClient) {
        supabaseUpsert("leeo_users", newUser);
        syncFromSupabase();
    }
    checkAuth();
});

btnLogout.addEventListener("click", () => {
    if (confirm("Deseja sair do sistema?")) {
        state.currentUser = null;
        safeLocalStorage.removeItem("leeo_currentUser");
        
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelector("[data-tab='inventario']").classList.add("active");
        document.querySelectorAll(".tab-view").forEach(view => view.classList.remove("active"));
        document.getElementById("view-inventario").classList.add("active");
        document.getElementById("page-title").textContent = tabs["inventario"];
        
        showToast("Sessão encerrada.", "info");
        checkAuth();
    }
});

function checkAuth() {
    if (state.currentUser) {
        authScreen.style.display = "none";
        mainApp.style.display = "grid";
        initDashboard();
    } else {
        mainApp.style.display = "none";
        authScreen.style.display = "flex";
        loginForm.reset();
        registerForm.reset();
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
    }
}

function initDashboard() {
    const user = state.currentUser;
    if (!user) return;
    
    document.getElementById("sidebar-user-name").textContent = user.name;
    
    let roleText = "Usuário";
    if (user.role === "admin") roleText = "Administrador";
    if (user.role === "superadmin") roleText = "Superadmin";
    document.getElementById("sidebar-user-role").textContent = roleText;
    
    const usersLi = document.getElementById("nav-users-li");
    if (user.role === "admin" || user.role === "superadmin") {
        usersLi.style.display = "block";
    } else {
        usersLi.style.display = "none";
    }
    
    const invAdminActions = document.getElementById("inventory-admin-actions");
    const editHeaders = document.querySelectorAll(".edit-actions-header");
    const resetCheckBtn = document.getElementById("btn-reset-checklist");
    const clearWaterBtn = document.getElementById("btn-clear-water-logs");
    const clearInvLogBtn = document.getElementById("btn-clear-inventory-logs");
    const clearResBtn = document.getElementById("btn-clear-reservations");
    
    if (user.role === "admin" || user.role === "superadmin") {
        if (invAdminActions) invAdminActions.style.display = "flex";
        if (resetCheckBtn) resetCheckBtn.style.display = "inline-flex";
        if (clearWaterBtn) clearWaterBtn.style.display = "inline-block";
        if (clearInvLogBtn) clearInvLogBtn.style.display = "inline-block";
        if (clearResBtn) clearResBtn.style.display = "inline-block";
        editHeaders.forEach(el => el.style.display = "table-cell");
    } else {
        if (invAdminActions) invAdminActions.style.display = "none";
        if (resetCheckBtn) resetCheckBtn.style.display = "none";
        if (clearWaterBtn) clearWaterBtn.style.display = "none";
        if (clearInvLogBtn) clearInvLogBtn.style.display = "none";
        if (clearResBtn) clearResBtn.style.display = "none";
    }
    
    const btnAddEquipModal = document.getElementById("btn-add-equipment-modal");
    if (btnAddEquipModal) {
        btnAddEquipModal.style.display = user.role === "superadmin" ? "flex" : "none";
    }
    
    const waterUser = document.getElementById("water-user");
    if (waterUser) {
        waterUser.value = user.name;
    }
    
    // Render all views
    renderReagentsTable();
    renderInventoryLogs();
    renderChecklist();
    setupResponsibleSelector();
    renderMutiraoGrid();
    renderReservations();
    updateReservationInputMin();
    renderWaterLogs();
    renderEquipmentsGrid();
    renderUsersTable();
    
    lucide.createIcons();
}

// ==========================================================================
// 3. Global Notification & Expiry Helpers
// ==========================================================================

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "danger") iconName = "x-circle";
    
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i data-lucide="x"></i></button>
    `;
    
    container.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    
    const autoRemove = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(autoRemove);
        toast.remove();
    });
}

function getExpirationStatus(expiryDateStr) {
    if (!expiryDateStr) return { label: "Sem Validade", class: "badge-danger", expired: true };
    
    const today = new Date();
    const expiryDate = new Date(expiryDateStr);
    
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { label: "Vencido", class: "badge-danger", expired: true, text: `Vencido há ${Math.abs(diffDays)} dia(s)` };
    } else if (diffDays <= 30) {
        return { label: "Próximo Venc.", class: "badge-warning", expired: false, text: `Vence em ${diffDays} dia(s)` };
    } else {
        return { label: "Válido", class: "badge-success", expired: false, text: `Válido (${diffDays} dias)` };
    }
}

function addInventoryLog(text, type = "info") {
    const now = new Date();
    const formattedTime = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    
    const activeUserName = state.currentUser ? state.currentUser.name : "Sistema";
    const logText = `${text} (por ${activeUserName})`;
    
    const newLog = {
        id: "il-" + Date.now(),
        time: formattedTime,
        type: type,
        text: logText
    };
    
    state.inventoryLogs.unshift(newLog);
    if (state.inventoryLogs.length > 50) {
        state.inventoryLogs.pop();
    }
    
    saveState();
    renderInventoryLogs();
    
    if (supabaseClient) {
        supabaseUpsert("leeo_inventory_logs", newLog);
    }
}

function renderInventoryLogs() {
    const logListEl = document.getElementById("inventory-log-list");
    if (!logListEl) return;
    logListEl.innerHTML = "";
    
    if (state.inventoryLogs.length === 0) {
        logListEl.innerHTML = `<li style="text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.8rem;">Nenhuma atividade registrada.</li>`;
        return;
    }
    
    state.inventoryLogs.forEach(log => {
        const li = document.createElement("li");
        li.className = `activity-log-item log-${log.type || 'info'}`;
        
        li.innerHTML = `
            <span>${log.text}</span>
            <span class="activity-log-time">${log.time}</span>
        `;
        logListEl.appendChild(li);
    });
}

function updateGlobalCounters() {
    let expiredCount = 0;
    let unlabeledCount = 0;
    
    state.reagents.forEach(r => {
        if (r.unlabeled) {
            unlabeledCount++;
        }
        const status = getExpirationStatus(r.expiry);
        if (status.expired) {
            expiredCount++;
        }
    });
    
    const expBadge = document.getElementById("stat-expired-count");
    const unlBadge = document.getElementById("stat-unlabeled-count");
    
    if (expBadge && unlBadge) {
        expBadge.innerHTML = `<i data-lucide="alert-triangle"></i><span>${expiredCount} Vencido(s)</span>`;
        unlBadge.innerHTML = `<i data-lucide="help-circle"></i><span>${unlabeledCount} Sem Rótulo</span>`;
        
        expBadge.style.display = expiredCount > 0 ? "flex" : "none";
        unlBadge.style.display = unlabeledCount > 0 ? "flex" : "none";
    }
    
    lucide.createIcons();
}

function setTopbarDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById("current-date");
    if (dateEl) dateEl.textContent = today.toLocaleDateString("pt-BR", options);
}

// ==========================================================================
// 4. Module 1: Reagents Inventory CRUD
// ==========================================================================

const reagentModal = document.getElementById("reagent-modal");
const reagentForm = document.getElementById("reagent-form");
const reagentsTbody = document.getElementById("reagents-tbody");
const searchInput = document.getElementById("reagent-search");
const filterLocation = document.getElementById("reagent-filter-location");
const filterStatus = document.getElementById("reagent-filter-status");

document.getElementById("btn-add-reagent-modal").addEventListener("click", () => {
    if (state.currentUser.role === "user") {
        showToast("Acesso negado: Apenas administradores podem adicionar reagentes.", "danger");
        return;
    }
    document.getElementById("reagent-modal-title").textContent = "Novo Reagente";
    reagentForm.reset();
    document.getElementById("reagent-id").value = "";
    reagentModal.classList.add("show");
});

function closeReagentModal() {
    reagentModal.classList.remove("show");
    reagentForm.reset();
}

document.getElementById("btn-close-reagent-modal").addEventListener("click", closeReagentModal);
document.getElementById("btn-cancel-reagent-modal").addEventListener("click", closeReagentModal);
reagentModal.addEventListener("click", (e) => {
    if (e.target === reagentModal) closeReagentModal();
});

reagentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.currentUser.role === "user") {
        showToast("Acesso negado.", "danger");
        return;
    }
    
    const id = document.getElementById("reagent-id").value;
    const code = document.getElementById("reagent-code").value.trim().toUpperCase();
    const name = document.getElementById("reagent-name").value.trim();
    const cas = document.getElementById("reagent-cas").value.trim();
    const quantity = document.getElementById("reagent-quantity").value.trim();
    const location = document.getElementById("reagent-location").value;
    const expiry = document.getElementById("reagent-expiry").value;
    const unlabeled = document.getElementById("reagent-unlabeled").checked;
    
    let targetReagent = null;
    
    if (id) {
        const index = state.reagents.findIndex(r => r.id === id);
        if (index !== -1) {
            targetReagent = { id, code, name, cas, quantity, location, expiry, unlabeled };
            state.reagents[index] = targetReagent;
            addInventoryLog(`Reagente atualizado: ${name} (${code})`, "info");
            showToast("Reagente atualizado com sucesso!", "success");
        }
    } else {
        targetReagent = {
            id: "r-" + Date.now(),
            code,
            name,
            cas,
            quantity,
            location,
            expiry,
            unlabeled
        };
        state.reagents.push(targetReagent);
        addInventoryLog(`Novo reagente adicionado: ${name} (${code})`, "info");
        showToast("Reagente cadastrado com sucesso!", "success");
    }
    
    saveState();
    closeReagentModal();
    renderReagentsTable();
    
    if (supabaseClient && targetReagent) {
        supabaseUpsert("leeo_reagents", targetReagent);
    }
});

window.editReagent = function(id) {
    if (state.currentUser.role === "user") {
        showToast("Acesso negado: Apenas administradores podem editar reagentes.", "danger");
        return;
    }
    const reagent = state.reagents.find(r => r.id === id);
    if (!reagent) return;
    
    document.getElementById("reagent-modal-title").textContent = "Editar Reagente";
    document.getElementById("reagent-id").value = reagent.id;
    document.getElementById("reagent-code").value = reagent.code;
    document.getElementById("reagent-name").value = reagent.name;
    document.getElementById("reagent-cas").value = reagent.cas;
    document.getElementById("reagent-quantity").value = reagent.quantity;
    document.getElementById("reagent-location").value = reagent.location;
    document.getElementById("reagent-expiry").value = reagent.expiry;
    document.getElementById("reagent-unlabeled").checked = reagent.unlabeled;
    
    reagentModal.classList.add("show");
};

window.deleteReagent = function(id) {
    if (state.currentUser.role === "user") {
        showToast("Acesso negado: Apenas administradores podem apagar reagentes.", "danger");
        return;
    }
    const reagent = state.reagents.find(r => r.id === id);
    if (!reagent) return;
    
    if (confirm(`Tem certeza que deseja apagar o reagente "${reagent.name}" (${reagent.code})?`)) {
        state.reagents = state.reagents.filter(r => r.id !== id);
        addInventoryLog(`Reagente removido do inventário: ${reagent.name} (${reagent.code})`, "danger");
        showToast("Reagente removido do inventário.", "success");
        saveState();
        renderReagentsTable();
        
        if (supabaseClient) {
            supabaseDelete("leeo_reagents", id);
        }
    }
};

document.getElementById("btn-discard-expired").addEventListener("click", () => {
    if (state.currentUser.role === "user") {
        showToast("Acesso negado.", "danger");
        return;
    }
    const expiredItems = state.reagents.filter(r => {
        const status = getExpirationStatus(r.expiry);
        return status.expired;
    });
    
    if (expiredItems.length === 0) {
        showToast("Nenhum material vencido no inventário atual.", "info");
        return;
    }
    
    const expiredCount = expiredItems.length;
    const expiredNames = expiredItems.map(r => `${r.name} (${r.code})`).join(", ");
    
    if (confirm(`Confirmar descarte de ${expiredCount} material(is) vencido(s)?\nItens: ${expiredNames}`)) {
        const expiredIds = expiredItems.map(r => r.id);
        
        state.reagents = state.reagents.filter(r => {
            const status = getExpirationStatus(r.expiry);
            return !status.expired;
        });
        
        addInventoryLog(`Descarte em massa efetuado. ${expiredCount} materiais vencidos descartados: [${expiredNames}]`, "warning");
        showToast(`${expiredCount} material(is) vencido(s) descartado(s) e registrado(s)!`, "success");
        saveState();
        renderReagentsTable();
        
        if (supabaseClient) {
            expiredIds.forEach(id => supabaseDelete("leeo_reagents", id));
        }
    }
});

document.getElementById("btn-clear-inventory-logs").addEventListener("click", () => {
    if (state.currentUser.role === "user") return;
    if (confirm("Tem certeza que deseja limpar o histórico de atividades?")) {
        const initialLog = { id: "il-" + Date.now(), time: "Agora", type: "info", text: "Histórico redefinido pelo administrador." };
        state.inventoryLogs = [initialLog];
        saveState();
        renderInventoryLogs();
        
        if (supabaseClient) {
            supabaseClient.from("leeo_inventory_logs").delete().neq("id", "none").then(() => {
                supabaseUpsert("leeo_inventory_logs", initialLog);
            });
        }
    }
});

function renderReagentsTable() {
    if (!reagentsTbody) return;
    reagentsTbody.innerHTML = "";
    
    const userRole = state.currentUser ? state.currentUser.role : "user";
    const isUserRole = userRole === "user";
    
    const actionsHeader = document.querySelector(".edit-actions-header");
    if (actionsHeader) {
        actionsHeader.style.display = isUserRole ? "none" : "table-cell";
    }
    
    const searchVal = searchInput.value.toLowerCase().trim();
    const locVal = filterLocation.value;
    const statusVal = filterStatus.value;
    
    let filtered = state.reagents.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchVal) || 
                            r.code.toLowerCase().includes(searchVal) || 
                            r.cas.toLowerCase().includes(searchVal);
                            
        const matchLoc = locVal === "todos" || r.location === locVal;
        
        const expiryStatus = getExpirationStatus(r.expiry);
        let matchStatus = true;
        if (statusVal === "expired") {
            matchStatus = expiryStatus.expired;
        } else if (statusVal === "unlabeled") {
            matchStatus = r.unlabeled;
        } else if (statusVal === "regular") {
            matchStatus = !expiryStatus.expired && !r.unlabeled;
        }
        
        return matchSearch && matchLoc && matchStatus;
    });
    
    document.getElementById("reagents-counter").textContent = `Exibindo ${filtered.length} de ${state.reagents.length} reagente(s)`;
    
    if (filtered.length === 0) {
        reagentsTbody.innerHTML = `
            <tr>
                <td colspan="${isUserRole ? 7 : 8}" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    Nenhum reagente encontrado com os filtros selecionados.
                </td>
            </tr>
        `;
        return;
    }
    
    filtered.forEach(reagent => {
        const tr = document.createElement("tr");
        const expStatus = getExpirationStatus(reagent.expiry);
        
        let alertBadgesHTML = "";
        if (expStatus.expired) {
            tr.className = "row-expired";
            alertBadgesHTML += `<span class="badge badge-danger" title="${expStatus.text}"><i data-lucide="alert-triangle"></i> Vencido</span> `;
        } else if (expStatus.label === "Próximo Venc.") {
            alertBadgesHTML += `<span class="badge badge-warning" title="${expStatus.text}"><i data-lucide="clock"></i> Próx. Venc.</span> `;
        }
        
        if (reagent.unlabeled) {
            tr.className = expStatus.expired ? "row-expired" : "row-unlabeled";
            alertBadgesHTML += `<span class="badge badge-warning" title="Sem rótulo visível ou danificado"><i data-lucide="help-circle"></i> Sem Rótulo</span>`;
        }
        
        if (alertBadgesHTML === "") {
            alertBadgesHTML = `<span class="badge badge-success"><i data-lucide="check"></i> Regular</span>`;
        }
        
        let formattedExpiry = "N/D";
        if (reagent.expiry) {
            const [year, month, day] = reagent.expiry.split("-");
            formattedExpiry = `${day}/${month}/${year}`;
        }
        
        let actionsTD = "";
        if (!isUserRole) {
            actionsTD = `
                <td class="actions-col">
                    <div class="table-actions">
                        <button class="btn-action edit" onclick="editReagent('${reagent.id}')" title="Editar Reagente">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="btn-action delete" onclick="deleteReagent('${reagent.id}')" title="Apagar Reagente">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
        }
        
        tr.innerHTML = `
            <td class="font-bold" style="color: var(--primary);">${reagent.code}</td>
            <td class="font-bold">${reagent.name}</td>
            <td><code>${reagent.cas}</code></td>
            <td>${reagent.quantity}</td>
            <td><span class="badge badge-neutral"><i data-lucide="map-pin"></i> ${reagent.location}</span></td>
            <td>${formattedExpiry}</td>
            <td>${alertBadgesHTML}</td>
            ${actionsTD}
        `;
        reagentsTbody.appendChild(tr);
    });
    
    lucide.createIcons();
}

// ==========================================================================
// 5. Module 2: Weekly Organization (Checklist & Responsible Selector)
// ==========================================================================

function setupResponsibleSelector() {
    const weeklyResponsibleSelect = document.getElementById("select-weekly-responsible");
    if (!weeklyResponsibleSelect) return;
    
    weeklyResponsibleSelect.innerHTML = "";
    
    const members = state.users.map(u => u.name);
    
    members.forEach(member => {
        const option = document.createElement("option");
        option.value = member;
        option.textContent = member;
        weeklyResponsibleSelect.appendChild(option);
    });
    
    if (!members.includes(state.weeklyResponsible)) {
        state.weeklyResponsible = state.currentUser ? state.currentUser.name : members[0];
    }
    
    weeklyResponsibleSelect.value = state.weeklyResponsible;
    
    weeklyResponsibleSelect.onchange = () => {
        const previous = state.weeklyResponsible;
        state.weeklyResponsible = weeklyResponsibleSelect.value;
        saveState();
        
        addInventoryLog(`Responsável da semana alterado: de [${previous}] para [${state.weeklyResponsible}]`, "info");
        showToast(`Responsável alterado para ${state.weeklyResponsible}!`, "success");
        
        if (supabaseClient) {
            supabaseUpsert("leeo_settings", { key: "weekly_responsible", value: state.weeklyResponsible });
        }
    };
}

function renderChecklist() {
    const checkboxes = document.querySelectorAll(".task-checkbox");
    
    checkboxes.forEach(cb => {
        const id = cb.getAttribute("data-id");
        cb.checked = state.checklist[id] || false;
        
        cb.onchange = () => {
            state.checklist[id] = cb.checked;
            saveState();
            updateChecklistProgress();
            
            if (cb.checked) {
                showToast("Tarefa marcada como concluída!", "success");
            }
            
            if (supabaseClient) {
                supabaseUpsert("leeo_checklist", { id: id, checked: cb.checked });
            }
        };
    });
    
    updateChecklistProgress();
}

function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll(".task-checkbox");
    const total = checkboxes.length;
    let checked = 0;
    
    checkboxes.forEach(cb => {
        if (cb.checked) checked++;
    });
    
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
    const progressFill = document.getElementById("checklist-progress-fill");
    const progressText = document.getElementById("checklist-progress-text");
    if (progressFill && progressText) {
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }
}

document.getElementById("btn-reset-checklist").addEventListener("click", () => {
    if (state.currentUser.role === "user") return;
    if (confirm("Deseja redefinir todo o checklist semanal para vazio?")) {
        Object.keys(state.checklist).forEach(key => {
            state.checklist[key] = false;
        });
        saveState();
        renderChecklist();
        showToast("Checklist semanal redefinido.", "info");
        
        if (supabaseClient) {
            Object.keys(state.checklist).forEach(key => {
                supabaseUpsert("leeo_checklist", { id: key, checked: false });
            });
        }
    }
});

// ==========================================================================
// 5.5 Module 2.5: Mutirão de Organização Geral
// ==========================================================================

const mutiraoGridContainer = document.getElementById("mutirao-grid-container");

function renderMutiraoGrid() {
    if (!mutiraoGridContainer) return;
    mutiraoGridContainer.innerHTML = "";
    
    const userRole = state.currentUser ? state.currentUser.role : "user";
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    const disabledAttr = isAdmin ? "" : "disabled";
    
    const membersList = state.users.map(u => u.name);
    
    state.mutirao.forEach((dayData, dayIdx) => {
        const divCard = document.createElement("div");
        
        const totalTasks = dayData.tasks.length;
        let checkedTasks = 0;
        dayData.tasks.forEach(t => { if (t.checked) checkedTasks++; });
        const dayProgressPercent = totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0;
        
        const isCompleted = dayProgressPercent === 100;
        divCard.className = `card mutirao-card ${isCompleted ? 'day-completed' : ''}`;
        
        let selectOptionsHTML = membersList.map(name => {
            const isSel = dayData.responsible === name ? "selected" : "";
            return `<option value="${name}" ${isSel}>${name}</option>`;
        }).join("");
        
        let tasksListHTML = dayData.tasks.map(task => {
            const isCh = task.checked ? "checked" : "";
            return `
                <label class="checklist-item">
                    <input type="checkbox" data-day-idx="${dayIdx}" data-task-id="${task.id}" ${isCh} ${disabledAttr} class="mutirao-task-checkbox">
                    <span class="custom-checkbox"></span>
                    <span class="task-text">${task.text}</span>
                </label>
            `;
        }).join("");
        
        divCard.innerHTML = `
            <div class="mutirao-card-header">
                <h3 class="mutirao-day-title">${dayData.day}</h3>
                ${isCompleted ? '<span class="badge badge-success"><i data-lucide="check-circle"></i> Concluído</span>' : `<span class="badge badge-neutral">${dayProgressPercent}%</span>`}
            </div>
            
            <div class="mutirao-assign-row">
                <div class="mutirao-input-group">
                    <label>Responsável</label>
                    <select ${disabledAttr} onchange="updateMutiraoResponsible(${dayIdx}, this.value)">
                        <option value="">Selecione...</option>
                        ${selectOptionsHTML}
                    </select>
                </div>
                <div class="mutirao-input-group">
                    <label>Equipe</label>
                    <input type="text" ${disabledAttr} placeholder="Integrantes..." value="${dayData.team || ''}" onchange="updateMutiraoTeam(${dayIdx}, this.value)">
                </div>
            </div>
            
            <div class="mutirao-tasks">
                ${tasksListHTML}
            </div>
            
            <div class="mutirao-progress-container">
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${dayProgressPercent}%; background: ${isCompleted ? 'var(--success)' : 'var(--primary)'};"></div>
                </div>
            </div>
        `;
        
        mutiraoGridContainer.appendChild(divCard);
    });
    
    document.querySelectorAll(".mutirao-task-checkbox").forEach(cb => {
        cb.addEventListener("change", () => {
            if (!isAdmin) {
                cb.checked = !cb.checked; // Revert checkbox change
                showToast("Acesso negado: Apenas administradores podem atualizar o mutirão.", "danger");
                return;
            }
            
            const dayIndex = parseInt(cb.getAttribute("data-day-idx"));
            const taskId = cb.getAttribute("data-task-id");
            
            const dayObj = state.mutirao[dayIndex];
            const taskObj = dayObj.tasks.find(t => t.id === taskId);
            if (taskObj) {
                taskObj.checked = cb.checked;
                saveState();
                renderMutiraoGrid();
                
                if (cb.checked) {
                    showToast(`Tarefa do mutirão de ${dayObj.day} concluída!`, "success");
                }
                
                if (supabaseClient) {
                    supabaseUpsert("leeo_mutirao", {
                        day: dayObj.day,
                        responsible: dayObj.responsible,
                        team: dayObj.team,
                        tasks_json: JSON.stringify(dayObj.tasks)
                    });
                }
            }
        });
    });
    
    lucide.createIcons();
}

window.updateMutiraoResponsible = function(dayIndex, value) {
    const userRole = state.currentUser ? state.currentUser.role : "user";
    if (userRole !== "admin" && userRole !== "superadmin") {
        showToast("Acesso negado: Apenas administradores podem gerenciar o mutirão.", "danger");
        return;
    }
    
    const dayObj = state.mutirao[dayIndex];
    dayObj.responsible = value;
    saveState();
    
    addInventoryLog(`Definido responsável do mutirão de ${dayObj.day}: [${value}]`, "info");
    showToast(`Responsável de ${dayObj.day} alterado para ${value}`, "success");
    
    if (supabaseClient) {
        supabaseUpsert("leeo_mutirao", {
            day: dayObj.day,
            responsible: dayObj.responsible,
            team: dayObj.team,
            tasks_json: JSON.stringify(dayObj.tasks)
        });
    }
};

window.updateMutiraoTeam = function(dayIndex, value) {
    const userRole = state.currentUser ? state.currentUser.role : "user";
    if (userRole !== "admin" && userRole !== "superadmin") {
        showToast("Acesso negado: Apenas administradores podem gerenciar o mutirão.", "danger");
        return;
    }
    
    const dayObj = state.mutirao[dayIndex];
    dayObj.team = value;
    saveState();
    
    if (supabaseClient) {
        supabaseUpsert("leeo_mutirao", {
            day: dayObj.day,
            responsible: dayObj.responsible,
            team: dayObj.team,
            tasks_json: JSON.stringify(dayObj.tasks)
        });
    }
};

// ==========================================================================
// 5.8 Module 2.8: Lab Scheduling with 48h restriction & Overlap Checking
// ==========================================================================

const reservationForm = document.getElementById("reservation-form");
const reservationsTbody = document.getElementById("reservations-tbody");

// Set minimum date attributes dynamically (Current Time + 48 hours)
function updateReservationInputMin() {
    const startInput = document.getElementById("reservation-start");
    const endInput = document.getElementById("reservation-end");
    if (!startInput || !endInput) return;
    
    const now = new Date();
    // Add 48 hours
    now.setHours(now.getHours() + 48);
    
    // Format YYYY-MM-DDTHH:MM
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const minStr = `${year}-${month}-${day}T${hours}:${minutes}`;
    startInput.min = minStr;
    endInput.min = minStr;
}

// Save reservation form
if (reservationForm) {
    reservationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const lab = document.getElementById("reservation-lab").value;
        const startStr = document.getElementById("reservation-start").value;
        const endStr = document.getElementById("reservation-end").value;
        const notes = document.getElementById("reservation-notes").value.trim();
        
        const now = new Date();
        const startVal = new Date(startStr);
        const endVal = new Date(endStr);
        
        // 1. Enforce 48h Advance limit
        const diffMs = startVal.getTime() - now.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        
        if (diffHrs < 47.9) { // Giving small margin for timezone/minute delays
            showToast("Erro: As reservas devem ser feitas com no mínimo 48 horas de antecedência.", "danger");
            return;
        }
        
        // 2. Validate bounds
        if (endVal <= startVal) {
            showToast("Erro: O horário de término deve ser após o horário de início.", "danger");
            return;
        }
        
        // 3. Conflict overlap checking
        const conflict = state.reservations.find(res => {
            if (res.lab !== lab) return false;
            const exStart = new Date(res.start);
            const exEnd = new Date(res.end);
            return (startVal < exEnd) && (endVal > exStart);
        });
        
        if (conflict) {
            showToast(`Erro: O ${lab} já está reservado por ${conflict.user} neste período.`, "danger");
            return;
        }
        
        // 4. Create reservation
        const user = state.currentUser ? state.currentUser.name : "Sistema";
        const newReservation = {
            id: "res-" + Date.now(),
            lab,
            user,
            start: startStr,
            end: endStr,
            notes
        };
        
        state.reservations.push(newReservation);
        saveState();
        renderReservations();
        
        reservationForm.reset();
        updateReservationInputMin();
        
        addInventoryLog(`Reserva criada: ${lab} para ${startStr.replace('T', ' ')}`, "info");
        showToast("Laboratório agendado com sucesso!", "success");
        
        if (supabaseClient) {
            supabaseUpsert("leeo_reservations", newReservation);
        }
    });
}

// Delete Reservation
window.deleteReservation = function(id) {
    const res = state.reservations.find(r => r.id === id);
    if (!res) return;
    
    // Auth gate check: Only own user or admin/superadmin can cancel
    const canCancel = (state.currentUser.name === res.user) || 
                      (state.currentUser.role === "admin") || 
                      (state.currentUser.role === "superadmin");
                      
    if (!canCancel) {
        showToast("Erro: Você só pode cancelar os seus próprios agendamentos.", "danger");
        return;
    }
    
    if (confirm(`Tem certeza que deseja cancelar o agendamento de "${res.lab}" feito por ${res.user}?`)) {
        state.reservations = state.reservations.filter(r => r.id !== id);
        addInventoryLog(`Agendamento cancelado: ${res.lab}`, "danger");
        showToast("Reserva cancelada com sucesso.", "success");
        saveState();
        renderReservations();
        
        if (supabaseClient) {
            supabaseDelete("leeo_reservations", id);
        }
    }
};

// Clear All Reservations
const clearResBtn = document.getElementById("btn-clear-reservations");
if (clearResBtn) {
    clearResBtn.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja apagar TODOS os agendamentos registrados?")) {
            state.reservations = [];
            saveState();
            renderReservations();
            showToast("Todos os agendamentos foram excluídos.", "info");
            
            if (supabaseClient) {
                supabaseClient.from("leeo_reservations").delete().neq("id", "none");
            }
        }
    });
}

// Render reservations list table
function renderReservations() {
    if (!reservationsTbody) return;
    reservationsTbody.innerHTML = "";
    
    if (state.reservations.length === 0) {
        reservationsTbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    Nenhum agendamento ativo.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort chronological (earliest first)
    const sorted = [...state.reservations].sort((a, b) => new Date(a.start) - new Date(b.start));
    
    sorted.forEach(res => {
        const tr = document.createElement("tr");
        
        const dateStart = new Date(res.start);
        const dateEnd = new Date(res.end);
        
        const formattedStart = dateStart.toLocaleDateString("pt-BR") + " " + dateStart.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        const formattedEnd = dateEnd.toLocaleDateString("pt-BR") + " " + dateEnd.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        
        // Show delete button only if own user or admin/superadmin
        const canCancel = (state.currentUser.name === res.user) || 
                          (state.currentUser.role === "admin") || 
                          (state.currentUser.role === "superadmin");
                          
        let deleteActionHTML = "-";
        if (canCancel) {
            deleteActionHTML = `
                <button class="btn-action delete" onclick="deleteReservation('${res.id}')" title="Cancelar Agendamento">
                    <i data-lucide="calendar-x"></i>
                </button>
            `;
        }
        
        tr.innerHTML = `
            <td class="font-bold">${res.lab}</td>
            <td><span class="badge badge-neutral"><i data-lucide="user"></i> ${res.user}</span></td>
            <td><code>${formattedStart}</code></td>
            <td><code>${formattedEnd}</code></td>
            <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${res.notes || ''}">
                ${res.notes || '-'}
            </td>
            <td class="actions-col">
                <div class="table-actions">
                    ${deleteActionHTML}
                </div>
            </td>
        `;
        
        reservationsTbody.appendChild(tr);
    });
    
    lucide.createIcons();
}

// ==========================================================================
// 6. Module 3: Equipments & Training
// ==========================================================================

const trainingModal = document.getElementById("training-modal");
const trainingTitle = document.getElementById("training-modal-title");
const trainingBody = document.getElementById("training-modal-body");
const equipmentGridContainer = document.getElementById("equipment-grid-container");

let currentEquipFilter = "todos";

function renderEquipmentsGrid() {
    if (!equipmentGridContainer) return;
    equipmentGridContainer.innerHTML = "";
    
    const userRole = state.currentUser ? state.currentUser.role : "user";
    const isUserRole = userRole === "user";
    
    let filtered = state.equipments.filter(e => {
        if (currentEquipFilter === "todos") return true;
        return e.status === currentEquipFilter;
    });
    
    if (filtered.length === 0) {
        equipmentGridContainer.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
                Nenhum equipamento correspondente encontrado.
            </div>
        `;
        return;
    }
    
    filtered.forEach(equip => {
        const div = document.createElement("div");
        const isMaintenance = equip.status === "Em Manutenção";
        div.className = `card equipment-card ${isMaintenance ? 'maintenance-mode' : ''}`;
        
        let statusBadge = `<span class="badge badge-success"><i data-lucide="check-circle-2"></i> Operacional</span>`;
        if (isMaintenance) {
            statusBadge = `<span class="badge badge-danger"><i data-lucide="alert-triangle"></i> Em Manutenção</span>`;
        }
        
        let toggleSwitchHTML = "";
        if (!isUserRole) {
            toggleSwitchHTML = `
                <div class="equip-status-btn-area">
                    <span class="status-toggle-label">Alterar Estado</span>
                    <label class="switch">
                        <input type="checkbox" ${!isMaintenance ? 'checked' : ''} onchange="toggleEquipStatus('${equip.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            `;
        }
        
        let adminCardActionsHTML = "";
        if (userRole === "superadmin") {
            adminCardActionsHTML = `
                <div class="equip-admin-actions" style="display: flex; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                    <button class="btn btn-outline btn-icon" onclick="editEquipment('${equip.id}')" style="flex: 1; font-size: 0.75rem; padding: 0.4rem 0.6rem; min-height: unset; height: unset;">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                        <span>Editar</span>
                    </button>
                    <button class="btn btn-outline btn-icon" onclick="deleteEquipment('${equip.id}')" style="flex: 1; font-size: 0.75rem; padding: 0.4rem 0.6rem; min-height: unset; height: unset; color: var(--danger); border-color: hsla(346, 84%, 55%, 0.3);">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger);"></i>
                        <span>Apagar</span>
                    </button>
                </div>
            `;
        }
        
        div.innerHTML = `
            <div class="equip-card-top">
                <div class="equip-icon-box">
                    <i data-lucide="${equip.icon || 'cpu'}"></i>
                </div>
                ${statusBadge}
            </div>
            
            <h3 class="equip-title">${equip.name}</h3>
            
            <div class="equip-details-area">
                <div class="equip-detail-row">
                    <i data-lucide="user"></i>
                    <span>Técnico: <strong>${equip.responsible || 'Sem responsável'}</strong></span>
                </div>
                <div class="equip-detail-row">
                    <i data-lucide="shield-alert"></i>
                    <span>Status: <strong>${equip.status}</strong></span>
                </div>
            </div>
            
            <button class="btn btn-outline btn-block btn-icon" onclick="openTrainingModal('${equip.id}')">
                <i data-lucide="book-open"></i>
                <span>Procedimentos e Treino</span>
            </button>
            
            ${toggleSwitchHTML}
            ${adminCardActionsHTML}
        `;
        
        equipmentGridContainer.appendChild(div);
    });
    
    lucide.createIcons();
}

window.toggleEquipStatus = function(id, isChecked) {
    if (state.currentUser.role === "user") {
        showToast("Acesso negado.", "danger");
        return;
    }
    const equip = state.equipments.find(e => e.id === id);
    if (!equip) return;
    
    const newStatus = isChecked ? "Operacional" : "Em Manutenção";
    equip.status = newStatus;
    
    if (newStatus === "Em Manutenção") {
        addInventoryLog(`Equipamento colocado EM MANUTENÇÃO: ${equip.name} (Téc: ${equip.responsible})`, "danger");
        showToast(`Equipamento ${equip.name} alterado para Em Manutenção!`, "warning");
    } else {
        addInventoryLog(`Equipamento reativado OPERACIONAL: ${equip.name}`, "info");
        showToast(`Equipamento ${equip.name} agora está Operacional!`, "success");
    }
    
    saveState();
    renderEquipmentsGrid();
    
    if (supabaseClient) {
        supabaseUpsert("leeo_equipments", { 
            id: equip.id, 
            name: equip.name, 
            responsible: equip.responsible, 
            status: equip.status,
            icon: equip.icon,
            video: equip.procedures ? equip.procedures.video : "",
            video_title: equip.procedures ? equip.procedures.videoTitle : "",
            procedures_json: equip.procedures ? JSON.stringify(equip.procedures.steps) : "[]"
        });
    }
};

window.openTrainingModal = function(id) {
    const equip = state.equipments.find(e => e.id === id);
    if (!equip) return;
    
    trainingTitle.textContent = `${equip.name} - Treinamento & Procedimentos`;
    
    let stepsHTML = "";
    if (equip.procedures && equip.procedures.steps) {
        stepsHTML = equip.procedures.steps.map(step => `<li>${step}</li>`).join("");
    }
    
    let videoLinkHTML = "";
    if (equip.procedures && equip.procedures.video) {
        videoLinkHTML = `
            <h4><i data-lucide="video"></i> Link de Vídeo de Treino</h4>
            <a href="${equip.procedures.video}" target="_blank" class="video-link-card">
                <i data-lucide="play-circle"></i>
                <div>
                    <div>Assistir: ${equip.procedures.videoTitle || 'Vídeo de Treinamento'}</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Link demonstrativo das melhores práticas de operação científica</span>
                </div>
            </a>
        `;
    }
    
    trainingBody.innerHTML = `
        <div class="training-content">
            <h4><i data-lucide="check-square"></i> Requisitos de Treino Obrigatório</h4>
            <p>Para operar o(a) <strong>${equip.name}</strong> de forma autónoma no laboratório LEEO, o usuário deve compreender os seguintes procedimentos operacionais:</p>
            
            <ul>
                ${stepsHTML || '<li>Nenhuma instrução cadastrada.</li>'}
            </ul>
            
            <div class="alert-banner warning-banner" style="margin-top: 1.5rem; margin-bottom: 1.5rem;">
                <div class="banner-icon"><i data-lucide="alert-circle"></i></div>
                <div class="banner-content">
                    <h4 class="banner-title" style="margin-top: 0;">Nota de Segurança</h4>
                    <p style="font-size: 0.8rem;">Em caso de dúvidas ou irregularidades de funcionamento, desligue o equipamento e chame imediatamente o Responsável Técnico: <strong>${equip.responsible || 'Sem responsável'}</strong>.</p>
                </div>
            </div>
            
            ${videoLinkHTML}
        </div>
    `;
    
    trainingModal.classList.add("show");
    lucide.createIcons();
};

// Training Modal Close Actions
const btnCloseTrainingModal = document.getElementById("btn-close-training-modal");
const btnCloseTrainingModalFoot = document.getElementById("btn-close-training-modal-foot");

function closeTrainingModal() {
    if (trainingModal) {
        trainingModal.classList.remove("show");
    }
}

if (btnCloseTrainingModal) btnCloseTrainingModal.addEventListener("click", closeTrainingModal);
if (btnCloseTrainingModalFoot) btnCloseTrainingModalFoot.addEventListener("click", closeTrainingModal);
if (trainingModal) {
    trainingModal.addEventListener("click", (e) => {
        if (e.target === trainingModal) closeTrainingModal();
    });
}

// Equipment CRUD Modals & Save Actions (Superadmin only)
const equipmentModal = document.getElementById("equipment-modal");
const equipmentForm = document.getElementById("equipment-form");
const btnAddEquipModal = document.getElementById("btn-add-equipment-modal");
const btnCloseEquipModal = document.getElementById("btn-close-equipment-modal");
const btnCancelEquipModal = document.getElementById("btn-cancel-equipment-modal");

function populateResponsibleSelect(selectElement, selectedValue) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Selecione um responsável...</option>';
    
    state.users.forEach(user => {
        const option = document.createElement("option");
        option.value = user.name;
        option.textContent = user.name + " (" + (user.role === 'superadmin' ? 'Superadmin' : user.role === 'admin' ? 'Admin' : 'Usuário') + ")";
        selectElement.appendChild(option);
    });
    
    if (selectedValue) {
        selectElement.value = selectedValue;
    }
}

if (btnAddEquipModal) {
    btnAddEquipModal.addEventListener("click", () => {
        if (state.currentUser.role !== "superadmin") {
            showToast("Acesso negado: Apenas superadmins podem cadastrar equipamentos.", "danger");
            return;
        }
        document.getElementById("equipment-modal-title").textContent = "Novo Equipamento";
        equipmentForm.reset();
        document.getElementById("equipment-id").value = "";
        
        populateResponsibleSelect(document.getElementById("equipment-responsible"));
        
        equipmentModal.classList.add("show");
    });
}

function closeEquipmentModal() {
    if (equipmentModal) {
        equipmentModal.classList.remove("show");
    }
}

if (btnCloseEquipModal) btnCloseEquipModal.addEventListener("click", closeEquipmentModal);
if (btnCancelEquipModal) btnCancelEquipModal.addEventListener("click", closeEquipmentModal);

window.editEquipment = function(id) {
    if (state.currentUser.role !== "superadmin") {
        showToast("Acesso negado: Apenas superadmins podem editar equipamentos.", "danger");
        return;
    }
    const equip = state.equipments.find(e => e.id === id);
    if (!equip) return;
    
    document.getElementById("equipment-modal-title").textContent = "Editar Equipamento";
    document.getElementById("equipment-id").value = equip.id;
    document.getElementById("equipment-name").value = equip.name;
    document.getElementById("equipment-icon").value = equip.icon || "cpu";
    document.getElementById("equipment-status").value = equip.status || "Operacional";
    
    document.getElementById("equipment-video").value = (equip.procedures && equip.procedures.video) ? equip.procedures.video : "";
    document.getElementById("equipment-video-title").value = (equip.procedures && equip.procedures.videoTitle) ? equip.procedures.videoTitle : "";
    
    const stepsTextarea = document.getElementById("equipment-steps");
    if (stepsTextarea) {
        const steps = (equip.procedures && equip.procedures.steps) ? equip.procedures.steps : [];
        stepsTextarea.value = steps.join("\n");
    }
    
    populateResponsibleSelect(document.getElementById("equipment-responsible"), equip.responsible);
    
    equipmentModal.classList.add("show");
};

window.deleteEquipment = function(id) {
    if (state.currentUser.role !== "superadmin") {
        showToast("Acesso negado: Apenas superadmins podem apagar equipamentos.", "danger");
        return;
    }
    const equip = state.equipments.find(e => e.id === id);
    if (!equip) return;
    
    if (confirm(`Tem certeza que deseja remover o equipamento "${equip.name}"?`)) {
        state.equipments = state.equipments.filter(e => e.id !== id);
        saveState();
        renderEquipmentsGrid();
        showToast(`Equipamento "${equip.name}" removido com sucesso.`, "success");
        
        addInventoryLog(`Equipamento excluído do sistema: ${equip.name}`, "danger");
        
        if (supabaseClient) {
            supabaseDelete("leeo_equipments", id);
        }
    }
};

if (equipmentForm) {
    equipmentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        if (state.currentUser.role !== "superadmin") {
            showToast("Acesso negado.", "danger");
            return;
        }
        
        const id = document.getElementById("equipment-id").value;
        const name = document.getElementById("equipment-name").value.trim();
        const icon = document.getElementById("equipment-icon").value;
        const responsible = document.getElementById("equipment-responsible").value;
        const status = document.getElementById("equipment-status").value;
        const video = document.getElementById("equipment-video").value.trim();
        const videoTitle = document.getElementById("equipment-video-title").value.trim();
        const stepsRaw = document.getElementById("equipment-steps").value;
        
        const steps = stepsRaw.split("\n")
                              .map(s => s.trim())
                              .filter(Boolean);
                              
        if (steps.length === 0) {
            showToast("Erro: Insira ao menos uma instrução de treinamento.", "danger");
            return;
        }
        
        let equip;
        let isEdit = false;
        if (id) {
            equip = state.equipments.find(e => e.id === id);
            isEdit = true;
        }
        
        if (!equip) {
            equip = {
                id: "eq-" + Date.now(),
                status: status || "Operacional"
            };
            state.equipments.push(equip);
        }
        
        equip.name = name;
        equip.icon = icon;
        equip.responsible = responsible;
        equip.status = status;
        equip.procedures = {
            video: video,
            videoTitle: videoTitle || "Vídeo de Treinamento",
            steps: steps
        };
        
        saveState();
        renderEquipmentsGrid();
        closeEquipmentModal();
        
        if (isEdit) {
            showToast(`Equipamento "${name}" atualizado com sucesso!`, "success");
            addInventoryLog(`Equipamento editado: ${name} (Responsável: ${responsible})`, "info");
        } else {
            showToast(`Equipamento "${name}" cadastrado com sucesso!`, "success");
            addInventoryLog(`Novo equipamento cadastrado: ${name} (Responsável: ${responsible})`, "info");
        }
        
        if (supabaseClient) {
            supabaseUpsert("leeo_equipments", {
                id: equip.id,
                name: equip.name,
                responsible: equip.responsible,
                status: equip.status,
                icon: equip.icon,
                video: equip.procedures.video,
                video_title: equip.procedures.videoTitle,
                procedures_json: JSON.stringify(equip.procedures.steps)
            });
        }
    });
}

// ==========================================================================
// 7. Module 4: Water Logs & Stock Tracking
// ==========================================================================

const waterLogForm = document.getElementById("water-log-form");
const waterHistoryTbody = document.getElementById("water-history-tbody");

function resetWaterFormDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const dateEl = document.getElementById("water-date");
    if (dateEl) dateEl.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

function calculateWaterStocks() {
    let deionizada = parseFloat(state.startingDeionizada) || 0;
    let destilada = parseFloat(state.startingDestilada) || 0;
    
    state.waterLogs.forEach(log => {
        const amount = parseFloat(log.amount);
        if (log.type === "Deionizada") {
            if (log.action === "Produzido") deionizada += amount;
            else deionizada -= amount;
        } else if (log.type === "Destilada") {
            if (log.action === "Produzido") destilada += amount;
            else destilada -= amount;
        }
    });
    
    const displayDeio = Math.max(0, deionizada).toFixed(1);
    const displayDest = Math.max(0, destilada).toFixed(1);
    
    const deEl = document.getElementById("stock-deionizada");
    const dsEl = document.getElementById("stock-destilada");
    
    if (deEl) deEl.textContent = `${displayDeio} Litros`;
    if (dsEl) dsEl.textContent = `${displayDest} Litros`;
}

function setupWaterStartInputs() {
    const startDeioCtrl = document.getElementById("start-control-deionizada");
    const startDestCtrl = document.getElementById("start-control-destilada");
    const inputDeio = document.getElementById("input-start-deionizada");
    const inputDest = document.getElementById("input-start-destilada");
    
    if (!inputDeio || !inputDest || !startDeioCtrl || !startDestCtrl) return;
    
    const userRole = state.currentUser ? state.currentUser.role : "user";
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    
    if (isAdmin) {
        startDeioCtrl.style.display = "flex";
        startDestCtrl.style.display = "flex";
        
        inputDeio.value = state.startingDeionizada;
        inputDest.value = state.startingDestilada;
        
        inputDeio.onchange = () => {
            const val = parseFloat(inputDeio.value);
            if (!isNaN(val) && val >= 0) {
                state.startingDeionizada = val;
                saveState();
                calculateWaterStocks();
                if (supabaseClient) {
                    supabaseUpsert("leeo_settings", { key: "start_deionizada", value: String(val) });
                }
                showToast("Estoque inicial de água deionizada atualizado!", "success");
            }
        };
        
        inputDest.onchange = () => {
            const val = parseFloat(inputDest.value);
            if (!isNaN(val) && val >= 0) {
                state.startingDestilada = val;
                saveState();
                calculateWaterStocks();
                if (supabaseClient) {
                    supabaseUpsert("leeo_settings", { key: "start_destilada", value: String(val) });
                }
                showToast("Estoque inicial de água destilada atualizado!", "success");
            }
        };
    } else {
        startDeioCtrl.style.display = "none";
        startDestCtrl.style.display = "none";
    }
}

function renderWaterLogs() {
    setupWaterStartInputs();
    calculateWaterStocks();
    if (!waterHistoryTbody) return;
    waterHistoryTbody.innerHTML = "";
    
    if (state.waterLogs.length === 0) {
        waterHistoryTbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    Nenhum registro de consumo ou produção anotado.
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedLogs = [...state.waterLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedLogs.forEach(log => {
        const tr = document.createElement("tr");
        
        let opBadge = "";
        if (log.action === "Produzido") {
            opBadge = `<span class="badge badge-success"><i data-lucide="plus"></i> Produzido</span>`;
        } else {
            opBadge = `<span class="badge badge-danger"><i data-lucide="minus"></i> Consumido</span>`;
        }
        
        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString("pt-BR") + " " + dateObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        
        tr.innerHTML = `
            <td><strong>${formattedDate}</strong></td>
            <td>${log.user}</td>
            <td><span class="badge badge-neutral">${log.type}</span></td>
            <td>${opBadge}</td>
            <td class="font-bold">${log.amount.toFixed(1)} L</td>
            <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.notes || ''}">
                ${log.notes || '-'}
            </td>
        `;
        
        waterHistoryTbody.appendChild(tr);
    });
    
    lucide.createIcons();
}

if (waterLogForm) {
    waterLogForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const type = document.getElementById("water-type").value;
        const action = document.getElementById("water-action").value;
        const amount = parseFloat(document.getElementById("water-amount").value);
        const user = document.getElementById("water-user").value.trim();
        const date = document.getElementById("water-date").value;
        const notes = document.getElementById("water-notes").value.trim();
        
        if (isNaN(amount) || amount <= 0) {
            showToast("Quantidade de água deve ser um valor positivo.", "danger");
            return;
        }
        
        const newLog = {
            id: "w-" + Date.now(),
            type,
            action,
            amount,
            user,
            date,
            notes
        };
        
        state.waterLogs.push(newLog);
        saveState();
        renderWaterLogs();
        
        waterLogForm.reset();
        resetWaterFormDate();
        
        showToast(`Volume de água ${action.toLowerCase()} registrado com sucesso!`, "success");
        
        if (supabaseClient) {
            supabaseUpsert("leeo_water_logs", newLog);
        }
    });
}

const clearWaterBtn = document.getElementById("btn-clear-water-logs");
if (clearWaterBtn) {
    clearWaterBtn.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja limpar todo o histórico de registros de água?")) {
            state.waterLogs = [];
            saveState();
            renderWaterLogs();
            showToast("Histórico de registros de água apagado.", "info");
            
            if (supabaseClient) {
                supabaseClient.from("leeo_water_logs").delete().neq("id", "none");
            }
        }
    });
}

// ==========================================================================
// 8. Module 5: Users Access Management
// ==========================================================================

const userModal = document.getElementById("user-modal");
const userForm = document.getElementById("user-form");
const usersTbody = document.getElementById("users-tbody");

document.getElementById("btn-add-user-modal").addEventListener("click", () => {
    const userRole = state.currentUser ? state.currentUser.role : "user";
    if (userRole !== "admin" && userRole !== "superadmin") {
        showToast("Acesso restrito.", "danger");
        return;
    }
    document.getElementById("user-modal-title").textContent = "Cadastrar Novo Usuário";
    userForm.reset();
    document.getElementById("user-id").value = "";
    userModal.classList.add("show");
});

function closeUserModal() {
    userModal.classList.remove("show");
    userForm.reset();
}

const closeUserModalBtn = document.getElementById("btn-close-user-modal");
const cancelUserModalBtn = document.getElementById("btn-cancel-user-modal");

if (closeUserModalBtn) closeUserModalBtn.addEventListener("click", closeUserModal);
if (cancelUserModalBtn) cancelUserModalBtn.addEventListener("click", closeUserModal);
if (userModal) {
    userModal.addEventListener("click", (e) => {
        if (e.target === userModal) closeUserModal();
    });
}

if (userForm) {
    userForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const loggedUserRole = state.currentUser ? state.currentUser.role : "user";
        if (loggedUserRole !== "admin" && loggedUserRole !== "superadmin") {
            showToast("Acesso restrito.", "danger");
            return;
        }
        
        const id = document.getElementById("user-id").value;
        const name = document.getElementById("user-fullname").value.trim();
        const username = document.getElementById("user-username").value.trim().toLowerCase();
        const password = document.getElementById("user-password").value;
        const role = document.getElementById("user-role").value;
        
        let targetUser = null;
        
        if (id) {
            const index = state.users.findIndex(u => u.id === id);
            if (index !== -1) {
                if (id === state.currentUser.id && role !== state.currentUser.role) {
                    showToast("Você não pode alterar o seu próprio nível de acesso.", "warning");
                    return;
                }
                
                targetUser = { id, name, username, password, role };
                state.users[index] = targetUser;
                showToast("Usuário atualizado com sucesso!", "success");
            }
        } else {
            if (state.users.some(u => u.username === username)) {
                showToast("Este nome de usuário já existe.", "danger");
                return;
            }
            
            targetUser = {
                id: "u-" + Date.now(),
                name,
                username,
                password,
                role
            };
            state.users.push(targetUser);
            showToast("Novo usuário cadastrado!", "success");
        }
        
        saveState();
        closeUserModal();
        renderUsersTable();
        setupResponsibleSelector();
        renderMutiraoGrid();
        
        if (supabaseClient && targetUser) {
            supabaseUpsert("leeo_users", targetUser);
        }
    });
}

window.editUser = function(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById("user-modal-title").textContent = "Editar Usuário";
    document.getElementById("user-id").value = user.id;
    document.getElementById("user-fullname").value = user.name;
    document.getElementById("user-username").value = user.username;
    document.getElementById("user-password").value = user.password;
    document.getElementById("user-role").value = user.role;
    
    userModal.classList.add("show");
};

window.deleteUser = function(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    
    if (id === state.currentUser.id) {
        showToast("Você não pode apagar sua própria conta de usuário.", "danger");
        return;
    }
    
    if (user.role === "superadmin" && state.currentUser.role !== "superadmin") {
        showToast("Apenas Superadmins podem excluir contas de Superadmin.", "danger");
        return;
    }
    
    if (confirm(`Tem certeza que deseja remover o usuário "${user.name}" (${user.username})?`)) {
        state.users = state.users.filter(u => u.id !== id);
        showToast("Usuário removido.", "success");
        saveState();
        renderUsersTable();
        setupResponsibleSelector();
        renderMutiraoGrid();
        
        if (supabaseClient) {
            supabaseDelete("leeo_users", id);
        }
    }
};

function renderUsersTable() {
    if (!usersTbody) return;
    usersTbody.innerHTML = "";
    
    state.users.forEach(user => {
        const tr = document.createElement("tr");
        
        let roleBadge = "";
        if (user.role === "superadmin") {
            roleBadge = `<span class="badge badge-danger"><i data-lucide="shield-check"></i> Superadmin</span>`;
        } else if (user.role === "admin") {
            roleBadge = `<span class="badge badge-warning"><i data-lucide="shield"></i> Administrador</span>`;
        } else {
            roleBadge = `<span class="badge badge-neutral"><i data-lucide="user"></i> Usuário</span>`;
        }
        
        tr.innerHTML = `
            <td class="font-bold">${user.name}</td>
            <td><code>${user.username}</code></td>
            <td>${roleBadge}</td>
            <td class="actions-col">
                <div class="table-actions">
                    <button class="btn-action edit" onclick="editUser('${user.id}')" title="Editar Usuário">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteUser('${user.id}')" title="Apagar Usuário">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        usersTbody.appendChild(tr);
    });
    
    lucide.createIcons();
}

// ==========================================================================
// 9. Application Load Entry Point
// ==========================================================================

const tabs = {
    inventario: "Inventário de Reagentes",
    organizacao: "Organização Semanal (Checklist)",
    mutirao: "Mutirão de Organização Geral",
    agendamento: "Agendamento de Laboratórios",
    equipamentos: "Gestão de Equipamentos e Treinamento",
    agua: "Registros de Água (Destilada / Deionizada)",
    usuarios: "Gerenciamento de Acesso"
};

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        document.querySelectorAll(".tab-view").forEach(view => view.classList.remove("active"));
        
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(`view-${tabId}`).classList.add("active");
        
        document.getElementById("page-title").textContent = tabs[tabId];
        document.querySelector(".sidebar").classList.remove("open");
        
        if (tabId === "inventario") {
            renderReagentsTable();
        } else if (tabId === "organizacao") {
            renderChecklist();
            setupResponsibleSelector();
        } else if (tabId === "mutirao") {
            renderMutiraoGrid();
        } else if (tabId === "agendamento") {
            renderReservations();
            updateReservationInputMin();
        } else if (tabId === "equipamentos") {
            renderEquipmentsGrid();
        } else if (tabId === "agua") {
            renderWaterLogs();
        } else if (tabId === "usuarios") {
            renderUsersTable();
        }
    });
});

window.addEventListener("DOMContentLoaded", () => {
    setTopbarDate();
    resetWaterFormDate();
    checkAuth();
    lucide.createIcons();
    
    const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener("click", () => {
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) sidebar.classList.toggle("open");
        });
    }
    
    if (supabaseClient) {
        syncFromSupabase();
    }
});
