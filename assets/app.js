// ── YOUTUBE FACADE: iframe erst bei Klick laden ──
document.querySelectorAll('.yt-facade').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-yt');
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&autoplay=1';
    iframe.title = btn.getAttribute('aria-label') || 'YouTube Video';
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    btn.replaceWith(iframe);
  });
});

// ── HERO LOAD ANIMATION SEQUENCE ──
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  if (hero) hero.classList.add('hero-loaded');
  
  // Initialize Calculators
  updateCalculator();
  updateTimeCalculator();
});

// ── LIQUID HEADER SCROLL EFFECT ──
const header = document.querySelector('.liquid-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.background = 'rgba(255, 255, 255, 0.05)';
    header.style.boxShadow = '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)';
  } else {
    header.style.background = 'rgba(255, 255, 255, 0.02)';
    header.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
  }
}, { passive: true });

// ── FAQ ──
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => toggleFaq(btn));
});

// ── SCROLL REVEAL (Restliche Seite) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.body.classList.add('js-ready');
// Nur Elemente überwachen, die nicht zur Hero-Start-Sequenz gehören
document.querySelectorAll('[data-anim]').forEach(el => revealObserver.observe(el));

// ── COUNT UP STATS ──
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    
    const counters = entry.target.querySelectorAll('[data-count]');
    counters.forEach((el, index) => {
      setTimeout(() => {
        const target = parseInt(el.getAttribute('data-count'));
        const isDot = el.getAttribute('data-format') === 'dot';
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        
        const increment = Math.max(target / 40, 1); 
        
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          let displayVal = Math.floor(current);
          if (isDot && displayVal >= 1000) displayVal = displayVal.toLocaleString('de-DE');
          el.textContent = prefix + displayVal + suffix;
          if (current >= target) clearInterval(timer);
        }, 30);
      }, index * 250);
    });
    countObserver.disconnect();
  });
}, { threshold: 0.4 });
const statsSection = document.querySelector('.stats');
if (statsSection) countObserver.observe(statsSection);

// ── ROI CALCULATOR (REVENUE) LOGIC ──
const customerSteps = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500];

function updateCalculator() {
  const revInput = document.getElementById('slider-rev').value;
  const custIndex = document.getElementById('slider-cust').value;
  
  const revVal = parseInt(revInput);
  const custVal = customerSteps[custIndex];
  
  document.getElementById('val-rev').innerText = revVal.toLocaleString('de-DE') + ' €';
  document.getElementById('val-cust').innerText = custVal;
  
  const addedCustomers = Math.max(1, Math.round(custVal * 0.30));
  const addedRevMonthly = addedCustomers * revVal;
  const addedRevYearly = addedRevMonthly * 12;
  
  document.getElementById('lost-leads').innerText = '+ ' + addedCustomers;
  document.getElementById('lost-revenue').innerText = '+ ' + addedRevMonthly.toLocaleString('de-DE') + ' €';
  document.getElementById('lost-revenue-year').innerText = '+ ' + addedRevYearly.toLocaleString('de-DE') + ' €';
}

// ── ROI CALCULATOR (TIME SAVINGS) LOGIC ──
function updateTimeCalculator() {
  const team = parseInt(document.getElementById('slider-team').value);
  const hours = parseInt(document.getElementById('slider-hours').value);
  const wage = parseInt(document.getElementById('slider-wage').value);
  
  document.getElementById('val-team').innerText = team;
  document.getElementById('val-hours').innerText = hours + ' Std.';
  document.getElementById('val-wage').innerText = wage + ' €';
  
  const lostHours = Math.round(team * hours * 4.33);
  const lostWages = lostHours * wage;
  const savedWages = Math.round(lostWages * 0.80);
  
  document.getElementById('lost-hours').innerText = lostHours.toLocaleString('de-DE') + ' Std.';
  document.getElementById('lost-wages').innerText = lostWages.toLocaleString('de-DE') + ' €';
  document.getElementById('saved-wages').innerText = '+ ' + savedWages.toLocaleString('de-DE') + ' €';
}

// ── CLIMATE BADGE VISIBILITY & TOGGLE ──
const climateBadge = document.getElementById('climateBadge');
window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight * 0.5) {
    climateBadge.classList.add('visible');
  } else {
    climateBadge.classList.remove('visible');
  }
}, { passive: true });

// Toggle-Funktion für das Schubladen-Menü
function toggleClimateBadge() {
  const badge = document.getElementById('climateBadge');
  badge.classList.toggle('collapsed');
}
document.querySelector('.climate-toggle').addEventListener('click', toggleClimateBadge);

// ── SLIDER-EVENTS (ehem. Inline-Handler) ──
[['slider-rev', updateCalculator], ['slider-cust', updateCalculator],
 ['slider-team', updateTimeCalculator], ['slider-hours', updateTimeCalculator],
 ['slider-wage', updateTimeCalculator]].forEach(([id, fn]) => {
  document.getElementById(id).addEventListener('input', fn);
});
