// ========== KHỞI TẠO CHÍNH ==========

// Đăng ký plugin datalabels
try {
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
        hasDataLabelsPlugin = true;
        console.log('✅ Đã đăng ký ChartDataLabels plugin');
    } else {
        console.warn('⚠️ Không tìm thấy ChartDataLabels plugin');
    }
} catch (e) {
    console.warn('⚠️ Lỗi khi đăng ký ChartDataLabels plugin:', e);
}

const accessCodeMap = {
    KV1ADZ: 'KV1',
    KV2ZAC: 'KV2',
    KV3CCC: 'KV3',
    KV4YXY: 'KV4',
    KV5XXZ: 'KV5',
    KV6XBC: 'KV6',
    KV7ABC: 'KV7',
    99: 'ADMIN'
};

let currentAccountRole = null;
let currentAccountKV = null;

function getAccessInfo(code) {
    if (!code) return null;
    const normalized = code.trim().toUpperCase();
    const role = accessCodeMap[normalized] || null;
    if (!role) return null;
    return {
        role: role === 'ADMIN' ? 'ADMIN' : 'KV',
        kv: role === 'ADMIN' ? null : role
    };
}

function setAccountFilters(activeKV, activeClass, isAdmin, selector, containerElement) {
    const container = containerElement || (selector ? document.querySelector(selector) : null);
    if (!container) return;
    container.querySelectorAll('button').forEach(btn => {
        const btnKV = btn.dataset.kv;
        btn.classList.remove(activeClass);
        btn.disabled = false;
        btn.style.opacity = '';

        if (!isAdmin && btnKV !== activeKV) {
            btn.disabled = true;
            btn.style.opacity = '0.55';
        }

        if (btnKV === activeKV) {
            btn.classList.add(activeClass);
        }
    });
}

function getEffectiveFilter(filterValue) {
    if (filterValue && filterValue !== 'all') return filterValue;
    if (currentAccountRole !== 'ADMIN' && currentAccountKV) return currentAccountKV;
    return 'all';
}

function updateFilterUI() {
    const topKV = getEffectiveFilter(currentTopKVFilter);
    const bottomKV = getEffectiveFilter(currentBottomKVFilter);
    const areaKV = getEffectiveFilter(currentKVFilter);

    const employeeFilters = document.querySelectorAll('.kv-filter-employee');
    if (employeeFilters.length > 0) {
        setAccountFilters(topKV, 'top-active', currentAccountRole === 'ADMIN', null, employeeFilters[0]);
    }
    if (employeeFilters.length > 1) {
        setAccountFilters(bottomKV, 'bottom-active', currentAccountRole === 'ADMIN', null, employeeFilters[1]);
    }

    const regionFilter = document.getElementById('kvFilter');
    if (regionFilter) {
        regionFilter.querySelectorAll('.kv-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === currentRegionFilter) {
                btn.classList.add('active');
            }
            if (currentAccountRole !== 'ADMIN') {
                const btnRegion = btn.dataset.filter;
                const regionKVs = REGION_MAP[btnRegion];
                if (btnRegion === 'all') {
                    btn.disabled = true;
                    btn.style.opacity = '0.55';
                } else if (regionKVs && regionKVs.length > 0) {
                    const hasAccess = regionKVs.includes(currentAccountKV);
                    btn.disabled = !hasAccess;
                    btn.style.opacity = hasAccess ? '' : '0.55';
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.55';
                }
            }
        });
    }

    setAccountFilters(areaKV, 'active', currentAccountRole === 'ADMIN', '.kv-sub-filter');
}

function applyAccountAccess(role, kv) {
    currentAccountRole = role;
    currentAccountKV = kv;

    const isAdmin = role === 'ADMIN';
    const defaultKV = isAdmin ? 'all' : kv || 'all';

    currentTopKVFilter = defaultKV;
    currentBottomKVFilter = defaultKV;
    currentKVFilter = defaultKV;
    currentRegionFilter = 'all';

    updateFilterUI();

    const nppContainer = document.getElementById('nppChartsContainer');
    if (nppContainer) {
        nppContainer.style.display = isAdmin ? '' : 'none';
    }

    const summaryStats = document.getElementById('summaryStats');
    if (summaryStats) {
        summaryStats.style.display = isAdmin ? '' : 'none';
    }

    // Hiển thị nút Chat AI chỉ cho ADMIN
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    if (chatToggleBtn) {
        chatToggleBtn.style.display = isAdmin ? 'flex' : 'none';
    }
    // Nếu không phải admin và chat panel đang mở, đóng lại
    if (!isAdmin) {
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) chatPanel.style.display = 'none';
        isChatOpen = false;
    }

    if (currentData) {
        createCharts(currentData);
    }
}

