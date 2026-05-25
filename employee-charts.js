// ========== BIỂU ĐỒ NHÂN VIÊN ==========

function createTopCompletionChart(data) {
    if (!data || data.length === 0) {
        const ctx = document.getElementById('topCompletionChart').getContext('2d');
        if (topCompletionChart) topCompletionChart.destroy();
        topCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Không có dữ liệu nhân viên đang hoạt động'], datasets: [{ label: 'Doanh số (VNĐ)', data: [0], backgroundColor: 'rgba(200,200,200,0.5)' }] },
            options: { plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
        return;
    }

    const chartCard = document.getElementById('topCompletionChart')?.closest('.chart-card');
    if (chartCard) {
        const titleElement = chartCard.querySelector('h3');
        if (titleElement) {
            const effectiveKV = getEffectiveFilter(currentKVFilter);
            if (effectiveKV !== 'all') {
                const kvName = getGroupName(effectiveKV) || effectiveKV;
                titleElement.innerHTML = `🏆 15 Nhân viên doanh số cao nhất - ${kvName}`;
            } else if (currentRegionFilter !== 'all') {
                titleElement.innerHTML = `🏆 15 Nhân viên doanh số cao nhất - ${REGION_LABELS[currentRegionFilter]}`;
            } else {
                titleElement.innerHTML = '🏆 15 Nhân viên doanh số cao nhất';
            }
        }
    }

    const topData = [...data]
        .filter(item => (item.doanh_so?.th || 0) > 0)
        .sort((a, b) => (b.doanh_so?.th || 0) - (a.doanh_so?.th || 0))
        .slice(0, 15);

    if (topData.length === 0) {
        const ctx = document.getElementById('topCompletionChart').getContext('2d');
        if (topCompletionChart) topCompletionChart.destroy();
        topCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Không có dữ liệu'], datasets: [{ label: 'Doanh số (VNĐ)', data: [0], backgroundColor: 'rgba(200,200,200,0.5)' }] },
            options: { plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
        return;
    }

    const labels = topData.map(item => {
        const { ten, maDonVi, groupPath } = getEmployeeDisplayInfo(item.ma_nv);
        const employeeKV = findKVFromGroup(item.ma_kv || 'Khác');
        const kvDisplay = employeeKV !== 'Khác' ? ` [${employeeKV}]` : '';

        if (groupPath && maDonVi) return `${ten}${kvDisplay}-${maDonVi}`;
        if (maDonVi) return `${ten}${kvDisplay} (${maDonVi})`;
        if (groupPath) return `${ten}${kvDisplay}\n(${groupPath})`;
        return `${ten}${kvDisplay}`;
    });

    const revenues = topData.map(item => item.doanh_so?.th || 0);
    const maxRevenue = Math.max(...revenues);
    let maxAxis = Math.ceil(maxRevenue * 1.3 / 1000000) * 1000000;

    try {
        const ctx = document.getElementById('topCompletionChart').getContext('2d');
        if (topCompletionChart) topCompletionChart.destroy();

        topCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh số (VNĐ)',
                    data: revenues,
                    backgroundColor: revenues.map(revenue => {
                        if (revenue >= 100000000) return 'rgba(76, 175, 80, 0.7)';
                        if (revenue >= 50000000) return 'rgba(33, 150, 243, 0.7)';
                        if (revenue >= 10000000) return 'rgba(255, 193, 7, 0.7)';
                        return 'rgba(244, 67, 54, 0.7)';
                    }),
                    borderColor: revenues.map(revenue => {
                        if (revenue >= 100000000) return 'rgba(76, 175, 80, 1)';
                        if (revenue >= 50000000) return 'rgba(33, 150, 243, 1)';
                        if (revenue >= 10000000) return 'rgba(255, 193, 7, 1)';
                        return 'rgba(244, 67, 54, 1)';
                    }),
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 12 } } },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const item = topData[context.dataIndex];
                                const revenue = context.raw;
                                const target = item.doanh_so?.kh || 0;
                                const completionRate = target > 0 ? ((revenue / target) * 100).toFixed(1) : 0;
                                const kvInfo = findKVFromGroup(item.ma_kv || 'Khác');
                                return [
                                    `📍 Khu vực: ${kvInfo}`,
                                    `💰 Doanh số: ${formatNumber(revenue)}`,
                                    `🎯 Kế hoạch: ${formatNumber(target)}`,
                                    `📊 Tỷ lệ HT: ${completionRate}%`
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
                        formatter: value => formatNumber(value)
                    } : {}
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: maxAxis,
                        ticks: { callback: value => formatNumber(value), stepSize: maxAxis / 5 },
                        title: { display: true, text: 'Doanh số (VNĐ)', font: { weight: 'bold' } }
                    },
                    y: {
                        ticks: {
                            font: { size: 10 },
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                return label && label.length > 50 ? label.substring(0, 47) + '...' : label;
                            }
                        }
                    }
                },
                layout: { padding: { left: 10, right: 10, top: 20, bottom: 20 } }
            }
        });
    } catch (error) {
        console.error('❌ Lỗi vẽ biểu đồ top doanh số:', error);
    }
}

