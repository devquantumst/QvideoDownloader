try {
   if (window.Notification) {
      const deny = () => Promise.resolve('denied');
      const rp = Notification.requestPermission?.bind(Notification);
      Object.defineProperty(Notification, 'requestPermission', {
         value: (...args) => {
            if (args.length && typeof args[0] === 'function') {
               try {
                  args[0]('denied');
               } catch (e) {}


// --- Begin: resilient fetch wrapper (adds CORS fallback) ---
(function() {
  try {
    const _origFetch = window.fetch.bind(window);
    window.fetch = async function(input, init) {
      // default options: CORS + no-referrer + no-store (caller can override)
      const baseInit = { mode: "cors", referrerPolicy: "no-referrer", cache: "no-store" };
      try {
        const res = await _origFetch(input, Object.assign({}, baseInit, init || {}));
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res;
      } catch (err) {
        // Only try proxy for cross-origin absolute URLs
        try {
          const url = typeof input === "string" ? input : (input && input.url);
          if (!url) throw err;
          const dest = new URL(url, location.href);
          if (dest.origin === location.origin) throw err;
          const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(dest.href);
          const res2 = await _origFetch(proxy, { cache: "no-store" });
          if (!res2.ok) throw new Error("Proxy HTTP " + res2.status);
          return res2;
        } catch (err2) {
          throw err2;
        }
      }
    };
  } catch (_e) {}
})();
 // --- End: resilient fetch wrapper ---



            }
            return deny();
         },
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
         if (name === 'notifications' || name === 'push') return Promise.resolve({
            state: 'denied',
            onchange: null
         });
         return origQuery(desc);
      };
   }
   if (navigator.serviceWorker && navigator.serviceWorker.register) {
      const sw = navigator.serviceWorker;
      sw.register = function () {
         // No-op to avoid third-party SW registration crashes on GH Pages
         return Promise.resolve(undefined);
      };
   }
   if (window.ServiceWorkerRegistration && ServiceWorkerRegistration.prototype && ServiceWorkerRegistration.prototype.pushManager) {
      ServiceWorkerRegistration.prototype.pushManager.subscribe = function () {
         return Promise.reject(new Error('Push is disabled.'));
      };
   }
} catch (e) {}

var link;
var download_count = 0;
var title = document.title;
var user_country;
var visited_convertr = false;

function quicklink() {
   var link_now = new URL(window.location.href);
   var r = link_now.searchParams.get("r");
   var f = link_now.searchParams.get("f");

   var mapping = {
      ddownr: {
         1: "mp3",
         3: "m4a",
         4: "m4a",
         5: "720",
         6: "1080",
         7: "1080",
         8: "8k",
         9: "360",
         10: "480",
         11: "4k",
      },
      coconvert: {
         1: "mp3",
         2: "m4a",
         3: "webm",
         4: "360",
         5: "480",
         6: "720",
         7: "1080",
         8: "1080",
         9: "4k",
         10: "8k",
         11: "aac",
         12: "flac",
         13: "opus",
         14: "ogg",
         15: "wav",
      },
      loader: {
         1: "mp3",
         2: "m4a",
         3: "webm",
         4: "360",
         5: "480",
         6: "720",
         7: "1080",
         8: "1080",
         9: "4k",
         10: "8k",
         11: "aac",
         12: "flac",
         13: "opus",
         14: "ogg",
         15: "wav",
      },
      y2downcc: {
         1: "mp3",
         2: "m4a",
         3: "webm",
         4: "360",
         5: "480",
         6: "720",
         7: "1080",
         8: "1080",
         9: "4k",
         10: "8k",
         11: "aac",
         12: "flac",
         13: "opus",
         14: "ogg",
         15: "wav",
      },
   };

   if (r != null) {
      document.getElementById("link").value = decodeURIComponent(
         link_now.searchParams.get("link")
      );

      if (mapping[r] && mapping[r][f]) {
         f = mapping[r][f];
      }
      document.getElementById("format").value = f;

      d();
   }
}

function isValidURL(str) {
   try {
      new URL(str);
      return true;
   } catch (_) {
      return false;
   }
}

function checkURL() {
   var link = document.getElementById("link").value;
   var loadButton = document.getElementById("load");

   if (!isValidURL(link)) {
      loadButton.disabled = true;
      loadButton.value = "Invalid";
      // loadButton.innerHTML = "Please insert a real URL";
   } else {
      loadButton.removeAttribute("disabled");
      loadButton.value = "Valid";
      // loadButton.innerHTML = "Download";
   }
}

var loadButton = document.getElementById('load');
loadButton.setAttribute('onclick', 'd();');

function d() {
   var loadButton = document.getElementById("load");
   loadButton.disabled = true;

   var link = document.getElementById("link").value;
   var format = document.getElementById("format").value;

   if (!isValidURL(link) || link.length === 0) {
      loadButton.removeAttribute("disabled");
      if (link.length === 0) {
         alert("Please Insert a Download URL");
      }
      return;
   }

   var dsElement = document.getElementById("ds");
   var placeholder = createElementFromHTML(`
    <div id="placeholder">
    <div id="card-11111" class="download-card mx-auto bg-white rounded-xl shadow-md overflow-hidden flex">
    <div class="md:flex flex" style="-webkit-filter: blur(5px);
  -moz-filter: blur(5px);
  -o-filter: blur(5px);
  -ms-filter: blur(5px);
  filter: blur(150px);
  /* width: 100px; */
  /* height: 100px; */
  background-color: #ccc;">
                    <div class="md:flex-shrink-0">
                        <img class="h-48 object-cover md:w-48" src="https://i.ytimg.com/vi/dQrBgda0sEY/hqdefault.jpg">
                    </div>
                    <div class="p-8 flex">
					<div class="uppercase pb-1 overflow tracking-wide text-sm text-indigo-500 font-semibold"><small><a href="#" target="_blank" rel="noopener noreferrer nofollow"><strong>Video</strong></a> - MP3 - 1 to 1 | <a href="https://www.byclickdownloader.com/How-to-download-youtube-playlists.php?source=loader2&innerpage=playlist" onclick="gtag('event', 'ad_byclick_playlist', {'event_category' : 'ad','event_label' : 'byclick_playlist'});" target="_blank" rel="noopener noreferrer nofollow"><strong>Download big playlist with more than 20 videos</strong></a></small></div>
                        <div class="progress">
                            <div class="progress-bar" id="dad467f182acc6007180a998aeb_progress" style="width: 100%;">100%</div>
                        </div>
                        <a onclick="// window.open removedgtag('event', 'dl_uncached', {'event_category' : 'dl','event_label' : 'dl_uncached'});" disabled="" id="" download="">
                            <button id="dad467f182acc6007180a998aeb_downloadButton" class="strong">
                                <div id="dad467f182acc6007180a998aeb_loadingIcon" class="loader" style="display: none;"></div>
                                <svg id="dad467f182acc6007180a998aeb_downloadIcon" style="display: inline-block;" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-download" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"></path>
                                    <path fill-rule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"></path>
                                </svg>
                                Download
                            </button>
                        </a>
						<a href="https://convertr.org" onclick="gtag('event', 'ad_veed_io', {'event_category' : 'ad','event_label' : 'veed_io'});" target="_blank" rel="noopener noreferrer nofollow"><strong style="max-width: 80%;display: block;margin-left: auto;margin-right: auto;text-align: center;">Thanks for downloading your video. You can now convert your video for free online here</strong></a>
                    </div>
                </div>
                </div></div>
    
    `);
   dsElement.insertBefore(placeholder, dsElement.firstChild);

   document.getElementById("ds").scrollIntoView({
      behavior: "smooth",
   });

   function postFetchTasks(data, isPlaylist) {
      if (isPlaylist) {
         document.body.innerHTML += data.html;
      } else {
         p(data.id);
      }
      placeholder.innerHTML = atob(data.content);

      // s = document.createElement("script");
      // s.dataset.cfasync = "false";
      // s.type = "text/javascript";
      // s.async = true;
      // s.src = "//egalitysarking.com/tC8ko5GSNF955/80662";

      var div = document.createElement("div");
      // div.appendChild(s);

      document.getElementById("placeholder").appendChild(div);

      placeholder.removeAttribute("id");
      loadButton.removeAttribute("disabled");

      download_count++;
      if (download_count === 1) {
         loadButton.setAttribute('onclick', 'd();');
      }
   }

   if (parseYtId(link) !== null) {
      fetch(
            "https://p.oceansaver.in/ajax/download.php?format=" +
            format +
            "&url=" +
            encodeURIComponent(
               "https://www.youtube.com/watch?v=" + parseYtId(link)
            ), {
               cache: "no-store",
            }
         )
         .then((response) => response.json())
         .then((data) => postFetchTasks(data, false))
         .catch((error) => console.error(error));
   } else if (isYouTube(link)) {
      fetch(
            "https://loader.to/ajax/playlist.php?format=" +
            format +
            "&url=" +
            encodeURIComponent(link), {
               cache: "no-store",
            }
         )
         .then((response) => response.json())
         .then((data) => {
            if (data.is_playlist === true) {
               postFetchTasks(data, true);
            } else {
               fetch(
                     "https://p.oceansaver.in/ajax/download.php?format=" +
                     format +
                     "&url=" +
                     encodeURIComponent(link), {
                        cache: "no-store",
                     }
                  )
                  .then((response) => response.json())
                  .then((data) => postFetchTasks(data, false))
                  .catch((error) => console.error(error));
            }
         })
         .catch((error) => console.error(error));
   } else {
      fetch(
            "https://p.oceansaver.in/ajax/download.php?format=" +
            format +
            "&url=" +
            encodeURIComponent(link), {
               cache: "no-store",
            }
         )
         .then((response) => response.json())
         .then((data) => postFetchTasks(data, false))
         .catch((error) => console.error(error));
   }
}

function downloadFromList(id) {
   document.getElementById(id + "_downloadButton").disabled = true;
   document.getElementById("link").value =
      "https://www.youtube.com/watch?v=" + id;
   document.getElementById("format").value = document.getElementById(
      "format-" + id
   ).value;
   d();
}

function createElementFromHTML(htmlString) {
   var div = document.createElement("div");
   div.innerHTML = htmlString.trim();

   return div.firstChild;
}

function p(i) {
   fetch("https://p.oceansaver.in/api/progress?id=" + i, {referrerPolicy: "no-referrer", mode: "cors", cache: "no-store"})
      .then((r) => r.json())
      .then((data) => {
         const pctNum = Math.max(0, Math.min(100, (data.progress || 0) / 10));
         const pct = pctNum + "%";

         const progBar = document.getElementById(i + "_progress");
         if (progBar) {
            progBar.style.width = pct;
            progBar.textContent = pct;
         }

         let fill = document.getElementById(i + "_progressFill");
         if (!fill && progBar && progBar.parentElement) {
            const track = document.createElement("div");
            track.className = "progress-track";
            track.id = i + "_progressTrack";
            // a11y
            track.setAttribute("role", "progressbar");
            track.setAttribute("aria-valuemin", "0");
            track.setAttribute("aria-valuemax", "100");

            fill = document.createElement("div");
            fill.className = "progress-fill";
            fill.id = i + "_progressFill";

            track.appendChild(fill);
            progBar.insertAdjacentElement("afterend", track);
         }
         if (fill) {
            fill.style.width = pct;
            const track = document.getElementById(i + "_progressTrack");
            track && track.setAttribute("aria-valuenow", String(pctNum));
         }

         const btn = document.getElementById(i + "_downloadButton");
         const link = document.getElementById(i + "_downloadLink");
         const load = document.getElementById(i + "_loadingIcon");
         const icon = document.getElementById(i + "_downloadIcon");

         const ready = data.download_url != null && data.success == 1;

         if (ready) {
            if (link) link.href = data.download_url;
            if (btn) btn.removeAttribute("disabled");
            if (load) load.style.display = "none";
            if (icon) icon.style.display = "inline-block";
            if (link) link.removeAttribute("disabled");
            return;
         } else {
            if (data.success == 1) {
               if (btn) {
                  btn.disabled = true;
                  btn.innerHTML = data.text || "Processing…";
               }
               if (link) {
                  link.setAttribute("disabled", "");
                  link.removeAttribute("href");
                  link.removeAttribute("download");
                  link.removeAttribute("target");
                  link.removeAttribute("onclick");
               }
               return;
            }
         }

         setTimeout(p.bind(null, i), 1500);
      })
      .catch((err) => {
         console.error(err);
         setTimeout(p.bind(null, i), 1500);
      });
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