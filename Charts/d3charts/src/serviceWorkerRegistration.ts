const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.startsWith('127.')
  );

  export function register() {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const publicUrl = new URL(process.env.PUBLIC_URL!, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          checkValidServiceWorker(swUrl);
        } else {
          registerValidSW(swUrl);
        }
      });
    }
  }
  
  function registerValidSW(swUrl: string) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        registration.update();
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl: string) {
    fetch(swUrl)
      .then((response) => {
        if (response.status === 404 || response.headers.get('content-type')?.indexOf('javascript') === -1) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          registerValidSW(swUrl);
        }
      })
      .catch(() => {
        console.log('No internet connection found. App is running in offline mode.');
      });
  }
  