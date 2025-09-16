try {
    if (window.Notification) {
        const deny = () => Promise.resolve('denied');
        Object.defineProperty(Notification, 'requestPermission', {
            value: () => deny(),
            configurable: true
        });
        const OldNotif = Notification;
        window.Notification = function Notification() {
            throw new Error('Notifications are disabled.');
        };
        window.Notification.prototype = OldNotif.prototype;
    }
    if (navigator.permissions && navigator.permissions.query) {
        const origQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = (desc) => {
            const name = desc && (desc.name || desc.permission || '');
            if (name === 'notifications' || name === 'push') return Promise.resolve({ state: 'denied', onchange: null });
            return origQuery(desc);
        };
    }
    if (navigator.serviceWorker && navigator.serviceWorker.register) {
        navigator.serviceWorker.register = function () {
            throw new Error('Service workers are disabled in this app.');
        };
    }
    if (window.ServiceWorkerRegistration && ServiceWorkerRegistration.prototype && ServiceWorkerRegistration.prototype.pushManager) {
        ServiceWorkerRegistration.prototype.pushManager.subscribe = function () {
            return Promise.reject(new Error('Push is disabled.'));
        };
    }
} catch (e) { }

var download_count = 0;

function isValidURL(str) {
    try { new URL(str); return true; } catch (_) { return false; }
}

function checkURL() {
    var link = document.getElementById("link").value;
    var loadButton = document.getElementById("load");
    if (!isValidURL(link)) {
        loadButton.disabled = true;
        loadButton.value = "Invalid";
    } else {
        loadButton.removeAttribute("disabled");
        loadButton.value = "Valid";
    }
}

var loadButton = document.getElementById('load');
loadButton.setAttribute('onclick', 'd();');

// Extract YouTube video ID
function parseYtId(s) {
    let e;
    if (s.indexOf("youtube.com/shorts/") > -1) e = /\/shorts\/([a-zA-Z0-9\-_]{11})/.exec(s);
    else if (s.indexOf("youtube.com/") > -1) e = /v=([a-zA-Z0-9\-_]{11})/.exec(s);
    else if (s.indexOf("youtu.be/") > -1) e = /\/([a-zA-Z0-9\-_]{11})/.exec(s);
    return e ? e[1] : null;
}

function isYouTube(url) {
    return url.includes("youtu");
}

function createElementFromHTML(htmlString) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// Get YouTube title from oEmbed API
async function getVideoTitle(url) {
    if (isYouTube(url)) {
        try {
            const ytId = parseYtId(url);
            if (ytId) {
                const resp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
                if (resp.ok) {
                    const data = await resp.json();
                    return data.title || document.title;
                }
            }
        } catch (e) { console.error("Title fetch error", e); }
    }
    return document.title || "video";
}

