window.addEventListener('error', (event) => {
  console.error('Yakalanmamış hata:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Yakalanmamış Promise reddi:', event.reason);
});

export const guvenliDepo = {
  oku(anahtar) {
    try {
      return localStorage.getItem(anahtar);
    } catch (error) {
      console.warn(`Depolama okunamadı (${anahtar}):`, error);
      return null;
    }
  },
  yaz(anahtar, deger) {
    try {
      localStorage.setItem(anahtar, deger);
      return true;
    } catch (error) {
      console.warn(`Depolama yazılamadı (${anahtar}):`, error);
      return false;
    }
  }
};

const yearNodes = document.querySelectorAll('[data-current-year]');

yearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const currentTheme = guvenliDepo.oku('theme') || 'light';

root.dataset.theme = currentTheme;

if (themeToggle) {
  const setThemeButton = (theme) => {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Açık modu aç' : 'Koyu modu aç');
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  setThemeButton(currentTheme);

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    guvenliDepo.yaz('theme', nextTheme);
    setThemeButton(nextTheme);
  });
}

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 700) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

const revealItems = document.querySelectorAll('main > h1, main > p, section, footer');

revealItems.forEach((item, index) => {
  const revealDelay = prefersReducedMotion.matches ? 0 : index * 90;
  item.style.setProperty('--reveal-delay', `${revealDelay}ms`);
  item.classList.add('reveal');
});

const showRevealItems = () => {
  revealItems.forEach((item) => item.classList.add('is-visible'));
};

if (prefersReducedMotion.matches) {
  showRevealItems();
} else {
  requestAnimationFrame(showRevealItems);
}

const slider = document.querySelector('.project-slider');

if (slider) {
  const slides = Array.from(slider.querySelectorAll('.project-slide'));
  const track = slider.querySelector('.project-slider-track');
  const prevButton = slider.querySelector('[data-direction="prev"]');
  const nextButton = slider.querySelector('[data-direction="next"]');

  if (slides.length && track && prevButton && nextButton) {
    let activeIndex = 0;
    let autoPlayId = null;

    const updateSlider = () => {
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.inert = !isActive;
      });

      track.style.transform = `translateX(-${activeIndex * 100}%)`;
    };

    const startAutoPlay = () => {
      if (prefersReducedMotion.matches || autoPlayId) {
        return;
      }

      autoPlayId = setInterval(() => {
        activeIndex = (activeIndex + 1) % slides.length;
        updateSlider();
      }, 5500);
    };

    const stopAutoPlay = () => {
      if (autoPlayId) {
        clearInterval(autoPlayId);
        autoPlayId = null;
      }
    };

    prefersReducedMotion.addEventListener('change', () => {
      if (prefersReducedMotion.matches) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    prevButton.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      updateSlider();
      startAutoPlay();
    });

    nextButton.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % slides.length;
      updateSlider();
      startAutoPlay();
    });

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    slider.addEventListener('focusin', stopAutoPlay);
    slider.addEventListener('focusout', (event) => {
      if (!slider.contains(event.relatedTarget) && !slider.matches(':hover')) {
        startAutoPlay();
      }
    });

    updateSlider();
    startAutoPlay();
  }
}

const modal = document.querySelector('#sertifika-penceresi');
const modalTitle = document.querySelector('#sertifika-baslik');
const modalFrame = document.querySelector('#sertifika-onizleme');
const modalCloseButton = document.querySelector('.modal-kapat');
const modalStatus = document.querySelector('#sertifika-durumu');

if (modal && modalTitle && modalFrame) {
  modalFrame.addEventListener('load', () => {
    modalStatus?.setAttribute('hidden', '');
  });

  modalFrame.addEventListener('error', () => {
    if (modalStatus) {
      modalStatus.removeAttribute('hidden');
      modalStatus.textContent = 'PDF yüklenemedi.';
    }
  });

  document.querySelectorAll('.sertifika-karti').forEach((kart) => {
    kart.addEventListener('click', (event) => {
      event.preventDefault();

      const courseName = kart.dataset.course || 'Sertifika';
      const filePath = kart.dataset.file || kart.getAttribute('href');

      modalTitle.textContent = courseName;
      modalStatus?.removeAttribute('hidden');
      if (modalStatus) {
        modalStatus.textContent = 'PDF yükleniyor...';
      }
      modalFrame.src = `${filePath}#toolbar=0&navpanes=0&scrollbar=0`;
      modal.showModal();
    });
  });

  modalCloseButton?.addEventListener('click', () => {
    modal.close();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.open) {
      modal.close();
    }
  });
}

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) {
      form.reportValidity();
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const formData = new FormData(form);
    console.log(Object.fromEntries(formData));

    const message = form.querySelector('.js-form-success');

    if (message) {
      message.remove();
    }

    const successMessage = document.createElement('p');
    successMessage.className = 'js-form-success';
    successMessage.setAttribute('role', 'status');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.textContent = 'Mesajınız başarıyla kaydedildi. Bu örnek form yalnızca görsel/uygulama amaçlıdır.';

    form.appendChild(successMessage);
    form.reset();
  });
});

const normalizePagePath = (pathname) => {
  const cleanPath = pathname.replace(/\/+$/, '');
  return cleanPath === '' ? '/' : cleanPath.replace(/\/index\.html$/, '');
};

let currentPath = '/';

try {
  currentPath = normalizePagePath(new URL(window.location.href).pathname);
} catch (error) {
  console.error('Geçerli sayfa yolu çözümlenemedi:', error);
}

document.querySelectorAll('nav a, footer a').forEach((link) => {
  const href = link.getAttribute('href');

  if (!href || href.startsWith('#')) {
    return;
  }

  let targetPath;

  try {
    targetPath = normalizePagePath(new URL(href, window.location.href).pathname);
  } catch (error) {
    console.error('Bağlantı yolu çözümlenemedi:', href, error);
    return;
  }

  if (targetPath === currentPath) {
    link.setAttribute('aria-current', 'page');
  }
});
