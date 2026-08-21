/* ============================================================
   NORTHGRID — main.js
   ============================================================ */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scroll behavior ---------- */
  var header = document.querySelector('.site-header');
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 40){ header.classList.add('is-solid'); }
    else{ header.classList.remove('is-solid'); }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  if(hamburger && mobileNav){
    hamburger.addEventListener('click', function(){
      var open = hamburger.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        hamburger.classList.remove('is-open');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .process-step');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-counter]');
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;
    if(reduceMotion){ el.textContent = target + suffix; return; }
    function step(ts){
      if(!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  if(counters.length && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function(el){ cio.observe(el); });
  }

  /* ---------- Service card accordions ---------- */
  document.querySelectorAll('.svc-card-head').forEach(function(head){
    head.addEventListener('click', function(){
      var card = head.closest('.svc-card');
      card.classList.toggle('is-open');
      var expanded = card.classList.contains('is-open');
      head.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    head.setAttribute('tabindex','0');
    head.setAttribute('role','button');
    head.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        head.click();
      }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('is-open'); });
      if(!wasOpen){ item.classList.add('is-open'); }
    });
  });

  /* ---------- Quick requirement selector (contact page) ---------- */
  var quickOptions = document.querySelectorAll('.quick-option');
  var serviceSelect = document.getElementById('service');
  quickOptions.forEach(function(opt){
    opt.addEventListener('click', function(){
      quickOptions.forEach(function(o){ o.classList.remove('is-active'); });
      opt.classList.add('is-active');
      var mapTo = opt.getAttribute('data-service');
      if(serviceSelect && mapTo){
        serviceSelect.value = mapTo;
        serviceSelect.dispatchEvent(new Event('change'));
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('enquiry-form-el');
  if(form){
    var statusBox = document.getElementById('form-status');
    var submitBtn = document.getElementById('form-submit');

    function setError(fieldWrap, message){
      fieldWrap.classList.toggle('has-error', !!message);
      var errEl = fieldWrap.querySelector('.field-error');
      if(errEl) errEl.textContent = message || '';
    }

    function validateField(input){
      var wrap = input.closest('.form-field');
      if(!wrap) return true;
      var value = input.value.trim();
      if(input.hasAttribute('required') && !value){
        setError(wrap, 'This field is required.');
        return false;
      }
      if(input.type === 'email' && value){
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRe.test(value)){
          setError(wrap, 'Enter a valid email address.');
          return false;
        }
      }
      if(input.type === 'tel' && value){
        var phoneRe = /^[0-9+\-\s()]{7,18}$/;
        if(!phoneRe.test(value)){
          setError(wrap, 'Enter a valid phone number.');
          return false;
        }
      }
      setError(wrap, '');
      return true;
    }

    form.querySelectorAll('input, select, textarea').forEach(function(input){
      input.addEventListener('blur', function(){ validateField(input); });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();

      // honeypot spam protection
      var honeypot = form.querySelector('input[name="company_website"]');
      if(honeypot && honeypot.value){ return; }

      var fields = form.querySelectorAll('input, select, textarea');
      var valid = true;
      fields.forEach(function(input){
        if(!validateField(input)) valid = false;
      });

      if(!valid){
        if(statusBox){
          statusBox.className = 'form-status error';
          statusBox.textContent = 'Please review the highlighted fields and try again.';
        }
        return;
      }

      if(submitBtn){
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
      }
      if(statusBox){ statusBox.className = 'form-status'; statusBox.textContent = ''; }

      // Simulated async submission — replace with real API/backend endpoint.
      setTimeout(function(){
        if(submitBtn){
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
        if(statusBox){
          statusBox.className = 'form-status success';
          statusBox.textContent = 'Thank you. Your enquiry has been received. Our retail technology team will contact you shortly.';
        }
        form.reset();
        quickOptions.forEach(function(o){ o.classList.remove('is-active'); });
      }, 1100);
    });
  }

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

})();