function createCharts(data) {
    console.log('🔄 Đang vẽ biểu đồ...');

    updateFilterUI();

    if (topCompletionChart) topCompletionChart.destroy();
    if (bottomCompletionChart) bottomCompletionChart.destroy();
    if (topAreaChart) topAreaChart.destroy();
    if (bottomAreaChart) bottomAreaChart.destroy();
    if (areaRevenueChart) areaRevenueChart.destroy();

    if (!data || data.length === 0) {
        console.warn('⚠️ Không có dữ liệu để vẽ biểu đồ');
        return;
    }

    const activeData = filterActiveEmployees(data);
    const effectiveTopKV = getEffectiveFilter(currentTopKVFilter);
    const effectiveBottomKV = getEffectiveFilter(currentBottomKVFilter);
    const effectiveAreaKV = getEffectiveFilter(currentKVFilter);

    const topFilteredData = effectiveTopKV === 'all'
        ? activeData
        : activeData.filter(item => findKVFromGroup(item.ma_kv || 'Khác') === effectiveTopKV);

    const bottomFilteredData = effectiveBottomKV === 'all'
        ? activeData
        : activeData.filter(item => findKVFromGroup(item.ma_kv || 'Khác') === effectiveBottomKV);

    currentTopKVFilter = effectiveTopKV;
    currentBottomKVFilter = effectiveBottomKV;
    currentKVFilter = effectiveAreaKV;

    createTopCompletionChart(topFilteredData, effectiveTopKV);
    createBottomCompletionChart(bottomFilteredData, effectiveBottomKV);

    createTopAreaChart(data);
    createBottomAreaChart(data);

    if (effectiveAreaKV === 'all') {
        createAreaRevenueChart(data, currentRegionFilter);
    } else {
        createNPPChartByKV(data, effectiveAreaKV);
    }
    console.log(`✅ Đã vẽ xong biểu đồ (${activeData.length} nhân viên active / ${data.length} tổng số)`);
}

