import datetime
import requests
import time

class CellarWatch(object):
    base_url = "https://www.cellar-watch.com"
    cookies = None
    headers = {
        "Accept": "application/json, text/javascript, */*",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, sdch, br",
        "Accept-Language": "en-GB,en;q=0.8"
    }

    def __init__(self, cookies=None):
        self.cookies = cookies

    def _construct_get(self, endpoint, url_components):
        url = "/".join([self.base_url, endpoint])
        args = []
        for k, v in url_components.items():
            args.append("{k}={v}".format(k=k, v=v))
        return "{url}?{args}".format(url=url, args="&".join(args))

    def _get(self, url):
        resp = requests.get(url, headers=self.headers, cookies=self.cookies)
        rc = str(resp.status_code)
        if rc.startswith("4") or rc.startswith("5"):
            raise requests.exceptions.HTTPError("Got {rc}, expected 200.".format(rc=rc))
        else:
            return resp.json()

    def get_wine_price_history(self, lwin, vintage, up_to=None, name=None):
        """
        Args:
            lwin    (int): The Liv-Ex wine reference number (LWIN).
            vintage (int): The year the wine was harvested.
            up_to   (int): Milliseconds since 1970-01-01.
        Returns:
            dict: A dictionary containing price history and auction information.
        """
        def __tidy_up_block(block):
            new_block = []
            for data in block:
                new_block.append({
                    "date": datetime.datetime.fromtimestamp(data["date"] / 1000),
                    "price": data["value"]
                })
            return new_block

        if up_to is None:
            up_to = int(time.time() * 1000)

        url = self._construct_get("chart/individualwinechartpage.do", {
            "_": int(time.time() * 1000),
            "ajaxReq": 1,
            "lwin": lwin,
            "vintage": vintage,
            "type": "max",
            "endTime": up_to
        })

        price_history = self._get(url)
        hist = {
            "auction": None,
            "market": None,
            "list": None
        }
        for block in price_history:
            if "name" not in block or "data" not in block:
                continue

            b = __tidy_up_block(block["data"])
            if "Auction" in block["name"]:
                hist["auction"] = b
            elif "Market" in block["name"]:
                hist["market"] = b
            elif "List" in block["name"]:
                hist["list"] = b

        return {
            "_id": "{lwin}-{vintage}".format(lwin=lwin, vintage=vintage),
            "name": name,
            "vintage": vintage,
            "lwin": lwin,
            "history": hist
        }

    def get_lwins(self, name):
        """
        Args:
            name (str): The name of the wine (or vineyard) to search for. Alphanumeric only.
        Returns:
            list: A list of matching wines (with corresponding LWINs).
        """
        url = self._construct_get("autocompletewinenames.do",
            {
                "ajaxReq": 1,
                "term": name.replace(" ", "+")
            }
        )

        return sorted(self._get(url), key=lambda v: v["id"])
