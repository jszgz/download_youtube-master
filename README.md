# download_youtube
Download youtube video from clipconverter.

It's very easy to use it.
Here is the easiest way.

    get = GetUrl('https://www.youtube.com/watch?v=Czy0pXRRZcs')
    print get.get_choose()
    # The parameter is to choose 4k, 1440p, 1080p and so on.
    status_url = get.get_statusurl(0)
    while True:
        print get.get_status(status_url)


You can use http proxy to avoid google CAPTCHA.

    self.proxy_handler = urllib2.ProxyHandler({"http" : 'http://ip:port'})
    self.opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookielib.CookieJar()), self.proxy_handler)

You can use multithreading to handle requests. But I don't add it. You can use it by your ways.
