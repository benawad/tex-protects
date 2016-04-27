import requests
import re
import json
from difflib import SequenceMatcher
import pandas as pd
from bs4 import BeautifulSoup
import numpy as np


def prime(years):
    cats = {}
    for year in years:
        r = \
        requests.get("http://www.dfps.state.tx.us/About_DFPS/Data_Books_and_Annual_Reports/%s/county_charts.asp"
                % year)

        soup = BeautifulSoup(r.text, "lxml")

        soup = soup.find("div", {"id": "content-text"})

        anchors = soup.ul.findAll('a')

        urls = []
        names = []

        base = "https://www.dfps.state.tx.us"

        for i in anchors:
            urls.append(base + i['href'])
            s = i.text
            s = re.sub("\\u00a0", " ", s)
            # remove duplicate space
            s = re.sub(" +", " ", s)
            # remove as of August 2015
            s = re.sub("as of .+", "", s)
            # remove During FS
            s = re.sub("During F.+", "", s)
            # remove : fiscal year 2015
            s = re.sub(":? [fF]iscal [yY]ear.+", "", s)
            # remove in FY
            s = re.sub("in FY.+", "", s)
            s = s.replace("*", "")
            s = s.strip()
            names.append(s)

        n = 0
        for u in urls:
            if names[n] in cats:
                n += 1
                continue
            table = pd.read_html(u)
            df = pd.DataFrame(table[0])
            df.columns = df.iloc[0]
            # remove first column
            df = df.reindex(df.index.drop(0))
            # remove extra space around column names
            fixedC = []
            for c in df.columns:
                c = re.sub(' +', ' ', c)
                c = c.replace("*", "")
                c = c.strip()
                fixedC.append(c)

            df.columns = fixedC
            # make sure capitalization of counties is consistent
            df['County'] = df['County'].str.title()
            if "Region" in df.columns:
                df = df.drop("Region", axis=1)
            # set county column as index
            df = df.set_index('County')
            # no such thing as NaN in json
            df = df.fillna("null")
            cats[names[n]] = list(df.columns)
            n += 1

    return cats

years = ["2015", "2014", "2013", "2012", "2011", "2010", "2009"]
outline = prime(years)

def comp(s1, s2):
    return SequenceMatcher(None, s1, s2).ratio()

def match_cols(cols, cat_name):
    # original = cols[:]
    tol = .70
    ans = cols[:]
    for i in outline[cat_name]:
        highest = 0
        pos = None
        # found = False
        for loc, j in enumerate(cols):
            if j == 'County' or j == 'Region':
                continue
            fuz = comp(i.lower(), j.lower())
            if fuz > highest:
                # found = True
                highest = fuz
                pos = loc
        # if not found or highest < tol:
            # print("--------------------------")
            # print("i=" + i)
            # print(original)
        if highest > tol:
            ans[pos] = i
            cols[pos] = 'County'

    # print("--------")
    # print(original)
    # print(ans)
    # print("--------")

    return ans

region = {}
def fetch(year):
    r = \
    requests.get("http://www.dfps.state.tx.us/About_DFPS/Data_Books_and_Annual_Reports/%s/county_charts.asp"
            % year)

    soup = BeautifulSoup(r.text, "lxml")

    soup = soup.find("div", {"id": "content-text"})

    anchors = soup.ul.findAll('a')

    urls = []
    names = []

    base = "https://www.dfps.state.tx.us"

    for i in anchors:
        urls.append(base + i['href'])
        s = i.text
        s = re.sub("\\u00a0", " ", s)
        # remove duplicate space
        s = re.sub(" +", " ", s)
        # remove as of August 2015
        s = re.sub("as of .+", "", s)
        # remove During FS
        s = re.sub("During F.+", "", s)
        # remove : fiscal year 2015
        s = re.sub(":? [fF]iscal [yY]ear.+", "", s)
        # reomve in FY
        s = re.sub("in FY.+", "", s)
        s = s.replace("*", "")
        s = s.strip()
        names.append(s)

    bigdf = None
    
    n = 0
    global region
    for u in urls:
        table = pd.read_html(u)
        df = pd.DataFrame(table[0])
        df.columns = df.iloc[0]
        # remove first column
        df = df.reindex(df.index.drop(0))
        # remove extra space around column names
        fixedC = []
        for c in df.columns:
            c = re.sub(' +', ' ', c)
            c = c.replace("*", "")
            c = c.strip()
            fixedC.append(c)

        df.columns = match_cols(fixedC, names[n])

        # make sure capitalization of counties is consistent
        try:
            df['County'] = df['County'].str.title()
        except ValueError:
            pass

        if "Region" in fixedC:
            if region == {}:
                ser = pd.Series(list(df["Region"]), df["County"])
                ser = ser.map(lambda x: str(x).lstrip('0'))
                ser = ser.fillna("null")
                region = ser.to_dict()
            df = df.drop("Region", axis=1)
      
        df = df.set_index('County')

        if bigdf is None:
            bigdf = df
        else:
            bigdf = pd.concat([bigdf, df], axis=1)
        n += 1

    bigdf = bigdf.T.groupby(level=0).first().T
    try:
        bigdf = bigdf.drop('Statewide')
    except:
        pass
    try:
        bigdf = bigdf.drop('Total')
    except:
        pass
    try:
        bigdf = bigdf.drop('total')
    except:
        pass
    bigdf['County'] = bigdf.index
    bigdf = bigdf.convert_objects(convert_numeric=True)
    st = bigdf.loc[['State Total']]
    rem_cols = []
    for i in st.columns:
        try:
            if np.isnan(st[i].iloc[0]):
                rem_cols.append(i)
        except:
            pass

    for i in rem_cols:
        try:
            bigdf.loc['State Total':'State Total', i:i] = bigdf[i].sum()
        except:
            pass

    bigdf = bigdf.fillna("null")
    bigdf = bigdf.applymap(str)

    return bigdf.to_dict('record')

d = {}
for i in years:
    d[i] = fetch(i)

d["Region"] = region
d["Outline"] = outline
with open("databook.json", "w") as f:
    json.dump(d, f)
