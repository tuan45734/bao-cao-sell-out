// ========== BIỂU ĐỒ KHU VỰC ==========

const REGION_MAP = {
    north: ['KV1', 'KV2', 'KV3', 'KV4', 'KV5', 'KV6'],
    central: ['KV7'],
    south: []
};

const REGION_LABELS = {
    all: 'Tất cả các miền',
    north: 'Miền Bắc',
    central: 'Miền Trung',
    south: 'Miền Nam'
};

function filterAreaRegion(region, event) {
    const filterDiv = document.getElementById('kvFilter');
    filterDiv.querySelectorAll('.kv-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    currentRegionFilter = region;
    currentKVFilter = 'all';

    const subFilter = document.getElementById('kvSubFilter');
    if (region === 'all' || region === 'south') {
        subFilter.style.display = 'none';
    } else {
        const kvs = REGION_MAP[region] || [];
        subFilter.innerHTML = '<button class="kv-btn active" data-kv="all" onclick="filterAreaRevenue(\'all\', event)">Tất cả</button>';
        kvs.forEach(kv => {
            subFilter.innerHTML += `<button class="kv-btn" data-kv="${kv}" onclick="filterAreaRevenue('${kv}', event)">${kv}</button>`;
        });
        subFilter.style.display = 'flex';
    }

    if (!currentData) return;

    const nppRevenueData = calculateNPPRevenue(currentData);
    updateTotalRevenueFromNPP(nppRevenueData);

    const chartCard = document.getElementById('areaRevenueChart')?.closest('.chart-card');
    if (!chartCard) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'kv-loading';
    loadingDiv.innerHTML = '<div class="spinner-small"></div><p>Đang lọc dữ liệu...</p>';
    loadingDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; z-index: 10;';
    chartCard.style.position = 'relative';
    chartCard.appendChild(loadingDiv);

    setTimeout(() => {
        const titleElement = chartCard.querySelector('h3');
        if (region === 'all') {
            createAreaRevenueChart(currentData);
        } else if (region === 'south') {
            if (titleElement) titleElement.innerHTML = '🥧 Tỷ lệ hoàn thành KPI - Miền Nam';
            showEmptyChart('Chưa có dữ liệu Miền Nam');
        } else {
            createAreaRevenueChart(currentData, region);
        }

        const loadingEl = chartCard.querySelector('.kv-loading');
        if (loadingEl) loadingEl.remove();
    }, 300);
}

function showEmptyChart(message) {
    try {
        const ctx = document.getElementById('areaRevenueChart').getContext('2d');
        if (areaRevenueChart) areaRevenueChart.destroy();

        const config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            },
            plugins: [{
                afterDraw: function (chart) {
                    const ctx = chart.ctx;
                    const w = chart.width;
                    const h = chart.height;
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '18px Arial';
                    ctx.fillStyle = '#999';
                    ctx.fillText(message, w / 2, h / 2);
                    ctx.restore();
                }
            }]
        };
        areaRevenueChart = new Chart(ctx, config);
    } catch (error) {
        console.error('❌ Lỗi vẽ biểu đồ trống:', error);
    }
}

function updateTotalRevenueFromNPP(nppRevenueData) {
    if (!nppRevenueData) return;

    let relevantNPPs = nppRevenueData;
    if (currentRegionFilter !== 'all' && currentKVFilter === 'all' && REGION_MAP[currentRegionFilter]) {
        const regionKVs = REGION_MAP[currentRegionFilter];
        relevantNPPs = nppRevenueData.filter(npp => regionKVs.includes(npp.kv));
    }

    let totalActualRevenue = 0;
    let totalTarget = 0;

    if (currentKVFilter === 'all') {
        totalActualRevenue = relevantNPPs.reduce((sum, npp) => sum + npp.actualRevenue, 0);
        totalTarget = getKVTargetFromNPP('all');
        if (currentRegionFilter !== 'all' && REGION_MAP[currentRegionFilter]) {
            const regionKVs = REGION_MAP[currentRegionFilter];
            totalTarget = relevantNPPs.reduce((sum, npp) => sum + (npp.target || 0), 0);
        }
    } else {
        const filteredNPPs = nppRevenueData.filter(npp => npp.kv === currentKVFilter);
        totalActualRevenue = filteredNPPs.reduce((sum, npp) => sum + npp.actualRevenue, 0);
        totalTarget = getKVTargetFromNPP(currentKVFilter);
    }

    const completionRate = totalTarget > 0 ? (totalActualRevenue / totalTarget * 100).toFixed(1) : 0;

    const totalRevenueElement = document.getElementById('totalRevenueAll');
    if (totalRevenueElement) {
        totalRevenueElement.innerHTML = `${formatNumber(totalActualRevenue)} / ${formatNumber(totalTarget)} (${completionRate}%)`;
    }
}

