#! python3
import requests
import json
import sys
import ssl
from datetime import datetime

URL = "https://{0}:29444/gappapi"
SERVER_IP = None
HUBKIT_IP = "localhost"

def fetchFromServer(url = URL, timestamp = datetime.now(), areaName = None):
    dt = timestamp.isoformat(sep='T', timespec='auto')
    dataDict = {
        "DateFrom": dt
    }
    if areaName is not None:
        dataDict["AreaName"] = areaName
    dataJsonString = json.dumps(dataDict)
    
    res = requests.post(url, data=dataJsonString, headers={"content-type": "application/json"}, verify=False)
    print(dataJsonString)
    if res.status_code is not 200:
        print("failed to retreive data")
        print(res)
        print(res.text)
        return (res.status_code, None)
    j = res.json()
    print(j)
    return (res.status_code, j["Result"])

def groupByArea(d):
    areas = {}
    d.sort(key=lambda x: datetime.strptime(x["Timestamp"][:19], "%Y-%m-%dT%H:%M:%S"))
    d = reversed(d)
    for reading in d:
        aname = reading["AreaName"]
        if aname in areas:
            areas[aname].append(reading)
        else:
            areas[aname] = [reading]
    return areas


def getUnique(areas):
    # set up unique map
    alreadyHaveMap = {}
    auniq = {}
    for area in areas.keys():
        auniq[area] = []
        alreadyHaveMap[area] = []

    # go through sorted list to find only the latest reading per datatype
    for area in areas.keys():
        for reading in areas[area]:
            rtype = reading["DataType"]
            if rtype not in alreadyHaveMap[area]:
                auniq[area].append(reading)
                alreadyHaveMap[area].append(rtype)
    
    return auniq

def FullFetch(hubkit_ip = HUBKIT_IP, timestamp = datetime.now(), areaName = None):
    url = URL.format(hubkit_ip)
    statusCode, json = fetchFromServer(url, timestamp, areaName) # Server supplied items
    if json is None:
        return statusCode
    g = groupByArea(json) # grouped by Area, sorted by Timestamp
    u = getUnique(g) # gets only the latest reading of each type for each layer - reliwes on `g` being sorted by Timestamp
    return u


def main():
    print(URL)
    ff = FullFetch()
    return 0

if __name__ == "__main__":
    SERVER_IP = sys.argv[1] #"0.0.0.0"
    HUBKIT_IP = sys.argv[2] # "0.0.0.0"
    URL = URL.format(HUBKIT_IP)
    sys.exit(main())