// Google Photos & Drive Integration Module for Atelier T-Shirt Lab

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
  const pickerProgressWrap = document.getElementById('pickerProgressWrap');
  const pickerProgressLabel = document.getElementById('pickerProgressLabel');
  const inputClientId = document.getElementById('inputGoogleClientId');
  const inputApiKey = document.getElementById('inputGoogleApiKey');
  const btnSaveCreds = document.getElementById('btnSaveGoogleCreds');
  const credsDetails = document.getElementById('credsDetails');
  const currentOriginCode = document.getElementById('currentOriginCode');
  const btnCopyOrigin = document.getElementById('btnCopyOrigin');
  const pickerDebugLog = document.getElementById('pickerDebugLog');
  const btnClearDebug = document.getElementById('btnClearDebug');

  let currentResolvedPhoto = null;
  let tokenClient = null;
  let activeClientId = null;

  // Initialize Current Browser Origin
  const browserOrigin = window.location.origin;
  if (currentOriginCode) {
    currentOriginCode.textContent = browserOrigin;
  }
  if (btnCopyOrigin) {
    btnCopyOrigin.addEventListener('click', () => {
      navigator.clipboard.writeText(browserOrigin).then(() => {
        showToast('Origin copied! Add this to Google Cloud Authorized origins.');
      }).catch(() => {
        showToast(`Origin: ${browserOrigin}`);
      });
    });
  }

  // Live Diagnostic Logger
  function logEvent(type, message) {
    const time = new Date().toLocaleTimeString();
    const prefix = `[${time}]`;
    console.log(`${prefix} [${type}] ${message}`);

    if (pickerDebugLog) {
      const line = document.createElement('div');
      if (type === 'ERROR') line.className = 'log-err';
      else if (type === 'SUCCESS') line.className = 'log-ok';
      else line.className = 'log-info';

      line.textContent = `${prefix} ${message}`;
      pickerDebugLog.appendChild(line);
      pickerDebugLog.scrollTop = pickerDebugLog.scrollHeight;
    }
  }

  if (btnClearDebug && pickerDebugLog) {
    btnClearDebug.addEventListener('click', () => {
      pickerDebugLog.innerHTML = 'Log cleared.';
    });
  }

  function setPickerProgress(active, text = '') {
    if (pickerProgressWrap) {
      if (active) {
        pickerProgressWrap.classList.remove('hidden');
        if (pickerProgressLabel) pickerProgressLabel.textContent = text;
      } else {
        pickerProgressWrap.classList.add('hidden');
      }
    }
  }

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
        applyPhotoToStudio(sample.url, `${sample.name}.jpg`);
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

  // Helper: Convert Blob to Data URL
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Unified Multi-Strategy Image Downloader
  // Tries direct fetch -> proxy -> high-res CDN -> unauthenticated fallback
  async function resolveImageBytes(candidates, token) {
    let lastError = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      logEvent('INFO', `Attempting source [${candidate.name}]: ${candidate.url.slice(0, 60)}...`);

      try {
        const fetchHeaders = {};
        if (candidate.needsAuth && token) {
          fetchHeaders['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(candidate.url, {
          headers: fetchHeaders,
          mode: 'cors'
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await res.json();
            throw new Error(`Server returned error: ${json.error || JSON.stringify(json)}`);
          }

          const blob = await res.blob();
          if (blob && blob.size > 500) {
            logEvent('SUCCESS', `Successfully fetched image via [${candidate.name}] (${(blob.size / 1024).toFixed(1)} KB)`);
            const dataUrl = await blobToDataURL(blob);
            return { dataUrl, size: blob.size, candidate: candidate.name };
          }
        } else {
          const errText = await res.text().catch(() => '');
          logEvent('WARN', `Source [${candidate.name}] returned HTTP ${res.status}: ${errText.slice(0, 100)}`);
          lastError = new Error(`HTTP ${res.status} from ${candidate.name}`);
        }
      } catch (err) {
        logEvent('WARN', `Source [${candidate.name}] failed: ${err.message}`);
        lastError = err;
      }
    }

    throw lastError || new Error('All image fetch strategies failed.');
  }

  // Apply Graphic directly into Studio
  async function applyPhotoToStudio(imageSrc, filename = 'google_photo.jpg') {
    showLoading(true);
    setPickerProgress(true, 'Rendering on model chest...');

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        let finalSrc = imageSrc;

        // Ensure canvas export is 100% untainted by converting to Data URL if not already
        if (!imageSrc.startsWith('data:')) {
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
        setPickerProgress(false);
        pickerStatusText.textContent = `Applied "${filename}" to T-shirt!`;
        logEvent('SUCCESS', `Artwork "${filename}" successfully mounted on model! (${img.naturalWidth}x${img.naturalHeight}px)`);
        showToast(`Applied "${filename}" to t-shirt!`);

        // Close modal smoothly after brief delay
        setTimeout(() => {
          closeModal();
        }, 600);

        resolve();
      };

      img.onerror = (e) => {
        showLoading(false);
        setPickerProgress(false);
        logEvent('ERROR', `Failed to render image into studio canvas`);
        pickerStatusText.textContent = 'Error: Image could not be loaded into canvas.';
        showToast('Failed to load image into studio.');
        reject(e);
      };

      img.src = imageSrc;
    });
  }

  // Tab 1: Resolve Shared Link or Direct URL
  async function resolvePhotoLink(rawUrl) {
    let url = rawUrl.trim();
    if (!url) {
      showToast('Please enter a Google Photos share link or photo URL.');
      return;
    }

    btnFetch.disabled = true;
    btnFetch.textContent = 'Resolving...';
    logEvent('INFO', `Resolving share link: ${url}`);

    try {
      // 1. Google Drive direct link
      const driveMatch = url.match(/\/d\/([a-zA-Z0-9_\-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        const highRes = `https://lh3.googleusercontent.com/d/${fileId}=s2400`;
        logEvent('SUCCESS', `Extracted Google Drive file ID: ${fileId}`);
        showResolvedPreview(highRes, `drive_${fileId}.jpg`);
        return;
      }

      // 2. Direct googleusercontent image link
      if (url.includes('googleusercontent.com')) {
        const base = url.replace(/=[swhpd0-9-]+$/, '');
        const highRes = `${base}=w2400-h2400`;
        showResolvedPreview(highRes, 'google_photo.jpg');
        return;
      }

      // 3. Try local server resolver endpoint
      try {
        const res = await fetch(`/api/resolve-google-photo?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data && data.success && data.imageUrl) {
          logEvent('SUCCESS', `Resolved link via backend: ${data.imageUrl.slice(0, 50)}...`);
          showResolvedPreview(data.imageUrl, data.filename || 'google_photo.jpg');
          return;
        }
      } catch (serverErr) {
        logEvent('WARN', `Server resolver unavailable, using CORS proxy: ${serverErr.message}`);
      }

      // 4. Client-side fallback via public CORS proxy
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
        logEvent('SUCCESS', `Extracted photo URL from sharing page`);
        showResolvedPreview(highRes, 'google_photo.jpg');
      } else {
        logEvent('ERROR', `Could not extract photo from link`);
        showToast('Could not extract photo. Ensure the sharing link is public or use a direct photo URL.');
      }
    } catch (err) {
      logEvent('ERROR', `Link resolution failed: ${err.message}`);
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

  if (btnApply) {
    btnApply.addEventListener('click', () => {
      if (currentResolvedPhoto) {
        applyPhotoToStudio(currentResolvedPhoto.url, currentResolvedPhoto.filename);
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
      logEvent('SUCCESS', `Credentials saved. Client ID: ${cId.slice(0, 15)}...`);
      showToast('Google API credentials saved!');
    });
  }

  // Tab 2: Launch Google Picker
  if (btnLaunchPicker) {
    btnLaunchPicker.addEventListener('click', () => {
      const rawApiKey = (inputApiKey ? inputApiKey.value.trim() : '') || localStorage.getItem('gphotos_api_key') || '';
      const rawClientId = (inputClientId ? inputClientId.value.trim() : '') || localStorage.getItem('gphotos_client_id') || '';

      const apiKey = rawApiKey.replace(/["';\s]/g, '');
      const clientId = rawClientId.replace(/["';\s]/g, '');

      if (!clientId) {
        if (credsDetails) credsDetails.open = true;
        pickerStatusText.textContent = 'Please enter your Google OAuth Client ID in Credentials setup.';
        logEvent('ERROR', 'No Client ID provided.');
        showToast('Google OAuth Client ID required.');
        return;
      }

      // Check for swapped credentials
      if (apiKey && apiKey.includes('googleusercontent.com')) {
        if (credsDetails) credsDetails.open = true;
        pickerStatusText.textContent = 'Warning: API Key contains a Client ID. API Key starts with "AIzaSy...".';
        logEvent('ERROR', 'API Key appears to be a Client ID.');
        showToast('Please check the API Key field.');
        return;
      }

      localStorage.setItem('gphotos_api_key', apiKey);
      localStorage.setItem('gphotos_client_id', clientId);
      if (inputApiKey) inputApiKey.value = apiKey;
      if (inputClientId) inputClientId.value = clientId;

      logEvent('INFO', `Starting authentication with Client ID: ${clientId.slice(0, 16)}...`);
      launchGoogleAuthAndPicker(apiKey, clientId);
    });
  }

  function launchGoogleAuthAndPicker(apiKey, clientId) {
    if (typeof gapi === 'undefined' || typeof google === 'undefined') {
      logEvent('ERROR', 'Google scripts still loading from googleapis.com');
      showToast('Google API library still loading, please wait a moment...');
      return;
    }

    pickerStatusText.textContent = 'Requesting Google authorization...';
    setPickerProgress(true, 'Waiting for Google sign-in...');

    gapi.load('picker', () => {
      logEvent('INFO', 'Google Picker library loaded.');

      if (!tokenClient || activeClientId !== clientId) {
        activeClientId = clientId;
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly https://www.googleapis.com/auth/drive.readonly',
          callback: async (response) => {
            if (response.error !== undefined) {
              setPickerProgress(false);
              pickerStatusText.textContent = `Authorization error: ${response.error}`;
              logEvent('ERROR', `OAuth error: ${response.error} (${response.error_description || ''})`);
              showToast(`Google Sign-in failed: ${response.error}`);
              return;
            }

            const token = response.access_token;
            logEvent('SUCCESS', `OAuth access token obtained (length: ${token.length})`);
            setPickerProgress(false);

            // Step 1: Try dedicated Google Photos Picker API
            logEvent('INFO', 'Trying Google Photos Picker API session (photospicker.googleapis.com)...');
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
                  logEvent('SUCCESS', `Google Photos session created: ID ${session.id}`);
                  openGooglePhotosSession(session, token);
                  return;
                }
              } else {
                const status = sessionRes.status;
                const errText = await sessionRes.text().catch(() => '');
                logEvent('WARN', `Photos Picker API returned ${status}: ${errText.slice(0, 120)}`);
              }
            } catch (err) {
              logEvent('WARN', `Photos Picker API session failed: ${err.message}`);
            }

            // Step 2: Fallback to Google Drive Image Picker
            logEvent('INFO', 'Opening Google Drive / Photos Picker dialog...');
            createDrivePicker(token, apiKey, clientId);
          }
        });
      }
      tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  // Google Photos Picker API Window Handler
  function openGooglePhotosSession(session, oauthToken) {
    pickerStatusText.textContent = 'Google Photos opened! Select photo and click "Done".';
    logEvent('INFO', `Opening picker popup: ${session.pickerUri}`);

    const popup = window.open(
      session.pickerUri,
      'google_photos_picker_window',
      'width=1000,height=720,left=150,top=100,resizable=yes,scrollbars=yes'
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      logEvent('WARN', 'Popup blocked by browser. Showing direct click link.');
      pickerStatusText.innerHTML = `Popup blocked! <a href="${session.pickerUri}" target="_blank" style="color: #818cf8; text-decoration: underline; font-weight: bold;">Click here to open Google Photos</a>`;
      showToast('Popup blocked — click the link in dialog to open Google Photos.');
    }

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
            logEvent('SUCCESS', 'User confirmed photo selection in Google Photos!');
            pickerStatusText.textContent = 'Retrieving selected photo...';
            setPickerProgress(true, 'Fetching photo data...');

            const itemsRes = await fetch(`https://photospicker.googleapis.com/v1/mediaItems?sessionId=${session.id}`, {
              headers: { 'Authorization': `Bearer ${oauthToken}` }
            });

            if (itemsRes.ok) {
              const itemsData = await itemsRes.json();
              logEvent('INFO', `MediaItems received: ${itemsData.mediaItems?.length || 0} item(s)`);

              if (itemsData.mediaItems && itemsData.mediaItems.length > 0) {
                const item = itemsData.mediaItems[0];
                const rawBaseUrl = item.mediaFile?.baseUrl || item.baseUrl;
                const filename = item.mediaFile?.filename || item.filename || 'google_photo.jpg';

                logEvent('INFO', `Selected: "${filename}", baseUrl: ${rawBaseUrl ? rawBaseUrl.slice(0, 45) + '...' : 'none'}`);

                if (rawBaseUrl) {
                  pickerStatusText.textContent = `Downloading "${filename}"...`;
                  setPickerProgress(true, `Downloading "${filename}"...`);

                  // Build multi-tier candidates
                  const candidates = [
                    {
                      name: 'Direct Browser Fetch (High-Res)',
                      url: `${rawBaseUrl}=w2400-h2400`,
                      needsAuth: true
                    },
                    {
                      name: 'Vite Proxy (High-Res)',
                      url: `/api/proxy-image?url=${encodeURIComponent(rawBaseUrl + '=w2400-h2400')}&token=${encodeURIComponent(oauthToken)}`,
                      needsAuth: false
                    },
                    {
                      name: 'Direct Browser Fetch (Original =d)',
                      url: `${rawBaseUrl}=d`,
                      needsAuth: true
                    },
                    {
                      name: 'Vite Proxy (Original =d)',
                      url: `/api/proxy-image?url=${encodeURIComponent(rawBaseUrl + '=d')}&token=${encodeURIComponent(oauthToken)}`,
                      needsAuth: false
                    },
                    {
                      name: 'Unauthenticated High-Res',
                      url: `${rawBaseUrl}=w2400-h2400`,
                      needsAuth: false
                    }
                  ];

                  try {
                    const result = await resolveImageBytes(candidates, oauthToken);
                    await applyPhotoToStudio(result.dataUrl, filename);
                  } catch (downloadErr) {
                    logEvent('ERROR', `Could not download photo: ${downloadErr.message}`);
                    pickerStatusText.textContent = `Error downloading image: ${downloadErr.message}`;
                    setPickerProgress(false);
                  }
                } else {
                  pickerStatusText.textContent = 'Could not find photo URL in selection.';
                  logEvent('ERROR', 'No baseUrl in mediaItem');
                  setPickerProgress(false);
                }
              } else {
                pickerStatusText.textContent = 'No photos selected.';
                setPickerProgress(false);
              }
            } else {
              pickerStatusText.textContent = 'Could not load selected photo details.';
              logEvent('ERROR', `mediaItems fetch failed: HTTP ${itemsRes.status}`);
              setPickerProgress(false);
            }

            // Cleanup session
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
          setPickerProgress(false);
        }
      } catch (pollErr) {
        console.warn('Polling error:', pollErr);
      }

      if (pollCount > 240) { // 4-minute timeout
        clearInterval(pollInterval);
        pickerStatusText.textContent = 'Selection timed out.';
        setPickerProgress(false);
      }
    }, 1500);
  }

  // Google Drive & Picker API Dialog
  function createDrivePicker(oauthToken, apiKey, clientId) {
    pickerStatusText.textContent = 'Opening image selector...';
    setPickerProgress(true, 'Opening picker dialog...');

    const driveView = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES);
    driveView.setIncludeFolders(true);

    const origin = window.location.origin;
    const appId = clientId ? clientId.split('-')[0] : '';

    const builder = new google.picker.PickerBuilder()
      .addView(driveView)
      .setOAuthToken(oauthToken)
      .setOrigin(origin)
      .setTitle('Select an Image for T-Shirt')
      .setCallback(async (data) => {
        logEvent('INFO', `Picker callback action: ${data[google.picker.Response.ACTION]}`);

        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const doc = data[google.picker.Response.DOCUMENTS][0];
          const fileId = doc[google.picker.Document.ID] || doc.id;
          const filename = doc[google.picker.Document.NAME] || 'google_photo.jpg';

          logEvent('SUCCESS', `Picked doc ID: ${fileId}, name: "${filename}"`);
          logEvent('INFO', `Doc metadata: ${JSON.stringify({
            id: fileId,
            mimeType: doc.mimeType,
            hasThumbnails: !!(doc.thumbnails && doc.thumbnails.length),
            thumbUrl: doc.thumbnails?.[0]?.url ? doc.thumbnails[0].url.slice(0, 50) + '...' : null
          })}`);

          pickerStatusText.textContent = `Applying "${filename}"...`;
          setPickerProgress(true, `Downloading "${filename}"...`);

          // Build multi-tier candidates for Drive
          const candidates = [];

          // Strategy 1: Google CDN High-Resolution Thumbnail (Works 100% WITHOUT Drive API enabled!)
          if (doc.thumbnails && doc.thumbnails[0] && doc.thumbnails[0].url) {
            const rawThumb = doc.thumbnails[0].url;
            const highResThumb = rawThumb.replace(/=s\d+.*$/, '=s2400').replace(/=w\d+.*$/, '=w2400');
            candidates.push({
              name: 'Google CDN High-Res Thumbnail (=s2400)',
              url: highResThumb,
              needsAuth: false
            });
            candidates.push({
              name: 'Google CDN Scaled Thumbnail',
              url: rawThumb,
              needsAuth: false
            });
          }

          // Strategy 2: Google Drive CDN Thumbnail by File ID
          candidates.push({
            name: 'Google Drive Direct CDN (=s2400)',
            url: `https://lh3.googleusercontent.com/d/${fileId}=s2400`,
            needsAuth: false
          });

          // Strategy 3: Google Drive API v3 alt=media (direct in-browser fetch with Bearer token)
          const driveMediaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
          candidates.push({
            name: 'Google Drive API Direct (Bearer Token)',
            url: driveMediaUrl,
            needsAuth: true
          });

          // Strategy 4: Vite Proxy for Drive API
          candidates.push({
            name: 'Vite Proxy (Drive API)',
            url: `/api/proxy-image?url=${encodeURIComponent(driveMediaUrl)}&token=${encodeURIComponent(oauthToken)}`,
            needsAuth: false
          });

          // Strategy 5: Vite Proxy for CDN
          candidates.push({
            name: 'Vite Proxy (Google CDN)',
            url: `/api/proxy-image?url=${encodeURIComponent('https://lh3.googleusercontent.com/d/' + fileId + '=s2400')}`,
            needsAuth: false
          });

          try {
            const result = await resolveImageBytes(candidates, oauthToken);
            await applyPhotoToStudio(result.dataUrl, filename);
          } catch (driveErr) {
            logEvent('ERROR', `All Drive fetch strategies failed: ${driveErr.message}`);
            pickerStatusText.textContent = `Failed to download: ${driveErr.message}`;
            setPickerProgress(false);
            showToast('Could not load image. See diagnostic log below.');
          }
        } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
          pickerStatusText.textContent = 'Picker canceled.';
          setPickerProgress(false);
          logEvent('INFO', 'User closed picker without selecting.');
        }
      });

    if (apiKey) {
      builder.setDeveloperKey(apiKey);
    }
    if (appId) {
      builder.setAppId(appId);
    }

    try {
      const picker = builder.build();
      picker.setVisible(true);
      setPickerProgress(false);
      pickerStatusText.textContent = 'Picker open. Select an image to apply.';
      logEvent('SUCCESS', 'Picker dialog displayed successfully.');
    } catch (buildErr) {
      logEvent('ERROR', `Failed to display picker: ${buildErr.message}`);
      pickerStatusText.textContent = `Picker error: ${buildErr.message}`;
      setPickerProgress(false);
    }
  }
}