// Main download function
async function d() {
    var loadButton = document.getElementById("load");
    loadButton.disabled = true;

    var link = document.getElementById("link").value;
    var format = document.getElementById("format").value;

    if (!isValidURL(link) || link.length === 0) {
        loadButton.removeAttribute("disabled");
        if (link.length === 0) alert("Please Insert a Download URL");
        return;
    }

    const videoTitle = await getVideoTitle(link);

    // Send URL + Title to Android if available
    if (window.AndroidDownloader) {
        window.AndroidDownloader.startDownload(link, videoTitle);
    }

    // Add placeholder UI
    var dsElement = document.getElementById("ds");
    var placeholder = createElementFromHTML(`<div id="placeholder">
        <div class="download-card mx-auto bg-white rounded-xl shadow-md overflow-hidden flex">
            <div class="md:flex flex" style="filter: blur(5px); background-color: #ccc;">
                <div class="md:flex-shrink-0">
                    <img class="h-48 object-cover md:w-48" src="https://i.ytimg.com/vi/${parseYtId(link) || "dQrBgda0sEY"}/hqdefault.jpg">
                </div>
                <div class="p-8 flex">
                    <div class="uppercase pb-1 text-sm text-indigo-500 font-semibold"><small><strong>${videoTitle}</strong></small></div>
                    <div class="progress"><div class="progress-bar" style="width: 100%;">100%</div></div>
                </div>
            </div>
        </div>
    </div>`);
    dsElement.insertBefore(placeholder, dsElement.firstChild);

    document.getElementById("ds").scrollIntoView({ behavior: "smooth" });

    function postFetchTasks(data, isPlaylist) {
        if (isPlaylist) document.body.innerHTML += data.html;
        else p(data.id);
        placeholder.innerHTML = atob(data.content);
        placeholder.removeAttribute("id");
        loadButton.removeAttribute("disabled");
        download_count++;
        if (download_count === 1) loadButton.setAttribute('onclick', 'd();');
    }

    // Fetch download link from your servers
    const baseUrl = "https://p.savenow.to/ajax/download.php";
    if (parseYtId(link) !== null) {
        fetch(`${baseUrl}?format=${format}&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + parseYtId(link))}`, { cache: "no-store" })
            .then(r => r.json()).then(data => postFetchTasks(data, false))
            .catch(err => console.error(err));
    } else if (isYouTube(link)) {
        fetch(`https://loader.to/ajax/playlist.php?format=${format}&url=${encodeURIComponent(link)}`, { cache: "no-store" })
            .then(r => r.json())
            .then(data => {
                if (data.is_playlist === true) postFetchTasks(data, true);
                else fetch(`${baseUrl}?format=${format}&url=${encodeURIComponent(link)}`, { cache: "no-store" })
                    .then(r2 => r2.json()).then(data2 => postFetchTasks(data2, false))
                    .catch(err => console.error(err));
            }).catch(err => console.error(err));
    } else {
        fetch(`${baseUrl}?format=${format}&url=${encodeURIComponent(link)}`, { cache: "no-store" })
            .then(r => r.json()).then(data => postFetchTasks(data, false))
            .catch(err => console.error(err));
    }
}

// Progress checking
function p(i) {
    fetch("https://p.savenow.to/api/progress?id=" + i, { cache: "no-store" })
        .then(r => r.json())
        .then(data => {
            const pctNum = Math.max(0, Math.min(100, (data.progress || 0) / 10));
            const pct = pctNum + "%";
            const progBar = document.getElementById(i + "_progress");
            if (progBar) {
                progBar.style.width = pct;
                progBar.textContent = pct;
            }
            const ready = data.download_url != null && data.success == 1;
            if (ready) return;
            setTimeout(p.bind(null, i), 1500);
        })
        .catch(() => setTimeout(p.bind(null, i), 1500));
}

function copyLink(id) {
    var copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Copied!");
}

function getOS() {
   var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
      windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
      iosPlatforms = ["iPhone", "iPad", "iPod"],
      os = null;

   if (macosPlatforms.indexOf(platform) !== -1) {
      os = "Mac OS";
   } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = "iOS";
   } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = "Windows";
   } else if (/Android/.test(userAgent)) {
      os = "Android";
   } else if (!os && /Linux/.test(platform)) {
      os = "Linux";
   }

   return os;
}

var os = getOS();

function openNav(id) {
   if (window.screen.width > 768) {
      document.getElementById(id).style.width = "400px";
   } else {
      document.getElementById(id).style.width = "100vw";
   }
}

function closeNav(id) {
   document.getElementById(id).style.width = "0";
}

function loadNext(limit, id, url) {
   fetch(
         "https://loader.to/ajax/playlist.php?limit=" +
         limit +
         "&url=" +
         encodeURIComponent(url), {
            cache: "no-store",
         }
      )
      .then((response) => response.json())
      .then((data) => {
         document.getElementById(id).innerHTML += data.html;
      })
      .catch((error) => console.error(error));
}

function parseYtId(s) {
   let e;
   if (s.indexOf("youtube.com/shorts/") > -1) {
      e = /\/shorts\/([a-zA-Z0-9\-_]{11})/.exec(s);
   } else if (s.indexOf("youtube.com/") > -1) {
      e = /v=([a-zA-Z0-9\-_]{11})/.exec(s);
   } else if (s.indexOf("youtu.be/") > -1) {
      e = /\/([a-zA-Z0-9\-_]{11})/.exec(s);
   }
   if (e) {
      return e[1];
   }
   return null;
}

function isYouTube(url) {
   return url.includes("youtu");
}

function onVisible(element, callback) {
   new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
         if (entry.intersectionRatio > 0) {
            callback(element);
            observer.disconnect();
         }
      });
   }).observe(element);
}

function appendScripts() {}

appendScripts();