function createBottomCompletionChart(data) {
    if (!data || data.length === 0) {
        const ctx = document.getElementById('bottomCompletionChart').getContext('2d');
        if (bottomCompletionChart) bottomCompletionChart.destroy();
        bottomCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Không có dữ liệu nhân viên đang hoạt động'], datasets: [{ label: 'Doanh số (VNĐ)', data: [0], backgroundColor: 'rgba(200,200,200,0.5)' }] },
            options: { plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
        return;
    }

    const chartCard = document.getElementById('bottomCompletionChart')?.closest('.chart-card');
    if (chartCard) {
        const titleElement = chartCard.querySelector('h3');
        if (titleElement) {
            const effectiveKV = getEffectiveFilter(currentKVFilter);
            if (effectiveKV !== 'all') {
                const kvName = getGroupName(effectiveKV) || effectiveKV;
                titleElement.innerHTML = `⚠️ 15 Nhân viên doanh số thấp nhất - ${kvName}`;
            } else if (currentRegionFilter !== 'all') {
                titleElement.innerHTML = `⚠️ 15 Nhân viên doanh số thấp nhất - ${REGION_LABELS[currentRegionFilter]}`;
            } else {
                titleElement.innerHTML = '⚠️ 15 Nhân viên doanh số thấp nhất';
            }
        }
    }

    const bottomData = [...data]
        .filter(item => (item.doanh_so?.th || 0) > 0)
        .sort((a, b) => (a.doanh_so?.th || 0) - (b.doanh_so?.th || 0))
        .slice(0, 15);

    if (bottomData.length === 0) {
        const ctx = document.getElementById('bottomCompletionChart').getContext('2d');
        if (bottomCompletionChart) bottomCompletionChart.destroy();
        bottomCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Không có dữ liệu'], datasets: [{ label: 'Doanh số (VNĐ)', data: [0], backgroundColor: 'rgba(200,200,200,0.5)' }] },
            options: { plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
        return;
    }

    const labels = bottomData.map(item => {
        const { ten, maDonVi, groupPath } = getEmployeeDisplayInfo(item.ma_nv);
        const employeeKV = findKVFromGroup(item.ma_kv || 'Khác');
        const kvDisplay = employeeKV !== 'Khác' ? ` [${employeeKV}]` : '';

        if (groupPath && maDonVi) return `${ten}${kvDisplay}-${maDonVi}`;
        if (maDonVi) return `${ten}${kvDisplay} (${maDonVi})`;
        if (groupPath) return `${ten}${kvDisplay}\n(${groupPath})`;
        return `${ten}${kvDisplay}`;
    });

    const revenues = bottomData.map(item => item.doanh_so?.th || 0);
    const maxRevenue = Math.max(...revenues);
    let maxAxis = Math.ceil(maxRevenue * 1.5 / 1000000) * 1000000;
    if (maxAxis < 10000000) maxAxis = 10000000;

    try {
        const ctx = document.getElementById('bottomCompletionChart').getContext('2d');
        if (bottomCompletionChart) bottomCompletionChart.destroy();

        bottomCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh số (VNĐ)',
                    data: revenues,
                    backgroundColor: revenues.map((revenue, index) => `rgba(244, 67, 54, ${0.4 + (index * 0.03)})`),
                    borderColor: revenues.map(() => 'rgba(244, 67, 54, 1)'),
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 12 } } },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const item = bottomData[context.dataIndex];
                                const revenue = context.raw;
                                const target = item.doanh_so?.kh || 0;
                                const completionRate = target > 0 ? ((revenue / target) * 100).toFixed(1) : 0;
                                const kvInfo = findKVFromGroup(item.ma_kv || 'Khác');
                                return [
                                    `📍 Khu vực: ${kvInfo}`,
                                    `💰 Doanh số: ${formatNumber(revenue)}`,
                                    `🎯 Kế hoạch: ${formatNumber(target)}`,
                                    `📊 Tỷ lệ HT: ${completionRate}%`
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
                        formatter: value => formatNumber(value)
                    } : {}
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: maxAxis,
                        ticks: { callback: value => formatNumber(value), stepSize: maxAxis / 5 },
                        title: { display: true, text: 'Doanh số (VNĐ)', font: { weight: 'bold' } }
                    },
                    y: {
                        ticks: {
                            font: { size: 10 },
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                return label && label.length > 50 ? label.substring(0, 47) + '...' : label;
                            }
                        }
                    }
                },
                layout: { padding: { left: 10, right: 10, top: 20, bottom: 20 } }
            }
        });
    } catch (error) {
        console.error('❌ Lỗi vẽ biểu đồ bottom doanh số:', error);
    }
}

