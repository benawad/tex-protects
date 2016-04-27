import pandas as pd
import json
import locale
import numpy as np

locale.setlocale( locale.LC_ALL, ''  )

def fetch(years):
    first = True
    yeardfs = []
    for year in years:
        old = ""
        if(int(year) < 2011):
            old = "_109-117"
        url = \
        "http://www.dfps.state.tx.us/About_DFPS/Data_Books_and_Annual_Reports/%s/finance%s.asp"\
        % (year, old)

        df = pd.read_html(url)[0]
        df.columns = df.iloc[0]
        df = df.reindex(df.index.drop(0))
        for i in df.columns:
            if 'Projected' in i:
                df = df.drop(i, axis=1)
            if not first and year in i:
                df = df.drop(i, axis=1)
            
        if(len(df.columns) <= 2):
            continue
        if first:
            first = False
        cols = df.columns.tolist()
        cols[0] = cols[0].replace(" ", "")
        df.columns = cols
        a = df[df[df.columns[0]].str.contains("A")]
        b = df[df[df.columns[0]].str.contains("B")]
        c = df[df[df.columns[0]].str.contains("C")]
        dfs = [a, b, c]
        dfl = ['A', 'B', 'C']
        for i in dfs:
            for column in df.columns[2:]:
                i[column] = i[column].replace('[\$,]', '', regex=True).astype(int)

        for l, i in enumerate(dfs):
            i = i.append(i.sum(numeric_only=True), ignore_index=True)
            i[i.columns[0]].iloc[len(i)-1] = "%s total" % dfl[l]
            dfs[l] = i

        df = pd.concat(dfs)
        totals = df[df[df.columns[0]].str.contains("total")]
        totals = totals.append(totals.sum(numeric_only=True), ignore_index=True)
        totals[totals.columns[0]].iloc[len(totals)-1] = "Total"
        df = df.append(totals.iloc[len(totals)-1])
        # add dollar sign and thousands seperator
        dollar = lambda x: locale.currency(x, grouping=True)[:-3]  # strip .00
        for c in df.columns[2:]:
            df[c] = df[c].apply(dollar)

        df = df.replace(np.nan, "null", regex=True)
        yeardfs.append(df)

    bigdf = yeardfs[0]
    for i in yeardfs[1:]:
        bigdf = bigdf.merge(i, 'right')
    cols = bigdf.columns.tolist()
    tmp = cols[2]
    cols[2] = cols[3]
    cols[3] = tmp
    bigdf = bigdf[cols]
    bigdf = bigdf[bigdf.index < bigdf[bigdf[bigdf.columns[0]] == 'Total'].index[0] + 1]
    bigdf.ix[bigdf['Program Area'] == "null", 'Program Area'] = bigdf.ix[bigdf['Program Area'] == "null", bigdf.columns[0]]
    bigdf = bigdf.drop(bigdf.columns[0], 1)
    return bigdf.to_dict('record')

d = {}
years = ["2015", "2014", "2013", "2012", "2011", "2010", "2009"]
d = fetch(years)

with open("finance.json", "w") as f:
    json.dump(d, f)