function createAreaRevenueChart(data, regionFilter) {
    const nppRevenueData = calculateNPPRevenue(data);

    const kvActualRevenue = {};
    nppRevenueData.forEach(npp => {
        if (!kvActualRevenue[npp.kv]) {
            kvActualRevenue[npp.kv] = 0;
        }
        kvActualRevenue[npp.kv] += npp.actualRevenue;
    });

    const kvData = [];
    let uniqueKVs = [...new Set(nppData.map(item => item.kv))];

    if (regionFilter && regionFilter !== 'all' && REGION_MAP[regionFilter] && REGION_MAP[regionFilter].length > 0) {
        const allowedKVs = REGION_MAP[regionFilter];
        uniqueKVs = uniqueKVs.filter(kv => allowedKVs.includes(kv));
    }

    uniqueKVs.forEach(kv => {
        const actualRevenue = kvActualRevenue[kv] || 0;
        const targetRevenue = getKVTargetFromNPP(kv);
        const completionRate = targetRevenue > 0 ? (actualRevenue / targetRevenue * 100) : 0;

        kvData.push({
            kv: kv,
            actualRevenue: actualRevenue,
            targetRevenue: targetRevenue,
            completionRate: completionRate
        });
    });

    updateTotalRevenueFromNPP(nppRevenueData);
    kvData.sort((a, b) => b.completionRate - a.completionRate);

    const labels = kvData.map(item => getGroupName(item.kv) || item.kv);
    const completionRates = kvData.map(item => item.completionRate);

    const chartCard = document.getElementById('areaRevenueChart')?.closest('.chart-card');
    if (chartCard) {
        const titleElement = chartCard.querySelector('h3');
        if (titleElement && currentKVFilter === 'all') {
            if (regionFilter && regionFilter !== 'all' && REGION_LABELS[regionFilter]) {
                titleElement.innerHTML = `🥧 Tỷ lệ hoàn thành KPI - ${REGION_LABELS[regionFilter]}`;
            } else {
                titleElement.innerHTML = '🥧 Tỷ lệ hoàn thành KPI theo Khu vực';
            }
        }
    }

    try {
        const ctx = document.getElementById('areaRevenueChart').getContext('2d');
        if (areaRevenueChart) areaRevenueChart.destroy();

        // Tính max value và set max cao hơn 1.1 lần (thêm 10% khoảng trống)
        const maxValue = Math.max(...completionRates, 0);
        let maxAxis = Math.ceil((maxValue * 1.1) / 10) * 10; // Làm tròn lên bội số của 10
        
        // Đảm bảo maxAxis ít nhất là 100 nếu có giá trị trên 80
        if (maxValue > 80 && maxAxis < 100) maxAxis = 100;
        if (maxAxis < 50) maxAxis = 50;

        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tỷ lệ hoàn thành (%)',
                    data: completionRates,
                    backgroundColor: completionRates.map(rate => {
                        if (rate >= 100) return 'rgba(76, 175, 80, 0.8)';
                        if (rate >= 80) return 'rgba(33, 150, 243, 0.8)';
                        if (rate >= 50) return 'rgba(255, 193, 7, 0.8)';
                        return 'rgba(244, 67, 54, 0.8)';
                    }),
                    borderColor: 'white',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const item = kvData[index];
                                return [
                                    `💰 Doanh số TH: ${formatNumber(item.actualRevenue)}`,
                                    `🎯 Kế hoạch: ${formatNumber(item.targetRevenue)}`,
                                    `📊 Tỷ lệ HT: ${item.completionRate.toFixed(1)}%`
                                ];
                            }
                        }
                    },
                    datalabels: hasDataLabelsPlugin ? {
                        display: true,
                        anchor: 'end',
                        align: 'end',
                        offset: 5,
                        color: '#333',
                        font: { weight: 'bold', size: 11 },
                        formatter: value => value.toFixed(1) + '%'
                    } : {}
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: maxAxis,
                        ticks: { 
                            callback: value => value + '%', 
                            stepSize: maxAxis > 100 ? 20 : 10 
                        },
                        title: { display: true, text: 'Tỷ lệ hoàn thành (%)', font: { weight: 'bold' } }
                    },
                    y: { ticks: { font: { size: 12 } } }
                }
            }
        };

        areaRevenueChart = new Chart(ctx, config);
    } catch (error) {
        console.error('❌ Lỗi vẽ biểu đồ tỷ lệ hoàn thành khu vực:', error);
    }
}

