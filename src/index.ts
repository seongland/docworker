/* CONFIGURATION STARTS HERE */
type Matcher = { [slug: string]: string }

/* Step 1: Domain name */
const MY_DOMAIN = 'doc.seongland.com'

/*
 * Step 2: enter your URL slug to page ID mapping
 * The key on the left is the slug (without the slash)
 * The value on the right is the Notion page ID
 */
const SLUG_TO_PAGE: Matcher = {
  '': '04089c8ae3534bf79512fc495944b321',
  logic: 'e562053ace984677a72cb9eaf5c6f91e',
  portfolio: 'b418523753984d4e8c940ede2e3de680',
  resume: '30022b4afb6f4d6e8446e0d49ec0a92f',
  computing: '3c7dae6f75754b0eaacefe11b809ee35',
  mathematics: '2731da9546944e7bb9455cedddd0f87f',
  'meta-science': 'bd533ed4e91c47809d96a342b5ddcccf',
  'applied-science': 'b6487154864c4aa9bcc0cdf09f6beaa6',
  'computer-application': '07680c91b1464e2aba83c5d44752fc2c',
  'computer-engineering': '46fa1b6d1f7e4297b85d8ff0b27fc803',
  society: '6d649d5e3a1b45ecbfba6ad536e6c987',
  'visual-design': '9338a889bc2845948faae416a0772bf0',
  'sound-design': 'da010ab49f0b459eaa670d33b730277e',
  'notion-cloudflare': 'aeb0f8e85c3e49c18b4c3320254305a7',
  testament: '39788903601a40fab6b2ff3f4bc42518',
  present: 'b709a5422126605a7ae7dfc3e6237505',
}

/* Step 2.5: undefined - auto, false is white */
const DEFAULT_DARK = true

/* Step 3: enter your page title and description for SEO purposes */
const PAGE_TITLE = 'Seongland Wiki'
const PAGE_DESCRIPTION = 'Seongland Document Page for All of World Information'

/* Step 4: enter a Google Font name, you can choose from https://fonts.google.com */
const GOOGLE_FONT = 'Public Sans'

/* Step 5: enter any custom scripts you'd like */
const CUSTOM_SCRIPT = `
<a href="https://www.buymeacoffee.com/seongland" style="position:fixed; right:30px; bottom:20px; z-index:1000">
<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&amp;emoji=☕&amp;slug=seongland&amp;button_colour=fff7&amp;font_colour=000&amp;font_family=Lato&amp;outline_colour=&amp;coffee_colour=424242">
</a>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-D4L5CK4THV"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-D4L5CK4THV');
</script>
<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "a6fb940551db4ac19503d4797ca68ffb"}'></script><!-- End Cloudflare Web Analytics -->
`

/* CONFIGURATION ENDS HERE */

const PAGE_TO_SLUG: Matcher = {}
const slugs: string[] = []
const pages: string[] = []
Object.keys(SLUG_TO_PAGE).forEach((slug) => {
  const page = SLUG_TO_PAGE[slug]
  slugs.push(slug)
  pages.push(page)
  PAGE_TO_SLUG[page] = slug
})

addEventListener('fetch', (event) => {
  event.respondWith(fetchAndApply(event.request))
})

function generateSitemap() {
  let sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  slugs.forEach(
    (slug) =>
      (sitemap +=
        '<url><loc>https://' + MY_DOMAIN + '/' + slug + '</loc></url>'),
  )
  sitemap += '</urlset>'
  return sitemap
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function handleOptions(request: Request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, PUT, OPTIONS',
      },
    })
  }
}