function displaySummaryStats(data) {
    const summaryStats = document.getElementById('summaryStats');
    summaryStats.innerHTML = '';
    if (!data || data.length === 0) return;

    const tongDoanhSoTH = data.reduce((sum, item) => sum + (item.doanh_so?.th || 0), 0);
    const tongDoanhSoKH = getKVTargetFromNPP('all');
    const tlTrungBinh = tongDoanhSoKH > 0 ? (tongDoanhSoTH / tongDoanhSoKH * 100) : 0;

    const activeData = filterActiveEmployees(data);
    let nvCaoNhat = null;
    if (activeData.length > 0) {
        nvCaoNhat = activeData.reduce((max, item) => (item.doanh_so?.th || 0) > (max.doanh_so?.th || 0) ? item : max, activeData[0]);
    }

    const nvCaoNhatInfo = nvCaoNhat ? getEmployeeDisplayInfo(nvCaoNhat.ma_nv) : null;
    const nvCaoNhatNPP = nvCaoNhatInfo?.maDonVi ? getGroupName(nvCaoNhatInfo.maDonVi) : 'N/A';

    const kvRevenue = {};
    data.forEach(item => {
        const maKV = item.ma_kv || 'Khác';
        const kv = findKVFromGroup(maKV);
        const revenue = item.doanh_so?.th || 0;
        if (!kvRevenue[kv]) kvRevenue[kv] = 0;
        kvRevenue[kv] += revenue;
    });

    let kvCaoNhat = null;
    let maxRevenue = 0;
    Object.entries(kvRevenue).forEach(([kv, revenue]) => {
        if (revenue > maxRevenue && kv !== 'Khác') {
            maxRevenue = revenue;
            const target = getKVTargetFromNPP(kv);
            kvCaoNhat = {
                ma: kv,
                doanhThu: revenue,
                target: target,
                tl: target > 0 ? (revenue / target * 100) : 0
            };
        }
    });

    const nppActualRevenue = {};
    data.forEach(item => {
        const maKV = item.ma_kv || 'Khác';
        const revenue = item.doanh_so?.th || 0;
        if (!nppActualRevenue[maKV]) nppActualRevenue[maKV] = 0;
        nppActualRevenue[maKV] += revenue;
    });

    let nppCaoNhatThucTe = null;
    let maxNPPActualRevenue = 0;
    Object.entries(nppActualRevenue).forEach(([maNPP, revenue]) => {
        if (revenue > maxNPPActualRevenue) {
            maxNPPActualRevenue = revenue;
            nppCaoNhatThucTe = {
                ten: getGroupName(maNPP) || maNPP,
                doanhSoTH: revenue,
                target: getNPPTarget(maNPP)
            };
        }
    });

    const stats = [
        { label: '🎯 Tổng DS KH (từ NPP)', value: tongDoanhSoKH },
        { label: '💰 Tổng DS TH', value: tongDoanhSoTH },
        { label: '📈 Tỷ lệ TB', value: tlTrungBinh, unit: '%' },
        {
            label: '🏆 NV cao nhất',
            value: nvCaoNhat ? getEmployeeName(nvCaoNhat.ma_nv) : 'N/A',
            subValue: nvCaoNhat ? formatNumber(nvCaoNhat.doanh_so?.th || 0) : '0',
            subLabel: 'Doanh số',
            nppInfo: nvCaoNhat ? ` - ${nvCaoNhatNPP}` : ''
        },
        {
            label: '🏢 NPP có DS cao nhất',
            value: nppCaoNhatThucTe ? nppCaoNhatThucTe.ten : 'N/A',
            subValue: formatNumber(nppCaoNhatThucTe ? nppCaoNhatThucTe.doanhSoTH : 0),
            subLabel: 'Doanh số TH',
            tlValue: nppCaoNhatThucTe && nppCaoNhatThucTe.target > 0 ?
                `KH: ${formatNumber(nppCaoNhatThucTe.target)} (${(nppCaoNhatThucTe.doanhSoTH / nppCaoNhatThucTe.target * 100).toFixed(1)}%)` : ''
        },
        {
            label: '📍 KV doanh thu cao nhất',
            value: kvCaoNhat ? getGroupName(kvCaoNhat.ma) : 'N/A',
            subValue: formatNumber(kvCaoNhat ? kvCaoNhat.doanhThu : 0),
            subLabel: 'Doanh số TH',
            tlValue: kvCaoNhat ? `KH: ${formatNumber(kvCaoNhat.target)} (${kvCaoNhat.tl.toFixed(1)}%)` : ''
        }
    ];

    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';

        if (stat.unit === '%') {
            statCard.innerHTML = `<div class="stat-label">${stat.label}</div><div class="stat-value">${stat.value.toFixed(1)}%</div>`;
        } else if (stat.subValue) {
            if (stat.nppInfo) {
                statCard.innerHTML = `
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value">${stat.value}</div>
                    <div style="font-size: 12px; opacity: 0.9; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        <span>${stat.subLabel}: ${stat.subValue}</span>
                        <span>${stat.nppInfo}</span>
                        ${stat.tlValue ? `<span>${stat.tlValue}</span>` : ''}
                    </div>
                `;
            } else {
                statCard.innerHTML = `
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value">${stat.value}</div>
                    <div style="font-size: 12px; opacity: 0.9; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        <span>${stat.subLabel}: ${stat.subValue}</span>
                        ${stat.tlValue ? `<span>${stat.tlValue}</span>` : ''}
                    </div>
                `;
            }
        } else {
            statCard.innerHTML = `<div class="stat-label">${stat.label}</div><div class="stat-value">${formatNumber(stat.value)}</div>`;
        }

        summaryStats.appendChild(statCard);
    });
}

