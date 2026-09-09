import { guvenliDepo } from '../script.js';

const apiPostList = document.querySelector('[data-api-post-list]');
const apiStatus = document.querySelector('[data-api-status]');
const apiErrorButton = document.querySelector('[data-api-error-test]');
const apiErrorStatus = document.querySelector('[data-api-error-status]');
const jsonStatus = document.querySelector('[data-json-status]');
const timeoutErrorButton = document.querySelector('[data-timeout-error-test]');

const setText = (element, text) => {
  if (element) {
    element.textContent = text;
  }
};

class HttpHatasi extends Error {
  constructor(mesaj, durum) {
    super(mesaj);
    this.name = 'HttpHatasi';
    this.durum = durum;
  }
}

const checkResponse = (response) => {
  if (!response.ok) {
    throw new HttpHatasi(`HTTP hatası: ${response.status}`, response.status);
  }

  return response;
};

const loadPosts = async () => {
  try {
    const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await checkResponse(postsResponse).json();

    if (!Array.isArray(posts) || posts.length === 0) {
      setText(apiStatus, 'Henüz gönderi bulunamadı.');
      return;
    }

    posts.slice(0, 10).forEach((post) => {
      const article = document.createElement('article');
      const title = document.createElement('h3');
      const body = document.createElement('p');

      title.textContent = post.title;
      body.textContent = post.body;
      article.append(title, body);
      apiPostList?.appendChild(article);
    });

    setText(apiStatus, 'İlk 10 gönderi yüklendi.');
  } catch (error) {
    setText(apiStatus, 'Gönderiler yüklenemedi.');
    if (error instanceof HttpHatasi) {
      console.error('HTTP hatası:', error.durum, error.message);
    } else {
      console.error('Gönderiler alınamadı:', error);
    }
  } finally {
    console.log('Gönderi isteği tamamlandı.');
  }
};

const loadRelatedData = async () => {
  try {
    const [post, user] = await Promise.all([
      fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then((response) => checkResponse(response).json()),
      fetch('https://jsonplaceholder.typicode.com/users/1')
        .then((response) => checkResponse(response).json())
    ]);

    console.log('Promise.all sonucu:', { post, user });
  } catch (error) {
    if (error instanceof HttpHatasi) {
      console.error('Promise.all HTTP hatası:', error.durum, error.message);
    } else {
      console.error('Promise.all isteği başarısız:', error);
    }
  } finally {
    console.log('Promise.all işlemi tamamlandı.');
  }
};

apiErrorButton?.addEventListener('click', async () => {
  apiErrorButton.disabled = true;
  setText(apiErrorStatus, 'Yanlış URL deneniyor...');

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/postsss');
    const uncheckedData = await response.json();
    console.log('ok kontrolü olmadan ayrıştırılan veri:', uncheckedData);

    checkResponse(response);
    setText(apiErrorStatus, 'Yanıt ayrıştırıldı; response.ok kontrolü sonrasında hata yakalanmadı.');
  } catch (error) {
    if (error instanceof HttpHatasi) {
      setText(apiErrorStatus, `response.ok ile HTTP hatası yakalandı: ${error.durum}`);
      console.error('HttpHatasi yakalandı:', error);
    } else {
      setText(apiErrorStatus, `Hata yakalandı: ${error.message}`);
      console.error('API hatası:', error);
    }
  } finally {
    apiErrorButton.disabled = false;
  }
});

try {
  const ayarlar = { tema: 'light', dil: 'tr' };
  const kaydedildi = guvenliDepo.yaz('api-demo-ayarlar', JSON.stringify(ayarlar));
  const kaydedilenAyarlar = guvenliDepo.oku('api-demo-ayarlar');

  if (!kaydedildi || !kaydedilenAyarlar) {
    throw new Error('API demo ayarları depolanamadı.');
  }

  const ayarlarNesnesi = JSON.parse(kaydedilenAyarlar);
  console.log('JSON.parse sonucu:', ayarlarNesnesi);

  try {
    JSON.parse('{bozuk-json}');
  } catch (error) {
    console.error('Bozuk JSON yakalandı:', error);
    setText(jsonStatus, 'JSON işlemleri tamamlandı. Sonuçlar konsolda.');
  }
} catch (error) {
  setText(jsonStatus, 'localStorage kullanılamıyor.');
  console.error('localStorage hatası:', error);
}

try {
  throw 'metin';
} catch (error) {
  console.log('String hata:', error, 'stack var mı?', Boolean(error?.stack));
}

try {
  throw new Error('metin');
} catch (error) {
  console.log('Error nesnesi:', error.message, 'stack var mı?', Boolean(error.stack));
}

timeoutErrorButton?.addEventListener('click', () => {
  try {
    setTimeout(() => {
      throw new Error('setTimeout içindeki hata dış try/catch tarafından yakalanamaz.');
    }, 0);
  } catch (error) {
    console.error('Bu catch çalışmaz:', error);
  }
});

loadPosts();
loadRelatedData();
