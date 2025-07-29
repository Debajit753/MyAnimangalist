// MyAnimangalist - Fixed Critical Bugs & Dark Mode Only with IndexedDB
class MyAnimangalistApp {
    constructor() {
        this.entries = [];
        this.currentTab = 'anime';
        this.currentRating = 0;
        this.editingEntry = null;
        this.currentSearchResult = null;
        this.searchResults = { anime: [], manga: [] };

        // API configuration
        this.jikanBaseUrl = 'https://api.jikan.moe/v4';
        this.rateLimitDelay = 350;
        this.lastRequestTime = 0;

        // IndexedDB configuration
        this.dbName = 'myanimangalist';
        this.storeName = 'entries';
        this.dbVersion = 1;
        this.db = null;

        // Confirmation resolver
        this._confirmResolver = null;

        this.init();
    }

    async init() {
        try {
            await this.openDatabase();
            await this.loadFromDB();
        } catch (error) {
            console.error('Database initialization failed:', error);
            this.showToast('Database unavailable, using memory storage', 'error');
        }
        
        this.setupEventListeners();
        this.renderCurrentTab();
        this.updateStatistics();
    }

    /* ============================= IndexedDB ============================= */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    getStore(mode = 'readonly') {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.transaction(this.storeName, mode).objectStore(this.storeName);
    }

    async addEntryToDB(entry) {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const store = this.getStore('readwrite');
            const request = store.add(entry);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async updateEntryInDB(entry) {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const store = this.getStore('readwrite');
            const request = store.put(entry);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteEntryFromDB(id) {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const store = this.getStore('readwrite');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadFromDB() {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const store = this.getStore('readonly');
            const request = store.getAll();
            request.onsuccess = () => {
                this.entries = request.result || [];
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /* ============================= EVENT LISTENERS ============================= */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.mainTab);
            });
        });