function createNPPChartByKV(data, kv) {
    if (!data || data.length === 0) return;

    const nppRevenueData = calculateNPPRevenue(data);
    const filteredNPPs = nppRevenueData.filter(npp => npp.kv === kv);

    if (filteredNPPs.length === 0) {
        showToast(`Không có dữ liệu NPP cho ${getGroupName(kv) || kv}`);
        return;
    }

    const chartData = filteredNPPs
        .map(npp => ({
            ten: npp.ten,
            revenue: npp.actualRevenue,
            target: npp.target,
            completionRate: npp.target > 0 ? (npp.actualRevenue / npp.target * 100) : 0
        }))
        .sort((a, b) => b.completionRate - a.completionRate);

    const labels = chartData.map(item => item.ten.replace(/^NPP\s+/i, ''));
    const completionRates = chartData.map(item => item.completionRate);

    // Tính max value và set max cao hơn 1.1 lần (thêm 10% khoảng trống)
    const maxValue = Math.max(...completionRates, 0);
    let maxAxis = Math.ceil((maxValue * 1.1) / 10) * 10; // Làm tròn lên bội số của 10
    
    // Đảm bảo maxAxis ít nhất là 100 nếu có giá trị trên 80
    if (maxValue > 80 && maxAxis < 100) maxAxis = 100;
    if (maxAxis < 50) maxAxis = 50;

    try {
        const ctx = document.getElementById('areaRevenueChart').getContext('2d');
        if (areaRevenueChart) areaRevenueChart.destroy();

        const kvName = getGroupName(kv) || kv;
        const chartCard = ctx.canvas.closest('.chart-card');
        const titleElement = chartCard.querySelector('h3');
        if (titleElement) titleElement.innerHTML = `🏢 Tỷ lệ hoàn thành KPI NPP - ${kvName}`;

        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tỷ lệ hoàn thành (%)',
                    data: completionRates,
                    backgroundColor: completionRates.map(rate => {
                        if (rate >= 100) return 'rgba(76, 175, 80, 0.8)';
                        if (rate >= 80) return 'rgba(255, 193, 7, 0.8)';
                        if (rate >= 50) return 'rgba(255, 152, 0, 0.8)';
                        return 'rgba(244, 67, 54, 0.8)';
                    }),
                    borderColor: 'white',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const item = chartData[index];
                                return [
                                    `💰 Doanh số TH: ${formatNumber(item.revenue)}`,
                                    `🎯 Kế hoạch: ${formatNumber(item.target)}`,
                                    `📊 Tỷ lệ HT: ${item.completionRate.toFixed(1)}%`
                                ];
                            }
                        }
                    },
                    datalabels: hasDataLabelsPlugin ? {
                        display: true,
                        anchor: 'end',
                        align: 'end',
                        offset: 5,
                        color: '#333',
                        font: { weight: 'bold', size: 11 },
                        formatter: value => value.toFixed(1) + '%'
                    } : {}
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: maxAxis,
                        ticks: { 
                            callback: value => value + '%', 
                            stepSize: maxAxis > 100 ? 20 : 10 
                        },
                        title: { display: true, text: 'Tỷ lệ hoàn thành (%)', font: { weight: 'bold' } }
                    },
                    y: {
                        ticks: {
                            font: { size: 12 },
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                return label && label.length > 30 ? label.substring(0, 27) + '...' : label;
                            }
                        }
                    }
                }
            }
        };

        areaRevenueChart = new Chart(ctx, config);
    } catch (error) {
        console.error('❌ Lỗi vẽ biểu đồ NPP theo KV:', error);
    }
}

function filterAreaRevenue(kv, event) {
    const subFilter = document.getElementById('kvSubFilter');
    subFilter.querySelectorAll('.kv-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    currentKVFilter = kv;
    if (!currentData) return;

    const nppRevenueData = calculateNPPRevenue(currentData);
    updateTotalRevenueFromNPP(nppRevenueData);

    const chartCard = document.getElementById('areaRevenueChart')?.closest('.chart-card');
    if (!chartCard) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'kv-loading';
    loadingDiv.innerHTML = '<div class="spinner-small"></div><p>Đang lọc dữ liệu...</p>';
    loadingDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; z-index: 10;';
    chartCard.style.position = 'relative';
    chartCard.appendChild(loadingDiv);

    setTimeout(() => {
        if (kv === 'all') {
            createAreaRevenueChart(currentData, currentRegionFilter);
        } else {
            createNPPChartByKV(currentData, kv);
        }

        const loadingEl = chartCard.querySelector('.kv-loading');
        if (loadingEl) loadingEl.remove();
    }, 300);
}