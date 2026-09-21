/**
 * Kanimerala Village Portal - Application Logic
 * Navigation, Search & Filtering, Modals, Theme, and Exports
 */

document.addEventListener('DOMContentLoaded', () => {
    const data = window.KANIMERALA_DATA || (typeof KANIMERALA_DATA !== 'undefined' ? KANIMERALA_DATA : null);
    if (!data) {
        console.error('Village dataset not found.');
        return;
    }

    // State
    const state = {
        currentTab: 'overview',
        viewMode: 'grid', // 'grid' | 'table'
        searchQuery: '',
        filterCategory: 'all',
        filterPoverty: 'all',
        filterHouseType: 'all',
        filterDrainage: 'all',
        filterGrievance: 'all',
        theme: localStorage.getItem('km_theme') || 'dark'
    };

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();

    // Init components
    initTabs();
    initThemeToggle();
    initSearchAndFilters();
    initModal();
    initExports();
    populateGrievanceList();
    renderHouseholds();

    // Init Charts for initial view
    if (window.KanimeralaCharts) {
        window.KanimeralaCharts.initAllCharts(data);
    }

    // -------------------------------------------------------------
    // Tab Navigation
    // -------------------------------------------------------------
    function initTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const panels = document.querySelectorAll('.tab-panel');

        function switchTab(tabId) {
            state.currentTab = tabId;
            tabs.forEach(t => {
                t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
            });
            panels.forEach(p => {
                p.classList.toggle('active', p.id === `tab-${tabId}`);
            });

            // Re-render / update charts for the newly visible tab
            setTimeout(() => {
                if (window.KanimeralaCharts && window.KanimeralaCharts.renderTabCharts) {
                    window.KanimeralaCharts.renderTabCharts(tabId, data);
                }
            }, 60);

            // Update URL hash safely without jumping
            try {
                history.replaceState(null, '', '#' + tabId);
            } catch(e) {}
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        tabs.forEach(t => {
            t.addEventListener('click', (e) => {
                e.preventDefault();
                const target = t.getAttribute('data-tab');
                switchTab(target);
            });
        });

        // Check URL hash on load
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(`tab-${hash}`)) {
            switchTab(hash);
        } else {
            switchTab('overview');
        }
    }

    // -------------------------------------------------------------
    // Theme Switcher
    // -------------------------------------------------------------
    function initThemeToggle() {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', state.theme);
            localStorage.setItem('km_theme', state.theme);
            updateThemeIcon();
            KanimeralaCharts.updateTheme();
        });
    }

    function updateThemeIcon() {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        if (state.theme === 'light') {
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            btn.title = "Switch to Dark Mode";
        } else {
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
            btn.title = "Switch to Light Mode";
        }
    }

    // -------------------------------------------------------------
    // Search & Filtering
    // -------------------------------------------------------------
    function initSearchAndFilters() {
        const searchInput = document.getElementById('hhSearchInput');
        const filterCat = document.getElementById('filterCategory');
        const filterPov = document.getElementById('filterPoverty');
        const filterHouse = document.getElementById('filterHouseType');
        const filterDrain = document.getElementById('filterDrainage');
        const filterGriev = document.getElementById('filterGrievance');
        const btnGrid = document.getElementById('viewGridBtn');
        const btnTable = document.getElementById('viewTableBtn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value.toLowerCase().trim();
                renderHouseholds();
            });
        }

        if (filterCat) {
            filterCat.addEventListener('change', (e) => {
                state.filterCategory = e.target.value;
                renderHouseholds();
            });
        }

        if (filterPov) {
            filterPov.addEventListener('change', (e) => {
                state.filterPoverty = e.target.value;
                renderHouseholds();
            });
        }

        if (filterHouse) {
            filterHouse.addEventListener('change', (e) => {
                state.filterHouseType = e.target.value;
                renderHouseholds();
            });
        }

        if (filterDrain) {
            filterDrain.addEventListener('change', (e) => {
                state.filterDrainage = e.target.value;
                renderHouseholds();
            });
        }

        if (filterGriev) {
            filterGriev.addEventListener('change', (e) => {
                state.filterGrievance = e.target.value;
                renderHouseholds();
            });
        }

        if (btnGrid && btnTable) {
            btnGrid.addEventListener('click', () => {
                state.viewMode = 'grid';
                btnGrid.classList.add('active');
                btnTable.classList.remove('active');
                renderHouseholds();
            });
            btnTable.addEventListener('click', () => {
                state.viewMode = 'table';
                btnTable.classList.add('active');
                btnGrid.classList.remove('active');
                renderHouseholds();
            });
        }
    }

    function getFilteredHouseholds() {
        return data.households.filter(h => {
            // Search
            if (state.searchQuery) {
                const q = state.searchQuery;
                const matchHead = h.headName.toLowerCase().includes(q);
                const matchCode = h.code.toLowerCase().includes(q);
                const matchMobile = (h.mobileNumber || '').includes(q);
                const matchSurveyor = (h.surveyorName || '').toLowerCase().includes(q);
                const matchProduce = (h.agriculturalProduce || '').toLowerCase().includes(q);
                const matchMember = h.members.some(m => m.name.toLowerCase().includes(q));
                const matchRemark = (h.remarks || '').toLowerCase().includes(q);

                if (!matchHead && !matchCode && !matchMobile && !matchSurveyor && !matchProduce && !matchMember && !matchRemark) {
                    return false;
                }
            }

            // Category Filter
            if (state.filterCategory !== 'all') {
                const hasCategory = h.members.some(m => m.category === state.filterCategory);
                if (!hasCategory) return false;
            }

            // Poverty Filter
            if (state.filterPoverty !== 'all') {
                if (state.filterPoverty === 'BPL' && !h.povertyStatus.includes('BPL')) return false;
                if (state.filterPoverty === 'APL' && !h.povertyStatus.includes('APL')) return false;
            }

            // House Type Filter
            if (state.filterHouseType !== 'all') {
                if (!h.houseType.toLowerCase().includes(state.filterHouseType.toLowerCase())) return false;
            }

            // Drainage Filter
            if (state.filterDrainage !== 'all') {
                const isDeficit = h.drainageFacility.toLowerCase().includes('no') || 
                                  h.drainageFacility.toLowerCase().includes('problem') || 
                                  h.drainageFacility.toLowerCase().includes('none');
                if (state.filterDrainage === 'deficit' && !isDeficit) return false;
                if (state.filterDrainage === 'adequate' && isDeficit) return false;
            }

            // Grievance Filter
            if (state.filterGrievance !== 'all') {
                const hasGrievance = h.remarks && h.remarks.trim() !== '' && 
                                     !['no', 'no problem', 'none'].includes(h.remarks.trim().toLowerCase());
                if (state.filterGrievance === 'yes' && !hasGrievance) return false;
                if (state.filterGrievance === 'no' && hasGrievance) return false;
            }

            return true;
        });
    }

    // -------------------------------------------------------------
    // Render Households
    // -------------------------------------------------------------
    function renderHouseholds() {
        const filtered = getFilteredHouseholds();
        const container = document.getElementById('householdsContainer');
        const countBadge = document.getElementById('resultsCount');

        if (countBadge) {
            countBadge.textContent = `${filtered.length} of ${data.households.length} Households`;
        }

        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-tertiary); margin-bottom: 0.75rem;">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">No Matching Households Found</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Try relaxing your search keywords or resetting the filters.</p>
                </div>
            `;
            return;
        }

        if (state.viewMode === 'grid') {
            container.className = 'household-grid';
            container.innerHTML = filtered.map(h => {
                const primaryCat = h.members.length > 0 ? h.members[0].category : 'ST';
                const isBpl = h.povertyStatus.includes('BPL');
                const hasRemark = h.remarks && h.remarks.trim() !== '' && !['no', 'no problem', 'none'].includes(h.remarks.trim().toLowerCase());

                return `
                    <div class="household-card" data-code="${h.code}">
                        <div>
                            <div class="hh-card-header">
                                <div>
                                    <div class="hh-head-name">${h.headName}</div>
                                    <div class="hh-phone">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        ${h.mobileNumber || 'Not provided'}
                                    </div>
                                </div>
                                <span class="hh-code-badge">${h.code}</span>
                            </div>

                            <div class="hh-tags">
                                <span class="tag tag-${primaryCat.toLowerCase()}">${primaryCat}</span>
                                <span class="tag ${isBpl ? 'tag-bpl' : 'tag-apl'}">${isBpl ? 'BPL' : 'APL'}</span>
                                <span class="tag">${h.familyMembersCount} Members</span>
                                ${h.agriculturalProduce && h.agriculturalProduce !== 'None' ? `<span class="tag" style="background: rgba(245, 158, 11, 0.15); color: var(--accent-amber);">${h.agriculturalProduce.split(',')[0]}</span>` : ''}
                            </div>

                            <div class="hh-details-list">
                                <div class="hh-detail-item">
                                    <span class="hh-detail-label">House Type</span>
                                    <span class="hh-detail-val">${h.houseType.split(' ')[0]}</span>
                                </div>
                                <div class="hh-detail-item">
                                    <span class="hh-detail-label">Toilet Facility</span>
                                    <span class="hh-detail-val">${h.toiletFacility}</span>
                                </div>
                                <div class="hh-detail-item">
                                    <span class="hh-detail-label">Drinking Water</span>
                                    <span class="hh-detail-val">${h.drinkingWater.includes('Mineral') ? 'Mineral Cans' : 'Tap Water'}</span>
                                </div>
                                <div class="hh-detail-item">
                                    <span class="hh-detail-label">Land Owned</span>
                                    <span class="hh-detail-val">${h.landAreaOwned ? h.landAreaOwned + ' Acres' : 'Landless'}</span>
                                </div>
                            </div>
                        </div>

                        ${hasRemark ? `
                            <div class="hh-remark-snippet" title="${h.remarks}">
                                "${h.remarks.length > 70 ? h.remarks.substring(0, 70) + '...' : h.remarks}"
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else {
            // Table View
            container.className = 'table-responsive';
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Head Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Members</th>
                            <th>Produce / Land</th>
                            <th>Water Source</th>
                            <th>Grievance / Issue</th>
                            <th>Surveyor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(h => {
                            const primaryCat = h.members.length > 0 ? h.members[0].category : 'ST';
                            const isBpl = h.povertyStatus.includes('BPL');
                            const hasRemark = h.remarks && h.remarks.trim() !== '' && !['no', 'no problem', 'none'].includes(h.remarks.trim().toLowerCase());
                            return `
                                <tr data-code="${h.code}">
                                    <td><span class="hh-code-badge">${h.code}</span></td>
                                    <td><strong>${h.headName}</strong><br><small style="color:var(--text-tertiary)">${h.mobileNumber || ''}</small></td>
                                    <td><span class="tag tag-${primaryCat.toLowerCase()}">${primaryCat}</span></td>
                                    <td><span class="tag ${isBpl ? 'tag-bpl' : 'tag-apl'}">${isBpl ? 'BPL' : 'APL'}</span></td>
                                    <td>${h.familyMembersCount}</td>
                                    <td>${h.agriculturalProduce || 'None'}<br><small style="color:var(--text-tertiary)">${h.landAreaOwned ? h.landAreaOwned + ' ac' : '-'}</small></td>
                                    <td>${h.drinkingWater}</td>
                                    <td style="max-width:200px; color: ${hasRemark ? 'var(--accent-rose)' : 'var(--text-tertiary)'}">
                                        ${hasRemark ? (h.remarks.length > 45 ? h.remarks.substring(0, 45) + '...' : h.remarks) : 'None'}
                                    </td>
                                    <td><small>${h.surveyorName.split(',')[0]}</small></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        // Attach click listener for modal
        container.querySelectorAll('[data-code]').forEach(el => {
            el.addEventListener('click', () => {
                const code = el.getAttribute('data-code');
                openHouseholdModal(code);
            });
        });
    }

    // -------------------------------------------------------------
    // Household Detail Modal
    // -------------------------------------------------------------
    function initModal() {
        const overlay = document.getElementById('householdModalOverlay');
        const closeBtn = document.getElementById('modalCloseBtn');

        if (!overlay) return;

        function closeModal() {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                closeModal();
            }
        });
    }

    function openHouseholdModal(code) {
        const hh = data.households.find(h => h.code === code);
        if (!hh) return;

        const overlay = document.getElementById('householdModalOverlay');
        const titleEl = document.getElementById('modalTitle');
        const subtitleEl = document.getElementById('modalSubtitle');
        const bodyEl = document.getElementById('modalBody');

        if (!overlay || !bodyEl) return;

        titleEl.textContent = `${hh.headName} (${hh.code})`;
        subtitleEl.textContent = `${hh.povertyStatus} • ${hh.houseOwnership} • Mobile: ${hh.mobileNumber || 'N/A'}`;

        const surveyDateFormatted = hh.surveyDate ? new Date(hh.surveyDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'June 7, 2026';

        bodyEl.innerHTML = `
            <!-- Housing & Basic Amenities -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Housing, Water & Amenities
                </div>
                <div class="modal-grid-3">
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">House Structure</span>
                        <span class="modal-grid-val">${hh.houseType}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Toilet Facility</span>
                        <span class="modal-grid-val">${hh.toiletFacility}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Drainage System</span>
                        <span class="modal-grid-val" style="color: ${hh.drainageFacility.toLowerCase().includes('no') ? 'var(--accent-rose)' : 'inherit'}">${hh.drainageFacility}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Drinking Water</span>
                        <span class="modal-grid-val">${hh.drinkingWater}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Water Source</span>
                        <span class="modal-grid-val">${hh.waterSource}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Cooking Fuel</span>
                        <span class="modal-grid-val">${hh.cookingFuel}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Electricity Supply</span>
                        <span class="modal-grid-val">${hh.electricityConnection} (${hh.electricityHours} hrs/day)</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Solar Panels</span>
                        <span class="modal-grid-val">${hh.solarPanels}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Mobile Network</span>
                        <span class="modal-grid-val">${hh.mobileNetwork}</span>
                    </div>
                </div>
            </div>

            <!-- Agriculture & Economic Profile -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    Agriculture, Assets & Welfare
                </div>
                <div class="modal-grid-3">
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Main Income Source</span>
                        <span class="modal-grid-val">${hh.mainIncomeSource || 'None'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Annual Income</span>
                        <span class="modal-grid-val">₹${hh.annualIncome ? hh.annualIncome.toLocaleString('en-IN') : '0'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Agricultural Land Owned</span>
                        <span class="modal-grid-val">${hh.landAreaOwned ? hh.landAreaOwned + ' Acres' : '0 (Landless)'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Primary Crops</span>
                        <span class="modal-grid-val">${hh.agriculturalProduce || 'None'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Irrigation System</span>
                        <span class="modal-grid-val">${hh.irrigationSystem || 'None'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Livestock Details</span>
                        <span class="modal-grid-val">${hh.livestockDetails || 'None'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Home Appliances</span>
                        <span class="modal-grid-val">${hh.appliances || 'None'}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Vehicles Owned</span>
                        <span class="modal-grid-val">${formatVehicles(hh.vehicles)}</span>
                    </div>
                    <div class="modal-grid-item">
                        <span class="modal-grid-label">Government Schemes Availed</span>
                        <span class="modal-grid-val">${hh.governmentSchemes || 'None recorded'}</span>
                    </div>
                </div>
            </div>

            <!-- Family Members Roster -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Family Members Roster (${hh.members.length} individuals)
                </div>
                ${hh.members.length > 0 ? `
                    <div class="table-responsive">
                        <table class="member-chip-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Relation</th>
                                    <th>Age/Gender</th>
                                    <th>Education</th>
                                    <th>Occupation</th>
                                    <th>Banking</th>
                                    <th>MNREGA</th>
                                    <th>Health Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hh.members.map(m => `
                                    <tr>
                                        <td><strong>${m.name}</strong></td>
                                        <td>${m.relation}</td>
                                        <td>${m.age || 'N/A'} yrs • ${m.gender}</td>
                                        <td>${m.education}</td>
                                        <td>${m.occupation || 'None'}</td>
                                        <td>${m.bankStatus.includes('No') ? '<span style="color:var(--accent-rose)">No Account</span>' : (m.bankName || 'Govt Account')}</td>
                                        <td>${m.mnregaJobCard === 'Yes' ? '<span style="color:var(--primary-400)">✓ Card</span>' : 'No'}</td>
                                        <td style="color: ${m.healthProblems && m.healthProblems.toLowerCase() !== 'no' ? 'var(--accent-rose)' : 'inherit'}">
                                            ${m.healthProblems || 'No'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p style="color: var(--text-tertiary); font-size: 0.85rem; font-style: italic;">No individual member records available for this household entry.</p>
                `}
            </div>

            <!-- Citizen Remarks / Grievances -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Field Remarks & Citizen Grievances
                </div>
                <div style="background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border-left: 4px solid ${hh.remarks ? 'var(--accent-rose)' : 'var(--primary-500)'};">
                    <p style="font-size: 0.92rem; line-height: 1.5; color: var(--text-primary); font-style: ${hh.remarks ? 'italic' : 'normal'};">
                        ${hh.remarks ? `"${hh.remarks}"` : 'No specific problem or remark reported during the household survey.'}
                    </p>
                </div>
            </div>

            <!-- Survey Metadata -->
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); border-top: 1px solid var(--border-subtle); padding-top: 1rem; margin-top: 1rem;">
                <span>Surveyor: <strong>${hh.surveyorName}</strong></span>
                <span>Survey Date: ${surveyDateFormatted}</span>
                <span>Source File: ${hh.file}</span>
            </div>
        `;

        document.body.style.overflow = 'hidden';
        overlay.classList.add('open');
    }

    function formatVehicles(v) {
        if (!v) return 'None';
        const parts = [];
        if (v.twoWheeler) parts.push(`${v.twoWheeler} Two-Wheeler`);
        if (v.cycle) parts.push(`${v.cycle} Bicycle`);
        if (v.sixPlusWheeler) parts.push(`${v.sixPlusWheeler} Commercial Vehicle`);
        if (v.other) parts.push(`${v.other} Other`);
        return parts.length > 0 ? parts.join(', ') : 'None';
    }

    // -------------------------------------------------------------
    // Populate Grievance Matrix
    // -------------------------------------------------------------
    function populateGrievanceList() {
        const container = document.getElementById('grievanceCardsContainer');
        if (!container) return;

        const grievances = data.grievances;
        container.innerHTML = grievances.map(g => {
            const catBadges = g.categories.map(c => `
                <span class="tag" style="background: rgba(244, 63, 94, 0.12); color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.25);">
                    ${c}
                </span>
            `).join('');

            return `
                <div class="grievance-card" data-code="${g.code}">
                    <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                            ${catBadges}
                        </div>
                        <div class="grievance-quote">"${g.text}"</div>
                    </div>
                    <div class="grievance-meta">
                        <span><strong>${g.headName}</strong> (${g.code})</span>
                        <a href="javascript:void(0)" style="font-weight: 600; color: var(--primary-400);">View Profile →</a>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.grievance-card').forEach(c => {
            c.addEventListener('click', () => {
                const code = c.getAttribute('data-code');
                openHouseholdModal(code);
            });
        });
    }

    // -------------------------------------------------------------
    // Exports
    // -------------------------------------------------------------
    function initExports() {
        const exportHhBtn = document.getElementById('exportHhCsvBtn');
        const exportMembersBtn = document.getElementById('exportMembersCsvBtn');
        const printBtn = document.getElementById('printReportBtn');

        if (exportHhBtn) {
            exportHhBtn.addEventListener('click', () => exportHouseholdsCsv());
        }

        if (exportMembersBtn) {
            exportMembersBtn.addEventListener('click', () => exportMembersCsv());
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }
    }

    function exportHouseholdsCsv() {
        const headers = ['Code', 'Head Name', 'Mobile', 'Members Count', 'Poverty Status', 'House Type', 'Toilet Facility', 'Drinking Water', 'Water Source', 'Drainage', 'Main Income', 'Annual Income (INR)', 'Land Owned (Acres)', 'Produce', 'Schemes', 'Remarks', 'Surveyor'];
        const rows = data.households.map(h => [
            h.code,
            `"${h.headName.replace(/"/g, '""')}"`,
            h.mobileNumber,
            h.familyMembersCount,
            `"${h.povertyStatus}"`,
            `"${h.houseType}"`,
            `"${h.toiletFacility}"`,
            `"${h.drinkingWater}"`,
            `"${h.waterSource}"`,
            `"${h.drainageFacility}"`,
            `"${h.mainIncomeSource}"`,
            h.annualIncome,
            h.landAreaOwned,
            `"${(h.agriculturalProduce || '').replace(/"/g, '""')}"`,
            `"${(h.governmentSchemes || '').replace(/"/g, '""')}"`,
            `"${(h.remarks || '').replace(/"/g, '""')}"`,
            `"${h.surveyorName}"`
        ]);

        downloadCsv([headers, ...rows], 'Kanimerala_UBA_Households_Survey.csv');
    }

    function exportMembersCsv() {
        const headers = ['Household Code', 'Name', 'Relation', 'Age', 'Gender', 'Category', 'Education', 'Occupation', 'Bank Status', 'Bank Name', 'MNREGA Card', 'Health Problems'];
        const rows = data.members.map(m => [
            m.householdCode,
            `"${m.name.replace(/"/g, '""')}"`,
            `"${m.relation}"`,
            m.age || '',
            m.gender,
            m.category,
            `"${m.education}"`,
            `"${m.occupation}"`,
            `"${m.bankStatus}"`,
            `"${m.bankName}"`,
            m.mnregaJobCard,
            `"${(m.healthProblems || '').replace(/"/g, '""')}"`
        ]);

        downloadCsv([headers, ...rows], 'Kanimerala_UBA_Village_Population_Census.csv');
    }

    function downloadCsv(array, filename) {
        const csvContent = "data:text/csv;charset=utf-8," + array.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
