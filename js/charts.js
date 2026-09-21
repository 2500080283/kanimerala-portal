/**
 * Kanimerala Village Portal - Chart.js Visualizers
 * Responsive, themed charts for demographics, economy, water, and health
 */

const KanimeralaCharts = (function () {
    const chartInstances = {};

    function getThemeColors() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return {
            textColor: isLight ? '#475569' : '#9ca3af',
            gridColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
            tooltipBg: isLight ? '#0f172a' : '#1f2937',
            tooltipText: isLight ? '#ffffff' : '#f9fafb'
        };
    }

    function initAllCharts(data) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, skipping chart initialization.');
            return;
        }

        const tc = getThemeColors();
        Chart.defaults.color = tc.textColor;
        Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
        Chart.defaults.font.size = 12;

        renderCategoryChart(data, tc);
        renderAgeGroupChart(data, tc);
        renderEducationChart(data, tc);
        renderCropsChart(data, tc);
        renderWaterChart(data, tc);
        renderHousingSanitationChart(data, tc);
        renderSchemesChart(data, tc);
        renderHealthChart(data, tc);
    }

    function renderCategoryChart(data, tc) {
        const ctx = document.getElementById('chartCategory');
        if (!ctx) return;
        if (chartInstances.category) chartInstances.category.destroy();

        const cats = data.metrics.categories;
        chartInstances.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cats).map(k => `${k} (${cats[k]} persons)`),
                datasets: [{
                    data: Object.values(cats),
                    backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#6366f1'],
                    borderWidth: 2,
                    borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#111827'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const total = 140;
                                const val = ctx.raw;
                                const pct = ((val / total) * 100).toFixed(1);
                                return ` ${val} members (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    function renderAgeGroupChart(data, tc) {
        const ctx = document.getElementById('chartAgeGroups');
        if (!ctx) return;
        if (chartInstances.ageGroups) chartInstances.ageGroups.destroy();

        const ag = data.metrics.ageGroups;
        chartInstances.ageGroups = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ag),
                datasets: [{
                    label: 'Population',
                    data: Object.values(ag),
                    backgroundColor: '#059669',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: tc.gridColor }, beginAtZero: true }
                }
            }
        });
    }

    function renderEducationChart(data, tc) {
        const ctx = document.getElementById('chartEducation');
        if (!ctx) return;
        if (chartInstances.education) chartInstances.education.destroy();

        const edu = data.metrics.education;
        const labels = ['Illiterate', '8th Pass', '10th Pass', '12th Pass', 'Graduate'];
        const values = labels.map(l => edu[l] || 0);

        chartInstances.education = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Individuals',
                    data: values,
                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: tc.gridColor }, beginAtZero: true },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    function renderCropsChart(data, tc) {
        const ctx = document.getElementById('chartCrops');
        if (!ctx) return;
        if (chartInstances.crops) chartInstances.crops.destroy();

        const crops = data.metrics.topCrops;
        chartInstances.crops = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(crops),
                datasets: [{
                    label: 'Farming Households',
                    data: Object.values(crops),
                    backgroundColor: '#f59e0b',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: tc.gridColor }, beginAtZero: true }
                }
            }
        });
    }

    function renderWaterChart(data, tc) {
        const ctx = document.getElementById('chartWater');
        if (!ctx) return;
        if (chartInstances.water) chartInstances.water.destroy();

        const w = data.metrics.water;
        chartInstances.water = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(w),
                datasets: [{
                    data: Object.values(w),
                    backgroundColor: ['#0284c7', '#10b981', '#64748b'],
                    borderWidth: 2,
                    borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#111827'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
                }
            }
        });
    }

    function renderHousingSanitationChart(data, tc) {
        const ctx = document.getElementById('chartDrainage');
        if (!ctx) return;
        if (chartInstances.drainage) chartInstances.drainage.destroy();

        const d = data.metrics.drainage;
        chartInstances.drainage = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Adequate Drainage (16)', 'Drainage Deficit / Stagnation (33)'],
                datasets: [{
                    data: [d['Adequate Drainage'], d['Deficit / Problem / None']],
                    backgroundColor: ['#10b981', '#f43f5e'],
                    borderWidth: 2,
                    borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#111827'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
                },
                cutout: '60%'
            }
        });
    }

    function renderSchemesChart(data, tc) {
        const ctx = document.getElementById('chartSchemes');
        if (!ctx) return;
        if (chartInstances.schemes) chartInstances.schemes.destroy();

        const labels = ['PM-KISAN', 'Jal Jeevan Mission', 'Ration Card', 'MNREGA Active', 'Pensions', 'Amma Vodi / Rythu Bharosa'];
        const values = [16, 7, 7, 7, 5, 5];

        chartInstances.schemes = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Beneficiary Households',
                    data: values,
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: tc.gridColor }, beginAtZero: true },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    function renderHealthChart(data, tc) {
        const ctx = document.getElementById('chartHealth');
        if (!ctx) return;
        if (chartInstances.health) chartInstances.health.destroy();

        const ailments = {
            'Hypertension / High BP': 12,
            'Diabetes / Sugar': 11,
            'Knee / Leg / Joint Pain': 10,
            'Stroke / Brain / Paralysis': 3,
            'Asthma / Breathing / Lung': 3,
            'Eye / Vision Ailments': 2,
            'Gastric': 2
        };

        chartInstances.health = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ailments),
                datasets: [{
                    label: 'Reported Cases',
                    data: Object.values(ailments),
                    backgroundColor: '#f43f5e',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: tc.gridColor }, beginAtZero: true },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    function updateTheme() {
        if (typeof KANIMERALA_DATA !== 'undefined') {
            initAllCharts(KANIMERALA_DATA);
        }
    }

    return {
        initAllCharts,
        updateTheme
    };
})();
