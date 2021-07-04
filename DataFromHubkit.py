#! python3
from typing import Dict, List, Union
import requests
import json
import sys
import ssl
from datetime import date, datetime, timedelta, timezone
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

URL = "https://{0}:29442/api/view/records?from={1}&virtualdeviceid={2}"
SERVER_IP = None
HUBKIT_IP = "localhost"

Area2IdMap: Dict[str, str] = {}
Id2AreaMap: Dict[str, str] = {}


dataKinds = {
    "24ce6d4d-ff08-46b5-ab6c-d8fdd50eea94": "Temperature",
    "4723d025-a1f2-431c-8e75-a9ba350ceae5": "Humidity",
    "927fa2a1-1fcc-4ea3-9b39-8c9e7263de0d": "Door",
    "fafd5c5c-6415-4def-83d3-986913546c67": "Motion Detected",
    "7e87a819-135e-40d3-9d5f-c0330f38ec4e": "CO2",
}

DeviceId2LastReadingTimestamp = {}

allPossibleIds = set()
SeenIdsForRun = set()
MaxPageScan = 10
ScanStartDate = datetime.min
MaxScanTime = timedelta(seconds=30)
MostRecentReadingAt = datetime.min


class DataReading():
    def __init__(self, time, data, areaId, deviceId, datakind):
        self.time = time
        self.data = data
        self.areaId = areaId
        self.deviceId = deviceId
        self.dataKind = datakind



def getArea2IdMap():
    res = requests.get(f"https://{HUBKIT_IP}:29442/api/layout/areas", verify=False)
    if res.status_code != 200:
        print("failed to retreive data")
        print(res)
        print(res.text)
        return (res.status_code, None)
    j = res.json()
    for area in j:
        Area2IdMap[area["DisplayName"]] = area["Id"]
        Id2AreaMap[area["Id"]] = area["DisplayName"]
        for layer in area["Layers"]:
            for vdev in layer["VirtualDevices"]:
                allPossibleIds.add(vdev["Id"])

def getAllDeviceData() -> Union[Dict[str, DataReading], int]:
    data = {}
    strft = datetime.min.strftime("%Y-%m-%dT%H:%M:%SZ")
    for deviceId in allPossibleIds:
        res = requests.get(URL.format(HUBKIT_IP, strft, deviceId), verify=False)
        if res.status_code != 200:
            print("failed to retreive data")
            print(res)
            print(res.text)
            return -1
        j = res.json()
        if len(j["Result"]) > 0:
            dr = parseDataReading(j["Result"][0])
            data[deviceId] = dr
    return data

def parseDataReading(obj: any) -> DataReading:
    dt = datetime.strptime(obj["DateTime"].split('.')[0], "%Y-%m-%dT%H:%M:%S")
    aid = obj["AreaId"]
    vid = obj["VirtualDeviceId"]
    data = obj["Data"]
    dkind = obj["DataKind"]
    dr = DataReading(dt, data, aid, vid, dkind)
    return dr


def massageReturnVals(data: Dict[str, DataReading]) -> Dict[str, Dict]:
    retDict: Dict[str, List[Dict]] = {} # RoomName : [echoReading]
    for dr in data.values():
        areaName = Id2AreaMap[dr.areaId]
        ts = dr.time
        data = dr.data
        dtype = dr.dataKind

        appender = {
            "DataType": dtype,
            "Data": data,
            "AreaName": areaName,
            "Timestamp": ts.timestamp(),
        }

        if areaName in retDict:
            retDict[areaName].append(appender)
        else:
            retDict[areaName] = [appender]
            
    return retDict


def fetchFromServer(url = URL, timestamp = datetime.utcnow()):
    timestamp = datetime.min
    strft = timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
    timestamp.timestamp
    url = URL.format(HUBKIT_IP, strft)
    res = requests.get(url, verify=False)
    if res.status_code != 200:
        print("failed to retreive data")
        print(res)
        print(res.text)
        return (res.status_code, None)
    j = res.json()
    
    return (res.status_code, j["Result"])


def FullFetch(hubkit_ip = HUBKIT_IP, timestamp = datetime.utcnow(), areaName = None):
    # populate the areas list on first run
    if (len(Area2IdMap) == 0):
        getArea2IdMap()
    dData = getAllDeviceData()
    retVals = massageReturnVals(dData)
    print(retVals)
    return retVals


def main():
    SERVER_IP = sys.argv[1] if len(sys.argv) > 2 else "localhost"
    HUBKIT_IP = sys.argv[2] if len(sys.argv) > 3 else "localhost"
    FullFetch()
    return 0

if __name__ == "__main__":
    sys.exit(main())