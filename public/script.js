/* ═══════════════════════════════════════════
   DATA  — swap for fetch('/api/books') later
═══════════════════════════════════════════ */
const BOOKS = [
  { id:1,  title:"Dune",                    author:"Frank Herbert",     cover:"https://covers.openlibrary.org/b/id/8739161-M.jpg",  badge:"Popular" },
  { id:2,  title:"The Midnight Library",    author:"Matt Haig",         cover:"https://covers.openlibrary.org/b/id/10527828-M.jpg", badge:"New"     },
  { id:3,  title:"Atomic Habits",           author:"James Clear",       cover:"https://covers.openlibrary.org/b/id/10368358-M.jpg", badge:null      },
  { id:4,  title:"Project Hail Mary",       author:"Andy Weir",         cover:"https://covers.openlibrary.org/b/id/12623977-M.jpg", badge:"Hot"     },
  { id:5,  title:"The Alchemist",           author:"Paulo Coelho",      cover:"https://covers.openlibrary.org/b/id/8356866-M.jpg",  badge:null      },
  { id:6,  title:"Thinking, Fast & Slow",   author:"Daniel Kahneman",   cover:"https://covers.openlibrary.org/b/id/7222246-M.jpg",  badge:null      },
  { id:7,  title:"The Way of Kings",        author:"Brandon Sanderson", cover:"https://covers.openlibrary.org/b/id/8739163-M.jpg",  badge:"Epic"    },
  { id:8,  title:"Sapiens",                 author:"Yuval Harari",      cover:"https://covers.openlibrary.org/b/id/8291532-M.jpg",  badge:null      },
  { id:9,  title:"Mistborn",               author:"Brandon Sanderson", cover:"https://covers.openlibrary.org/b/id/8739164-M.jpg",  badge:null      },
];
const RECOMMENDED = [
  { id:10, title:"The Hobbit",            author:"J.R.R. Tolkien", cover:"https://covers.openlibrary.org/b/id/8406786-M.jpg",  badge:"Classic" },
  { id:11, title:"1984",                  author:"George Orwell",  cover:"https://covers.openlibrary.org/b/id/8575708-M.jpg",  badge:null      },
  { id:12, title:"The Martian",           author:"Andy Weir",      cover:"https://covers.openlibrary.org/b/id/7222247-M.jpg",  badge:"Loved"   },
  { id:13, title:"Flowers for Algernon",  author:"Daniel Keyes",   cover:"https://covers.openlibrary.org/b/id/8739162-M.jpg",  badge:null      },
];

/* ═══════════════════════════════════════════
   STATE — single source of truth
═══════════════════════════════════════════ */
const appState = {
  authenticated: false,
  currentView: 'hero',
  modalMode: 'signup',
  user: null,
};

/* ═══════════════════════════════════════════
   STATE CONTROLLER — zero DOM
═══════════════════════════════════════════ */
const State = {
  navigate(view) {
    if (!appState.authenticated && view !== 'hero') { State.openModal('login'); return; }
    appState.currentView = view;
    UI.renderView();
  },

  openModal(mode = 'signup') {
    appState.modalMode = mode;
    UI.renderModal();
    document.getElementById('auth-modal').classList.add('open');
    setTimeout(() => document.getElementById(mode === 'signup' ? 'auth-name' : 'auth-email')?.focus(), 340);
  },

  closeModal() {
    document.getElementById('auth-modal').classList.remove('open');
  },

  handleAuth() {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name     = appState.modalMode === 'signup' ? document.getElementById('auth-name').value.trim() : '';
    if (!email || !password) { UI.showToast('Please fill in all fields'); return; }
    if (password.length < 6) { UI.showToast('Password must be 6+ characters'); return; }

    // Simulate auth — replace with: fetch('/api/auth', { method:'POST', body: JSON.stringify({email,password,name}) })
    appState.user = { name: name || email.split('@')[0], email };
    appState.authenticated = true;
    State.closeModal();
    setTimeout(() => { State.navigate('home'); UI.showToast(`Welcome, ${appState.user.name.split(' ')[0]}! 📚`); }, 320);
  },

  logout() {
    appState.authenticated = false;
    appState.user = null;
    appState.currentView = 'hero';
    UI.renderView();
    UI.showToast('Signed out successfully');
  },
};