async function fetchAndApply(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  let url = new URL(request.url)
  url.hostname = 'www.notion.so'
  if (url.pathname === '/robots.txt')
    return new Response('Sitemap: https://' + MY_DOMAIN + '/sitemap.xml')
  if (url.pathname === '/sitemap.xml') {
    let response = new Response(generateSitemap())
    response.headers.set('content-type', 'application/xml')
    return response
  }
  let response
  if (url.pathname.startsWith('/app') && url.pathname.endsWith('js')) {
    response = await fetch(url.toString())
    let body = await response.text()
    response = new Response(
      body
        .replace(/www.notion.so/g, MY_DOMAIN)
        .replace(/notion.so/g, MY_DOMAIN),
      response,
    )
    response.headers.set('Content-Type', 'application/x-javascript')
    return response
  } else if (url.pathname.startsWith('/api')) {
    // Forward API
    response = await fetch(url.toString(), {
      body: url.pathname.startsWith('/api/v3/getPublicPageData')
        ? null
        : request.body,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
      },
      method: 'POST',
    })
    response = new Response(response.body, response)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } else if (slugs.indexOf(url.pathname.slice(1)) > -1) {
    const pageId = SLUG_TO_PAGE[url.pathname.slice(1)]
    return Response.redirect('https://' + MY_DOMAIN + '/' + pageId, 301)
  } else {
    response = await fetch(url.toString(), {
      body: url.pathname.startsWith('/api/v3/getPublicPageData')
        ? null
        : request.body,
      headers: request.headers,
      method: request.method,
    })
    response = new Response(response.body, response)
    response.headers.delete('Content-Security-Policy')
    response.headers.delete('X-Frame-Options')
    response.headers.delete('X-Content-Security-Policy')
  }

  return appendJavascript(response, SLUG_TO_PAGE, DEFAULT_DARK)
}

class MetaRewriter {
  element(element: HTMLElement) {
    if (
      element.getAttribute('property') === 'og:title' ||
      element.getAttribute('name') === 'twitter:title'
    )
      element.setAttribute('content', PAGE_TITLE)
    if (element.tagName === 'title') element.setInnerContent(PAGE_TITLE)
    if (
      element.getAttribute('name') === 'description' ||
      element.getAttribute('property') === 'og:description' ||
      element.getAttribute('name') === 'twitter:description'
    )
      element.setAttribute('content', PAGE_DESCRIPTION)

    if (
      element.getAttribute('property') === 'og:url' ||
      element.getAttribute('name') === 'twitter:url'
    )
      element.setAttribute('content', MY_DOMAIN)
    if (element.getAttribute('name') === 'apple-itunes-app') element.remove()
  }
}

class HeadRewriter {
  element(element: HTMLElement) {
    element.append(
      `<link href='https://fonts.googleapis.com/css?family=${GOOGLE_FONT.replace(
        ' ',
        '+',
      )}:Regular,Bold,Italic&display=swap' rel='stylesheet'>
        <style>* { font-family: "${GOOGLE_FONT}" !important; }</style>`,
      {
        html: true,
      },
    )
    element.append(
      `<style>
      div.notion-topbar > div > div:nth-child(4) { font-size: 0 !important; }
      div.notion-topbar > div > div:nth-child(3) { display: none !important; }
      div.notion-topbar > div > div:nth-child(5) { display: none !important; }
      div.notion-topbar > div > div:nth-child(6) { display: none !important; }
      div.notion-topbar-mobile > div:nth-child(5) { display: none !important; }
      div.notion-topbar > div > div:nth-child(1n).toggle-mode { display: block !important; }
      div.notion-topbar-mobile > div:nth-child(1n).toggle-mode { display: block !important; }
      </style>`,
      {
        html: true,
      },
    )
  }
}