        // Search functionality
        ['anime', 'manga'].forEach(type => {
            const searchBtn = document.getElementById(`${type}-search-btn`);
            const searchInput = document.getElementById(`${type}-search`);

            if (searchBtn) {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.performSearch(type);
                });
            }

            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.performSearch(type);
                    }
                });

                searchInput.addEventListener('input', (e) => {
                    if (e.target.value.trim() === '') {
                        this.hideSearchResults(type);
                    }
                });
            }
        });

        // Manual add buttons
        const addAnimeBtn = document.getElementById('add-anime-manual');
        const addMangaBtn = document.getElementById('add-manga-manual');
        
        if (addAnimeBtn) {
            addAnimeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openEntryModal('anime');
            });
        }
        
        if (addMangaBtn) {
            addMangaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openEntryModal('manga');
            });
        }

        // Filter changes
        ['anime', 'manga'].forEach(type => {
            ['status', 'rating', 'sort'].forEach(filterType => {
                const filter = document.getElementById(`${type}-${filterType}-filter`);
                if (filter) {
                    filter.addEventListener('change', () => {
                        this.renderMediaTab(type);
                    });
                }
            });
        });

        // Modal events
        this.setupModalEvents();

        // Import/Export buttons
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');

        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportData();
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openImportModal();
            });
        }

        this.setupImportEvents();
    }

    /* ============================= SEARCH ============================= */
    async performSearch(type) {
        const searchInput = document.getElementById(`${type}-search`);
        if (!searchInput) return;

        const query = searchInput.value.trim();
        if (!query) {
            this.showToast('Please enter a search term', 'error');
            return;
        }

        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await this.sleep(this.rateLimitDelay - timeSinceLastRequest);
        }

        this.showLoading();

        try {
            const url = `${this.jikanBaseUrl}/${type}?q=${encodeURIComponent(query)}&limit=10`;
            const response = await fetch(url);
            
            this.lastRequestTime = Date.now();

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.searchResults[type] = data.data || [];
            this.displaySearchResults(type, this.searchResults[type]);

        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed. Please try again.', 'error');
            this.displaySearchResults(type, []);
        } finally {
            this.hideLoading();
        }
    }

    displaySearchResults(type, results) {
        const container = document.getElementById(`${type}-search-results`);
        if (!container) return;

        if (!results || results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found. Try a different search term.</div>';
            container.classList.remove('hidden');
            return;
        }

        container.innerHTML = results.map((item, index) => {
            const poster = item.images?.jpg?.image_url || '';
            const title = item.title || item.title_english || 'Unknown Title';
            const year = this.getItemYear(item, type);
            const meta = this.getItemMeta(item, type);
            const synopsis = (item.synopsis || 'No synopsis available.').substring(0, 200) + '...';

            return `
                <div class="search-result-item" data-result-index="${index}" data-result-type="${type}">
                    ${poster ? `<img src="${poster}" alt="${this.escapeHtml(title)}" class="search-result-poster" onerror="this.style.display='none'">` : '<div class="search-result-poster" style="background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5);">No Image</div>'}
                    <div class="search-result-info">
                        <div class="search-result-title">${this.escapeHtml(title)}</div>
                        <div class="search-result-meta">${year} • ${meta}</div>
                        <div class="search-result-synopsis">${this.escapeHtml(synopsis)}</div>
                        <button class="btn btn--primary btn--sm search-add-btn" data-index="${index}" data-type="${type}">Add to List</button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners to add buttons
        container.querySelectorAll('.search-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(e.target.dataset.index);
                const type = e.target.dataset.type;
                this.addFromSearchResult(index, type);
            });
        });

        container.classList.remove('hidden');
    }

    hideSearchResults(type) {
        const container = document.getElementById(`${type}-search-results`);
        if (container) {
            container.classList.add('hidden');
        }
    }

    getItemYear(item, type) {
        if (type === 'anime' && item.aired?.from) {
            return new Date(item.aired.from).getFullYear();
        }
        if (type === 'manga' && item.published?.from) {
            return new Date(item.published.from).getFullYear();
        }
        return 'Unknown';
    }

    getItemMeta(item, type) {
        if (type === 'anime') {
            return `${item.episodes || '?'} episodes`;
        }
        return `${item.chapters || '?'} chapters`;
    }

    addFromSearchResult(index, type) {
        const result = this.searchResults[type][index];
        if (!result) return;

        this.hideSearchResults(type);
        this.openEntryModal(type, result);
    }

    /* ============================= MODAL MANAGEMENT ============================= */
    setupModalEvents() {
        // Entry modal
        const entryModal = document.getElementById('entry-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-entry');
        const form = document.getElementById('entry-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeEntryModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeEntryModal();
            });
        }

        if (entryModal) {
            entryModal.addEventListener('click', (e) => {
                if (e.target === entryModal.querySelector('.modal__overlay')) {
                    this.closeEntryModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEntry();
            });
        }

        // Confirmation modal
        const confirmModal = document.getElementById('confirm-modal');
        const confirmClose = document.getElementById('close-confirm-modal');
        const confirmNo = document.getElementById('confirm-no');
        const confirmYes = document.getElementById('confirm-yes');

        if (confirmClose) {
            confirmClose.addEventListener('click', () => this.hideConfirm(false));
        }

        if (confirmNo) {
            confirmNo.addEventListener('click', () => this.hideConfirm(false));
        }

        if (confirmYes) {
            confirmYes.addEventListener('click', () => this.hideConfirm(true));
        }

        if (confirmModal) {
            confirmModal.addEventListener('click', (e) => {
                if (e.target === confirmModal.querySelector('.modal__overlay')) {
                    this.hideConfirm(false);
                }
            });
        }
    }

    openEntryModal(type, searchResult = null) {
        this.editingEntry = null;
        this.currentRating = 0;
        this.currentSearchResult = searchResult;

        const modal = document.getElementById('entry-modal');
        const titleEl = document.getElementById('modal-title');
        const typeEl = document.getElementById('entry-type');
        const statusEl = document.getElementById('entry-status');

        if (titleEl) titleEl.textContent = searchResult ? 'Add Entry' : 'Add Entry';
        if (typeEl) typeEl.value = type;

        // Set status options
        const statusOptions = this.getStatusOptions(type);
        if (statusEl) {
            statusEl.innerHTML = statusOptions.map(status => 
                `<option value="${status}">${status}</option>`
            ).join('');
        }

        // Clear and pre-fill form
        if (searchResult) {
            this.prefillFromSearchResult(type, searchResult);
        } else {
            this.clearModalForm();
        }

        this.setupStarRating();

        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    prefillFromSearchResult(type, result) {
        document.getElementById('entry-title').value = result.title || result.title_english || '';
        document.getElementById('entry-year').value = this.getItemYear(result, type);
        document.getElementById('entry-synopsis').value = result.synopsis || '';
        document.getElementById('total-progress').value = type === 'anime' ? (result.episodes || '') : (result.chapters || '');
    }

    getStatusOptions(type) {
        if (type === 'anime') {
            return ['Watching', 'Completed', 'Plan to Watch', 'Dropped', 'On Hold'];
        } else {
            return ['Reading', 'Completed', 'Plan to Read', 'Dropped', 'On Hold'];
        }
    }

    clearModalForm() {
        const form = document.getElementById('entry-form');
        if (form) {
            const inputs = form.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
            inputs.forEach(input => {
                if (input.type !== 'hidden') {
                    input.value = '';
                }
            });
        }

        this.currentRating = 0;
        this.updateRatingDisplay();
    }

    closeEntryModal() {
        const modal = document.getElementById('entry-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentSearchResult = null;
        this.editingEntry = null;
        this.currentRating = 0;
    }

    setupStarRating() {
        const container = document.getElementById('modal-star-rating');
        if (!container) return;

        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '★';
            star.dataset.rating = i;
            
            star.addEventListener('click', () => {
                this.currentRating = i;
                this.updateRatingDisplay();
            });

            star.addEventListener('mouseenter', () => {
                this.highlightStars(i);
            });

            star.addEventListener('mouseleave', () => {
                this.highlightStars(this.currentRating);
            });

            container.appendChild(star);
        }

        this.updateRatingDisplay();
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('#modal-star-rating .star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }

    updateRatingDisplay() {
        this.highlightStars(this.currentRating);
        const ratingDisplay = document.getElementById('rating-display');
        if (ratingDisplay) {
            ratingDisplay.textContent = this.currentRating;
        }
    }

    showConfirm(message) {
        return new Promise((resolve) => {
            this._confirmResolver = resolve;
            document.getElementById('confirm-message').textContent = message;
            document.getElementById('confirm-modal').classList.remove('hidden');
        });
    }

    hideConfirm(result) {
        document.getElementById('confirm-modal').classList.add('hidden');
        if (this._confirmResolver) {
            this._confirmResolver(result);
            this._confirmResolver = null;
        }
    }

    /* ============================= ENTRY OPERATIONS ============================= */
    async saveEntry() {
        const formData = this.getFormData();
        
        if (!formData.title.trim()) {
            this.showToast('Please enter a title', 'error');
            return;
        }

        // Check for duplicates (only when adding new)
        if (!this.editingEntry) {
            const isDuplicate = this.entries.some(entry => 
                entry.title.toLowerCase() === formData.title.toLowerCase() && 
                entry.type === formData.type
            );

            if (isDuplicate) {
                this.showToast('This entry already exists in your list', 'error');
                return;
            }
        }

        let entry;

        if (this.editingEntry) {
            // Update existing entry
            entry = { ...this.editingEntry, ...formData };
            try {
                await this.updateEntryInDB(entry);
                this.entries = this.entries.map(e => e.id === entry.id ? entry : e);
                this.showToast('Entry updated successfully!', 'success');
            } catch (error) {
                console.error('Update failed:', error);
                this.showToast('Failed to update entry', 'error');
                return;
            }
        } else {
            // Create new entry
            entry = {
                id: `${formData.type}_${Date.now()}`,
                ...formData,
                dateAdded: new Date().toISOString()
            };

            // Add search result data if available
            if (this.currentSearchResult) {
                entry.imageUrl = this.currentSearchResult.images?.jpg?.image_url || '';
                entry.malId = this.currentSearchResult.mal_id;
            }

            try {
                await this.addEntryToDB(entry);
                this.entries.unshift(entry);
                this.showToast('Entry added successfully!', 'success');
            } catch (error) {
                console.error('Save failed:', error);
                this.showToast('Failed to save entry', 'error');
                return;
            }
        }

        this.closeEntryModal();
        this.renderCurrentTab();
        this.updateStatistics();
    }

    getFormData() {
        return {
            type: document.getElementById('entry-type')?.value || 'anime',
            title: document.getElementById('entry-title')?.value?.trim() || '',
            year: document.getElementById('entry-year')?.value ? parseInt(document.getElementById('entry-year').value) : null,
            status: document.getElementById('entry-status')?.value || 'Completed',
            rating: this.currentRating,
            genres: this.parseGenres(document.getElementById('entry-genres')?.value || ''),
            synopsis: document.getElementById('entry-synopsis')?.value?.trim() || '',
            notes: document.getElementById('entry-notes')?.value?.trim() || '',
            progress: {
                current: parseInt(document.getElementById('current-progress')?.value || '0'),
                total: parseInt(document.getElementById('total-progress')?.value || '0')
            }
        };
    }

    parseGenres(genresString) {
        return genresString
            .split(',')
            .map(genre => genre.trim())
            .filter(genre => genre.length > 0);
    }

    async deleteEntry(id) {
        const confirmDelete = await this.showConfirm('Are you sure you want to delete this entry? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            await this.deleteEntryFromDB(id);
            this.entries = this.entries.filter(e => e.id !== id);
            this.renderCurrentTab();
            this.updateStatistics();
            this.showToast('Entry deleted successfully!', 'success');
        } catch (error) {
            console.error('Delete failed:', error);
            this.showToast('Failed to delete entry', 'error');
        }
    }

    editEntry(id) {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) return;

        this.editingEntry = entry;
        this.currentRating = entry.rating || 0;
        
        this.openEntryModal(entry.type);
        
        // Fill form fields
        document.getElementById('modal-title').textContent = 'Edit Entry';
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-year').value = entry.year || '';
        document.getElementById('entry-status').value = entry.status;
        document.getElementById('entry-genres').value = entry.genres?.join(', ') || '';
        document.getElementById('entry-synopsis').value = entry.synopsis || '';
        document.getElementById('entry-notes').value = entry.notes || '';
        document.getElementById('current-progress').value = entry.progress?.current || 0;
        document.getElementById('total-progress').value = entry.progress?.total || 0;
        
        this.updateRatingDisplay();
    }

    /* ============================= TAB & RENDERING ============================= */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mainTab === tabName);
        });

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab content
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }

        this.renderCurrentTab();
    }

    renderCurrentTab() {
        if (this.currentTab === 'anime' || this.currentTab === 'manga') {
            this.renderMediaTab(this.currentTab);
        } else if (this.currentTab === 'stats') {
            this.renderStatistics();
        }
    }

    renderMediaTab(type) {
        const grid = document.getElementById(`${type}-grid`);
        const emptyState = document.getElementById(`${type}-empty-state`);
        
        if (!grid || !emptyState) return;

        let entries = this.entries.filter(entry => entry.type === type);

        // Apply filters
        const statusFilter = document.getElementById(`${type}-status-filter`)?.value;
        const ratingFilter = document.getElementById(`${type}-rating-filter`)?.value;
        const sortFilter = document.getElementById(`${type}-sort-filter`)?.value || 'dateAdded';

        if (statusFilter) {
            entries = entries.filter(entry => entry.status === statusFilter);
        }

        if (ratingFilter) {
            const minRating = parseInt(ratingFilter);
            entries = entries.filter(entry => (entry.rating || 0) >= minRating);
        }

        // Apply sorting
        entries.sort((a, b) => {
            switch (sortFilter) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'status':
                    return a.status.localeCompare(b.status);
                default: // dateAdded
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });

        if (entries.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.innerHTML = entries
            .map(entry => this.createEntryCard(entry))
            .join('');

        this.attachCardEventListeners();
    }

    createEntryCard(entry) {
        const stars = this.createStarsDisplay(entry.rating || 0);
        const progressBar = this.createProgressBar(entry.progress);
        const statusClass = entry.status.toLowerCase().replace(/\s+/g, '-');
        
        return `
            <div class="entry-card" data-id="${entry.id}">
                ${entry.imageUrl ? `<img src="${entry.imageUrl}" alt="${this.escapeHtml(entry.title)}" class="entry-card__poster" onerror="this.style.display='none'">` : ''}
                <div class="entry-card__content">
                    <div class="entry-card__header">
                        <h3 class="entry-card__title">${this.escapeHtml(entry.title)}</h3>
                        <div class="entry-card__actions">
                            <button class="action-btn action-btn--edit" data-id="${entry.id}">Edit</button>
                            <button class="action-btn action-btn--delete" data-id="${entry.id}">Delete</button>
                        </div>
                    </div>
                    
                    <div class="entry-card__meta">
                        <span class="entry-card__badge">${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>
                        ${entry.year ? `<span class="entry-card__badge">${entry.year}</span>` : ''}
                        <span class="status status--${statusClass}">${entry.status}</span>
                    </div>

                    <div class="entry-card__rating">
                        <div class="rating-stars">${stars}</div>
                        <span class="rating-numeric">${entry.rating || 0}/5</span>
                    </div>

                    ${progressBar}

                    ${entry.genres && entry.genres.length > 0 ? `
                        <div class="entry-card__genres">
                            <strong>Genres:</strong> ${entry.genres.join(', ')}
                        </div>
                    ` : ''}

                    ${entry.synopsis ? `
                        <div class="entry-card__synopsis">${this.escapeHtml(entry.synopsis)}</div>
                    ` : ''}

                    ${entry.notes ? `
                        <div class="entry-card__notes">"${this.escapeHtml(entry.notes)}"</div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createStarsDisplay(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const active = i <= rating ? 'active' : '';
            stars += `<span class="star ${active}">★</span>`;
        }
        return stars;
    }

    createProgressBar(progress) {
        if (!progress || (!progress.current && !progress.total)) return '';
        
        const current = progress.current || 0;
        const total = progress.total || 0;
        const percentage = total > 0 ? (current / total) * 100 : 0;
        
        return `
            <div class="entry-card__progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="progress-text">${current}${total > 0 ? ` / ${total}` : ''}</div>
            </div>
        `;
    }

    attachCardEventListeners() {
        document.querySelectorAll('.action-btn--edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editEntry(e.target.dataset.id);
            });
        });

        document.querySelectorAll('.action-btn--delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEntry(e.target.dataset.id);
            });
        });
    }

    /* ============================= STATISTICS ============================= */
    updateStatistics() {
        const total = this.entries.length;
        const completed = this.entries.filter(e => e.status === 'Completed').length;
        const inProgress = this.entries.filter(e => 
            e.status === 'Watching' || e.status === 'Reading'
        ).length;
        
        const avgRating = total > 0 ? 
            (this.entries.reduce((sum, e) => sum + (e.rating || 0), 0) / total).toFixed(1) : '0.0';

        const totalEl = document.getElementById('total-entries');
        const completedEl = document.getElementById('completed-entries');
        const inProgressEl = document.getElementById('in-progress-entries');
        const avgRatingEl = document.getElementById('avg-rating');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (inProgressEl) inProgressEl.textContent = inProgress;
        if (avgRatingEl) avgRatingEl.textContent = avgRating;
    }

    renderStatistics() {
        this.updateStatistics();
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    }

    renderCharts() {
        this.renderTypeChart();
        this.renderStatusChart();
    }

    renderTypeChart() {
        const ctx = document.getElementById('type-chart');
        if (!ctx) return;

        const typeCounts = {
            Anime: this.entries.filter(e => e.type === 'anime').length,
            Manga: this.entries.filter(e => e.type === 'manga').length
        };

        if (this.typeChart) {
            this.typeChart.destroy();
        }

        this.typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: ['#1FB8CD', '#FFC185']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderStatusChart() {
        const ctx = document.getElementById('status-chart');
        if (!ctx) return;

        const statusCounts = {};
        this.entries.forEach(entry => {
            statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
        });

        if (this.statusChart) {
            this.statusChart.destroy();
        }

        this.statusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    label: 'Count',
                    data: Object.values(statusCounts),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    /* ============================= IMPORT/EXPORT ============================= */
    exportData() {
        const data = {
            entries: this.entries,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myanimangalist-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    openImportModal() {
        const modal = document.getElementById('import-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeImportModal() {
        const modal = document.getElementById('import-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupImportEvents() {
        const closeImportBtn = document.getElementById('close-import-modal');
        const importJsonBtn = document.getElementById('import-json');

        if (closeImportBtn) {
            closeImportBtn.addEventListener('click', () => {
                this.closeImportModal();
            });
        }

        if (importJsonBtn) {
            importJsonBtn.addEventListener('click', () => {
                this.importJSON();
            });
        }

        const importModal = document.getElementById('import-modal');
        if (importModal) {
            importModal.addEventListener('click', (e) => {
                if (e.target === importModal.querySelector('.modal__overlay')) {
                    this.closeImportModal();
                }
            });
        }
    }

    async importJSON() {
        const fileInput = document.getElementById('json-file-input');
        if (!fileInput) return;
        
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Please select a JSON file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.entries || !Array.isArray(data.entries)) {
                    this.showToast('Invalid JSON format', 'error');
                    return;
                }

                const confirmImport = await this.showConfirm(`This will import ${data.entries.length} entries. Continue?`);
                if (!confirmImport) return;

                for (const entry of data.entries) {
                    // Ensure unique ID
                    entry.id = entry.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    try {
                        await this.addEntryToDB(entry);
                    } catch (error) {
                        // Skip duplicates or invalid entries
                        console.warn('Failed to import entry:', entry.title, error);
                    }
                }

                await this.loadFromDB();
                this.renderCurrentTab();
                this.updateStatistics();
                this.closeImportModal();
                this.showToast(`Imported ${data.entries.length} entries!`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Error parsing JSON file', 'error');
            }
        };
        reader.readAsText(file);
    }

    /* ============================= UTILITIES ============================= */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 4000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MyAnimangalistApp();
});