/* ═══════════════════════════════════════════
   UI CONTROLLER — reads appState, writes DOM
═══════════════════════════════════════════ */
const UI = {
  isDesktop: () => window.innerWidth >= 1024,

  renderView() {
    const { currentView, authenticated, user } = appState;
    const desktop = UI.isDesktop();

    // Deactivate all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.opacity = '0';
      s.style.transform = 'translateY(12px)';
      s.style.pointerEvents = 'none';
      // On desktop, screens fill full height; on mobile, leave room for nav
      if (s.id !== 'screen-hero') {
        s.style.bottom = (!desktop && authenticated && currentView !== 'hero') ? '72px' : '0';
      }
    });

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    sidebar.style.display = (authenticated && currentView !== 'hero' && desktop) ? 'flex' : 'none';

    // Mobile bottom nav
    const nav = document.getElementById('bottom-nav');
    if (!desktop && authenticated && currentView !== 'hero') {
      nav.style.setProperty('display','flex','important');
    } else {
      nav.style.setProperty('display','none','important');
    }

    // Activate screen
    const target = document.getElementById(`screen-${currentView}`);
    if (target) requestAnimationFrame(() => {
      target.style.opacity = '1';
      target.style.transform = 'translateY(0)';
      target.style.pointerEvents = 'all';
      target.classList.add('active');
    });

    // Sidebar active states
    document.querySelectorAll('.sidebar-item').forEach(item => {
      const on = item.dataset.view === currentView;
      item.style.background = on ? 'rgba(255,255,255,0.06)' : '';
      item.style.color = on ? '#c8974a' : 'rgba(253,248,240,0.35)';
      const icon = item.querySelector('.sidebar-icon');
      if (icon) icon.style.background = on ? 'rgba(200,151,74,0.18)' : '';
    });

    // Mobile nav active states
    document.querySelectorAll('.nav-item').forEach(item => {
      const on = item.dataset.view === currentView;
      const icon  = item.querySelector('.nav-icon');
      const label = item.querySelector('.nav-label');
      const wrap  = item.querySelector('.nav-icon-wrap');
      if (icon)  { icon.style.color  = on ? '#b07d32' : 'rgba(176,125,50,0.38)'; icon.style.transform = on ? 'translateY(-1px)' : ''; }
      if (label) { label.style.color = on ? '#b07d32' : 'rgba(176,125,50,0.38)'; label.style.fontWeight = on ? '600' : '500'; }
      if (wrap)  { wrap.style.background = on ? 'rgba(200,151,74,0.12)' : ''; wrap.style.boxShadow = on ? '0 0 18px rgba(200,151,74,0.38)' : ''; }
    });

    // Sidebar user card
    const userCard = document.getElementById('sidebar-user');
    if (userCard) userCard.style.display = (authenticated && user) ? 'block' : 'none';
    if (user) {
      const sa = document.getElementById('sidebar-avatar');
      const sn = document.getElementById('sidebar-name');
      const se = document.getElementById('sidebar-email');
      if (sa) sa.textContent = (user.name||'R')[0].toUpperCase();
      if (sn) sn.textContent = user.name || 'Reader';
      if (se) se.textContent = user.email || '';
    }

    if (currentView === 'home')    UI.renderHome();
    if (currentView === 'books')   UI.renderBooksGrid(BOOKS);
    if (currentView === 'profile') UI.renderProfile();
  },

  renderHome() {
    const hr = new Date().getHours();
    const period = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening';
    const labels = { morning:'Good morning', afternoon:'Good afternoon', evening:'Good evening' };
    const first = appState.user?.name?.split(' ')[0] || 'Reader';
    const gt = document.getElementById('greeting-time');
    const gn = document.getElementById('greeting-name');
    if (gt) gt.textContent = labels[period];
    if (gn) gn.innerHTML = `Welcome back, <em class="text-amber-500">${first}</em>`;
    UI.renderBookRow('home-books-row', BOOKS.slice(0,6));
    UI.renderBookRow('home-recommended-row', RECOMMENDED);
  },

  renderBookRow(id, books) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = books.map(b => `
      <div class="shrink-0 cursor-pointer active:scale-95 transition-transform duration-150 group" onclick="UI.showToast('${b.title.replace(/'/g,"\\'")}')">
        <div class="w-[110px] h-[160px] rounded-lg overflow-hidden relative mb-2.5 shadow-book">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${b.cover}" alt="${b.title}"
            onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#8b5e1a,#3d2610)'">
          <div class="absolute inset-y-0 left-0 w-2 bg-black/20 rounded-l-lg"></div>
          ${b.badge ? `<span class="absolute top-2 right-2 bg-amber-400/90 text-brown-900 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full">${b.badge}</span>` : ''}
        </div>
        <p class="text-xs font-semibold text-brown-900 leading-snug w-[110px] line-clamp-2">${b.title}</p>
        <p class="text-[11px] text-amber-500 mt-0.5 w-[110px] truncate">${b.author}</p>
      </div>`).join('');
  },

  renderBooksGrid(books) {
    const grid = document.getElementById('books-grid');
    if (!grid) return;
    if (!books.length) {
      grid.innerHTML = `<div class="col-span-full py-20 text-center text-amber-500/50 text-sm">No books found</div>`;
      return;
    }
    grid.innerHTML = books.map(b => `
      <div class="cursor-pointer active:scale-95 transition-transform duration-150 group" onclick="UI.showToast('${b.title.replace(/'/g,"\\'")}')">
        <div class="w-full aspect-[2/3] rounded-lg overflow-hidden relative mb-2 shadow-warm">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${b.cover}" alt="${b.title}"
            onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#8b5e1a,#3d2610)'">
          <div class="absolute inset-y-0 left-0 w-1.5 bg-black/20 rounded-l-lg"></div>
          ${b.badge ? `<span class="absolute top-1.5 right-1.5 bg-amber-400/90 text-brown-900 text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full">${b.badge}</span>` : ''}
        </div>
        <p class="text-[11px] font-semibold text-brown-900 leading-snug line-clamp-2">${b.title}</p>
        <p class="text-[10px] text-amber-500 mt-0.5 truncate">${b.author}</p>
      </div>`).join('');
  },

  filterBooks(q) {
    const lq = q.toLowerCase();
    UI.renderBooksGrid(BOOKS.filter(b => b.title.toLowerCase().includes(lq) || b.author.toLowerCase().includes(lq)));
  },

  renderProfile() {
    const { user } = appState;
    if (!user) return;
    const a = document.getElementById('profile-avatar');
    const n = document.getElementById('profile-name-display');
    const e = document.getElementById('profile-email-display');
    if (a) a.textContent = (user.name||'R')[0].toUpperCase();
    if (n) n.textContent = user.name || 'Reader';
    if (e) e.textContent = user.email || '';
  },

  renderModal() {
    const su = appState.modalMode === 'signup';
    document.getElementById('modal-title').textContent    = su ? 'Create account' : 'Welcome back';
    document.getElementById('modal-subtitle').textContent = su ? 'Join thousands of readers on Folio' : 'Sign in to your shelf';
    document.getElementById('name-field').style.display   = su ? 'block' : 'none';
    document.getElementById('auth-btn-label').textContent = su ? 'Create my shelf' : 'Sign in';
    document.querySelectorAll('.modal-tab').forEach((t,i) => {
      const on = (i===0 && su) || (i===1 && !su);
      t.style.background  = on ? '#fdf8f0' : '';
      t.style.color       = on ? '#2c1a0e' : 'rgba(176,125,50,0.5)';
      t.style.fontWeight  = on ? '600' : '500';
      t.style.boxShadow   = on ? '0 4px 24px rgba(92,61,30,0.12)' : '';
    });
  },

  switchTab(mode) { appState.modalMode = mode; UI.renderModal(); },

  handleModalBackdrop(e) {
    if (e.target === document.getElementById('auth-modal')) State.closeModal();
  },

  showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(16px)';
    }, 2500);
  },
};

/* ═══════════════════════════════════════════
   SWIPE (mobile only)
═══════════════════════════════════════════ */
const VIEWS = ['home','books','favorites','profile'];
let tx = 0, ty = 0;
document.getElementById('app').addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive:true });
document.getElementById('app').addEventListener('touchend', e => {
  if (!appState.authenticated) return;
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
  const i = VIEWS.indexOf(appState.currentView);
  if (i === -1) return;
  if (dx < 0 && i < VIEWS.length-1) State.navigate(VIEWS[i+1]);
  if (dx > 0 && i > 0)              State.navigate(VIEWS[i-1]);
}, { passive:true });

/* ═══════════════════════════════════════════
   RESPONSIVE RE-RENDER
═══════════════════════════════════════════ */
let rTimer;
window.addEventListener('resize', () => { clearTimeout(rTimer); rTimer = setTimeout(UI.renderView, 120); });

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', UI.renderView);