async function searchKPI() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const auth = document.getElementById('auth').value;
    const searchBtn = document.getElementById('searchBtn');
    const loading = document.getElementById('loading');
    const reportSection = document.getElementById('reportSection');
    const errorMessage = document.getElementById('errorMessage');
    const dataInfo = document.getElementById('dataInfo');

    if (!month || !year || !auth) {
        showError('Vui lòng nhập đầy đủ thông tin: Tháng, Năm và Authorization');
        return;
    }

    searchBtn.disabled = true;
    loading.classList.add('active');
    reportSection.classList.remove('active');
    errorMessage.style.display = 'none';
    dataInfo.style.display = 'none';

    try {
        console.log('🔄 Đang tải dữ liệu nhân viên...');
        await fetchEmployees();
        console.log('⏳ Đợi 1 giây trước khi gọi API tiếp theo...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔄 Đang tải dữ liệu nhóm...');
        await fetchGroups();
        console.log('⏳ Đợi 1 giây trước khi gọi API KPI...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔄 Đang tải dữ liệu KPI...');
        const url = `https://openapi.mobiwork.vn/OpenAPI/V1/KPI?thang=${month}&nam=${year}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'accept': 'application/json', 'Authorization': auth }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const mergedData = mergeKPIData(data.result || []);
        currentData = mergedData;
        allData = JSON.parse(JSON.stringify(mergedData));
        document.getElementById('reportTitle').textContent = `Báo cáo KPI Tất Cả tháng ${month}/${year}`;
        
        dataInfo.style.display = 'none';
        
        setTimeout(() => createCharts(currentData), 100);
        displaySummaryStats(currentData);
        reportSection.classList.add('active');
        console.log(`✅ Đã tải xong dữ liệu KPI: ${currentData.length} nhân viên`);
    } catch (error) {
        console.error('❌ Lỗi chi tiết:', error);
        showError(`Lỗi khi tải dữ liệu: ${error.message}`);
    } finally {
        searchBtn.disabled = false;
        loading.classList.remove('active');
    }
}

function verifyAccess() {
    const codeInput = document.getElementById('accessCode');
    const errorDiv = document.getElementById('loginError');
    const enteredCode = codeInput.value.trim();
    
    // Chuyển thành chữ hoa để so sánh, cho phép nhập cả chữ thường
    const accessInfo = getAccessInfo(enteredCode);
    if (accessInfo) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        applyAccountAccess(accessInfo.role, accessInfo.kv);
    } else {
        errorDiv.style.display = 'flex';
        codeInput.value = '';
        codeInput.focus();
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

async function initializeAndFetchKPI() {
    console.log('🚀 Tự động tải dữ liệu KPI...');

    const loading = document.getElementById('loading');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.disabled = true;
    loading.classList.add('active');

    try {
        console.log('🔄 Đang tải dữ liệu nhân viên...');
        await fetchEmployees();
        console.log('⏳ Đợi 1 giây trước khi gọi API tiếp theo...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔄 Đang tải dữ liệu nhóm...');
        await fetchGroups();
        console.log('⏳ Đợi 1 giây trước khi gọi API KPI...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const month = document.getElementById('month').value;
        const year = document.getElementById('year').value;
        const auth = document.getElementById('auth').value;

        console.log(`🔄 Đang tải dữ liệu KPI tháng ${month}/${year}...`);
        const url = `https://openapi.mobiwork.vn/OpenAPI/V1/KPI?thang=${month}&nam=${year}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'accept': 'application/json', 'Authorization': auth }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        currentData = data.result || [];
        allData = JSON.parse(JSON.stringify(currentData));

        document.getElementById('reportTitle').textContent = `Báo cáo KPI Tất Cả tháng ${month}/${year}`;
        
        const dataInfo = document.getElementById('dataInfo');
        dataInfo.style.display = 'none';
        
        setTimeout(() => createCharts(currentData), 100);
        displaySummaryStats(currentData);
        document.getElementById('reportSection').classList.add('active');

        console.log(`✅ Đã tải xong dữ liệu KPI: ${currentData.length} nhân viên`);
    } catch (error) {
        console.error('❌ Lỗi khi tự động tải dữ liệu:', error);
        showError(`Lỗi khi tự động tải dữ liệu: ${error.message}`);
    } finally {
        searchBtn.disabled = false;
        loading.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    //const today = new Date();
    const today = new Date();
    document.getElementById('month').value = today.getMonth() + 1;
    document.getElementById('year').value = today.getFullYear();
    console.log('🚀 Ứng dụng đã sẵn sàng!');

    // Khởi tạo Chat AI
    if (typeof initChat === 'function') {
        initChat();
    }

    setTimeout(() => {
        initializeAndFetchKPI();
    }, 1000);
});