class BodyRewriter {
  SLUG_TO_PAGE: Matcher
  DEFAULT_DARK: boolean
  constructor(SLUG_TO_PAGE: Matcher, DEFAULT_DARK: boolean) {
    this.SLUG_TO_PAGE = SLUG_TO_PAGE
    this.DEFAULT_DARK = DEFAULT_DARK
  }
  element(element: HTMLElement) {
    element.append(
      `<script>
      window.CONFIG.domainBaseUrl = 'https://${MY_DOMAIN}';
      const SLUG_TO_PAGE = ${JSON.stringify(this.SLUG_TO_PAGE)};
      const DEFAULT_DARK = ${JSON.stringify(this.DEFAULT_DARK)};
      const PAGE_TO_SLUG = {};
      const slugs = [];
      const pages = [];
      const el = document.createElement('div');
      let redirected = false;
      Object.keys(SLUG_TO_PAGE).forEach(slug => {
        const page = SLUG_TO_PAGE[slug];
        slugs.push(slug);
        pages.push(page);
        PAGE_TO_SLUG[page] = slug;
      });
      function getPage() {
        return location.pathname.slice(-32);
      }
      function getSlug() {
        return location.pathname.slice(1);
      }
      function updateSlug() {
        const slug = PAGE_TO_SLUG[getPage()];
        if (slug != null) {
          history.replaceState(history.state, '', '/' + slug);
        }
      }
      function onDark() {
        el.innerHTML = '<div title="Change to Light Mode" style="margin-left: 14px; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgb(46, 170, 220); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(12px) translateY(0px);"></div></div></div></div>';
        document.body.classList.add('dark');
        __console.environment.ThemeStore.setState({ mode: 'dark' });
      };
      function onLight() {
        el.innerHTML = '<div title="Change to Dark Mode" style="margin-left: 14px; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgba(135, 131, 120, 0.3); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(0px) translateY(0px);"></div></div></div></div>';
        document.body.classList.remove('dark');
        __console.environment.ThemeStore.setState({ mode: 'light' });
      }
      function toggle() {
        if (document.body.classList.contains('dark')) {
          onLight();
        } else {
          onDark();
        }
      }
      function addDarkModeButton(device) {
        const nav = device === 'web' ? document.querySelector('.notion-topbar').firstChild : document.querySelector('.notion-topbar-mobile');
        el.className = 'toggle-mode';
        el.addEventListener('click', toggle);
        nav.appendChild(el);

        if (DEFAULT_DARK !== undefined){
          DEFAULT_DARK ? onDark() : onLight()
        }
        // enable smart dark mode based on user-preference
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            onDark();
        } else {
            onLight();
        }

        // try to detect if user-preference change
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            toggle();
        });
      }
      const observer = new MutationObserver(function() {
        if (redirected) return;
        const nav = document.querySelector('.notion-topbar');
        const mobileNav = document.querySelector('.notion-topbar-mobile');
        if (nav && nav.firstChild && nav.firstChild.firstChild
          || mobileNav && mobileNav.firstChild) {
          redirected = true;
          updateSlug();
          addDarkModeButton(nav ? 'web' : 'mobile');
          const onpopstate = window.onpopstate;
          window.onpopstate = function() {
            if (slugs.includes(getSlug())) {
              const page = SLUG_TO_PAGE[getSlug()];
              if (page) {
                history.replaceState(history.state, 'bypass', '/' + page);
              }
            }
            onpopstate.apply(this, [].slice.call(arguments));
            updateSlug();
          };
        }
      });
      observer.observe(document.querySelector('#notion-app'), {
        childList: true,
        subtree: true,
      });
      const replaceState = window.history.replaceState;
      window.history.replaceState = function(state) {
        if (arguments[1] !== 'bypass' && slugs.includes(getSlug())) return;
        return replaceState.apply(window.history, arguments);
      };
      const pushState = window.history.pushState;
      window.history.pushState = function(state) {
        const dest = new URL(location.protocol + location.host + arguments[2]);
        const id = dest.pathname.slice(-32);
        if (pages.includes(id)) {
          arguments[2] = '/' + PAGE_TO_SLUG[id];
        }
        return pushState.apply(window.history, arguments);
      };
      const open = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function() {
        arguments[1] = arguments[1].replace('${MY_DOMAIN}', 'www.notion.so');
        return open.apply(this, [].slice.call(arguments));
      };
    </script>${CUSTOM_SCRIPT}`,
      {
        html: true,
      },
    )
  }
}

async function appendJavascript(
  res: Response,
  SLUG_TO_PAGE: Matcher,
  DEFAULT_DARK: boolean,
) {
  return new HTMLRewriter()
    .on('title', new MetaRewriter())
    .on('meta', new MetaRewriter())
    .on('head', new HeadRewriter())
    .on('body', new BodyRewriter(SLUG_TO_PAGE, DEFAULT_DARK))
    .transform(res)
}
