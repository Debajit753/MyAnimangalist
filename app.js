// MyAnimangalist Application - Anime, Manga, Manhwa, Manhua Tracker

class MyAnimangalistApp {
    constructor() {
        this.entries = [];
        this.currentTab = 'anime';
        this.currentRating = 0;
        this.editingEntry = null;
        this.searchTimeout = null;
        
        // API Configuration
        this.jikanBaseUrl = 'https://api.jikan.moe/v4';
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
        
        // Predefined data for manhwa and manhua
        this.manhwaData = [
            { id: 'solo-leveling', title: 'Solo Leveling', image: 'https://i.imgur.com/6Uo8wNV.jpg', chapters: 179, year: 2018, score: 8.7, synopsis: '10 years ago, after the Gate that connected the real world with the monster world opened, some of the ordinary, everyday people received the power to hunt monsters within the Gate. They are known as Hunters. However, not all Hunters are powerful. My name is Sung Jin-Woo, an E-rank Hunter. I\'m someone who has to risk his life in the lowliest of dungeons, the World\'s Weakest. Having no skills whatsoever to display, I barely earned the required money by fighting in low-leveled dungeons... at least until I found a hidden dungeon with the hardest difficulty within the D-rank dungeons! In the end, as I was accepting death, I suddenly received a strange power, a quest log that only I could see, a secret to leveling up that only I know about! If I trained in accordance with my quests and hunted monsters, my level would rise. Changing from the weakest Hunter to the strongest S-rank Hunter!' },
            { id: 'tower-of-god', title: 'Tower of God', image: 'https://i.imgur.com/yNZz8pL.jpg', chapters: 500, year: 2010, score: 8.5, synopsis: 'What do you desire? Money and wealth? Honor and pride? Authority and power? Revenge? Or something that transcends them all? Whatever you desire—it\'s here on the top floor. At the top of the tower exists everything in this world, and all of it can be yours. You can become a god. This is the story of the beginning and the end of Rachel, the girl who climbed the tower so she could see the stars, and Bam, the boy who needed nothing but her.' },
            { id: 'god-of-high-school', title: 'The God of High School', image: 'https://i.imgur.com/pXmRDvM.jpg', chapters: 569, year: 2011, score: 8.2, synopsis: 'While an island half-disappearing from the face of earth, a mysterious organization is sending out invitations for a tournament to every high school in the world. "The God of High School" tournament. The winners of this tournament will be granted any wish they want. Han Dae-Wi wants money because his friend is in the hospital and he needs to pay for his surgery. Yu Mi-Ra wants to continue her family\'s ancient martial arts. Jin Mo-Ri is...well, he just wants to fight against strong opponents.' },
            { id: 'noblesse', title: 'Noblesse', image: 'https://i.imgur.com/ABC123.jpg', chapters: 544, year: 2007, score: 8.4, synopsis: 'Rai wakes up from an 820-year-long sleep and starts his new life as a student in a high school founded by his loyal servant, Frankenstein. But his peaceful days with other human students are soon interrupted by mysterious attackers known as the "Unions".' },
            { id: 'true-beauty', title: 'True Beauty', image: 'https://i.imgur.com/DEF456.jpg', chapters: 200, year: 2018, score: 7.9, synopsis: 'After binge-watching beauty videos online, a shy comic book fan masters the art of makeup and sees her social standing skyrocket as she becomes her school\'s prettiest pretty girl overnight. But will her elite status be short-lived?' },
            { id: 'sweet-home', title: 'Sweet Home', image: 'https://i.imgur.com/GHI789.jpg', chapters: 141, year: 2017, score: 8.1, synopsis: 'Cha Hyun-soo is a high school student who becomes a recluse after his family dies in a car accident. He moves into a new apartment and encounters strange situations involving his neighbors who are turning into monsters.' },
            { id: 'lookism', title: 'Lookism', image: 'https://i.imgur.com/JKL012.jpg', chapters: 400, year: 2014, score: 8.3, synopsis: 'Park Hyung-suk is bullied at his old school because of his looks. At his new school, he wakes up in a perfect body. Now living a double life in two bodies, how long can he keep this secret?' },
            { id: 'unordinary', title: 'Unordinary', image: 'https://i.imgur.com/MNO345.jpg', chapters: 300, year: 2016, score: 7.8, synopsis: 'In a world where everyone has supernatural powers, John is the only one without any abilities. But is he really as powerless as he seems?' }
        ];
        
        this.manhuaData = [
            { id: 'tales-demons-gods', title: 'Tales of Demons and Gods', image: 'https://i.imgur.com/XYZ123.jpg', chapters: 400, year: 2015, score: 7.8, synopsis: 'Killed by a Sage Emperor and reborn as his 13 year old self, Nie Li was given a second chance at life. A second chance to change everything and save his loved ones and his beloved city. He shall once again battle with the Sage Emperor to avenge his death and those of his beloved. With the vast knowledge of hundred years of life he accumulated in his previous life, wielding the strongest demon spirits, he shall reach the pinnacle of Martial Arts.' },
            { id: 'battle-through-heavens', title: 'Battle Through the Heavens', image: 'https://i.imgur.com/ABC456.jpg', chapters: 300, year: 2014, score: 8.0, synopsis: 'In a land where no magic is present. A land where the strong makes the rules and weak has to obey. A land filled with alluring treasures and beauty yet also filled with unforeseen danger. Xiao Yan, who has shown talents none had seen in decades, suddenly three years ago lost everything, his powers, his reputation, and his promise to his mother. What sorcery has caused him to lose all of his powers? And why has his fiancee suddenly shown up?' },
            { id: 'soul-land', title: 'Soul Land', image: 'https://i.imgur.com/DEF789.jpg', chapters: 350, year: 2013, score: 8.3, synopsis: 'Tang San spent his life in the Tang Outer Sect, dedicated to the creation and mastery of hidden weapons. Once he stole the secret lore of the Inner Sect to reach the pinnacle of his art, his only way out was death. But after throwing himself off the deadly Hell\'s Peak he was reborn in a different world, the world of Douluo Dalu, a world where every person has a spirit of their own, and those with powerful spirits can practice their spirit power to rise and become Spirit Masters.' },
            { id: 'king-avatar', title: 'The King\'s Avatar', image: 'https://i.imgur.com/GHI012.jpg', chapters: 280, year: 2016, score: 8.6, synopsis: 'Widely regarded as a trailblazer and top-tier professional player in the online multiplayer game Glory, Ye Xiu is dubbed the "Battle God" for his skills and contributions to the game over the years. However, when forced to retire from the team and to leave his gaming career behind, he finds work at a nearby internet café.' },
            { id: 'martial-peak', title: 'Martial Peak', image: 'https://i.imgur.com/JKL345.jpg', chapters: 800, year: 2013, score: 7.7, synopsis: 'The journey to the martial peak is a lonely, solitary and long one. In the face of adversity, you must survive and remain unyielding. Only then can you break through and continue on your journey to become the strongest. Sky Tower tests its disciples in the harshest ways to prepare them for this journey.' },
            { id: 'apotheosis', title: 'Apotheosis', image: 'https://i.imgur.com/PQR678.jpg', chapters: 500, year: 2015, score: 7.9, synopsis: 'Luo Zheng is a slave who is crushed and tormented by others. But his life changes when he acquires a skill that allows him to turn into steel. Now he seeks to become the strongest and forge his own destiny.' },
            { id: 'god-martial-arts', title: 'God of Martial Arts', image: 'https://i.imgur.com/STU901.jpg', chapters: 450, year: 2016, score: 7.6, synopsis: 'In the Tianyuan continent, there exists numerous sects and powerful martial artists. Lin Feng is a young martial artist who trains hard to become stronger and protect those he cares about.' },
            { id: 'star-martial-god', title: 'Star Martial God Technique', image: 'https://i.imgur.com/VWX234.jpg', chapters: 350, year: 2017, score: 7.5, synopsis: 'In the heavens and the earth, there are countless martial arts techniques. But among them, the Star Martial God Technique is the most mysterious and powerful one that can shake the universe.' }
        ];
        
        this.init();
    }

