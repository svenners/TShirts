// Google Photos Integration Module for Atelier T-Shirt Lab

const SAMPLE_GOOGLE_PHOTOS = [
  {
    name: 'Cyberpunk Neon Art',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    type: 'JPG'
  },
  {
    name: 'Tokyo Neon Nights',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
    type: 'JPG'
  },
  {
    name: 'Golden Sunset Wave',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    type: 'JPG'
  },
  {
    name: 'Alpine Mountain Peak',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    type: 'JPG'
  },
  {
    name: 'Abstract Fluid Swirl',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
    type: 'JPG'
  },
  {
    name: 'Tiger in the Mist',
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&auto=format&fit=crop&q=80',
    type: 'JPG'
  }
];

export function setupGooglePhotos({ setGraphic, showToast, showLoading }) {
  const modal = document.getElementById('googlePhotosModal');
  const btnOpen = document.getElementById('btnOpenGooglePhotos');
  const btnClose = document.getElementById('btnCloseGooglePhotos');
  const inputUrl = document.getElementById('inputGooglePhotosUrl');
  const btnFetch = document.getElementById('btnFetchGooglePhoto');
  const previewCard = document.getElementById('gphotosPreviewCard');
  const previewImg = document.getElementById('gphotosPreviewImg');
  const previewTitle = document.getElementById('gphotosPreviewTitle');
  const previewMeta = document.getElementById('gphotosPreviewMeta');
  const btnApply = document.getElementById('btnApplyGooglePhoto');
  const sampleGrid = document.getElementById('gphotosSampleGrid');
  const tabs = document.querySelectorAll('.gphotos-tab');
  const tabContents = document.querySelectorAll('.gphotos-tab-content');

  // Google Picker elements
  const btnLaunchPicker = document.getElementById('btnLaunchGooglePicker');
  const pickerStatusText = document.getElementById('pickerStatusText');
  const inputClientId = document.getElementById('inputGoogleClientId');
  const inputApiKey = document.getElementById('inputGoogleApiKey');
  const btnSaveCreds = document.getElementById('btnSaveGoogleCreds');
  const credsDetails = document.getElementById('credsDetails');

  let currentResolvedPhoto = null;
  let tokenClient = null;

  // Restore saved credentials from localStorage
  const savedClientId = localStorage.getItem('gphotos_client_id') || '';
  const savedApiKey = localStorage.getItem('gphotos_api_key') || '';
  if (inputClientId && savedClientId) inputClientId.value = savedClientId;
  if (inputApiKey && savedApiKey) inputApiKey.value = savedApiKey;

  // Render Sample Photos
  if (sampleGrid) {
    sampleGrid.innerHTML = '';
    SAMPLE_GOOGLE_PHOTOS.forEach(sample => {
      const item = document.createElement('div');
      item.className = 'gphotos-sample-item';
      item.innerHTML = `
        <img src="${sample.url}" alt="${sample.name}" loading="lazy" />
        <span class="gphotos-sample-title">${sample.name}</span>
      `;
      item.addEventListener('click', () => {
        applyPhotoUrl(sample.url, `${sample.name}.jpg`);
      });
      sampleGrid.appendChild(item);
    });
  }

  // Open / Close Modal
  const openModal = () => {
    modal.classList.remove('hidden');
    inputUrl.focus();
  };

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tabContent${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Fetch / Resolve Photo Link
  async function resolvePhotoLink(rawUrl) {
    let url = rawUrl.trim();
    if (!url) {
      showToast('Please enter a Google Photos share link or photo URL.');
      return;
    }

    btnFetch.disabled = true;
    btnFetch.textContent = 'Resolving...';

    try {
      // 1. Direct googleusercontent image link
      if (url.includes('googleusercontent.com')) {
        const base = url.replace(/=[swhpd0-9-]+$/, '');
        const highRes = `${base}=w2400-h2400`;
        showResolvedPreview(highRes, 'google_photo.jpg');
        return;
      }

      // 2. Try local server resolver endpoint
      try {
        const res = await fetch(`/api/resolve-google-photo?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data && data.success && data.imageUrl) {
          showResolvedPreview(data.imageUrl, data.filename || 'google_photo.jpg');
          return;
        }
      } catch (serverErr) {
        console.warn('Server resolver endpoint unavailable, attempting fallback:', serverErr);
      }

      // 3. Client-side fallback via public CORS proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl);
      const html = await proxyRes.text();

      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      let imgUrl = ogMatch ? ogMatch[1] : null;

      if (!imgUrl) {
        const lh3Match = html.match(/(https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9_\-]+)/);
        if (lh3Match) imgUrl = lh3Match[1];
      }

      if (imgUrl) {
        const base = imgUrl.replace(/=[swhpd0-9-]+$/, '');
        const highRes = `${base}=w2400-h2400`;
        showResolvedPreview(highRes, 'google_photo.jpg');
      } else {
        showToast('Could not extract photo. Ensure the sharing link is public or use a direct photo URL.');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to resolve Google Photos link.');
    } finally {
      btnFetch.disabled = false;
      btnFetch.textContent = 'Load Photo';
    }
  }

  function showResolvedPreview(imageUrl, filename) {
    previewCard.classList.remove('hidden');
    previewImg.src = imageUrl;
    previewTitle.textContent = filename;
    previewMeta.textContent = 'Verifying image...';

    const testImg = new Image();
    testImg.crossOrigin = 'anonymous';
    testImg.onload = () => {
      previewMeta.textContent = `${testImg.naturalWidth} × ${testImg.naturalHeight} px • High Resolution`;
      currentResolvedPhoto = {
        url: imageUrl,
        filename: filename,
        width: testImg.naturalWidth,
        height: testImg.naturalHeight
      };
    };
    testImg.onerror = () => {
      previewMeta.textContent = 'Preview loaded (ready to apply)';
      currentResolvedPhoto = {
        url: imageUrl,
        filename: filename,
        width: 1200,
        height: 1200
      };
    };
    testImg.src = imageUrl;
  }

  if (btnFetch) {
    btnFetch.addEventListener('click', () => {
      resolvePhotoLink(inputUrl.value);
    });
  }

  if (inputUrl) {
    inputUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        resolvePhotoLink(inputUrl.value);
      }
    });
  }

  // Apply Photo to T-Shirt (converting to Data URL for 100% CORS-safe canvas export)
  async function applyPhotoUrl(imgUrl, filename = 'google_photo.jpg') {
    showLoading(true);
    closeModal();

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let finalSrc = imgUrl;

      // Convert to local Data URL so canvas export is guaranteed not to be tainted
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        finalSrc = canvas.toDataURL('image/png');
      } catch (corsErr) {
        console.warn('Canvas export tainted or CORS fallback active, using direct source:', corsErr);
      }

      setGraphic({
        src: finalSrc,
        filename: filename,
        type: 'JPG',
        dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        sizeText: 'Google Photo',
        isAnimated: false
      });

      showLoading(false);
      showToast(`Applied "${filename}" to t-shirt!`);
    };

    img.onerror = () => {
      showLoading(false);
      showToast('Failed to load image into studio. Please try another link.');
    };

    img.src = imgUrl;
  }

  if (btnApply) {
    btnApply.addEventListener('click', () => {
      if (currentResolvedPhoto) {
        applyPhotoUrl(currentResolvedPhoto.url, currentResolvedPhoto.filename);
      }
    });
  }

  // Save Credentials
  if (btnSaveCreds) {
    btnSaveCreds.addEventListener('click', () => {
      const cId = inputClientId.value.trim();
      const aKey = inputApiKey.value.trim();
      localStorage.setItem('gphotos_client_id', cId);
      localStorage.setItem('gphotos_api_key', aKey);
      showToast('Google API credentials saved!');
    });
  }

  // Official Google Picker API
  let activeClientId = null;

  if (btnLaunchPicker) {
    btnLaunchPicker.addEventListener('click', () => {
      const rawApiKey = (inputApiKey ? inputApiKey.value.trim() : '') || localStorage.getItem('gphotos_api_key') || '';
      const rawClientId = (inputClientId ? inputClientId.value.trim() : '') || localStorage.getItem('gphotos_client_id') || '';

      const apiKey = rawApiKey.replace(/["';\s]/g, '');
      const clientId = rawClientId.replace(/["';\s]/g, '');

      if (!clientId) {
        if (credsDetails) credsDetails.open = true;
        pickerStatusText.textContent = 'Please enter your Google OAuth Client ID above.';
        showToast('Google OAuth Client ID required.');
        return;
      }

      // Check for swapped credentials
      if (apiKey && apiKey.includes('googleusercontent.com')) {
        if (credsDetails) credsDetails.open = true;
        pickerStatusText.textContent = 'Warning: Your API Key field contains a Client ID (.apps.googleusercontent.com). The API Key starts with "AIzaSy...".';
        showToast('Please check the API Key field.');
        return;
      }

      // Save sanitized values automatically
      localStorage.setItem('gphotos_api_key', apiKey);
      localStorage.setItem('gphotos_client_id', clientId);
      if (inputApiKey) inputApiKey.value = apiKey;
      if (inputClientId) inputClientId.value = clientId;

      launchGooglePicker(apiKey, clientId);
    });
  }

  function launchGooglePicker(apiKey, clientId) {
    if (typeof gapi === 'undefined' || typeof google === 'undefined') {
      showToast('Google API library still loading, please wait a moment...');
      return;
    }

    pickerStatusText.textContent = 'Requesting Google authorization...';

    gapi.load('picker', () => {
      if (!tokenClient || activeClientId !== clientId) {
        activeClientId = clientId;
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly https://www.googleapis.com/auth/drive.readonly',
          callback: async (response) => {
            if (response.error !== undefined) {
              pickerStatusText.textContent = `Authorization error: ${response.error}`;
              showToast('Google Sign-in failed.');
              return;
            }

            const token = response.access_token;

            // 1. Try Google Photos Picker API (dedicated to Google Photos)
            pickerStatusText.textContent = 'Opening Google Photos library...';
            try {
              const sessionRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
              });

              if (sessionRes.ok) {
                const session = await sessionRes.json();
                if (session && session.pickerUri) {
                  openGooglePhotosPickerSession(session, token);
                  return;
                }
              } else {
                console.warn('Google Photos session API response:', sessionRes.status, await sessionRes.text());
              }
            } catch (err) {
              console.warn('Google Photos Picker API session error, falling back to Drive:', err);
            }

            // 2. Fallback to Google Drive picker
            createDrivePicker(token, apiKey, clientId);
          }
        });
      }
      tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  function openGooglePhotosPickerSession(session, oauthToken) {
    pickerStatusText.textContent = 'Google Photos opened! Select your photo(s) and click "Done".';

    const popup = window.open(
      session.pickerUri,
      'google_photos_picker_window',
      'width=1000,height=720,left=150,top=100,resizable=yes,scrollbars=yes'
    );

    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      pollCount++;

      try {
        const getRes = await fetch(`https://photospicker.googleapis.com/v1/sessions/${session.id}`, {
          headers: { 'Authorization': `Bearer ${oauthToken}` }
        });

        if (getRes.ok) {
          const sessionData = await getRes.json();
          if (sessionData.mediaItemsSet) {
            clearInterval(pollInterval);
            if (popup && !popup.closed) popup.close();
            pickerStatusText.textContent = 'Retrieving selected photo...';

            const itemsRes = await fetch(`https://photospicker.googleapis.com/v1/mediaItems?sessionId=${session.id}`, {
              headers: { 'Authorization': `Bearer ${oauthToken}` }
            });

            if (itemsRes.ok) {
              const itemsData = await itemsRes.json();
              if (itemsData.mediaItems && itemsData.mediaItems.length > 0) {
                const item = itemsData.mediaItems[0];
                const imgUrl = `${item.baseUrl}=w2400-h2400`;
                const filename = item.filename || 'google_photo.jpg';
                applyPhotoUrl(imgUrl, filename);
                pickerStatusText.textContent = `Applied "${filename}"!`;
              } else {
                pickerStatusText.textContent = 'No photos selected.';
              }
            } else {
              pickerStatusText.textContent = 'Could not load selected photo details.';
            }

            // Clean up session proactively
            fetch(`https://photospicker.googleapis.com/v1/sessions/${session.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${oauthToken}` }
            }).catch(() => {});

            return;
          }
        }

        if (popup && popup.closed) {
          clearInterval(pollInterval);
          pickerStatusText.textContent = 'Google Photos window closed.';
        }
      } catch (pollErr) {
        console.warn('Google Photos polling error:', pollErr);
      }

      if (pollCount > 180) { // 3-minute timeout
        clearInterval(pollInterval);
        pickerStatusText.textContent = 'Selection timed out.';
      }
    }, 1500);
  }

  function createDrivePicker(oauthToken, apiKey, clientId) {
    pickerStatusText.textContent = 'Opening image selector...';

    // Image picker view
    const driveView = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES);
    driveView.setIncludeFolders(true);

    const origin = window.location.protocol + '//' + window.location.host;
    const appId = clientId ? clientId.split('-')[0] : '';

    const builder = new google.picker.PickerBuilder()
      .addView(driveView)
      .setOAuthToken(oauthToken)
      .setOrigin(origin)
      .setTitle('Select an Image')
      .setCallback((data) => {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const doc = data[google.picker.Response.DOCUMENTS][0];
          const filename = doc[google.picker.Document.NAME] || 'google_photo.jpg';
          const imgUrl = doc[google.picker.Document.THUMBNAILS]?.[0]?.url || doc[google.picker.Document.URL];
          if (imgUrl) {
            applyPhotoUrl(imgUrl, filename);
          }
        }
      });

    // Only attach developer key if provided (OAuth token is already authorized)
    if (apiKey) {
      builder.setDeveloperKey(apiKey);
    }

    if (appId) {
      builder.setAppId(appId);
    }

    const picker = builder.build();
    picker.setVisible(true);
    pickerStatusText.textContent = 'Picker open. Select an image to apply.';
  }
}
