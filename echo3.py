import http.server
import socketserver
import os
import DataFromHubkit
import json
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import argparse

PORT = None
BIND = None
URL = None

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/fetch'):
            print(self.path)
            dateFrom = datetime.now()
            areaName = None
            query = parse_qs(urlparse(self.path).query)
            if "datefrom" in query:
                dateFrom = query["datefrom"][0]
                dateFrom = datetime.strptime(dateFrom, "%Y-%m-%dT%H:%M:%S.%fZ")
            if "areaname" in query:
                areaName = query["areaname"][0]
            else:
                dateFrom = datetime.now()
            print(dateFrom)
            d = DataFromHubkit.FullFetch(URL, dateFrom, areaName)
            s = json.dumps(d)
            self.send_response(200)
            self.send_header("content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes(s, "UTF-8"))
        else:
            super().do_GET()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--port", type=int, default=8081, help="port number for this python sever to run on. Default: 8081")
    parser.add_argument("-b", "--bind", type=str, default="", help="local address to for this python server to bind to. Default: ''")
    parser.add_argument("-u", "--url", type=str, default="localhost", help="address of hubkit instance to query from. Default: localhost")
    args = parser.parse_args()

    PORT = args.port
    BIND = args.bind
    URL = args.url
    
    DIR = "src/webNov24"
    FETCHFROM = datetime.now()
    web_dir = os.path.join(os.path.dirname(__file__), DIR)
    os.chdir(web_dir)

    httpd = socketserver.TCPServer((BIND, PORT), MyHandler, bind_and_activate=False)
    try:
        print("Server started on {0}:{1}".format(BIND, PORT))
        httpd.server_bind()
        httpd.server_activate()
        httpd.serve_forever()
    except:
        print("Shutting down server")
        httpd.server_close()