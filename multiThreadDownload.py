#coding:utf-8

'''
Date:2017.02.09
About:Python实现多线程HTTP文件下载器（Python2.7.x + win/Linux)
Author:Ben
'''

import time
import threading
import urllib2
import urllib
import re

def validateTitle(title):
    rstr = r"[\/\\\:\*\?\"\<\>\|]"  # '/ \ : * ? " < > |'
    new_title = re.sub(rstr, "_", title)  # 替换为下划线
    return new_title


max_thread = 10
lock = threading.RLock()

class Downloader(threading.Thread):
    def __init__(self, url):
        self.url = url
        self.threadNum = 32
        threading.Thread.__init__(self)

    def getFilename(self):
        url = self.url
        protocol, s1 = urllib.splittype(url)
        host, path = urllib.splithost(s1)
        filename = path.split('/')[-1]
        if '.' not in filename:
            filename = None
        print "Do you want to change a filename?('y' or other words)"
        answer = 'n'
        if answer == "y" or filename is None:
            print "Please input your new filename:"
            filename = raw_input()


        filename = urllib.unquote(filename)
        filename = validateTitle(filename)
        return filename

    def getLength(self):
        opener = urllib2.build_opener()
        req = opener.open(self.url)
        meta = req.info()
        length = int(meta.getheaders("Content-Length")[0])
        return length

    def get_range(self):
        ranges = []
        length = self.getLength()
        offset = int(int(length) / self.threadNum)
        for i in range(self.threadNum):
            if i == (self.threadNum - 1):
                ranges.append((i*offset,''))
            else:
                ranges.append((i*offset,(i+1)*offset))
        return ranges

    def downloadThread(self,start,end):
        req = urllib2.Request(self.url)
        req.headers['Range'] = 'bytes=%s-%s' % (start, end)
        f = urllib2.urlopen(req)
        offset = start
        buffer = 1024*1024
        while 1:
            block = f.read(buffer)
            if not block:
                break
            with lock:
                self.file.seek(offset)
                self.file.write(block)
                offset = offset + len(block)

    def download(self):
        filename = self.getFilename()
        self.file = open(filename, 'wb')
        thread_list = []
        n = 1
        for ran in self.get_range():
            start, end = ran
            print 'starting:%d thread '% n
            n += 1
            thread = threading.Thread(target=self.downloadThread,args=(start,end))
            thread.start()
            thread_list.append(thread)

        for i in thread_list:
            i.join()
        print 'Download %s Success!'%(self.file)
        self.file.close()

