Original Article: https://pqsec.org/2020/05/25/import-markdown-into-medium.html

# Import Markdown into Medium in 4 clicks

## Or my first web app in 10 years: what could go wrong?

**TL;DR: if you're just looking for the tool itself, it is [here][m2m]**

I write my personal posts on [my own blog][pqsec-org], but to reach a wider audience I followed the advice on the Internet to cross-post my posts on popular publishing platforms. In the end I couldn't select between [Medium][medium] and [dev.to][dev-to], so decided to use both.

My own blog is hosted on [GitHub Pages][github-pages], so I write my posts in [Markdown][wikipedia-markdown]. Luckily, [dev.to][dev-to] supports Markdown natively as well, so I can just copy-paste posts there. [Medium][medium], however, is not very Markdown friendly: they heavily promote the usage of their superior editor, which is great indeed, but completely useless when it comes to cross-posting.

### Markdown to Medium prior art

There is always the official [Medium import tool][medium-import-story], but when I tried to use it on one of my posts, it completely omitted all the code blocks. It's probably OK, if you have one or two of those and you can re-add them manually, but quickly becomes tiresome for a heavy code oriented post.

The second thing I found was this method of [using the official import tool on a GitHub gist](https://medium.com/@andymcfee/how-to-import-markdown-into-medium-c06dc981bd96), but this produced the same result for me as above. The post also mentions [this automated tool](https://markdowntomedium.com/), which goes one step further: it creates a separate [GitHub gist](https://gist.github.com/) for every code block in the post and apparently tries to use Medium gist auto expansion, which again did not work for me as all gist links remained not expanded in the editor. I quickly noticed the downsides of the approach as well: when parsing my post [Fixing weak crypto in OpenSSL based applications][fixing-weak-crypto], it created more than 20 gists in my GitHub account and that's for a single post! GitHub gists do not have the concept of "folders", so your account might quickly become messy because of all these gists. Finally, I prefer for all post contents to be hosted in one place. Otherwise, if GitHub is having problems for example, parts of your post suddenly become unreadable, which might frustrate the audience. For completness, I would like to mention [Markdium](https://markdium.dev/) - I didn't try it myself, but according to the demo it uses the same automated GitHub gist approach, but also provides a nice Markdown editor directly in the browser.

Next, there is [this browser based tool](http://markdown-to-medium.surge.sh/): it claims to generate html, which is compatible with Medium's editor. So the workflow is like this: you copy-paste the Markdown into the tool, the tool renders it and produces html and you copy-paste this html directly into the Medium's editor. The tool worked as described, when I tried it - I didn't find any inconsistencies and all the code blocks were in place. There are also no gists or giving away your GitHub credentials involved. The only downside is that you have to copy-paste twice. The other potential concern is while the tool produces "compatible" html now, there is no guarantee it would stay that way as Medium might change the way it handles the input any time.

Finally, I found [Mdium][mdium] - a small python tool, which can publish a Markdown post via... Medium API! But the surprise came not from the tool itself, rather (quoting from the tool's post):

> It’s 2019 and their editor doesn’t support Markdown, but their API does?

Wait, what? Medium does support Markdown natively, but API only? Heading to the [official Medium API documentation](https://github.com/Medium/medium-api-docs#creating-a-post) we see:

> contentFormat: The format of the "content" field. There are two valid values, "html", and "markdown"

I didn't try the Mdium python tool to be honest, just took the previously mentioned [Fixing weak crypto in OpenSSL based applications][fixing-weak-crypto] Markdown source, generated myself [an API token][medium-api-token] and posted it as a draft with [curl](https://curl.haxx.se/). And voila! The post was nicely imported with all code blocks intact!

### A browser based import tool

Importing posts with curl is not a sustainable solution and, if there is an API, I was hoping there would be some ready tools providing this feature. But a quick search did not yield any results except the previously mentioned [Mdium][mdium]. There is nothing wrong with Mdium, but it just didn't tick all the boxes for me: probably, like many other modern Internet users, I have multiple devices with different operating systems, some of them are mobile tablets without straightforward access to python or terminal. Thanks to modern "cloud technologies" I can use any of those to start a new post or continue writing an existing one directly in the browser without the need to manually synchronise any data or installing any applications. I would like the same level of convenience for publishing posts as well, so it would be nice to have a small browser application to hit the Medium API without the need to install anything. And since I didn't find one, I decided to try to create it myself.

![thanos](/img/m2m/thanos.gif)

#### Selecting a UI framework

I mostly do system programming and last time I did something around a non-console UI was more than 10 years ago. And that was not without horror stories. At the time [.NET Framework][net-framework] was quite popular as the primary tool to write Windows GUI applications. Microsoft also made a push to extend the technology to the Web with [ASP.NET][asp-net] - a server side scripting support for .NET Framework. One could even write a Web UI in ASP.NET with [Web forms][asp-web-forms] - basically, a bunch of ready made .NET components, which rendered into HTML elements. Once I used the technology to write a simple website, but the result was interesting: the site looked great and rendered fine in every modern browser at the time, except... Microsoft's own [Internet Explorer][msie] 🤦. I didn't touch a Web UI ever since...

Based on the above experience I was expecting that writing a Web UI would be the biggest challenge (and, oh my I was wrong!). I did hear there are numerous tools and frameworks for writing modern Web applications, which would hopefully take most of the pain away, but which one to choose? I read about [Material Design][material-design] and web frameworks like [React][react], [Angular][angular] and [Vue][vuejs]. These seem to be great tools to write complex Web applications, but each of them is not a complete solution. For example, you need to understand how to properly combine [Material Design][material-design] and [Vue][vuejs] or use some other third-party metaframework, like [vuematerial.io](https://vuematerial.io/).

My requirements for the app were quite simple: a small web form and some backing Javascript, which makes JSON requests to the Medium API. I also wanted to get away from installing [Node JS][node-js], which seems to be required to follow any reasonable tutorials for the above technologies. It was just too much of a curve to write a simple web form. Then I looked at [Bootstrap][bootstrap] and it seemed to be the right tool: a simple "all-in-one" solution, which allows to write plain familiar HTML directly in the browser and provide a reasonable cross-browser friendly UI. It also doesn't force you into a particular Javascript framework, so you don't even have to use any for simple things. In the end I was able to compose a small web form and draft simple UI notifications within hours with no prior experience with Bootstrap. My job was almost done...

### Hello, CORS!

... Or not! During the development of my Web app I even hacked a small local mock Medium API to test the whole flow and it worked great. I thought all I have to do now is to replace the API url with the real one and the app is ready. I was soon disappointed to see nothing happens, when I target my app at the real Medium API. Browser debugging tools showed my requests are simply being blocked because of [Cross-origin resource sharing (CORS)][cors] violation!

This post will not deep dive into CORS as there are better tutorials, specs and detailed resources out there, but in a nutshell, CORS is a way to block by default most (especially authenticated!) cross-origin requests in modern browsers. During the testing with the mock Medium API it was fine, because requests originated from my `localhost` "origin" and where hitting my mock server running on `localhost` as well. In order for this to work with real Medium API, the API needs to reply with special [CORS headers][cors-mozilla] as well as support special "HTTP preflight requests". A proper combination of these gives the browser the "permission" to perform the API request - otherwise the browser will not do it as it happened in my case.

I reached out to Medium support about CORS on their API in case I was doing something wrong, but they confirmed CORS is not supported as well as there are no plans to support it in the future. I don't quite understand why would anyone provide a public HTTP API, but make it usable from anything except the browser (if you know - please, reach out to [me on Twitter][me-twitter]), but it is what it is. Without proper CORS support from the API publisher it seems the only way to make the API accessible in the browser is to use a third-pary CORS proxy, which will inject proper CORS headers.

#### Implementing a CORS proxy

There are number of ready-made public CORS proxies, but probably one of the most popular one is [CORS anywhere][cors-anywhere] running at https://cors-anywhere.herokuapp.com/. Unfortunately, it doesn't work for our use-case: the proxy injects a special CORS header `Access-Control-Allow-Origin` with a `*` (wildcard responce). This is good enough for most cases as it tells the browser that the server (or proxy in this case) allows cross-origin requests from any origin. Medium API, however, obviously requires authentication and looks for the presense of the `Authorization` header in incoming requests with the [Medium API token][medium-api-token]. CORS dictates that browsers will only send cross-origin `Authorization` header, if the origin was explicitly allowed (listed) by the server in `Access-Control-Allow-Origin`, that is wildcard response is not good enough for these "authenticated" requests.

Of course, one could grab the sources of [CORS anywhere][cors-anywhere], make the relevant changes and republish the proxy with proper `Authorization` support, but I wanted something simpler than running my app in a public cloud. Then I remembered about [Cloudflare Workers][cf-workers], which are more than ideal for this kind of task. Moreover, Cloudflare Worker Templates resource already has a [barebone CORS proxy](https://developers.cloudflare.com/workers/templates/pages/cors_header_proxy/). The template, however, has similar limitations as [CORS anywhere][cors-anywhere], so requires slight adjustments:

  * the template sets `Access-Control-Allow-Origin` to `*` in the preflight response the same way as [CORS anywhere][cors-anywhere] - we need to replace this with something like `request.headers.get('Origin')`, so the requester will always get their origin explicitly "allowed"
  * we need to make `Access-Control-Allow-Methods` dynamic as well to "allow" the browser to send the `Authorization` header
  * finally, we need to add `Access-Control-Allow-Credentials: true` header to the preflight response to explicitly allow the browser to make authenticated requests

In addition to the above I also removed the test page from the template and, unlike [CORS anywhere][cors-anywhere], where you have to specify the proxied URL via a query string, my implementation takes it from a custom `X-Corsify-Url` request header. The full code is listed below:

```javascript
async function handleRequest(request) {
  const url = new URL(request.url)
  const apiurl = request.headers.get('X-Corsify-Url')
  const origin = url.origin
  // Rewrite request to point to API url. This also makes the request mutable
  // so we can add the correct Origin header to make the API server think
  // that this request isn't cross-site.
  request = new Request(apiurl, request)
  request.headers.set('Origin', new URL(apiurl).origin)
  request.headers.set('Host', new URL(apiurl).hostname)
  request.headers.delete('X-Corsify-Url')
  let response = await fetch(request)
  // Recreate the response so we can modify the headers
  response = new Response(response.body, response)
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append('Vary', 'Origin')
  return response
}
function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    let corsHeaders = {
      'Access-Control-Allow-Origin': request.headers.get('Origin'),
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
      'Access-Control-Allow-Credentials': true,
      'Vary': 'Origin',
    }
    return new Response(null, {
      headers: corsHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}
addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  // if (url.pathname.startsWith(proxyEndpoint)) {
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      event.respondWith(handleOptions(request))
    } else if (
      request.method === 'GET' ||
      request.method === 'HEAD' ||
      request.method === 'POST'
    ) {
      // Handle requests to the API server
      event.respondWith(handleRequest(request))
    } else {
      event.respondWith(async () => {
        return new Response(null, {
          status: 405,
          statusText: 'Method Not Allowed',
        })
      })
    }
})
```

After several iterations of testing and slight adjustments to my Medium import web application everything worked 🎉.

![m2m-demo](/img/m2m/m2m-demo.gif)

### CORS proxy security considerations

There is definitely some risk in passing your requests, especially the ones with an API token, through a proxy. Because CORS proxies operate on the layer 7 of the [OSI model][osi-model], they see request plaintext data, even if the original request was sent encrypted via [HTTPS][https]. Rogue proxies can steal your credentials as well as modify the request/response data in any way they wish and not only inject proper CORS headers. In case of Medium, anyone with your token can publish posts in your name and do all the other things covered by the API, so make sure understand the risk of using a CORS proxy. This is, by the way, true for any other third-pary Medium integration mentioned in this post as all of them get your API token one way or the other, and some get a GitHub one as well.

So, can you trust my proxy? I say "definitely yes", but if I was the casual reader of this post - a simple "yes" might not be enough for me. That's why for extra cautious I made the CORS proxy configurable in the UI, so you can point the app at your own instance. You can easily run one for free on Cloudflare Workers, which allows up to 100K requests per day (and I think no-one publishes 100K posts a day, so should be enough) with no need to think about applications, regions or instances. You can also opt for a more traditional approach and run a [CORS anywhere][cors-anywhere]-like application in some public cloud or even on premise.

Can we trust Cloudflare to run our proxy? I would be biased here to provide an opinion, so instead I would encourage interested readers to use CDN finder tools, such as [this](https://www.whatsmycdn.com/) and check which CDN is used by Medium for more objective information.

If you don't want to bother with running proxies, but still not comfortable with giving away your API token, the alternative approach would be to use one-time tokens. It seems there is no limit in how many Medium tokens you can generate and you can also easily revoke any token. So the workflow would be as simple as:

  1. [generate a new integration token][medium-api-token]
  2. publish a post using this token and any CORS proxy
  3. immediately revoke this token afterwards

### Final words

By creating this simple app I learned that writing a simple Web UI with modern Web frameworks is not that scary anymore. Please, do note, I'm not a Web developer, so if you see some non-idiomatic Javascript code, don't shame me, but provide improvement suggestions or, even better, send a [pull request on GitHub][m2m-prs].

I also learned a lot about CORS, but what I failed to understand is why many public APIs do not support it. At first glance it may seem that non-CORS API is more secure as it prevents malicious websites to impersonate users of the API. However, when a **public** API does not support CORS, most developers seem to turn to third-party CORS proxies, like the ones mentioned in this post, thus probably even increasing the risk of a token leak should the proxy go rogue. Please, [reach out on Twitter][me-twitter], if you think otherwise.

If you're reading this post on Medium, it was published from Markdown using this [Markdown to Medium][m2m] tool. If you found it useful, send your comments or improvement suggestions [on Twitter][me-twitter].

[pqsec-org]: https://pqsec.org/
[medium]: https://medium.com/
[dev-to]: https://dev.to/
[github-pages]: https://pages.github.com/
[wikipedia-markdown]: https://en.wikipedia.org/wiki/Markdown
[medium-import-story]: https://help.medium.com/hc/en-us/articles/214550207-Import-a-post
[fixing-weak-crypto]: https://pqsec.org/2020/04/13/fixing-weak-crypto-in-openssl-based-applications.html
[medium-api-token]: https://help.medium.com/hc/en-us/articles/213480228-Get-an-integration-token-for-your-writing-app
[mdium]: https://medium.com/@icyphox/mdium-publish-your-markdown-to-medium-from-the-cli-79906ef6b16b
[net-framework]: https://en.wikipedia.org/wiki/.NET_Framework
[asp-net]: https://dotnet.microsoft.com/apps/aspnet
[asp-web-forms]: https://dotnet.microsoft.com/apps/aspnet/web-forms
[material-design]: https://material.io/
[msie]: https://en.wikipedia.org/wiki/Internet_Explorer
[react]: https://reactjs.org/
[angular]: https://angular.io/
[vuejs]: https://vuejs.org/
[node-js]: https://nodejs.org/
[bootstrap]: https://getbootstrap.com/
[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[cors-mozilla]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[me-twitter]: https://twitter.com/ignatkn
[cors-anywhere]: https://github.com/Rob--W/cors-anywhere
[cf-workers]: https://workers.cloudflare.com/
[osi-model]: https://en.wikipedia.org/wiki/OSI_model
[https]: https://en.wikipedia.org/wiki/HTTPS
[m2m-prs]: https://github.com/pqsec/m2m/pulls
[m2m]: https://m2m.pqsec.org/