    async init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupTheme();
        this.renderCurrentTab();
        this.updateStatistics();
        
        // Load sample data if empty
        if (this.entries.length === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleEntries = [
            {
                id: 'anime_sample_1',
                type: 'anime',
                title: 'Attack on Titan',
                originalTitle: 'Shingeki no Kyojin',
                poster: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
                year: 2013,
                status: 'Completed',
                userRating: 9,
                genres: ['Action', 'Drama', 'Fantasy'],
                synopsis: 'Humanity fights for survival against giant humanoid Titans.',
                progress: { current: 25, total: 25 },
                dateAdded: '2024-01-10',
                notes: 'Incredible story and animation',
                externalIds: { mal: 16498 }
            },
            {
                id: 'manga_sample_1',
                type: 'manga',
                title: 'One Piece',
                originalTitle: 'One Piece',
                poster: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
                year: 1997,
                status: 'Reading',
                userRating: 10,
                genres: ['Adventure', 'Comedy', 'Shounen'],
                synopsis: 'Monkey D. Luffy explores the Grand Line to become Pirate King.',
                progress: { current: 1050, total: 1100 },
                dateAdded: '2024-01-05',
                notes: 'Epic adventure story',
                externalIds: { mal: 13 }
            },
            {
                id: 'manhwa_sample_1',
                type: 'manhwa',
                title: 'Solo Leveling',
                originalTitle: 'Solo Leveling',
                poster: 'https://i.imgur.com/6Uo8wNV.jpg',
                year: 2018,
                status: 'Completed',
                userRating: 9,
                genres: ['Action', 'Fantasy', 'Supernatural'],
                synopsis: 'A weak hunter becomes the strongest after finding a mysterious system.',
                progress: { current: 179, total: 179 },
                dateAdded: '2024-01-12',
                notes: 'Amazing art and progression system',
                externalIds: {}
            },
            {
                id: 'manhua_sample_1',
                type: 'manhua',
                title: 'Battle Through the Heavens',
                originalTitle: 'Doupo Cangqiong',
                poster: 'https://i.imgur.com/ABC456.jpg',
                year: 2014,
                status: 'Reading',
                userRating: 8,
                genres: ['Action', 'Fantasy', 'Martial Arts'],
                synopsis: 'Xiao Yan lost his powers but now seeks to regain them and become stronger.',
                progress: { current: 200, total: 300 },
                dateAdded: '2024-01-08',
                notes: 'Great cultivation story',
                externalIds: {}
            }
        ];
        
        this.entries = sampleEntries;
        this.saveToStorage();
        this.renderCurrentTab();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Main tab navigation
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.mainTab);
            });
        });

        // Search functionality
        this.setupSearchListeners();
        
        // Manual add buttons
        ['anime', 'manga', 'manhwa', 'manhua'].forEach(type => {
            const btn = document.getElementById(`add-${type}-manual`);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openEntryModal(type);
                });
            }
        });

        // Modal events
        this.setupModalListeners();

        // Filter events
        this.setupFilterListeners();

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Import/Export
        const importBtn = document.getElementById('import-btn');
        const exportBtn = document.getElementById('export-btn');

        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openImportModal();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData();
            });
        }

        this.setupImportListeners();
    }

    setupSearchListeners() {
        ['anime', 'manga', 'manhwa', 'manhua'].forEach(type => {
            const searchBtn = document.getElementById(`${type}-search-btn`);
            const searchInput = document.getElementById(`${type}-search`);

            if (searchBtn) {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
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

                // Debounced search
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        if (e.target.value.length > 2) {
                            this.performSearch(type);
                        } else if (e.target.value.length === 0) {
                            // Hide search results when input is cleared
                            const resultsContainer = document.getElementById(`${type}-search-results`);
                            if (resultsContainer) {
                                resultsContainer.classList.add('hidden');
                            }
                        }
                    }, 500);
                });
            }
        });
    }

    updateManualAddButtons() {
        ['anime', 'manga', 'manhwa', 'manhua'].forEach(type => {
            const btn = document.getElementById(`add-${type}-manual`);
            if (btn) {
                const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
                btn.textContent = `Add ${capitalizedType} Manually`;
            }
        });
    }

    async performSearch(type) {
        const searchInput = document.getElementById(`${type}-search`);
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (!query) {
            // Hide search results if query is empty
            const resultsContainer = document.getElementById(`${type}-search-results`);
            if (resultsContainer) {
                resultsContainer.classList.add('hidden');
            }
            return;
        }

        this.showLoading();
        
        try {
            if (type === 'anime' || type === 'manga') {
                await this.searchJikan(type, query);
            } else {
                this.searchLocal(type, query);
            }
        } catch (error) {
            console.error(`${type} search error:`, error);
            this.showToast(`Error searching ${type}. Please try again.`, 'error');
            // Show fallback results
            this.displayMockResults(type, query);
        } finally {
            this.hideLoading();
        }
    }

    async searchJikan(type, query) {
        // Rate limiting
        const now = Date.now();
        if (now - this.lastRequestTime < this.rateLimitDelay) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - (now - this.lastRequestTime)));
        }
        
        try {
            const url = `${this.jikanBaseUrl}/${type}?q=${encodeURIComponent(query)}&limit=10`;
            const response = await fetch(url);
            
            this.lastRequestTime = Date.now();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            this.displaySearchResults(type, data.data || []);
        } catch (error) {
            console.error('Jikan API error:', error);
            // Fallback to mock data
            this.displayMockResults(type, query);
        }
    }

    searchLocal(type, query) {
        const data = type === 'manhwa' ? this.manhwaData : this.manhuaData;
        const results = data.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        this.displaySearchResults(type, results, true);
    }

    displaySearchResults(type, results, isLocal = false) {
        const container = document.getElementById(`${type}-search-results`);
        if (!container) return;
        
        if (!results || results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found. Try a different search term.</div>';
            container.classList.remove('hidden');
            return;
        }

        container.innerHTML = results.map(item => {
            const poster = this.getItemPoster(item, type, isLocal);
            const title = this.getItemTitle(item, isLocal);
            const year = this.getItemYear(item, type, isLocal);
            const meta = this.getItemMeta(item, type, isLocal);
            const synopsis = this.getItemSynopsis(item, isLocal);

            return `
                <div class="search-result-item" data-type="${type}" data-result='${JSON.stringify(item)}' data-is-local="${isLocal}">
                    ${poster ? `<img src="${poster}" alt="${title}" class="search-result-poster" onerror="this.style.display='none'">` : '<div class="search-result-poster" style="background: var(--color-bg-2); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary);">No Image</div>'}
                    <div class="search-result-info">
                        <div class="search-result-title">${this.escapeHtml(title)}</div>
                        <div class="search-result-meta">${year} ${meta ? `• ${meta}` : ''}</div>
                        <div class="search-result-synopsis">${this.escapeHtml(synopsis)}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.classList.remove('hidden');
        this.attachSearchResultListeners();
    }

    displayMockResults(type, query) {
        // Create more realistic mock data based on the query
        const mockData = [];
        
        if (type === 'anime') {
            if (query.toLowerCase().includes('attack')) {
                mockData.push({
                    id: 'mock_attack_titan',
                    title: 'Attack on Titan',
                    title_english: 'Attack on Titan',
                    synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought them to the brink of extinction.',
                    year: 2013,
                    episodes: 25,
                    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' } }
                });
            }
        } else if (type === 'manga') {
            if (query.toLowerCase().includes('attack')) {
                mockData.push({
                    id: 'mock_attack_titan_manga',
                    title: 'Shingeki no Kyojin',
                    title_english: 'Attack on Titan',
                    synopsis: 'The manga that started it all. Follow Eren Yeager and his friends as they fight against the Titans.',
                    year: 2009,
                    chapters: 139,
                    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/manga/2/37846.jpg' } }
                });
            }
        }
        
        // If no specific matches, create a generic result
        if (mockData.length === 0) {
            mockData.push({
                id: `mock_${Date.now()}`,
                title: `${query} (${type.charAt(0).toUpperCase() + type.slice(1)})`,
                synopsis: `A search result for "${query}". This is a demo result since the API might be unavailable.`,
                year: 2020,
                [type === 'anime' ? 'episodes' : 'chapters']: type === 'anime' ? 12 : 50
            });
        }
        
        this.displaySearchResults(type, mockData);
    }

    getItemPoster(item, type, isLocal) {
        if (isLocal) return item.image;
        return item.images?.jpg?.image_url || item.images?.jpg?.large_image_url;
    }

    getItemTitle(item, isLocal) {
        if (isLocal) return item.title;
        return item.title || item.title_english || 'Unknown Title';
    }

    getItemYear(item, type, isLocal) {
        if (isLocal) return item.year;
        
        if (type === 'anime') {
            return item.aired?.from ? new Date(item.aired.from).getFullYear() : item.year || 'Unknown Year';
        } else {
            return item.published?.from ? new Date(item.published.from).getFullYear() : item.year || 'Unknown Year';
        }
    }

    getItemMeta(item, type, isLocal) {
        if (isLocal) return `${item.chapters || '?'} chapters`;
        
        if (type === 'anime') {
            return `${item.episodes || '?'} episodes`;
        } else {
            return `${item.chapters || '?'} chapters`;
        }
    }

    getItemSynopsis(item, isLocal) {
        if (isLocal) return item.synopsis || 'No synopsis available.';
        return item.synopsis || 'No synopsis available.';
    }

    attachSearchResultListeners() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const result = JSON.parse(item.dataset.result);
                const isLocal = item.dataset.isLocal === 'true';
                this.addFromSearchResult(type, result, isLocal);
            });
        });
    }

    addFromSearchResult(type, result, isLocal = false) {
        // Hide search results
        document.querySelectorAll('.search-results').forEach(container => {
            container.classList.add('hidden');
        });

        // Open modal with pre-filled data
        this.openEntryModal(type, result, isLocal);
    }

    setupModalListeners() {
        const modal = document.getElementById('entry-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-entry');
        const form = document.getElementById('entry-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeEntryModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeEntryModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal.querySelector('.modal__overlay')) {
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

        // Star rating
        this.setupStarRating();
    }

    setupStarRating() {
        const starContainer = document.getElementById('modal-star-rating');
        if (!starContainer) return;

        // Clear existing stars and create new ones (10 stars for anime/manga/manhwa/manhua)
        starContainer.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '★';
            star.dataset.rating = i;
            starContainer.appendChild(star);
        }

        const stars = starContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(starContainer, index + 1);
            });

            star.addEventListener('mouseleave', () => {
                this.highlightStars(starContainer, this.currentRating);
            });

            star.addEventListener('click', () => {
                this.currentRating = index + 1;
                this.highlightStars(starContainer, this.currentRating);
                const ratingDisplay = document.getElementById('rating-display');
                if (ratingDisplay) {
                    ratingDisplay.textContent = this.currentRating;
                }
            });
        });
    }

    highlightStars(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    setupFilterListeners() {
        ['anime', 'manga', 'manhwa', 'manhua'].forEach(type => {
            ['status', 'rating', 'genre'].forEach(filterType => {
                const filter = document.getElementById(`${type}-${filterType}-filter`);
                if (filter) {
                    filter.addEventListener('change', () => {
                        this.renderCurrentTab();
                    });
                }
            });
        });
    }

    setupImportListeners() {
        const closeImportBtn = document.getElementById('close-import-modal');
        const importJsonBtn = document.getElementById('import-json');
        const importCsvBtn = document.getElementById('import-csv');

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

        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', () => {
                this.importCSV();
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

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-main-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab content
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }

        this.currentTab = tabName;
        
        // Update manual add button text
        this.updateManualAddButtons();
        
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'anime':
            case 'manga':
            case 'manhwa':
            case 'manhua':
                this.renderMediaTab(this.currentTab);
                break;
            case 'stats':
                this.renderStatistics();
                break;
        }
    }

    renderMediaTab(type) {
        const container = document.getElementById(`${type}-grid`);
        if (!container) return;
        
        const entries = this.getFilteredEntries(type);
        
        if (entries.length === 0) {
            const searchAPI = type === 'anime' || type === 'manga' ? 'Jikan API' : 'popular titles';
            container.innerHTML = `<div class="no-entries"><p>No ${type} found. Search ${searchAPI} or add manually!</p></div>`;
            return;
        }

        container.innerHTML = entries.map(entry => this.createEntryCard(entry)).join('');
        this.attachCardEventListeners();
    }

    getFilteredEntries(type) {
        let entries = this.entries.filter(entry => entry.type === type);

        // Apply status filter
        const statusFilter = document.getElementById(`${type}-status-filter`);
        if (statusFilter && statusFilter.value) {
            entries = entries.filter(entry => entry.status === statusFilter.value);
        }

        // Apply rating filter
        const ratingFilter = document.getElementById(`${type}-rating-filter`);
        if (ratingFilter && ratingFilter.value) {
            entries = entries.filter(entry => (entry.userRating || 0) >= parseInt(ratingFilter.value));
        }

        // Apply genre filter
        const genreFilter = document.getElementById(`${type}-genre-filter`);
        if (genreFilter && genreFilter.value) {
            entries = entries.filter(entry => {
                const genres = Array.isArray(entry.genres) ? entry.genres : [];
                return genres.some(genre => genre.toLowerCase().includes(genreFilter.value.toLowerCase()));
            });
        }

        return entries.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    createEntryCard(entry) {
        const stars = this.createStarsDisplay(entry.userRating || 0, 10);
        const progressBar = this.createProgressBar(entry.progress);
        const statusClass = entry.status.toLowerCase().replace(/\s+/g, '-');
        
        return `
            <div class="entry-card" data-id="${entry.id}">
                ${entry.poster ? `<img src="${entry.poster}" alt="${entry.title}" class="entry-card__poster" onerror="this.style.display='none'">` : ''}
                <div class="entry-card__content">
                    <div class="entry-card__header">
                        <h3 class="entry-card__title">${this.escapeHtml(entry.title)}</h3>
                        <div class="entry-card__actions">
                            <button class="action-btn action-btn--edit" data-id="${entry.id}">Edit</button>
                            <button class="action-btn action-btn--delete" data-id="${entry.id}">Delete</button>
                        </div>
                    </div>
                    
                    <div class="entry-card__meta">
                        <span class="entry-card__badge entry-card__type">${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>
                        ${entry.year ? `<span class="entry-card__badge entry-card__year">${entry.year}</span>` : ''}
                        <span class="status status--${statusClass}">${entry.status}</span>
                    </div>

                    <div class="entry-card__rating">
                        <div class="rating-stars">${stars}</div>
                        <span class="rating-numeric">${entry.userRating || 0}/10</span>
                    </div>

                    ${progressBar ? `<div class="entry-card__progress">${progressBar}</div>` : ''}

                    ${entry.genres && entry.genres.length > 0 ? `
                        <div class="entry-card__genres">
                            <strong>Genres:</strong> ${Array.isArray(entry.genres) ? entry.genres.join(', ') : entry.genres}
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

    createStarsDisplay(rating, maxRating) {
        let stars = '';
        for (let i = 1; i <= maxRating; i++) {
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
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div class="progress-text">${current}${total > 0 ? ` / ${total}` : ''}</div>
        `;
    }

    attachCardEventListeners() {
        document.querySelectorAll('.action-btn--edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                this.editEntry(id);
            });
        });

        document.querySelectorAll('.action-btn--delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                this.deleteEntry(id);
            });
        });
    }

    openEntryModal(type, searchResult = null, isLocal = false) {
        const modal = document.getElementById('entry-modal');
        const titleEl = document.getElementById('modal-title');
        const typeEl = document.getElementById('entry-type');
        const statusEl = document.getElementById('entry-status');
        const progressRow = document.getElementById('progress-row');

        if (!modal || !titleEl || !typeEl || !statusEl || !progressRow) {
            console.error('Modal elements not found');
            return;
        }

        this.editingEntry = null;
        this.currentRating = 0;

        titleEl.textContent = searchResult ? 'Add Entry' : 'Add Entry';
        typeEl.value = type;

        // Set up status options based on type
        const statusOptions = this.getStatusOptions(type);
        statusEl.innerHTML = statusOptions.map(status => 
            `<option value="${status}">${status}</option>`
        ).join('');

        // Always show progress row for all types
        progressRow.style.display = 'grid';
        const currentLabel = document.querySelector('label[for="current-progress"]');
        const totalLabel = document.querySelector('label[for="total-progress"]');
        
        if (currentLabel && totalLabel) {
            if (type === 'anime') {
                currentLabel.textContent = 'Current Episodes';
                totalLabel.textContent = 'Total Episodes';
            } else {
                currentLabel.textContent = 'Current Chapters';
                totalLabel.textContent = 'Total Chapters';
            }
        }

        // Pre-fill data if from search result
        if (searchResult) {
            this.prefillModalFromSearchResult(type, searchResult, isLocal);
        } else {
            this.clearModalForm();
        }

        // Set up star rating
        this.setupStarRating();
        
        modal.classList.remove('hidden');
    }

    prefillModalFromSearchResult(type, result, isLocal = false) {
        const titleInput = document.getElementById('entry-title');
        const yearInput = document.getElementById('entry-year');
        const synopsisInput = document.getElementById('entry-synopsis');
        const genresInput = document.getElementById('entry-genres');
        const totalProgressInput = document.getElementById('total-progress');

        if (titleInput) titleInput.value = this.getItemTitle(result, isLocal);
        if (yearInput) yearInput.value = this.getItemYear(result, type, isLocal);
        if (synopsisInput) synopsisInput.value = this.getItemSynopsis(result, isLocal);

        // Set total progress
        if (totalProgressInput) {
            if (isLocal) {
                totalProgressInput.value = result.chapters || result.episodes || '';
            } else {
                totalProgressInput.value = result.episodes || result.chapters || '';
            }
        }

        // Set genres
        if (genresInput && result.genres) {
            let genres = '';
            if (isLocal) {
                // For local data, genres might be an array or string
                genres = Array.isArray(result.genres) ? result.genres.join(', ') : result.genres;
            } else {
                // For Jikan API data
                if (Array.isArray(result.genres)) {
                    genres = result.genres.map(g => g.name || g).join(', ');
                }
            }
            genresInput.value = genres;
        }
        
        // Store external data
        this.currentSearchResult = {
            poster: this.getItemPoster(result, type, isLocal),
            originalTitle: result.title_japanese || result.title,
            externalIds: isLocal ? {} : { mal: result.mal_id }
        };
    }

    getStatusOptions(type) {
        if (type === 'anime') {
            return ['Completed', 'Watching', 'Plan to Watch', 'Dropped', 'On Hold'];
        } else {
            return ['Reading', 'Completed', 'Plan to Read', 'Dropped', 'On Hold'];
        }
    }

    clearModalForm() {
        const form = document.getElementById('entry-form');
        if (form) {
            form.reset();
        }
        
        this.currentRating = 0;
        this.currentSearchResult = null;
        
        const starContainer = document.getElementById('modal-star-rating');
        const ratingDisplay = document.getElementById('rating-display');
        
        if (starContainer) {
            this.highlightStars(starContainer, 0);
        }
        
        if (ratingDisplay) {
            ratingDisplay.textContent = '0';
        }
    }

    closeEntryModal() {
        const modal = document.getElementById('entry-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.editingEntry = null;
        this.currentRating = 0;
        this.currentSearchResult = null;
        
        // Hide search results
        document.querySelectorAll('.search-results').forEach(container => {
            container.classList.add('hidden');
        });
    }

    saveEntry() {
        const formData = this.getFormData();
        
        if (!formData.title.trim()) {
            this.showToast('Please enter a title', 'error');
            return;
        }

        if (this.editingEntry) {
            this.updateEntry(this.editingEntry.id, formData);
            this.showToast('Entry updated successfully!', 'success');
        } else {
            this.addEntry(formData);
            this.showToast('Entry added successfully!', 'success');
        }

        this.closeEntryModal();
        this.renderCurrentTab();
        this.updateStatistics();
    }

    getFormData() {
        const typeEl = document.getElementById('entry-type');
        const titleEl = document.getElementById('entry-title');
        const yearEl = document.getElementById('entry-year');
        const statusEl = document.getElementById('entry-status');
        const genresEl = document.getElementById('entry-genres');
        const synopsisEl = document.getElementById('entry-synopsis');
        const notesEl = document.getElementById('entry-notes');
        const currentProgressEl = document.getElementById('current-progress');
        const totalProgressEl = document.getElementById('total-progress');

        const type = typeEl ? typeEl.value : '';
        const genres = genresEl ? genresEl.value.trim() : '';
        
        const data = {
            type: type,
            title: titleEl ? titleEl.value.trim() : '',
            year: yearEl && yearEl.value ? parseInt(yearEl.value) : null,
            status: statusEl ? statusEl.value : '',
            userRating: this.currentRating,
            genres: genres ? (genres.includes(',') ? genres.split(',').map(g => g.trim()) : [genres]) : [],
            synopsis: synopsisEl ? synopsisEl.value.trim() : '',
            notes: notesEl ? notesEl.value.trim() : ''
        };

        // Add progress
        const current = currentProgressEl ? currentProgressEl.value : '';
        const total = totalProgressEl ? totalProgressEl.value : '';
        data.progress = {
            current: current ? parseInt(current) : 0,
            total: total ? parseInt(total) : 0
        };

        // Add data from search result if available
        if (this.currentSearchResult) {
            Object.assign(data, this.currentSearchResult);
        }

        return data;
    }

    addEntry(data) {
        const entry = {
            id: `${data.type}_${Date.now()}`,
            ...data,
            dateAdded: new Date().toISOString().split('T')[0]
        };
        
        this.entries.unshift(entry);
        this.saveToStorage();
    }

    updateEntry(id, data) {
        const index = this.entries.findIndex(e => e.id === id);
        if (index !== -1) {
            this.entries[index] = { ...this.entries[index], ...data };
            this.saveToStorage();
        }
    }

    editEntry(id) {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) return;

        this.editingEntry = entry;
        this.currentRating = entry.userRating || 0;

        const modal = document.getElementById('entry-modal');
        const titleEl = document.getElementById('modal-title');
        
        if (titleEl) {
            titleEl.textContent = 'Edit Entry';
        }
        
        // Fill form with entry data
        const idEl = document.getElementById('entry-id');
        const typeEl = document.getElementById('entry-type');
        const entryTitleEl = document.getElementById('entry-title');
        const yearEl = document.getElementById('entry-year');
        const synopsisEl = document.getElementById('entry-synopsis');
        const notesEl = document.getElementById('entry-notes');
        const genresEl = document.getElementById('entry-genres');

        if (idEl) idEl.value = entry.id;
        if (typeEl) typeEl.value = entry.type;
        if (entryTitleEl) entryTitleEl.value = entry.title;
        if (yearEl) yearEl.value = entry.year || '';
        if (synopsisEl) synopsisEl.value = entry.synopsis || '';
        if (notesEl) notesEl.value = entry.notes || '';

        // Set genres
        if (genresEl) {
            const genres = Array.isArray(entry.genres) ? entry.genres.join(', ') : (entry.genres || '');
            genresEl.value = genres;
        }

        // Set status options and current status
        const statusEl = document.getElementById('entry-status');
        if (statusEl) {
            const statusOptions = this.getStatusOptions(entry.type);
            statusEl.innerHTML = statusOptions.map(status => 
                `<option value="${status}" ${status === entry.status ? 'selected' : ''}>${status}</option>`
            ).join('');
        }

        // Set progress
        const progressRow = document.getElementById('progress-row');
        const currentProgressEl = document.getElementById('current-progress');
        const totalProgressEl = document.getElementById('total-progress');
        
        if (progressRow) {
            progressRow.style.display = 'grid';
            if (currentProgressEl) currentProgressEl.value = entry.progress?.current || 0;
            if (totalProgressEl) totalProgressEl.value = entry.progress?.total || 0;
        }

        // Set up star rating and current rating
        this.setupStarRating();
        
        const starContainer = document.getElementById('modal-star-rating');
        const ratingDisplay = document.getElementById('rating-display');
        
        if (starContainer) {
            this.highlightStars(starContainer, this.currentRating);
        }
        
        if (ratingDisplay) {
            ratingDisplay.textContent = this.currentRating;
        }

        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    deleteEntry(id) {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        this.entries = this.entries.filter(e => e.id !== id);
        this.saveToStorage();
        this.renderCurrentTab();
        this.updateStatistics();
        this.showToast('Entry deleted successfully!', 'success');
    }

    renderStatistics() {
        this.updateStatistics();
        
        // Small delay to ensure DOM is updated before rendering charts
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    }

    updateStatistics() {
        const total = this.entries.length;
        const completed = this.entries.filter(e => 
            e.status === 'Completed'
        ).length;
        const inProgress = this.entries.filter(e => 
            e.status === 'Watching' || e.status === 'Reading'
        ).length;
        
        const avgRating = total > 0 ? 
            (this.entries.reduce((sum, e) => sum + (e.userRating || 0), 0) / total).toFixed(1) : '0.0';

        const totalEl = document.getElementById('total-entries');
        const completedEl = document.getElementById('completed-entries');
        const inProgressEl = document.getElementById('in-progress-entries');
        const avgEl = document.getElementById('avg-rating');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (inProgressEl) inProgressEl.textContent = inProgress;
        if (avgEl) avgEl.textContent = avgRating;
    }

    renderCharts() {
        if (this.currentTab !== 'stats') return;
        
        this.renderTypeChart();
        this.renderStatusChart();
    }

    renderTypeChart() {
        const ctx = document.getElementById('type-chart');
        if (!ctx) return;

        const typeCounts = {
            anime: this.entries.filter(e => e.type === 'anime').length,
            manga: this.entries.filter(e => e.type === 'manga').length,
            manhwa: this.entries.filter(e => e.type === 'manhwa').length,
            manhua: this.entries.filter(e => e.type === 'manhua').length
        };

        // Destroy existing chart if it exists
        if (this.typeChart) {
            this.typeChart.destroy();
        }

        this.typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Anime', 'Manga', 'Manhwa', 'Manhua'],
                datasets: [{
                    data: [typeCounts.anime, typeCounts.manga, typeCounts.manhwa, typeCounts.manhua],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
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

        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

        // Destroy existing chart if it exists
        if (this.statusChart) {
            this.statusChart.destroy();
        }

        this.statusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Count',
                    data: data,
                    backgroundColor: colors.slice(0, labels.length)
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

    setupTheme() {
        const savedTheme = localStorage.getItem('myanimangalist-theme') || 'light';
        this.applyTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        localStorage.setItem('myanimangalist-theme', theme);
        
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
        }
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

    exportData() {
        const data = {
            entries: this.entries,
            exportDate: new Date().toISOString(),
            version: '1.0'
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

    importJSON() {
        const fileInput = document.getElementById('json-file-input');
        if (!fileInput) return;
        
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Please select a JSON file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.entries && Array.isArray(data.entries)) {
                    if (confirm(`This will import ${data.entries.length} entries. Continue?`)) {
                        this.entries = [...this.entries, ...data.entries];
                        this.saveToStorage();
                        this.renderCurrentTab();
                        this.updateStatistics();
                        this.closeImportModal();
                        this.showToast(`Imported ${data.entries.length} entries!`, 'success');
                    }
                } else {
                    this.showToast('Invalid JSON format', 'error');
                }
            } catch (error) {
                this.showToast('Error parsing JSON file', 'error');
            }
        };
        reader.readAsText(file);
    }

    importCSV() {
        const fileInput = document.getElementById('csv-file-input');
        if (!fileInput) return;
        
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Please select a CSV file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                const importedEntries = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    if (values.length < headers.length || !values[0]) continue;
                    
                    const entry = {
                        id: `imported_${Date.now()}_${i}`,
                        type: 'anime', // Default to anime for CSV imports
                        title: values[headers.indexOf('Title')] || values[0],
                        year: parseInt(values[headers.indexOf('Year')]) || null,
                        status: 'Completed',
                        userRating: parseFloat(values[headers.indexOf('Score')]) || 0,
                        genres: [],
                        synopsis: '',
                        notes: values[headers.indexOf('Tags')] || '',
                        progress: { current: 1, total: 1 },
                        dateAdded: new Date().toISOString().split('T')[0],
                        externalIds: {}
                    };
                    
                    importedEntries.push(entry);
                }
                
                if (importedEntries.length > 0) {
                    if (confirm(`Import ${importedEntries.length} entries from CSV?`)) {
                        this.entries = [...this.entries, ...importedEntries];
                        this.saveToStorage();
                        this.renderCurrentTab();
                        this.updateStatistics();
                        this.closeImportModal();
                        this.showToast(`Imported ${importedEntries.length} entries!`, 'success');
                    }
                } else {
                    this.showToast('No valid entries found in CSV', 'error');
                }
            } catch (error) {
                this.showToast('Error parsing CSV file', 'error');
            }
        };
        reader.readAsText(file);
    }

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

    saveToStorage() {
        try {
            localStorage.setItem('myanimangalist-entries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving to storage:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('myanimangalist-entries');
            this.entries = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.entries = [];
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MyAnimangalistApp();
});